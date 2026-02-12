# TaskMaster - Task Management System

A comprehensive task management REST API built with Node.js, Express, MongoDB, and advanced features including RBAC (Role-Based Access Control) and email notifications.

## Team

- **Chingiz** - Authentication & User Management
- **Kaysar** - Task Management & Validation
- **Sultan** - RBAC, Email Service & Deployment

## Features

### Core Functionality
- User authentication with JWT tokens
- Password hashing with bcrypt
- Role-based access control (User, Premium, Admin)
- Task CRUD operations with filtering
- Comment system for tasks
- Dashboard with statistics and analytics
- Email notifications (welcome, task assignment, deadlines)
- Automated email scheduler with cron jobs
- Rate limiting for API security
- User preferences management

### Advanced Features
- **RBAC (+5 points)**: Three user roles with different permissions
- **Email Service (+5 points)**: Five types of automated emails via Brevo
- Search functionality
- Task categories and priorities
- User task limits (20 for regular users, unlimited for premium/admin)

## Technologies

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT, bcryptjs
- **Email Service**: Nodemailer + Brevo (SendinBlue)
- **Validation**: Joi
- **Security**: express-rate-limit, CORS
- **Scheduling**: node-cron

## Installation

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas account
- Brevo (SendinBlue) account for emails

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/taskmaster.git
cd taskmaster
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

The server will run on `http://localhost:5000`

## Environment Configuration

### MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster (M0 Sandbox)
3. Create a database user
4. Whitelist your IP address (or 0.0.0.0/0 for development)
5. Get your connection string and update `MONGODB_URI` in .env

### Brevo Email Setup

1. Register at [Brevo](https://app.brevo.com)
2. Go to Settings → SMTP & API
3. Generate SMTP credentials
4. Update `.env`:
   ```
   SMTP_USER=your_email@example.com
   SMTP_PASSWORD=your_smtp_key
   ```

Free tier: 300 emails/day

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "username": "john",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Task Endpoints

All task endpoints require authentication. Include JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get All Tasks
```http
GET /api/tasks?status=todo&priority=high&category=work
```

#### Create Task
```http
POST /api/tasks
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "title": "Complete project",
  "description": "Finish the backend API",
  "status": "todo",
  "priority": "high",
  "category": "work",
  "dueDate": "2026-02-15"
}
```

#### Update Task
```http
PUT /api/tasks/:id
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "status": "completed"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Search Tasks
```http
GET /api/tasks/search?q=project
Authorization: Bearer YOUR_JWT_TOKEN
```

### Comment Endpoints

#### Get Comments
```http
GET /api/comments/:taskId
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Create Comment
```http
POST /api/comments/:taskId
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "text": "Great progress!"
}
```

### Dashboard Endpoint

```http
GET /api/dashboard
Authorization: Bearer YOUR_JWT_TOKEN
```

Returns:
- Total tasks
- Completed/todo/in-progress counts
- High priority tasks
- Overdue tasks
- Tasks by category/priority
- Completion rate

### User Endpoints

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update Profile
```http
PUT /api/users/profile
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "username": "newname",
  "email": "newemail@example.com"
}
```

### Preferences Endpoints

#### Get Preferences
```http
GET /api/preferences
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update Preferences
```http
PUT /api/preferences
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "emailNotifications": true,
  "theme": "dark",
  "language": "en"
}
```

### Admin Endpoints

Require admin role.

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer ADMIN_JWT_TOKEN
```

#### Change User Role
```http
PUT /api/admin/users/:id/role
Content-Type: application/json
Authorization: Bearer ADMIN_JWT_TOKEN

{
  "role": "premium"
}
```

## User Roles

| Role | Task Limit | Permissions |
|------|-----------|-------------|
| User | 20 tasks | Basic task management |
| Premium | Unlimited | All task features |
| Admin | Unlimited | Full system access + user management |

## Email Notifications

The system sends 5 types of automated emails:

1. **Welcome Email** - On user registration
2. **Task Assignment** - When task assigned to user
3. **Deadline Reminder** - 24 hours before due date
4. **Overdue Notice** - For missed deadlines
5. **Role Upgrade** - When user promoted to Premium/Admin

## Screenshots

### 1. User Registration
![Registration](screenshots/01-register.png)
*POST /api/auth/register - User registration with JWT token*

### 2. User Login
![Login](screenshots/02-login.png)
*POST /api/auth/login - Authentication and token generation*

### 3. Get User Profile
![Profile](screenshots/03-profile.png)
*GET /api/users/profile - Retrieve user data with preferences*

### 4. Create Task
![Create Task](screenshots/04-create-task.png)
*POST /api/tasks - Creating task with priority and category*

### 5. Get All Tasks
![Get Tasks](screenshots/05-get-tasks.png)
*GET /api/tasks - List all tasks with filters*

### 6. Task Search
![Search](screenshots/06-search.png)
*GET /api/tasks/search?q=keyword - Search functionality*

### 7. Dashboard Statistics
![Dashboard](screenshots/07-dashboard.png)
*GET /api/dashboard - Task statistics and analytics*

### 8. Create Comment
![Comment](screenshots/08-comment.png)
*POST /api/comments/:taskId - Adding comment to task*

### 9. Admin - Get Users
![Admin Users](screenshots/09-admin-users.png)
*GET /api/admin/users - Admin viewing all users*

### 10. Admin - Change Role
![Change Role](screenshots/10-change-role.png)
*PUT /api/admin/users/:id/role - Upgrading user to Premium*

## Project Structure

```
taskmaster/
├── config/
│   ├── database.js          # MongoDB connection
│   └── email.js             # Email service configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── taskController.js    # Task CRUD
│   ├── commentController.js # Comments
│   ├── dashboardController.js # Statistics
│   ├── preferencesController.js # User settings
│   └── adminController.js   # Admin functions
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── roleCheck.js         # RBAC middleware
│   ├── rateLimiter.js       # Rate limiting
│   ├── validate.js          # Input validation
│   └── errorHandler.js      # Error handling
├── models/
│   ├── User.js              # User schema
│   ├── Task.js              # Task schema
│   └── Comment.js           # Comment schema
├── routes/
│   ├── auth.js              # Auth routes
│   ├── users.js             # User routes
│   ├── tasks.js             # Task routes
│   ├── comments.js          # Comment routes
│   ├── dashboard.js         # Dashboard routes
│   ├── preferences.js       # Preferences routes
│   └── admin.js             # Admin routes
├── utils/
│   └── emailScheduler.js    # Cron jobs for emails
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── server.js                # Main application file
└── README.md
```

## Testing

Import the Postman collection (if provided) or test endpoints manually:

1. Register a new user
2. Login and save the JWT token
3. Use token in Authorization header for protected routes
4. Test task creation, updates, deletion
5. Test dashboard statistics
6. Test admin endpoints (requires admin role)

## Deployment

### Deploy to Render

1. Create account at [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables from .env
6. Deploy

Your API will be available at: `https://your-app-name.onrender.com`

## Contributing

This is a university project by Chingiz, Kaysar, and Sultan.

## License

MIT

## Support

For issues or questions, please contact the team members.
