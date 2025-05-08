# Terms and Conditions API Documentation

This document outlines the Terms and Conditions API endpoints used to manage legal documents on the LMS platform.

## Authentication

Get current document endpoints are public, but version history and update endpoints require admin authentication with a valid `auth_key` header.

## API Endpoints

### Get Current Terms and Conditions

Retrieves the current version of terms and conditions.

- **URL**: `/api/legal/terms`
- **Method**: `GET`
- **Auth Required**: No

#### Success Response

```json
{
  "id": 5,
  "content": "<h1>Terms and Conditions</h1><p>These terms and conditions outline the rules and regulations for the use of our Learning Management System...</p>",
  "version": 5,
  "created_at": "2023-06-15T10:30:00Z",
  "updated_at": "2023-06-15T10:30:00Z"
}
```

### Get All Terms and Conditions Versions

Retrieves a history of all terms and conditions versions.

- **URL**: `/api/legal/terms/versions`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)

#### Success Response

```json
[
  {
    "id": 5,
    "content": "<h1>Terms and Conditions</h1><p>These terms and conditions outline the rules and regulations for the use of our Learning Management System...</p>",
    "version": 5,
    "created_at": "2023-06-15T10:30:00Z",
    "updated_at": "2023-06-15T10:30:00Z"
  },
  {
    "id": 4,
    "content": "<h1>Terms and Conditions</h1><p>Previous version of terms and conditions...</p>",
    "version": 4,
    "created_at": "2023-05-10T09:00:00Z",
    "updated_at": "2023-05-10T09:00:00Z"
  },
  ...
]
```

### Update Terms and Conditions

Creates a new version of terms and conditions.

- **URL**: `/api/legal/terms`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  - `content` (required): HTML content of terms and conditions

#### Success Response

```json
{
  "message": "Terms and conditions updated successfully",
  "terms": {
    "id": 6,
    "content": "<h1>Terms and Conditions</h1><p>Updated terms and conditions content...</p>",
    "version": 6,
    "created_at": "2023-07-20T14:45:00Z",
    "updated_at": "2023-07-20T14:45:00Z"
  }
}
```

#### Error Response

```json
{
  "errors": [
    {
      "msg": "Content is required",
      "param": "content",
      "location": "body"
    }
  ]
}
```

### Get Current Privacy Policy

Retrieves the current version of privacy policy.

- **URL**: `/api/legal/privacy`
- **Method**: `GET`
- **Auth Required**: No

#### Success Response

```json
{
  "id": 3,
  "content": "<h1>Privacy Policy</h1><p>This privacy policy outlines how we collect, use, and protect your personal information...</p>",
  "version": 3,
  "created_at": "2023-06-15T10:30:00Z",
  "updated_at": "2023-06-15T10:30:00Z"
}
```

### Get All Privacy Policy Versions

Retrieves a history of all privacy policy versions.

- **URL**: `/api/legal/privacy/versions`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)

#### Success Response

```json
[
  {
    "id": 3,
    "content": "<h1>Privacy Policy</h1><p>This privacy policy outlines how we collect, use, and protect your personal information...</p>",
    "version": 3,
    "created_at": "2023-06-15T10:30:00Z",
    "updated_at": "2023-06-15T10:30:00Z"
  },
  {
    "id": 2,
    "content": "<h1>Privacy Policy</h1><p>Previous version of privacy policy...</p>",
    "version": 2,
    "created_at": "2023-04-20T13:15:00Z",
    "updated_at": "2023-04-20T13:15:00Z"
  },
  ...
]
```

### Update Privacy Policy

Creates a new version of privacy policy.

- **URL**: `/api/legal/privacy`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  - `content` (required): HTML content of privacy policy

#### Success Response

```json
{
  "message": "Privacy policy updated successfully",
  "policy": {
    "id": 4,
    "content": "<h1>Privacy Policy</h1><p>Updated privacy policy content...</p>",
    "version": 4,
    "created_at": "2023-07-20T14:50:00Z",
    "updated_at": "2023-07-20T14:50:00Z"
  }
}
```

#### Error Response

```json
{
  "errors": [
    {
      "msg": "Content is required",
      "param": "content",
      "location": "body"
    }
  ]
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: The request was successful
- `400 Bad Request`: The request was malformed or missing required fields
- `401 Unauthorized`: Authentication is required or failed
- `403 Forbidden`: The authenticated user doesn't have permission (not an admin)
- `500 Internal Server Error`: An unexpected error occurred on the server 