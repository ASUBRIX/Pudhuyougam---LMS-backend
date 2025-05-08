# LMS Backend API Overview

This document provides an overview of all available API endpoints in the Learning Management System backend server.

## Authentication

Most endpoints require authentication using the `auth_key` header, which is obtained after successful login. Some endpoints also require admin privileges.

## Available API Documentation

Detailed documentation for each API category is available in the following files:

- [User Management API](./users-api.md) - User registration, authentication, and profile management
- [Student Management API](./students-api.md) - Student profile management and administration
- [Banner Management API](./banner-api.md) - Promotional banner management
- [Website Settings API](./settings-api.md) - System-wide settings management
- [Terms and Conditions API](./terms-conditions-api.md) - Legal documents management
- [Test Management API](./tests-api.md) - Test creation and management

## Quick Reference

### User Management Endpoints

- **POST** `/api/users/register` - Register a new user
- **POST** `/api/users/login/email` - Login with email and password
- **POST** `/api/users/login/otp/request` - Request OTP for phone login
- **POST** `/api/users/login/otp/verify` - Verify OTP for phone login
- **GET** `/api/users` - Get all users (admin only)
- **GET** `/api/users/me` - Get current user profile

### Student Management Endpoints

- **GET** `/api/students/profile` - Get student profile
- **PUT** `/api/students/profile` - Update student profile
- **POST** `/api/students/profile/upload-picture` - Upload profile picture
- **GET** `/api/students` - Get all students (admin only)
- **POST** `/api/students` - Add new student (admin only)
- **PUT** `/api/students/:id` - Edit student (admin only)
- **PUT** `/api/students/:id/status` - Toggle student status (admin only)
- **DELETE** `/api/students/:id` - Delete student (admin only)
- **GET** `/api/students/stats` - Get student statistics (admin only)

### Banner Management Endpoints

- **GET** `/api/banners` - Get all banners
- **GET** `/api/banners/:id` - Get single banner
- **POST** `/api/banners` - Create banner
- **PUT** `/api/banners/:id` - Update banner
- **DELETE** `/api/banners/:id` - Delete banner

### Website Settings Endpoints

- **GET** `/api/settings` - Get website settings
- **PUT** `/api/settings` - Update website settings (admin only)

### Terms and Conditions Endpoints

- **GET** `/api/legal/terms` - Get current terms and conditions
- **GET** `/api/legal/terms/versions` - Get all terms versions (admin only)
- **PUT** `/api/legal/terms` - Update terms and conditions (admin only)
- **GET** `/api/legal/privacy` - Get current privacy policy
- **GET** `/api/legal/privacy/versions` - Get all privacy policy versions (admin only)
- **PUT** `/api/legal/privacy` - Update privacy policy (admin only)

### Test Management Endpoints

- **POST** `/api/tests/folders/create` - Create folder
- **GET** `/api/tests/folders/:folder_id/contents` - Get folder contents
- **DELETE** `/api/tests/folders/:folder_id` - Delete folder
- **POST** `/api/tests/test/create` - Create test
- **POST** `/api/tests/test/:test_id/questions` - Add question to test
- **PUT** `/api/tests/test/:test_id/questions/:question_id` - Edit question
- **DELETE** `/api/tests/test/:test_id/questions/:question_id` - Delete question
- **GET** `/api/tests/test/:test_id/questions` - Get all questions in a test
- **PUT** `/api/tests/test/:test_id/settings` - Update test settings
- **GET** `/api/tests/search` - Search and sort tests

## Response Format

All API endpoints return responses in JSON format. Successful responses typically return HTTP status code 200 (OK) or 201 (Created), while errors return appropriate 4xx or 5xx status codes.

## Error Handling

All endpoints use consistent error handling, returning an error object with a descriptive message:

```json
{
  "error": "Error description message"
}
```

Some endpoints may return more detailed validation errors:

```json
{
  "errors": [
    {
      "msg": "Field is required",
      "param": "field_name",
      "location": "body"
    }
  ]
}
```

## Common HTTP Status Codes

- `200 OK`: The request was successful
- `201 Created`: A new resource was created successfully
- `400 Bad Request`: The request was malformed or missing required fields
- `401 Unauthorized`: Authentication is required or failed
- `403 Forbidden`: The authenticated user doesn't have permission
- `404 Not Found`: The requested resource doesn't exist
- `500 Internal Server Error`: An unexpected error occurred on the server 