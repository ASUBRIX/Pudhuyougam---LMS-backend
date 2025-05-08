# Test Management API Documentation

This document outlines the Test Management API endpoints used to create and manage tests on the LMS platform.

## Authentication

All test management endpoints require authentication with a valid `auth_key` header. Most endpoints require admin privileges.

## API Endpoints

### Create Folder

Creates a new folder for organizing tests.

- **URL**: `/api/tests/folders/create`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  - `name` (required): Folder name
  - `parent_id` (optional): Parent folder ID, if creating a sub-folder

#### Success Response

```json
{
  "id": 5,
  "name": "Math Tests",
  "parent_id": null,
  "created_at": "2023-06-15T10:30:00Z",
  "updated_at": "2023-06-15T10:30:00Z"
}
```

### Get Folder Contents

Retrieves tests and sub-folders within a folder.

- **URL**: `/api/tests/folders/:folder_id/contents`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)
- **URL Parameters**:
  - `folder_id`: Folder ID

#### Success Response

```json
{
  "folders": [
    {
      "id": 6,
      "name": "Algebra",
      "parent_id": 5,
      "created_at": "2023-06-16T09:15:00Z",
      "updated_at": "2023-06-16T09:15:00Z"
    }
  ],
  "tests": [
    {
      "id": 10,
      "title": "Basic Math Test",
      "description": "Test covering basic math concepts",
      "category": "math",
      "status": "published",
      "is_free": true,
      "folder_id": 5,
      "created_at": "2023-06-16T11:30:00Z",
      "updated_at": "2023-06-16T11:30:00Z",
      "question_count": 20
    }
  ]
}
```

### Delete Folder

Deletes a folder.

- **URL**: `/api/tests/folders/:folder_id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Admin)
- **URL Parameters**:
  - `folder_id`: Folder ID

#### Success Response

```json
{
  "message": "Folder deleted successfully",
  "folderId": 5
}
```

#### Error Response

```json
{
  "error": "Cannot delete folder with tests or sub-folders"
}
```

### Create Test

Creates a new test.

- **URL**: `/api/tests/test/create`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Request Body**:
  - `title` (required): Test title
  - `description` (optional): Test description
  - `category` (optional): Test category
  - `folder_id` (optional): Folder ID to place the test in
  - `is_free` (optional): Whether the test is free or paid

#### Success Response

```json
{
  "id": 12,
  "title": "Advanced Physics",
  "description": "Test covering advanced physics concepts",
  "category": "physics",
  "status": "draft",
  "is_free": false,
  "folder_id": 7,
  "created_at": "2023-07-10T14:00:00Z",
  "updated_at": "2023-07-10T14:00:00Z"
}
```

### Add Question to Test

Adds a question to an existing test.

- **URL**: `/api/tests/test/:test_id/questions`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **URL Parameters**:
  - `test_id`: Test ID
- **Request Body**:
  - `question_text` (required): The question text
  - `question_type` (required): Type of question (e.g., "multiple_choice", "true_false")
  - `options` (required for multiple choice): Array of answer options
  - `correct_answer` (required): The correct answer or index of correct answer
  - `explanation` (optional): Explanation of the correct answer
  - `marks` (optional): Points for correct answer (default: 1)

#### Success Response

```json
{
  "status": "success",
  "message": "Question added successfully.",
  "question": {
    "id": 45,
    "test_id": 12,
    "question_text": "What is the formula for calculating force?",
    "question_type": "multiple_choice",
    "options": ["F = ma", "F = mv", "F = mg", "F = m/a"],
    "correct_answer": 0,
    "explanation": "Force equals mass times acceleration (F = ma) according to Newton's Second Law of Motion.",
    "marks": 2,
    "created_at": "2023-07-10T14:30:00Z",
    "updated_at": "2023-07-10T14:30:00Z"
  }
}
```

### Edit Question

Updates an existing question.

- **URL**: `/api/tests/test/:test_id/questions/:question_id`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)
- **URL Parameters**:
  - `test_id`: Test ID
  - `question_id`: Question ID
- **Request Body**:
  - `question_text` (optional): Updated question text
  - `question_type` (optional): Updated type of question
  - `options` (optional): Updated array of answer options
  - `correct_answer` (optional): Updated correct answer
  - `explanation` (optional): Updated explanation
  - `marks` (optional): Updated points value

#### Success Response

```json
{
  "status": "success",
  "message": "Question updated successfully.",
  "question": {
    "id": 45,
    "test_id": 12,
    "question_text": "According to Newton's Second Law, what is the formula for calculating force?",
    "question_type": "multiple_choice",
    "options": ["F = ma", "F = mv", "F = mg", "F = m/a"],
    "correct_answer": 0,
    "explanation": "Force equals mass times acceleration (F = ma) according to Newton's Second Law of Motion.",
    "marks": 3,
    "created_at": "2023-07-10T14:30:00Z",
    "updated_at": "2023-07-11T09:45:00Z"
  }
}
```

### Delete Question

Deletes a question from a test.

- **URL**: `/api/tests/test/:test_id/questions/:question_id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Admin)
- **URL Parameters**:
  - `test_id`: Test ID
  - `question_id`: Question ID

