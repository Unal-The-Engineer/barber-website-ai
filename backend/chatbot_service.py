import os
import json
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

from openai import OpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.schema import Document

from sqlmodel import Session, select, and_, func
from database import get_session
from models import Reservation, WorkingHours

# Load environment variables
load_dotenv()

class BarberChatbotService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = os.getenv("CHATBOT_MODEL", "gpt-4")
        self.temperature = float(os.getenv("CHATBOT_TEMPERATURE", "0.3"))
        self.max_tokens = int(os.getenv("CHATBOT_MAX_TOKENS", "500"))
        
        # Business info
        self.business_name = os.getenv("BUSINESS_NAME", "Elite Cuts")
        self.business_phone = os.getenv("BUSINESS_PHONE", "(555) 123-4567")
        self.business_address = os.getenv("BUSINESS_ADDRESS", "123 Main Street, Downtown District")
        self.business_hours = os.getenv("BUSINESS_HOURS", "Mon-Fri: 9AM-7PM, Sat: 8AM-6PM, Sun: 10AM-4PM")
        
        # RAG setup
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            model=os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
        )
        self.vector_store_path = os.getenv("VECTOR_STORE_PATH", "./vector_store/")
        
        # Load or create vector store
        self._setup_vector_store()
    
    def _setup_vector_store(self):
        """Setup vector store with business knowledge"""
        business_knowledge = [
            f"{self.business_name} is a professional barbershop.",
            f"Address: {self.business_address}",
            f"Phone: {self.business_phone}",
            f"Working hours: {self.business_hours}",
            "Our services: Classic haircuts, beard trimming, hot towel shaves, premium grooming packages",
            "Our prices: Classic cuts start from $35, beard trimming $25, premium packages $50-85",
            "Appointment system: You can book online appointments or call us by phone",
            "Our experienced barbers provide the highest quality service",
            "Modern equipment and hygienic environment guarantee",
            "Customer satisfaction is our priority",
        ]
        
        try:
            # Try to load existing vector store
            self.vector_store = FAISS.load_local(
                self.vector_store_path, 
                self.embeddings,
                allow_dangerous_deserialization=True
            )
            print("✅ Vector store loaded successfully")
        except:
            # Create new vector store
            documents = [Document(page_content=text) for text in business_knowledge]
            self.vector_store = FAISS.from_documents(documents, self.embeddings)
            
            # Save vector store
            os.makedirs(self.vector_store_path, exist_ok=True)
            self.vector_store.save_local(self.vector_store_path)
            print("✅ New vector store created and saved")
    
    def _get_system_prompt(self) -> str:
        """Strong and focused system prompt"""
        return f"""
You are the dedicated AI assistant for {self.business_name} barbershop. Your task is to help ONLY with barbershop-related topics.

## YOUR IDENTITY:
- Official AI assistant of {self.business_name} barbershop
- Professional, helpful, and friendly
- Expert assistant speaking English

## WHAT YOU SHOULD DO:
✅ Provide information about barber services
✅ Share working hours and pricing information
✅ Check appointment availability (date/time)
✅ Give general information about the salon
✅ Share address and contact information
✅ Make service recommendations
✅ ALWAYS direct customers to book appointments on the website

## NEVER DO:
❌ Talk about non-barber/salon topics
❌ Share personal appointment information
❌ Reveal customer data
❌ Give medical/health advice
❌ Make long unnecessary explanations
❌ Offer to book appointments directly (you can't book for them)
❌ Ask "Would you like me to book this for you?" (you don't have booking capability)

## FOR APPOINTMENT QUESTIONS:
- Only give time availability info ("This time is booked/available")
- Never mention customer names/details
- Suggest alternative times
- ALWAYS end with: "You can book your appointment on our website or call us at {self.business_phone}"
- NEVER offer to book for them directly

## SALON INFORMATION:
- Address: {self.business_address}
- Phone: {self.business_phone}  
- Hours: {self.business_hours}

## YOUR STYLE:
- Short and clear responses
- Friendly but professional
- Helpful and solution-focused
- Don't go into unnecessary detail

For off-topic questions: "Sorry, I can only help with {self.business_name} related questions. How can I assist you with our barber services?"

Now help the customer!
"""

    def _check_appointment_availability(self, date_str: str, time_str: str = None) -> Dict[str, Any]:
        """Check appointment availability from database"""
        try:
            # Parse date
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            
            # Get database session properly
            from database import engine
            with Session(engine) as session:
                # Check working hours for that date
                working_hours = session.exec(
                    select(WorkingHours).where(
                        func.date(WorkingHours.date) == target_date
                    )
                ).first()
                
                if not working_hours:
                    # No specific working hours set - assume default open hours
                    print(f"No working hours found for {target_date}, assuming default hours")
                    # Continue with normal availability check (don't return closed)
                
                # If specific time requested
                if time_str:
                    # Check if time slot is taken
                    existing_reservation = session.exec(
                        select(Reservation).where(
                            and_(
                                func.date(Reservation.date) == target_date,
                                Reservation.time == time_str,
                                Reservation.status == "active"
                            )
                        )
                    ).first()
                    
                    if existing_reservation:
                        return {
                            "available": False,
                            "message": f"{time_str} on {target_date.strftime('%B %d, %Y')} is already booked."
                        }
                    else:
                        return {
                            "available": True,
                            "message": f"{time_str} on {target_date.strftime('%B %d, %Y')} is available!"
                        }
                else:
                    # Get all reservations for that date
                    reservations = session.exec(
                        select(Reservation).where(
                            and_(
                                func.date(Reservation.date) == target_date,
                                Reservation.status == "active"
                            )
                        )
                    ).all()
                    
                    occupied_times = [r.time for r in reservations]
                    
                    # Generate available time slots (use same format as backend: 12-hour format)
                    all_slots = []
                    
                    # Default business hours: 9AM-6PM (12-hour format to match database)
                    time_slots = [
                        "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
                        "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", 
                        "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM"
                    ]
                    
                    for slot in time_slots:
                        if slot not in occupied_times:
                            all_slots.append(slot)
                    
                    if all_slots:
                        return {
                            "available": True,
                            "message": f"Available times on {target_date.strftime('%B %d, %Y')}: {', '.join(all_slots[:5])}" + ("..." if len(all_slots) > 5 else "")
                        }
                    else:
                        return {
                            "available": False,
                            "message": f"All time slots are booked on {target_date.strftime('%B %d, %Y')}."
                        }
                        
        except Exception as e:
            print(f"Appointment check error: {e}")
            print(f"Date string: {date_str}")
            import traceback
            traceback.print_exc()
            return {
                "available": False,
                "message": "There was an issue checking appointments. Please call us."
            }
    
    def _detect_appointment_query(self, message: str) -> Optional[Dict[str, str]]:
        """Detect appointment query and extract date/time"""
        import re
        
        message = message.lower()
        
        # Date patterns
        date_patterns = [
            r'(\d{1,2})\s*(january|february|march|april|may|june|july|august|september|october|november|december)',
            r'(\d{1,2})[./](\d{1,2})[./](\d{2,4})',
            r'(\d{4})-(\d{1,2})-(\d{1,2})',
            r'(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)'
        ]
        
        # Time patterns  
        time_patterns = [
            r'at\s*(\d{1,2}):?(\d{0,2})',
            r'(\d{1,2}):(\d{2})',
            r'(\d{1,2})\s*pm|am',
        ]
        
        # Check if it's an appointment query - broader detection
        appointment_keywords = [
            'appointment', 'available', 'free', 'booked', 'time', 'date', 'reservation', 'schedule',
            'book', 'open', 'slot', 'july', 'june', 'may', 'april', 'march', 'february', 'january',
            'august', 'september', 'october', 'november', 'december', 'today', 'tomorrow',
            'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
            'am', 'pm', ':', 'hour', 'o\'clock', 'busy', 'when', 'what time'
        ]
        # Much more liberal detection - if any date/time related word
        if not any(keyword in message for keyword in appointment_keywords):
            return None
        
        # Use LLM to extract date - much more powerful than regex
        try:
            extract_prompt = f"""
Extract date and time from this message: "{message}"

Current date: {datetime.now().strftime("%Y-%m-%d")}

Return ONLY in this exact JSON format:
{{"date": "YYYY-MM-DD or null", "time": "H:MM AM/PM or null"}}

Examples:
- "July 4th" → {{"date": "2024-07-04", "time": null}}
- "tomorrow at 3pm" → {{"date": "2024-07-02", "time": "3:00 PM"}}
- "9:00 AM on July 5th" → {{"date": "2024-07-05", "time": "9:00 AM"}}
- "available times today" → {{"date": "2024-07-01", "time": null}}

Time format must be: "9:00 AM", "12:30 PM", etc. (12-hour format with AM/PM)
"""
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": extract_prompt}],
                temperature=0,
                max_tokens=100
            )
            
            import json
            result = json.loads(response.choices[0].message.content.strip())
            
            # Return extracted data if valid
            if result.get("date") or result.get("time"):
                return {
                    "date": result.get("date"),
                    "time": result.get("time")
                }
        except Exception as e:
            print(f"LLM date extraction failed: {e}")
        
        # Fallback to simple detection
        extracted_date = None
        if 'today' in message:
            extracted_date = datetime.now().strftime("%Y-%m-%d")
        elif 'tomorrow' in message:
            extracted_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
            
        if extracted_date:
            return {"date": extracted_date, "time": None}
        
        return None

    def _get_relevant_context(self, query: str) -> str:
        """RAG: Get relevant context"""
        try:
            docs = self.vector_store.similarity_search(query, k=3)
            context = "\n".join([doc.page_content for doc in docs])
            return context
        except Exception as e:
            print(f"RAG error: {e}")
            return ""

    def get_response(self, user_message: str, conversation_history: list = None) -> str:
        """Main chatbot response function"""
        try:
            # Check if it's an appointment query
            appointment_query = self._detect_appointment_query(user_message)
            appointment_context = ""
            
            print(f"DEBUG: User message: {user_message}")
            print(f"DEBUG: Appointment query detected: {appointment_query}")
            
            if appointment_query:
                if appointment_query.get("date"):
                    print(f"DEBUG: Checking availability for date: {appointment_query['date']}")
                    availability = self._check_appointment_availability(
                        appointment_query["date"], 
                        appointment_query.get("time")
                    )
                    print(f"DEBUG: Availability result: {availability}")
                    appointment_context = f"\n\nAPPOINTMENT INFO: {availability['message']}"
            
            # Get relevant context from RAG
            rag_context = self._get_relevant_context(user_message)
            
            # Construct messages with conversation history
            messages = [{"role": "system", "content": self._get_system_prompt()}]
            
            # Add conversation history if provided
            if conversation_history:
                for msg in conversation_history[-4:]:  # Keep last 4 exchanges
                    if msg.get('role') in ['user', 'assistant']:
                        messages.append({
                            "role": msg['role'], 
                            "content": msg.get('content', '')
                        })
            
            # Add current message with context
            messages.append({
                "role": "user", 
                "content": f"CUSTOMER QUESTION: {user_message}\n\nRELEVANT INFO: {rag_context}{appointment_context}"
            })
            
            # Get response from OpenAI
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Chatbot error: {e}")
            return "Sorry, I'm experiencing a technical issue right now. Please try again later or call us at: " + self.business_phone

# Global instance
chatbot_service = BarberChatbotService() 