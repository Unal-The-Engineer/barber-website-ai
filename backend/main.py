from fastapi import FastAPI, Depends, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
from sqlmodel import SQLModel, select
from database import engine, get_session
from models import Reservation, WorkingHours, AdminUser
from sqlmodel import Session
from typing import List
from datetime import date as date_type, datetime, time, timedelta
from sqlalchemy import func, and_
from email_service import send_reservation_confirmation_to_customer, send_reservation_cancellation_to_customer
from dotenv import load_dotenv
import jwt
from pydantic import BaseModel
from apscheduler.schedulers.background import BackgroundScheduler
import atexit

# Load .env file
load_dotenv()

# Import chatbot service
from chatbot_service import chatbot_service

# Automatic cleanup function
def auto_cleanup_old_reservations():
    """Automatically delete old reservations (2+ weeks) and past working hours (1+ day)"""
    print("Running automatic cleanup of old data...")
    
    with Session(engine) as session:
        two_weeks_ago = datetime.now() - timedelta(days=14)
        today = datetime.now().date()
        
        # Find old reservations (2+ weeks old)
        old_reservations = session.exec(
            select(Reservation).where(
                func.date(Reservation.date) < two_weeks_ago.date()
            )
        ).all()
        
        # Find past working hours (any past date)
        old_working_hours = session.exec(
            select(WorkingHours).where(
                func.date(WorkingHours.date) < today
            )
        ).all()
        
        reservation_count = len(old_reservations)
        working_hours_count = len(old_working_hours)
        
        # Delete old reservations
        if reservation_count > 0:
            for reservation in old_reservations:
                session.delete(reservation)
            print(f"Auto cleanup: Deleted {reservation_count} old reservations (2+ weeks old)")
        
        # Delete past working hours
        if working_hours_count > 0:
            for working_hour in old_working_hours:
                session.delete(working_hour)
            print(f"Auto cleanup: Deleted {working_hours_count} past working hours records")
        
        if reservation_count > 0 or working_hours_count > 0:
            session.commit()
            print(f"Auto cleanup: Total deleted - {reservation_count} reservations, {working_hours_count} working hours")
        else:
            print("Auto cleanup: No old data to delete")

# Initialize scheduler
scheduler = BackgroundScheduler()
# Run cleanup every day at 3:00 AM
scheduler.add_job(func=auto_cleanup_old_reservations, trigger="cron", hour=3, minute=0)
scheduler.start()
print("✅ Auto cleanup scheduler started - will run daily at 3:00 AM")

