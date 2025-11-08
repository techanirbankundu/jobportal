# Job Portal Backend

A comprehensive job portal backend built with Node.js, Express, Drizzle ORM, and Neon PostgreSQL.

## Features

- **User Authentication**
  - User registration
  - User login with JWT
  - Role-based access control (candidate/recruiter)

- **User Management**
  - Profile management
  - CV upload to Cloudinary
  - Skills management

- **Job Management**
  - Create, read, update, delete jobs (recruiter only)
  - List all active jobs
  - Get single job details
  - Get relevant jobs based on candidate skills

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Drizzle ORM
- **Database**: Neon PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Cloudinary
- **Password Hashing**: bcryptjs

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── jobController.js
│   ├── db/               # Database configuration
│   │   ├── index.js
│   │   └── schema.js
│   ├── middleware/       # Custom middleware
│   │   └── authMiddleware.js
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── jobRoutes.js
│   ├── utils/            # Utility functions
│   │   ├── jwt.js
│   │   ├── password.js
│   │   └── cloudinary.js
│   ├── app.js            # Express app configuration
│   ├── index.js         # Server entry point
│   └── drizzle.config.js # Drizzle configuration
├── package.json
└── README.md
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the `backend` directory with the following variables:
   ```
   DATABASE_URL=your_neon_database_url
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   PORT=3000
   ```

3. **Database Migration**
   Generate and run migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Run the Server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### User Profile (Requires Authentication)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/cv/upload` - Upload CV (multipart/form-data)
- `GET /api/users/skills` - Get all available skills
- `POST /api/users/skills` - Add skills to user profile

### Jobs
- `GET /api/jobs` - Get all active jobs
- `GET /api/jobs/:id` - Get single job details
- `GET /api/jobs/relevant` - Get relevant jobs based on user skills (Requires Authentication)
- `POST /api/jobs` - Create a new job (Recruiter only)
- `PUT /api/jobs/:id` - Update a job (Recruiter only)
- `DELETE /api/jobs/:id` - Delete a job (Recruiter only)

## Request/Response Examples

### Register User
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "candidate" // or "recruiter"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Job (Recruiter)
```json
POST /api/jobs
Headers: Authorization: Bearer <token>
{
  "title": "Senior Developer",
  "description": "We are looking for...",
  "company": "Tech Corp",
  "location": "Remote",
  "salary": "$100k - $150k",
  "employmentType": "full-time",
  "skillIds": [1, 2, 3]
}
```

### Upload CV
```
POST /api/users/cv/upload
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: cv (file)
```

## Database Schema

- **users**: User accounts with roles (candidate/recruiter)
- **skills**: Available skills
- **user_skills**: Many-to-many relationship between users and skills
- **jobs**: Job postings
- **job_skills**: Many-to-many relationship between jobs and skills
- **applications**: Job applications (schema ready, endpoints can be added)

## Notes

- All passwords are hashed using bcryptjs
- JWT tokens are used for authentication
- CV files are uploaded to Cloudinary and only the URL is stored in the database
- The relevant jobs feature matches candidate skills with job requirements
- Recruiters can only manage their own jobs

