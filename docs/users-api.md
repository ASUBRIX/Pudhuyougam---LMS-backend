# User Management API Documentation

This document outlines the User Management API endpoints used for user authentication and management on the LMS platform.

## Authentication

Some endpoints do not require authentication (register, login), while others require a valid `auth_key` header.

## API Endpoints

### Register User

Creates a new user account.

- **URL**: `/api/users/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  - `first_name` (required): User's first name
  - `last_name` (required): User's last name
  - `email` (required): User's email address
  - `password_hash` (required): Hashed password
  - `phone_number` (optional): User's phone number
  - `role` (optional): User's role (e.g., "student", "admin")

#### Success Response

```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone_number": "1234567890",
  "role": "student",
  "created_at": "2023-06-15T10:30:00Z",
  "updated_at": "2023-06-15T10:30:00Z"
}
```

#### Error Response

```json
{
  "error": "Email already exists."
}
```

or

```json
{
  "error": "First name, last name, email, and password are required."
}
```

### Login with Email and Password

Authenticates a user with email and password.

- **URL**: `/api/users/login/email`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  - `email` (required): User's email address
  - `password_hash` (required): Hashed password

#### Success Response

```json
{
  "auth_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "student"
  }
}
```

#### Error Response

```json
{
  "error": "Invalid email or password."
}
```

### Request OTP for Login

Generates a one-time password for phone number authentication.

- **URL**: `/api/users/login/otp/request`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  - `phone_number` (required): User's phone number

#### Success Response

```json
{
  "message": "OTP sent",
  "otp": "123456"  // Note: OTP should not be returned in production
}
```

#### Error Response

```json
{
  "error": "User not found."
}
```

### Verify OTP for Login

Verifies the OTP and authenticates the user.

- **URL**: `/api/users/login/otp/verify`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  - `phone_number` (required): User's phone number
  - `otp` (required): The one-time password received

#### Success Response

```json
{
  "auth_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "student"
  }
}
```

#### Error Response

```json
{
  "error": "Invalid or expired OTP."
}
```

### Get All Users

Retrieves a list of all users (admin only).

- **URL**: `/api/users`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)

#### Success Response

```json
[
  {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone_number": "1234567890",
    "role": "student",
    "created_at": "2023-06-15T10:30:00Z",
    "updated_at": "2023-06-15T10:30:00Z"
  },
  {
    "id": 2,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "phone_number": "0987654321",
    "role": "admin",
    "created_at": "2023-06-15T11:30:00Z",
    "updated_at": "2023-06-15T11:30:00Z"
  }
]
```

### Get Current User Profile

Retrieves the profile of the currently authenticated user.

- **URL**: `/api/users/me`
- **Method**: `GET`
- **Auth Required**: Yes

#### Success Response

```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone_number": "1234567890",
  "role": "student",
  "created_at": "2023-06-15T10:30:00Z",
  "updated_at": "2023-06-15T10:30:00Z"
}
```

#### Error Response

```json
{
  "error": "User not found."
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: The request was successful
- `201 Created`: A new resource was created (POST)
- `400 Bad Request`: The request was malformed or missing required fields
- `401 Unauthorized`: Authentication is required or failed
- `404 Not Found`: The requested resource doesn't exist
- `500 Internal Server Error`: An unexpected error occurred on the server 