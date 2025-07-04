import smtplib
import os
import locale
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from models import Reservation
from dotenv import load_dotenv

# Set locale to English for date formatting
try:
    locale.setlocale(locale.LC_TIME, 'en_US.UTF-8')
except locale.Error:
    try:
        locale.setlocale(locale.LC_TIME, 'en_US')
    except locale.Error:
        try:
            locale.setlocale(locale.LC_TIME, 'C')
        except locale.Error:
            pass  # Use system default if none work

# Load .env file
load_dotenv()

# Gmail SMTP settings
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS", "your-email@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "your-app-password")

def send_email(to_email: str, subject: str, body: str):
    """General email sending function"""
    try:
        # Create email
        msg = MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add email content
        msg.attach(MIMEText(body, 'html'))
        
        # Establish SMTP connection and send email
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        text = msg.as_string()
        server.sendmail(EMAIL_ADDRESS, to_email, text)
        server.quit()
        
        print(f"Email sent successfully: {to_email}")
        return True
    except Exception as e:
        print(f"Email sending error: {e}")
        return False

def send_reservation_confirmation_to_customer(reservation: Reservation):
    """Send reservation confirmation email to customer"""
    subject = "Reservation Confirmation - Elite Cuts"
    
    # Format date (with day information)
    reservation_date = reservation.date.strftime("%d %B %Y, %A")
    
    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reservation Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3C2415 0%, #2A1810 100%); padding: 40px; text-align: center;">
                <h1 style="color: #F0EDE6; margin: 0 0 8px; font-size: 42px; font-weight: 700; letter-spacing: 1px; font-family: Georgia, 'Times New Roman', serif;">Elite Cuts</h1>
                <div style="color: rgba(240, 237, 230, 0.9); margin: 0; font-size: 12px; letter-spacing: 3px; font-weight: 500; font-family: Arial, sans-serif;">EST. 2010</div>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
                <h2 style="color: #2c3e50; margin: 0 0 20px; font-size: 22px; font-weight: 400; text-align: center;">Reservation Confirmation</h2>
                
                <p style="color: #5a6c7d; font-size: 15px; margin-bottom: 25px; text-align: center;">
                    Dear <strong style="color: #3C2415;">{reservation.name}</strong>, your reservation has been successfully confirmed.
                </p>
                
                <!-- Reservation Details -->
                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #6c757d; font-size: 14px; font-weight: 500;">Date</td>
                            <td style="padding: 8px 0; color: #2c3e50; font-size: 16px; font-weight: 600; text-align: right;">{reservation_date}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6c757d; font-size: 14px; font-weight: 500; border-top: 1px solid #e9ecef;">Time</td>
                            <td style="padding: 8px 0; color: #3C2415; font-size: 16px; font-weight: 600; text-align: right; border-top: 1px solid #e9ecef;">{reservation.time}</td>
                        </tr>
                    </table>
                </div>
                
                <!-- Important Notes -->
                <div style="background-color: #f8f9fa; border-left: 4px solid #3C2415; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
                    <h4 style="color: #3C2415; margin: 0 0 15px; font-size: 16px; font-weight: 500;">Important Information</h4>
                    <ul style="margin: 0; padding-left: 20px; color: #5a6c7d; font-size: 14px; line-height: 1.6;">
                        <li style="margin-bottom: 8px;">Please arrive 5 minutes before your appointment</li>
                        <li style="margin-bottom: 8px;">For changes, please notify us at least 2 hours in advance</li>
                        <li>For cancellations, you can call (555) 123-4567</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin-top: 25px;">
                    <p style="color: #6c757d; font-size: 14px; margin: 0;">Thank you for your appointment.</p>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
                <p style="color: #95a5a6; margin: 0; font-size: 13px;">
                    123 Main Street • (555) 123-4567
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(reservation.email, subject, body)

def send_reservation_cancellation_to_customer(reservation: Reservation):
    """Send reservation cancellation email to customer"""
    subject = "Reservation Cancellation - Elite Cuts"
    
    # Format date (with day information)
    reservation_date = reservation.date.strftime("%d %B %Y, %A")
    
    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reservation Cancellation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3C2415 0%, #2A1810 100%); padding: 40px; text-align: center;">
                <h1 style="color: #F0EDE6; margin: 0 0 8px; font-size: 42px; font-weight: 700; letter-spacing: 1px; font-family: Georgia, 'Times New Roman', serif;">Elite Cuts</h1>
                <div style="color: rgba(240, 237, 230, 0.9); margin: 0; font-size: 12px; letter-spacing: 3px; font-weight: 500; font-family: Arial, sans-serif;">EST. 2010</div>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
                <h2 style="color: #dc3545; margin: 0 0 20px; font-size: 22px; font-weight: 400; text-align: center;">Reservation Cancellation</h2>
                
                <p style="color: #5a6c7d; font-size: 15px; margin-bottom: 25px; text-align: center;">
                    Dear <strong style="color: #3C2415;">{reservation.name}</strong>, your reservation has been cancelled.
                </p>
                
                <!-- Cancelled Reservation Details -->
                <div style="background-color: #fff5f5; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                    <h4 style="color: #dc3545; margin: 0 0 15px; font-size: 16px; font-weight: 500;">Cancelled Reservation</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #6c757d; font-size: 14px; font-weight: 500;">Date</td>
                            <td style="padding: 8px 0; color: #2c3e50; font-size: 16px; font-weight: 600; text-align: right;">{reservation_date}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6c757d; font-size: 14px; font-weight: 500; border-top: 1px solid #e9ecef;">Time</td>
                            <td style="padding: 8px 0; color: #dc3545; font-size: 16px; font-weight: 600; text-align: right; border-top: 1px solid #e9ecef;">{reservation.time}</td>
                        </tr>
                    </table>
                </div>
                
                <!-- New Booking Information -->
                <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
                    <h4 style="color: #3b82f6; margin: 0 0 15px; font-size: 16px; font-weight: 500;">New Reservation</h4>
                    <p style="margin: 0; color: #5a6c7d; font-size: 14px; line-height: 1.6;">
                        You can make a reservation for another date. Visit our website to see available times and create your new appointment.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 25px;">
                    <p style="color: #6c757d; font-size: 14px; margin: 0 0 15px;">Thank you for your understanding.</p>
                    <a href="http://localhost:5173/appointment" style="display: inline-block; background-color: #3C2415; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">Make New Reservation</a>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
                <p style="color: #95a5a6; margin: 0; font-size: 13px;">
                    123 Main Street • (555) 123-4567
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(reservation.email, subject, body)

 