# Shutdown scheduler when app stops
atexit.register(lambda: scheduler.shutdown())

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup"""
    SQLModel.metadata.create_all(engine)
    
    # Create default admin user if not exists
    with Session(engine) as session:
        admin = session.exec(select(AdminUser).where(AdminUser.username == "admin")).first()
        if not admin:
            default_admin = AdminUser(
                username="admin",
                password="admin",  # In production, this should be hashed
                created_at=datetime.now()
            )
            session.add(default_admin)
            session.commit()
    yield

app = FastAPI(lifespan=lifespan)
security = HTTPBearer()

# JWT secret key
JWT_SECRET = "elite-cuts-admin-secret-2024"

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for requests
class AdminLogin(BaseModel):
    username: str
    password: str

class WorkingHoursCreate(BaseModel):
    date: str  # YYYY-MM-DD format
    start_time: str  # HH:MM format
    end_time: str  # HH:MM format
    is_available: bool

class ChatMessage(BaseModel):
    message: str
    conversation_history: list = []

class ChatResponse(BaseModel):
    response: str





def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify admin JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        username = payload.get("username")
        if username != "admin":
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
def read_root():
    return {"message": "Hello, Barber! FastAPI çalışıyor."}

# Admin Authentication
@app.post("/admin/login")
def admin_login(login_data: AdminLogin, session: Session = Depends(get_session)):
    """Admin login endpoint"""
    if login_data.username == "admin" and login_data.password == "admin":
        # Create JWT token
        token_data = {"username": login_data.username}
        token = jwt.encode(token_data, JWT_SECRET, algorithm="HS256")
        return {"access_token": token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# Admin Dashboard - Get active reservations (future dates)
@app.get("/admin/reservations/active", response_model=List[Reservation])
def get_active_reservations(
    admin_user: str = Depends(verify_admin_token),
    session: Session = Depends(get_session)
):
    """Get active reservations (today and future dates) for admin dashboard"""
    today = datetime.now().date()
    reservations = session.exec(
        select(Reservation).where(
            and_(
                Reservation.status == "active",
                func.date(Reservation.date) >= today
            )
        ).order_by(Reservation.date, Reservation.time)
    ).all()
    return reservations

# Admin Dashboard - Get past reservations
@app.get("/admin/reservations/past", response_model=List[Reservation])
def get_past_reservations(
    admin_user: str = Depends(verify_admin_token),
    session: Session = Depends(get_session)
):
    """Get past reservations for admin dashboard"""
    today = datetime.now().date()
    reservations = session.exec(
        select(Reservation).where(
            and_(
                Reservation.status == "active",
                func.date(Reservation.date) < today
            )
        ).order_by(Reservation.date.desc(), Reservation.time.desc())
    ).all()
    return reservations

# Admin Dashboard - Get cancelled reservations
@app.get("/admin/reservations/cancelled", response_model=List[Reservation])
def get_cancelled_reservations(
    admin_user: str = Depends(verify_admin_token),
    session: Session = Depends(get_session)
):
    """Get cancelled reservations for admin dashboard"""
    reservations = session.exec(
        select(Reservation).where(
            Reservation.status == "cancelled"
        ).order_by(Reservation.date.desc(), Reservation.time.desc())
    ).all()
    return reservations

# Admin Dashboard - Get all reservations (for backward compatibility)
@app.get("/admin/reservations", response_model=List[Reservation])
def get_all_reservations(
    admin_user: str = Depends(verify_admin_token),
    session: Session = Depends(get_session)
):
    """Get all active reservations for admin dashboard"""
    reservations = session.exec(
        select(Reservation).where(Reservation.status == "active").order_by(Reservation.date, Reservation.time)
    ).all()
    return reservations

# Admin - Cancel reservation
@app.delete("/admin/reservations/{reservation_id}")
def cancel_reservation(
    reservation_id: int,
    admin_user: str = Depends(verify_admin_token),
    session: Session = Depends(get_session)
):
    """Cancel a reservation and send cancellation email"""
    reservation = session.get(Reservation, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if reservation.status == "cancelled":
        raise HTTPException(status_code=400, detail="Reservation already cancelled")
    
    # Check if reservation is in the past
    today = datetime.now().date()
    reservation_date = reservation.date.date()
    if reservation_date < today:
        raise HTTPException(status_code=400, detail="Cannot cancel past reservations")
    
    # Update reservation status
    reservation.status = "cancelled"
    session.add(reservation)
    session.commit()
    
    # Send cancellation email
    try:
        send_reservation_cancellation_to_customer(reservation)
    except Exception as e:
        print(f"Email sending error: {e}")
    
    return {"message": "Reservation cancelled successfully"}

# Test endpoint for manual cleanup (for testing purposes)
@app.post("/admin/test-cleanup")
def test_cleanup(
    admin_user: str = Depends(verify_admin_token),
    session: Session = Depends(get_session)
):
    """Test the auto cleanup function manually"""
    two_weeks_ago = datetime.now() - timedelta(days=14)
    today = datetime.now().date()
    print(f"DEBUG: Looking for reservations older than: {two_weeks_ago.date()}")
    print(f"DEBUG: Looking for working hours older than: {today}")
    
    # Find old reservations (2+ weeks old)
    old_reservations = session.exec(
        select(Reservation).where(
            func.date(Reservation.date) < two_weeks_ago.date()
        )
    ).all()
    print(f"DEBUG: Found {len(old_reservations)} old reservations")
    
    # Find past working hours (any past date)
    old_working_hours = session.exec(
        select(WorkingHours).where(
            func.date(WorkingHours.date) < today
        )
    ).all()
    print(f"DEBUG: Found {len(old_working_hours)} past working hours")
    
    # Debug: Show all working hours dates
    all_working_hours = session.exec(select(WorkingHours)).all()
    print(f"DEBUG: All working hours dates:")
    for wh in all_working_hours:
        wh_date = wh.date.date() if hasattr(wh.date, 'date') else wh.date
        print(f"  - ID {wh.id}: {wh_date} ({'PAST' if wh_date < today else 'FUTURE'})")
    
    # Debug: Show all reservation dates  
    all_reservations = session.exec(select(Reservation)).all()
    print(f"DEBUG: All reservation dates:")
    for res in all_reservations:
        res_date = res.date.date() if hasattr(res.date, 'date') else res.date
        print(f"  - ID {res.id}: {res_date} ({'OLD' if res_date < two_weeks_ago.date() else 'NEW'})")
    
    reservation_count = len(old_reservations)
    working_hours_count = len(old_working_hours)
    
    # Delete old reservations
    if reservation_count > 0:
        for reservation in old_reservations:
            session.delete(reservation)
    
    # Delete old working hours
    if working_hours_count > 0:
        for working_hour in old_working_hours:
            session.delete(working_hour)
    
    if reservation_count > 0 or working_hours_count > 0:
        session.commit()
        return {
            "message": f"✅ Test cleanup completed: Deleted {reservation_count} old reservations (2+ weeks), {working_hours_count} past working hours",
            "deleted_reservations": reservation_count,
            "deleted_working_hours": working_hours_count,
            "total_deleted": reservation_count + working_hours_count
        }
    else:
        return {
            "message": "✅ Test cleanup completed: No old data found to delete",
            "deleted_reservations": 0,
            "deleted_working_hours": 0,
            "total_deleted": 0
        }

# Admin - Working Hours Management
@app.post("/admin/working-hours")
def create_working_hours(
    working_hours: WorkingHoursCreate,
    admin_user: str = Depends(verify_admin_token),
    session: Session = Depends(get_session)
):
    """Create or update working hours for a specific date"""
    try:
        date_obj = datetime.strptime(working_hours.date, "%Y-%m-%d").date()
        
        # Check if working hours already exist for this date and time range
        existing = session.exec(
            select(WorkingHours).where(
                and_(
                    func.date(WorkingHours.date) == date_obj,
                    WorkingHours.start_time == working_hours.start_time,
                    WorkingHours.end_time == working_hours.end_time
                )
            )
        ).first()
        
        if existing:
            # Update existing record
            existing.is_available = working_hours.is_available
            session.add(existing)
        else:
            # Create new record
            new_working_hours = WorkingHours(
                date=datetime.combine(date_obj, time()),
                start_time=working_hours.start_time,
                end_time=working_hours.end_time,
                is_available=working_hours.is_available
            )
            session.add(new_working_hours)
        
        # If this is an unavailable time slot, cancel existing reservations
        if not working_hours.is_available:
            # Find active reservations that fall within this unavailable time range
            conflicting_reservations = session.exec(
                select(Reservation).where(
                    and_(
                        func.date(Reservation.date) == date_obj,
                        Reservation.status == "active"
                    )
                )
            ).all()
            
            # Filter reservations that fall within the time range (convert to 24h for comparison)
            actual_conflicting = []
            for res in conflicting_reservations:
                res_time_24h = convert_12h_to_24h(res.time)
                if working_hours.start_time <= res_time_24h < working_hours.end_time:
                    actual_conflicting.append(res)
            
            conflicting_reservations = actual_conflicting
            
            # Cancel each conflicting reservation and send email
            cancelled_count = 0
            for reservation in conflicting_reservations:
                reservation.status = "cancelled"
                session.add(reservation)
                cancelled_count += 1
                
                # Send cancellation email to customer
                try:
                    send_reservation_cancellation_to_customer(reservation)
                except Exception as e:
                    print(f"Email sending error for reservation {reservation.id}: {e}")
        
        session.commit()
        
        # Return message with cancellation info if any
        if not working_hours.is_available and 'cancelled_count' in locals() and cancelled_count > 0:
            return {
                "message": f"Working hours updated successfully. {cancelled_count} conflicting reservations were cancelled and customers were notified.",
                "cancelled_reservations": cancelled_count
            }
        else:
            return {"message": "Working hours updated successfully"}
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

@app.get("/admin/working-hours")
def get_working_hours(
    admin_user: str = Depends(verify_admin_token),
    session: Session = Depends(get_session)
):
    """Get all working hours settings"""
    working_hours = session.exec(select(WorkingHours).order_by(WorkingHours.date)).all()
    return working_hours

# Check if time slot is available (updated to consider working hours)
def convert_12h_to_24h(time_12h: str) -> str:
    """Convert 12-hour format to 24-hour format"""
    time_part, period = time_12h.split(' ')
    hours, minutes = time_part.split(':')
    hours = int(hours)
    
    if period == 'AM':
        if hours == 12:
            hours = 0
    else:  # PM
        if hours != 12:
            hours += 12
    
    return f"{hours:02d}:{minutes}"

def convert_24h_to_12h(time_24h: str) -> str:
    """Convert 24-hour format to 12-hour format"""
    hours, minutes = time_24h.split(':')
    hours = int(hours)
    
    if hours == 0:
        return f"12:{minutes} AM"
    elif hours < 12:
        return f"{hours}:{minutes} AM"
    elif hours == 12:
        return f"12:{minutes} PM"
    else:
        return f"{hours - 12}:{minutes} PM"

@app.get("/reservations/available-times")
def get_available_times(
    date: str = Query(..., description="YYYY-MM-DD formatında bir tarih"),
    session: Session = Depends(get_session)
):
    """Get available time slots for a specific date"""
    try:
        date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        
        # Get existing reservations for the date
        existing_reservations = session.exec(
            select(Reservation).where(
                and_(
                    func.date(Reservation.date) == date_obj,
                    Reservation.status == "active"
                )
            )
        ).all()
        
        # Get unavailable working hours for the date
        unavailable_hours = session.exec(
            select(WorkingHours).where(
                and_(
                    func.date(WorkingHours.date) == date_obj,
                    WorkingHours.is_available == False
                )
            )
        ).all()
        
        # Default time slots (12-hour format to match frontend)
        all_time_slots = [
            '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
            '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM'
        ]
        
        # Get reserved times from database
        reserved_times = [res.time for res in existing_reservations]
        
        # Add unavailable working hours to reserved times
        for unavailable in unavailable_hours:
            start_time_24h = unavailable.start_time
            end_time_24h = unavailable.end_time
            
            # Mark all slots between start and end time as reserved
            for slot in all_time_slots:
                slot_24h = convert_12h_to_24h(slot)
                if start_time_24h <= slot_24h < end_time_24h:
                    if slot not in reserved_times:
                        reserved_times.append(slot)
        
        # Available times = all slots that are NOT reserved
        available_times = [slot for slot in all_time_slots if slot not in reserved_times]
        
        return {
            "date": date,
            "all_time_slots": all_time_slots,  # Frontend needs all slots to show
            "available_times": available_times,
            "reserved_times": reserved_times
        }
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")

# Existing endpoints (updated)
class ReservationCreate(BaseModel):
    name: str
    email: str
    phone: str
    service: str
    date: str  # Accept as string from frontend
    time: str

@app.post("/reservations", response_model=Reservation)
def create_reservation(reservation_data: ReservationCreate, session: Session = Depends(get_session)):
    # Parse the date string to datetime
    try:
        parsed_date = datetime.fromisoformat(reservation_data.date.replace('Z', '+00:00'))
    except ValueError:
        # Try alternative parsing if ISO format fails
        try:
            parsed_date = datetime.strptime(reservation_data.date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")
    
    # Check for conflicts (only active reservations)
    conflict = session.exec(
        select(Reservation).where(
            Reservation.date == parsed_date,
            Reservation.time == reservation_data.time,
            Reservation.status == "active"
        )
    ).first()
    if conflict:
        raise HTTPException(status_code=400, detail="Bu gün ve saatte zaten bir rezervasyon var.")
    
    # Check working hours availability
    date_obj = parsed_date.date()
    reservation_time_24h = convert_12h_to_24h(reservation_data.time)
    unavailable_hours = session.exec(
        select(WorkingHours).where(
            and_(
                func.date(WorkingHours.date) == date_obj,
                WorkingHours.is_available == False,
                WorkingHours.start_time <= reservation_time_24h,
                WorkingHours.end_time > reservation_time_24h
            )
        )
    ).first()
    
    if unavailable_hours:
        raise HTTPException(status_code=400, detail="This time is outside working hours.")
    
    # Create new reservation object
    reservation = Reservation(
        name=reservation_data.name,
        email=reservation_data.email,
        phone=reservation_data.phone,
        service=reservation_data.service,
        date=parsed_date,
        time=reservation_data.time,
        status="active"
    )
    
    # Save reservation
    session.add(reservation)
    session.commit()
    session.refresh(reservation)
    
    # Send confirmation email to customer (in background, don't cancel reservation even if email fails)
    try:
        send_reservation_confirmation_to_customer(reservation)
    except Exception as e:
        print(f"Email sending error: {e}")
        # Reservation successful even if email fails
    
    return reservation

@app.get("/reservations", response_model=List[Reservation])
def get_reservations(session: Session = Depends(get_session)):
    reservations = session.exec(
        select(Reservation).where(Reservation.status == "active")
    ).all()
    return reservations

@app.get("/reservations/by-date", response_model=List[Reservation])
def get_reservations_by_date(
    date: date_type = Query(..., description="YYYY-MM-DD formatında bir tarih"), 
    session: Session = Depends(get_session)
):
    reservations = session.exec(
        select(Reservation).where(
            and_(
                func.date(Reservation.date) == date,
                Reservation.status == "active"
            )
        )
    ).all()
    return reservations

# Chatbot endpoint
@app.post("/chatbot", response_model=ChatResponse)
def chat_with_bot(message: ChatMessage):
    """Elite Cuts AI Chatbot - Barbershop assistant"""
    try:
        response = chatbot_service.get_response(
            message.message, 
            message.conversation_history
        )
        return ChatResponse(response=response)
    except Exception as e:
        print(f"Chatbot endpoint error: {e}")
        return ChatResponse(
            response="Sorry, I'm experiencing a technical issue right now. Please try again later."
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 