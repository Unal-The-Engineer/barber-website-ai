# AI-Powered Barbershop Management System

A comprehensive full-stack barbershop management platform that combines modern web technologies with advanced AI integration to deliver seamless booking experiences and business automation.

## 🚀 Features

### Customer Features
- **Smart Booking System**: Real-time appointment scheduling with conflict prevention
- **AI Customer Support**: 24/7 intelligent chatbot powered by OpenAI GPT-4
- **Email Notifications**: Automated booking confirmations and cancellations
- **Responsive Design**: Mobile-friendly interface with modern UI/UX

### Business Features
- **Admin Dashboard**: Comprehensive management panel for reservations and analytics
- **Working Hours Management**: Flexible schedule configuration
- **Automated Data Cleanup**: Background jobs for optimal performance
- **Secure Authentication**: JWT-based admin access

### Technical Features
- **RAG Technology**: Retrieval Augmented Generation for intelligent responses
- **Vector Database**: FAISS-powered knowledge base for the chatbot
- **Real-time Updates**: Live data synchronization across the platform
- **Professional Email Templates**: HTML-formatted customer communications

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Lucide React** for modern icons
- **React Router** for navigation

### Backend
- **Python 3.11+**
- **FastAPI** for high-performance API
- **SQLModel** for database operations
- **Alembic** for database migrations
- **SQLite** for data storage

### AI Integration
- **OpenAI GPT-4** for intelligent conversations
- **LangChain** for AI workflow management
- **FAISS** for vector similarity search
- **Tiktoken** for token management

### Infrastructure
- **JWT** for secure authentication
- **SMTP** for email automation
- **APScheduler** for background jobs
- **CORS** middleware for cross-origin requests

## 🚦 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- OpenAI API key
- Gmail account (for email notifications)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/barber-website.git
cd barber-website
```

2. **Setup Frontend**
```bash
npm install
```

3. **Setup Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env file with your credentials
```

5. **Database Setup**
```bash
alembic upgrade head
```

### Running the Application

1. **Start Backend** (Terminal 1)
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload
```

2. **Start Frontend** (Terminal 2)
```bash
npm run dev
```

3. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Admin Dashboard: http://localhost:5173/admin

## 📧 Email Configuration

For email functionality, you need:
1. Gmail account with 2FA enabled
2. App-specific password generated
3. Configure EMAIL_ADDRESS and EMAIL_PASSWORD in .env

## 🤖 AI Configuration

1. Get OpenAI API key from https://platform.openai.com/
2. Add OPENAI_API_KEY to your .env file
3. The system will automatically create a vector knowledge base

## 🔐 Default Admin Credentials

- Username: `admin`
- Password: `admin`

**Important**: Change these credentials in production!

## 📱 API Endpoints

### Public Endpoints
- `GET /` - Health check
- `POST /reservations` - Create booking
- `GET /reservations/available-times` - Check availability
- `POST /chatbot` - Chat with AI assistant

### Admin Endpoints (JWT Required)
- `POST /admin/login` - Admin authentication
- `GET /admin/reservations/active` - Active bookings
- `GET /admin/reservations/past` - Past bookings
- `GET /admin/reservations/cancelled` - Cancelled bookings
- `DELETE /admin/reservations/{id}` - Cancel booking
- `POST /admin/working-hours` - Set working hours

## 🏗️ Project Structure

```
barber-website/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── context/           # React context providers
│   └── utils/             # Utility functions and constants
├── backend/               # Python FastAPI backend
│   ├── main.py           # FastAPI application
│   ├── models.py         # Database models
│   ├── database.py       # Database configuration
│   ├── email_service.py  # Email automation
│   ├── chatbot_service.py # AI chatbot logic
│   └── alembic/          # Database migrations
└── README.md
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Heroku)
```bash
# Update database to PostgreSQL for production
# Set environment variables
# Deploy backend folder
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- FastAPI for the excellent Python framework
- React team for the frontend framework
- LangChain for AI orchestration tools

## 📞 Support

For support, email your-email@gmail.com or open an issue on GitHub.

---

**Built with ❤️ for modern barbershops** 