#### Success Response

```json
{
  "status": "success",
  "message": "Question deleted successfully."
}
```

### Get All Questions in a Test

Retrieves all questions for a specific test.

- **URL**: `/api/tests/test/:test_id/questions`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)
- **URL Parameters**:
  - `test_id`: Test ID

#### Success Response

```json
[
  {
    "id": 45,
    "test_id": 12,
    "question_text": "According to Newton's Second Law, what is the formula for calculating force?",
    "question_type": "multiple_choice",
    "options": ["F = ma", "F = mv", "F = mg", "F = m/a"],
    "correct_answer": 0,
    "explanation": "Force equals mass times acceleration (F = ma) according to Newton's Second Law of Motion.",
    "marks": 3,
    "created_at": "2023-07-10T14:30:00Z",
    "updated_at": "2023-07-11T09:45:00Z"
  },
  {
    "id": 46,
    "test_id": 12,
    "question_text": "Is momentum a vector quantity?",
    "question_type": "true_false",
    "options": ["True", "False"],
    "correct_answer": 0,
    "explanation": "Momentum is a vector quantity because it has both magnitude and direction.",
    "marks": 1,
    "created_at": "2023-07-10T14:35:00Z",
    "updated_at": "2023-07-10T14:35:00Z"
  }
]
```

### Update Test Settings

Updates test settings and can finalize a test.

- **URL**: `/api/tests/test/:test_id/settings`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)
- **URL Parameters**:
  - `test_id`: Test ID
- **Request Body**:
  - `title` (optional): Updated test title
  - `description` (optional): Updated test description
  - `category` (optional): Updated test category
  - `status` (optional): Test status (e.g., "draft", "published")
  - `is_free` (optional): Whether the test is free or paid
  - `time_limit` (optional): Time limit in minutes
  - `passing_percentage` (optional): Percentage required to pass
  - `randomize_questions` (optional): Whether to randomize question order

#### Success Response

```json
{
  "id": 12,
  "title": "Advanced Physics Exam",
  "description": "Comprehensive test covering advanced physics concepts",
  "category": "physics",
  "status": "published",
  "is_free": false,
  "folder_id": 7,
  "time_limit": 60,
  "passing_percentage": 70,
  "randomize_questions": true,
  "created_at": "2023-07-10T14:00:00Z",
  "updated_at": "2023-07-12T10:15:00Z"
}
```

### Search and Sort Tests

Searches for tests with optional filtering and sorting.

- **URL**: `/api/tests/search`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)
- **Query Parameters**:
  - `query` (optional): Search term to filter tests by title, description or folder name
  - `sort` (optional): Sort order for results (values: `modified`, `name`). Default: `modified`
  - `page` (optional): Page number for pagination. Default: 1
  - `limit` (optional): Number of results per page. Default: 10

#### Success Response

```json
{
  "results": [
    {
      "id": 12,
      "title": "Advanced Physics Exam",
      "description": "Comprehensive test covering advanced physics concepts",
      "category": "physics",
      "status": "published",
      "is_free": false,
      "folder_name": "Physics",
      "folder_id": 7,
      "question_count": 25,
      "created_at": "2023-07-10T14:00:00Z",
      "updated_at": "2023-07-12T10:15:00Z"
    },
    {
      "id": 14,
      "title": "Basic Physics Quiz",
      "description": "Quiz covering basic physics concepts",
      "category": "physics",
      "status": "published",
      "is_free": true,
      "folder_name": "Physics",
      "folder_id": 7,
      "question_count": 10,
      "created_at": "2023-07-15T09:00:00Z",
      "updated_at": "2023-07-15T09:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
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