# API Services Documentation

This directory contains all API service functions to connect the frontend to the backend.

## Setup

1. Create a `.env` file in the frontend root directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

2. The API base URL defaults to `http://localhost:3000/api` if not specified.

## Authentication

All authenticated endpoints automatically include the JWT token from localStorage.

## Available Services

### Auth API (`authApi.js`)

#### `register(userData)`
Register a new user.
```javascript
import { register } from './services/authApi';

const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'candidate' // or 'recruiter'
};

const result = await register(userData);
// Token and user data are automatically saved to localStorage
```

#### `login(credentials)`
Login user.
```javascript
import { login } from './services/authApi';

const credentials = {
  email: 'john@example.com',
  password: 'password123'
};

const result = await login(credentials);
// Token and user data are automatically saved to localStorage
```

#### `logout()`
Logout user (clears token and user data).
```javascript
import { logout } from './services/authApi';

logout();
```

### User API (`userApi.js`)

#### `getProfile()`
Get current user profile with skills.
```javascript
import { getProfile } from './services/userApi';

const profile = await getProfile();
```

#### `updateProfile(profileData)`
Update user profile.
```javascript
import { updateProfile } from './services/userApi';

const profileData = {
  name: 'John Doe',
  phone: '1234567890',
  location: 'New York',
  bio: 'Software developer'
};

const result = await updateProfile(profileData);
```

#### `uploadCV(file)`
Upload CV file (PDF, DOC, or DOCX).
```javascript
import { uploadCV } from './services/userApi';

const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const result = await uploadCV(file);
```

#### `addSkills(skillIds)`
Add skills to user profile.
```javascript
import { addSkills } from './services/userApi';

const skillIds = [1, 2, 3]; // Array of skill IDs

const result = await addSkills(skillIds);
```

#### `getAllSkills()`
Get all available skills.
```javascript
import { getAllSkills } from './services/userApi';

const skills = await getAllSkills();
```

#### `createSkill(names)`
Create new skills.
```javascript
import { createSkill } from './services/userApi';

const names = ['React', 'Node.js', 'TypeScript'];

const result = await createSkill(names);
```

### Jobs API (`jobApi.js`)

#### `getAllJobs()`
Get all active jobs (public endpoint).
```javascript
import { getAllJobs } from './services/jobApi';

const jobs = await getAllJobs();
```

#### `getJobById(jobId)`
Get job details by ID (public endpoint).
```javascript
import { getJobById } from './services/jobApi';

const job = await getJobById(1);
```

#### `getRelevantJobs()`
Get relevant jobs based on user skills (requires authentication).
```javascript
import { getRelevantJobs } from './services/jobApi';

const jobs = await getRelevantJobs();
```

#### `createJob(jobData)`
Create a new job (recruiter only).
```javascript
import { createJob } from './services/jobApi';

const jobData = {
  title: 'Senior Developer',
  description: 'Job description...',
  company: 'Tech Corp',
  location: 'San Francisco',
  salary: 120000,
  employmentType: 'full-time',
  skillIds: [1, 2, 3]
};

const result = await createJob(jobData);
```

#### `updateJob(jobId, jobData)`
Update a job (recruiter only - own jobs).
```javascript
import { updateJob } from './services/jobApi';

const jobData = {
  title: 'Updated Title',
  salary: 130000,
  isActive: true
};

const result = await updateJob(1, jobData);
```

#### `deleteJob(jobId)`
Delete a job (recruiter only - own jobs).
```javascript
import { deleteJob } from './services/jobApi';

const result = await deleteJob(1);
```

## Error Handling

All API functions throw errors that should be caught:

```javascript
import { login } from './services/authApi';

try {
  const result = await login({ email: 'user@example.com', password: 'pass' });
  console.log('Success:', result);
} catch (error) {
  console.error('Error:', error.message);
  // Handle error (show message to user, etc.)
}
```

## Token Management

Tokens are automatically managed:
- Saved on login/register
- Included in authenticated requests
- Can be cleared with `logout()`

Use `isAuthenticated()` from `utils/token.js` to check if user is logged in:

```javascript
import { isAuthenticated } from './utils/token';

if (isAuthenticated()) {
  // User is logged in
}
```

