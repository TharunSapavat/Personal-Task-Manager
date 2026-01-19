# Personal Task Manager 


A comprehensive task management system built with Node.js, Express, MongoDB, and React that helps users build productive habits through streak tracking, achievements, and intelligent reminders.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 📝 Task Management
- **Create & Organize Tasks**: Add tasks with titles, descriptions, priorities, and categories
- **Smart Deadlines**: Set due dates with automatic deadline tracking
- **Priority Levels**: Categorize tasks by urgency (High, Medium, Low)
- **Task Categories**: Organize tasks into custom categories for better management
- **Status Tracking**: Monitor task progress (Pending, In Progress, Completed)

### 🔥 Streak System
- **Daily Streak Tracking**: Build momentum by completing tasks consistently
- **Streak Statistics**: View current streak, longest streak, and streak history
- **Streak Preservation**: Automatic tracking of completion patterns
- **Visual Indicators**: See your streak progress at a glance

### 🏆 Achievement System
- **Unlockable Achievements**: Earn badges for reaching milestones
- **Achievement Categories**: 
  - Task Completion milestones (First Task, 10 Tasks, 50 Tasks, etc.)
  - Streak achievements (Week Warrior, Month Master, etc.)
  - Productivity awards (Early Bird, Night Owl, Speed Demon)
- **Achievement Notifications**: Celebrate wins with animated unlock modals
- **Progress Tracking**: See which achievements are close to unlocking

### 🔔 Smart Reminders
- **Email Notifications**: Automated reminders sent via Resend API
- **Custom Reminder Times**: Set specific reminder schedules for each task
- **Daily Digest**: Receive daily summaries of pending tasks
- **Deadline Alerts**: Get notified before task deadlines approach

### 📊 Analytics Dashboard
- **Task Statistics**: View completion rates and productivity metrics
- **Streak Analytics**: Analyze your consistency patterns
- **Category Breakdown**: See time distribution across different task types
- **Progress Charts**: Visual representation of your productivity journey

### 🎨 User Experience
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Smooth Animations**: Engaging transitions powered by Framer Motion
- **Confetti Celebrations**: Fun visual feedback for achievements
- **Real-time Updates**: Instant synchronization across the app
- **Toast Notifications**: Non-intrusive feedback for user actions

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (v5.2.1)
- **Database**: MongoDB with Mongoose ODM (v9.1.0)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt encryption
- **Email Service**: Resend API (v6.6.0)
- **Scheduled Tasks**: node-cron (v4.2.1)
- **Security**: Cookie-parser, CORS
- **Development**: Nodemon for auto-reload

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **State Management**: React Context API
- **Routing**: React Router DOM (v7.11.0)
- **Styling**: Tailwind CSS (v3.4.19)
- **UI Components**: Lucide React icons
- **Charts**: Chart.js with react-chartjs-2
- **Animations**: Framer Motion (v12.23.26)
- **Notifications**: React Toastify (v11.0.5)
- **Effects**: React Confetti (v6.4.0)
- **HTTP Client**: Axios (v1.13.2)
- **Linting**: ESLint (v9.39.1)

## 📁 Project Structure

```
Personal-Task-Manager/
├── backend/
│   ├── config/
│   │   └── achievements.js          # Achievement definitions and criteria
│   ├── controllers/
│   │   ├── achievementController.js # Achievement logic and unlocking
│   │   ├── auth.js                  # User authentication (login/register)
│   │   ├── quoteController.js       # Motivational quotes system
│   │   ├── streakController.js      # Streak tracking logic
│   │   └── taskController.js        # Task CRUD operations
│   ├── middlewares/
│   │   └── authMiddleware.js        # JWT verification middleware
│   ├── models/
│   │   ├── TaskModel.js             # Task schema and validation
│   │   └── UserModel.js             # User schema with achievements
│   ├── routes/
│   │   ├── achievementRoutes.js     # Achievement API endpoints
│   │   ├── auth.js                  # Auth API endpoints
│   │   ├── quoteRoutes.js           # Quote API endpoints
│   │   ├── streakRoutes.js          # Streak API endpoints
│   │   └── taskRoutes.js            # Task API endpoints
│   ├── services/
│   │   ├── customReminderScheduler.js  # Custom reminder scheduling
│   │   ├── emailService.js          # Email notification service
│   │   └── reminderScheduler.js     # Automated reminder system
│   ├── index.js                     # Express server entry point
│   ├── package.json
│   └── .env                         # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AchievementUnlockModal.jsx  # Achievement celebration modal
    │   │   ├── Navbar.jsx                  # Navigation bar
    │   │   └── Sidebar.jsx                 # Sidebar navigation
    │   ├── hooks/
    │   │   └── useDebounce.js              # Debounce hook for search
    │   ├── pages/
    │   │   ├── achievementspage.jsx        # Achievements dashboard
    │   │   ├── analyticspage.jsx           # Analytics and statistics
    │   │   ├── dashboard.jsx               # Main dashboard
    │   │   ├── landingPage.jsx             # Landing/welcome page
    │   │   ├── settingspage.jsx            # User settings
    │   │   ├── streakspage.jsx             # Streak tracking page
    │   │   └── taskspage.jsx               # Task management page
    │   ├── services/
    │   │   └── api.js                      # API client configuration
    │   ├── App.jsx                         # Main app component
    │   ├── main.jsx                        # React entry point
    │   ├── App.css
    │   └── index.css
    ├── public/                             # Static assets
    ├── index.html
    ├── vite.config.js                      # Vite configuration
    ├── tailwind.config.js                  # Tailwind CSS configuration
    ├── postcss.config.js                   # PostCSS configuration
    ├── eslint.config.js                    # ESLint configuration
    ├── vercel.json                         # Vercel deployment config
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn**
- **Resend API Account** (for email notifications)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/Personal-Task-Manager.git
cd Personal-Task-Manager
```

