# Website Settings API Documentation

This document outlines the Website Settings API endpoints used to manage site-wide settings on the LMS platform.

## Authentication

Get settings endpoint is public, but update endpoint requires admin authentication with a valid `auth_key` header.

## API Endpoints

### Get Website Settings

Retrieves all website settings.

- **URL**: `/api/settings`
- **Method**: `GET`
- **Auth Required**: No

#### Success Response

```json
{
  "site_name": "Learning Management System",
  "site_title": "Online Learning Platform",
  "site_description": "A comprehensive learning management system",
  "site_email": "info@example.com",
  "site_phone": "+1234567890",
  "site_address": "123 Learning Street, Education City",
  "site_logo": "/uploads/site_logo-12345.png",
  "site_favicon": "/uploads/site_favicon-12345.ico",
  "copyright_text": "© 2023 Learning Management System",
  "facebook_url": "https://facebook.com/lms",
  "youtube_url": "https://youtube.com/lms",
  "telegram_url": "https://t.me/lms",
  "instagram_url": "https://instagram.com/lms",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

### Update Website Settings

Updates website settings.

- **URL**: `/api/settings`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `site_name` (optional): Name of the website
  - `site_title` (optional): Title of the website
  - `site_description` (optional): Description of the website
  - `site_email` (optional): Contact email address
  - `site_phone` (optional): Contact phone number
  - `site_address` (optional): Physical address
  - `site_logo` (optional): Logo image file
  - `site_favicon` (optional): Favicon image file
  - `copyright_text` (optional): Copyright text to display
  - `facebook_url` (optional): Facebook page URL
  - `youtube_url` (optional): YouTube channel URL
  - `telegram_url` (optional): Telegram channel URL
  - `instagram_url` (optional): Instagram profile URL

#### Success Response

```json
{
  "message": "Website settings updated successfully",
  "settings": {
    "site_name": "Updated LMS Name",
    "site_title": "Updated Online Learning Platform",
    "site_description": "An updated comprehensive learning management system",
    "site_email": "updated@example.com",
    "site_phone": "+0987654321",
    "site_address": "456 Education Avenue, Learning City",
    "site_logo": "/uploads/site_logo-67890.png",
    "site_favicon": "/uploads/site_favicon-67890.ico",
    "copyright_text": "© 2023 Updated LMS",
    "facebook_url": "https://facebook.com/updated-lms",
    "youtube_url": "https://youtube.com/updated-lms",
    "telegram_url": "https://t.me/updated-lms",
    "instagram_url": "https://instagram.com/updated-lms",
    "updated_at": "2023-01-03T00:00:00Z"
  }
}
```

#### Error Response

```json
{
  "error": "Only image files are allowed!"
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: The request was successful
- `400 Bad Request`: The request was malformed or missing required fields
- `401 Unauthorized`: Authentication is required or failed
- `403 Forbidden`: The authenticated user doesn't have permission (not an admin)
- `500 Internal Server Error`: An unexpected error occurred on the server 