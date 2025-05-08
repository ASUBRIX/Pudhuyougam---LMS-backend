# Banner Management API Documentation

This document outlines the Banner Management API endpoints used to manage promotional banners on the LMS platform.

## Authentication

All banner management endpoints require admin authentication. Include the `auth_key` header with each request.

## API Endpoints

### Get All Banners

Retrieves a list of all banners with optional sorting and searching.

- **URL**: `/api/banners`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)
- **Query Parameters**:
  - `sort` (optional): Sort order for results (values: `newest`, `oldest`, `title`). Default: `newest`
  - `search` (optional): Search term to filter banners by title or description

#### Success Response

```json
[
  {
    "id": 1,
    "title": "Banner One",
    "image_url": "http://example.com/uploads/banners/banner-1.jpg",
    "link": "https://example.com",
    "description": "Main homepage banner",
    "created_at": "2023-06-15T10:30:00Z",
    "updated_at": "2023-06-15T10:30:00Z"
  },
  ...
]
```

### Get Single Banner

Retrieves a specific banner by ID.

- **URL**: `/api/banners/:id`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)
- **URL Parameters**:
  - `id`: Banner ID

#### Success Response

```json
{
  "id": 1,
  "title": "Banner One",
  "image_url": "http://example.com/uploads/banners/banner-1.jpg",
  "link": "https://example.com",
  "description": "Main homepage banner",
  "created_at": "2023-06-15T10:30:00Z",
  "updated_at": "2023-06-15T10:30:00Z"
}
```

#### Error Response

```json
{
  "error": "Banner not found"
}
```

### Create Banner

Creates a new banner.

- **URL**: `/api/banners`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `title` (required): Banner title
  - `image` (required): Banner image file (1126px x 400px recommended)
  - `link` (optional): URL for the banner to link to
  - `description` (optional): Description of the banner

#### Success Response

```json
{
  "id": 3,
  "title": "New Banner",
  "image_url": "http://example.com/uploads/banners/banner-12345.jpg",
  "link": "https://example.com",
  "description": "New promotional banner",
  "created_at": "2023-06-16T14:25:00Z",
  "updated_at": "2023-06-16T14:25:00Z"
}
```

#### Error Response

```json
{
  "error": "Title is required"
}
```

or

```json
{
  "error": "Image is required"
}
```

### Update Banner

Updates an existing banner.

- **URL**: `/api/banners/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)
- **Content-Type**: `multipart/form-data`
- **URL Parameters**:
  - `id`: Banner ID
- **Form Fields**:
  - `title` (optional): Updated banner title
  - `image` (optional): New banner image file
  - `link` (optional): Updated URL for the banner to link to
  - `description` (optional): Updated description of the banner

#### Success Response

```json
{
  "id": 3,
  "title": "Updated Banner",
  "image_url": "http://example.com/uploads/banners/banner-12345.jpg",
  "link": "https://example.com/updated",
  "description": "Updated promotional banner",
  "created_at": "2023-06-16T14:25:00Z",
  "updated_at": "2023-06-16T15:30:00Z"
}
```

#### Error Response

```json
{
  "error": "Banner not found"
}
```

### Delete Banner

Deletes a banner.

- **URL**: `/api/banners/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Admin)
- **URL Parameters**:
  - `id`: Banner ID

#### Success Response

```json
{
  "message": "Banner deleted successfully",
  "banner": {
    "id": 3,
    "title": "Banner to Delete",
    "image_url": "http://example.com/uploads/banners/banner-12345.jpg",
    "link": "https://example.com",
    "description": "Banner that was deleted",
    "created_at": "2023-06-16T14:25:00Z",
    "updated_at": "2023-06-16T15:30:00Z"
  }
}
```

#### Error Response

```json
{
  "error": "Banner not found"
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: The request was successful (GET, PUT, DELETE)
- `201 Created`: A new resource was created (POST)
- `400 Bad Request`: The request was malformed or missing required fields
- `401 Unauthorized`: Authentication is required or failed
- `403 Forbidden`: The authenticated user doesn't have permission (not an admin)
- `404 Not Found`: The requested resource doesn't exist
- `500 Internal Server Error`: An unexpected error occurred on the server 