2. **Backend Setup**

```bash
cd backend
npm install
```

3. **Configure Environment Variables**

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
DB_URL=mongodb://localhost:27017/personal-task-manager
# Or use MongoDB Atlas:
# DB_URL=mongodb+srv://username:password@cluster.mongodb.net/personal-task-manager

# Authentication
JWT_KEY=your_super_secret_jwt_key_min_32_characters

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Frontend URL (for CORS and email links)
FRONTEND_URL=http://localhost:5173
```

4. **Frontend Setup**

```bash
cd ../frontend
npm install
```

### Start Development Servers

1. **Start Backend** (from `backend` directory):

```bash
npm start
# or for development with auto-reload:
npx nodemon index.js
```

2. **Start Frontend** (from `frontend` directory):

```bash
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

## 📚 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| GET | `/auth/profile` | Get user profile | Yes |

### Task Routes

**Base URL**: `/api/tasks`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all user tasks | Yes |
| POST | `/` | Create new task | Yes |
| GET | `/:id` | Get task by ID | Yes |
| PUT | `/:id` | Update task | Yes |
| DELETE | `/:id` | Delete task | Yes |
| PATCH | `/:id/complete` | Mark task as complete | Yes |

### Achievement Routes

**Base URL**: `/api/achievements`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user achievements | Yes |
| POST | `/check` | Check and unlock achievements | Yes |
| GET | `/available` | Get all available achievements | Yes |

### Streak Routes

**Base URL**: `/api/streaks`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user streak data | Yes |
| POST | `/update` | Update streak on task completion | Yes |
| GET | `/history` | Get streak history | Yes |

### Quote Routes

**Base URL**: `/api/quotes`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/daily` | Get daily motivational quote | Yes |
| GET | `/random` | Get random quote | Yes |

## 🔐 Authentication

Personal Task Manager uses **JWT (JSON Web Tokens)** for secure authentication.

### Request Headers
```
Authorization: Bearer <your_jwt_token>
```

### Registration
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Token Storage
- Tokens are stored in HTTP-only cookies
- Tokens expire after 7 days
- Refresh required after expiration

## 🎯 Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Backend server port | No | `4000` |
| `DB_URL` | MongoDB connection string | Yes | - |
| `JWT_KEY` | Secret key for JWT signing | Yes | - |
| `RESEND_API_KEY` | Resend API key for emails | Yes | - |
| `RESEND_FROM_EMAIL` | Sender email address | No | `onboarding@resend.dev` |
| `FRONTEND_URL` | Frontend application URL | No | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | No | `development` |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

### Adding npm Scripts (Optional)

For convenience, you can add these scripts to `backend/package.json`:

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js",
  "test": "jest"
}
```

## 📝 Future Enhancements

- [ ] Mobile application (React Native)
- [ ] Team collaboration features
- [ ] Recurring tasks and habits
- [ ] Task templates
- [ ] Dark mode toggle
- [ ] Advanced filtering and sorting
- [ ] Calendar view integration
- [ ] Voice task creation
- [ ] AI-powered task suggestions
- [ ] Export data (PDF, CSV)
- [ ] Third-party integrations (Google Calendar, Slack)
- [ ] Offline mode with sync
- [ ] Custom themes and personalization
- [ ] Gamification enhancements
- [ ] Social features (share achievements)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for productivity enthusiasts and goal-oriented individuals
- Inspired by modern habit-tracking and gamification principles
- Thanks to all contributors and supporters
- Special thanks to the open-source community

---

**Note**: This is a personal project. For production use, ensure proper security measures, data validation, error handling, and compliance with data protection regulations are implemented.

### 📞 Support

For questions, bug reports, or feature requests, please open an issue on GitHub.

**Made with ❤️ by S Tharun**
