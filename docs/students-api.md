# Student Management API Documentation

This document outlines the Student Management API endpoints used for managing student profiles on the LMS platform.

## Authentication

All student management endpoints require authentication with a valid `auth_key` header. Some endpoints require admin privileges.

## API Endpoints

### Get Student Profile

Retrieves the profile of the currently authenticated student.

- **URL**: `/api/students/profile`
- **Method**: `GET`
- **Auth Required**: Yes (Student)

#### Success Response

```json
{
  "id": 1,
  "user_id": 10,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "1234567890",
  "enrollment_date": "2023-06-15T10:30:00Z",
  "status": "active",
  "about": "Student pursuing computer science",
  "education": "Bachelor's in Computer Science",
  "profile_picture": "/uploads/profile-pictures/1/profile-12345.jpg",
  "created_at": "2023-06-15T10:30:00Z",
  "updated_at": "2023-06-15T10:30:00Z"
}
```

#### Error Response

```json
{
  "error": "Student not found"
}
```

### Update Student Profile

Updates the profile of the currently authenticated student.

- **URL**: `/api/students/profile`
- **Method**: `PUT`
- **Auth Required**: Yes (Student)
- **Request Body**:
  - `firstName` (optional): Student's first name
  - `lastName` (optional): Student's last name
  - `email` (optional): Student's email address
  - `phone` (optional): Student's phone number
  - `about` (optional): Student's bio information
  - `education` (optional): Student's education background
  - `profilePicture` (optional): Path to profile picture

#### Success Response

```json
{
  "message": "Profile updated successfully",
  "student": {
    "id": 1,
    "user_id": 10,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "enrollment_date": "2023-06-15T10:30:00Z",
    "status": "active",
    "about": "Updated student bio information",
    "education": "Updated education information",
    "profile_picture": "/uploads/profile-pictures/1/profile-12345.jpg",
    "created_at": "2023-06-15T10:30:00Z",
    "updated_at": "2023-06-16T11:30:00Z"
  }
}
```

### Upload Profile Picture

Uploads a profile picture for the currently authenticated student.

- **URL**: `/api/students/profile/upload-picture`
- **Method**: `POST`
- **Auth Required**: Yes (Student)
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `profilePicture` (required): Image file (JPG, JPEG, PNG, GIF)

#### Success Response

```json
{
  "message": "Profile picture updated successfully",
  "profilePicture": "/uploads/profile-pictures/1/profile-12345.jpg",
  "student": {
    "id": 1,
    "user_id": 10,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "profile_picture": "/uploads/profile-pictures/1/profile-12345.jpg",
    "updated_at": "2023-06-16T11:30:00Z"
  }
}
```

#### Error Response

```json
{
  "error": "No file uploaded"
}
```

or

```json
{
  "error": "Only image files are allowed!"
}
```

### Get All Students (Admin)

Retrieves a list of all students with optional search, sort, and filter.

- **URL**: `/api/students`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)
- **Query Parameters**:
  - `search` (optional): Search term to filter students by name, email, or ID
  - `sortBy` (optional): Sort order for results (values: `newest`, `oldest`, `name`, `status`). Default: `newest`
  - `fromDate` (optional): Filter students enrolled after this date
  - `toDate` (optional): Filter students enrolled before this date

#### Success Response

```json
[
  {
    "id": 1,
    "user_id": 10,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "enrollment_date": "2023-06-15T10:30:00Z",
    "status": "active",
    "about": "Student pursuing computer science",
    "education": "Bachelor's in Computer Science",
    "profile_picture": "/uploads/profile-pictures/1/profile-12345.jpg"
  },
  ...
]
```

### Add New Student (Admin)

Creates a new student account.

- **URL**: `/api/students`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  - `userId` (optional): Associated user ID (if a user record already exists)
  - `firstName` (required): Student's first name
  - `lastName` (required): Student's last name
  - `email` (required): Student's email address
  - `phone` (optional): Student's phone number
  - `enrollmentDate` (optional): Date of enrollment
  - `status` (optional): Student's status (default: "active")
  - `about` (optional): Student's bio information
  - `education` (optional): Student's education background
  - `profilePicture` (optional): Path to profile picture
  - `password_hash` (optional): Password if creating a new user

#### Success Response

```json
{
  "message": "Student added successfully",
  "student": {
    "id": 3,
    "user_id": 15,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone": "0987654321",
    "enrollment_date": "2023-06-16T10:30:00Z",
    "status": "active",
    "created_at": "2023-06-16T10:30:00Z",
    "updated_at": "2023-06-16T10:30:00Z"
  }
}
```

### Edit Student (Admin)

Updates an existing student record.

- **URL**: `/api/students/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)
- **URL Parameters**:
  - `id`: Student ID
- **Request Body**:
  - `userId` (optional): Associated user ID
  - `firstName` (optional): Student's first name
  - `lastName` (optional): Student's last name
  - `email` (optional): Student's email address
  - `phone` (optional): Student's phone number
  - `enrollmentDate` (optional): Date of enrollment
  - `status` (optional): Student's status
  - `about` (optional): Student's bio information
  - `education` (optional): Student's education background
  - `profilePicture` (optional): Path to profile picture

#### Success Response

```json
{
  "message": "Student edited successfully",
  "student": {
    "id": 3,
    "user_id": 15,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.updated@example.com",
    "status": "inactive",
    "updated_at": "2023-06-17T10:30:00Z"
  }
}
```

#### Error Response

```json
{
  "error": "Student not found"
}
```

### Toggle Student Status (Admin)

Updates a student's status.

- **URL**: `/api/students/:id/status`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)
- **URL Parameters**:
  - `id`: Student ID
- **Request Body**:
  - `status` (required): New status value (e.g., "active", "inactive")

#### Success Response

```json
{
  "message": "Student status updated successfully",
  "student": {
    "id": 3,
    "status": "inactive"
  }
}
```

#### Error Response

```json
{
  "error": "Student not found"
}
```

### Delete Student (Admin)

Deletes a student record.

- **URL**: `/api/students/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Admin)
- **URL Parameters**:
  - `id`: Student ID

#### Success Response

```json
{
  "message": "Student deleted successfully",
  "studentId": "3"
}
```

#### Error Response

```json
{
  "error": "Student not found"
}
```

### Get Student Statistics (Admin)

Retrieves student statistics.

- **URL**: `/api/students/stats`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)

#### Success Response

```json
{
  "total_students": 250,
  "active_students": 230
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: The request was successful
- `400 Bad Request`: The request was malformed or missing required fields
- `401 Unauthorized`: Authentication is required or failed
- `403 Forbidden`: The authenticated user doesn't have permission
- `404 Not Found`: The requested resource doesn't exist
- `500 Internal Server Error`: An unexpected error occurred on the server 