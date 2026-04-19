# ComradeConnect API Documentation

**Base URL:** `https://apiv2.comradeconnect.co.zw/v1`

**API Version:** v1

**Last Updated:** April 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [File Upload Flow](#file-upload-flow)
4. [Response Format](#response-format)
5. [Error Handling](#error-handling)
6. [Endpoints](#endpoints)
   - [User Management](#user-management)
   - [Admin](#admin)
   - [Feeds & Posts](#feeds--posts)
   - [Accommodations](#accommodations)
   - [Jobs](#jobs)
   - [Chat](#chat)
   - [File Management](#file-management)
   - [ComradeConnect AI](#comradeconnect-ai)
7. [WebSocket Events](#websocket-events)
8. [Rate Limiting](#rate-limiting)
9. [Pagination](#pagination)

---

## Overview

ComradeConnect API is a comprehensive REST API built with **Fastify**, **MongoDB**, and **Firebase**. It provides features for:

- User authentication and profile management
- Social feed with posts, comments, and likes
- Job listings and applications
- Accommodation listings and rentals
- Real-time messaging and chat
- AI-powered text and image processing
- **Two-step file upload system** for images and documents
- WebSocket-based real-time communication

### Technology Stack

- **Framework:** Fastify v5.8.4
- **Database:** MongoDB (via Mongoose)
- **Authentication:** Firebase Admin SDK + JWT
- **Real-time:** Socket.IO
- **AI Services:**
  - DeepSeek API for text processing
  - Google Generative AI (Gemini)
  - OpenAI API
- **File Upload:** Multipart form-data with cloud storage
- **Caching:** Redis

---

## Authentication

The API uses **JWT (JSON Web Tokens)** for authentication with Firebase integration.

### Getting Authentication Tokens

#### 1. Register a New User

```http
POST /v1/user/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe",
  "phoneNumber": "+263712345678",
  "idNumber": "ID12345678"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "507f1f77bcf86cd799439011"
}
```

#### 2. Login

```http
POST /v1/user/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "John Doe",
    "phoneNumber": "+263712345678"
  }
}
```

#### 3. Refresh Access Token

```http
GET /v1/user/tokens
Authorization: Bearer {refreshToken}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Authorization Header

Include the access token in all authenticated requests:

```http
Authorization: Bearer {accessToken}
```

---

## File Upload Flow

The API implements a **two-step file upload process** for content with images or attachments:

### Step 1: Create Document/Content

First, create the main content (feed post, accommodation listing, user profile update, etc.) and receive a document ID.

### Step 2: Upload Files

Then, upload files/images associated with that document ID, optionally including metadata.

### Supported Routes

- `feeds` - Feed posts with images
- `accommodations` - Accommodation listings with photos
- `user-profile` - User profile pictures and documents
- `jobs` - Job postings with company logos

### File Upload Process

#### 1. Create Content First

```http
POST /v1/feeds/new
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "My Post Title",
  "content": "Post content here"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My Post Title",
    "content": "Post content here"
  }
}
```

#### 2. Upload Files for the Content

```http
POST /v1/file/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

documentId: 507f1f77bcf86cd799439011
route: feeds
type: image
uniqueKey: post-image-1
metadata: {"alt": "Post image", "caption": "Beautiful view"}
file: <image_file>
```

**Response:**

```json
{
  "success": true,
  "message": "File uploaded successfully"
}
```

### File Types Supported

- `image` - JPEG, PNG, GIF, WebP (max 10MB)
- `document` - PDF, DOC, DOCX
- `video` - MP4, MOV (max 50MB)
- `audio` - MP3, WAV

### Metadata Options

You can pass optional metadata as JSON string:

```json
{
  "alt": "Alternative text for accessibility",
  "caption": "Image caption",
  "order": 1,
  "isPrimary": true,
  "tags": ["tag1", "tag2"]
}
```

---

## Response Format

### Standard Success Response

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Standard Error Response

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

### Error Status Codes

| Code | Meaning                                |
| ---- | -------------------------------------- |
| 200  | OK - Request successful                |
| 201  | Created - Resource created             |
| 400  | Bad Request - Invalid input            |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions   |
| 404  | Not Found - Resource not found         |
| 500  | Internal Server Error                  |

---

## Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Email or password is incorrect"
}
```

### Common Error Codes

- `INVALID_CREDENTIALS` - Wrong email/password
- `USER_NOT_FOUND` - User does not exist
- `UNAUTHORIZED` - Missing or invalid authentication
- `VALIDATION_ERROR` - Invalid request parameters
- `RESOURCE_NOT_FOUND` - Resource does not exist
- `INTERNAL_ERROR` - Server error

---

## Endpoints

### Admin

#### Get Admin Statistics

Returns comprehensive platform statistics for administrators.

```http
GET /v1/admin/stats
Authorization: Bearer {accessToken}
```

**Required Permissions:** Admin level > 0

**Response:**

```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "onlineUsers": 89,
    "totalAccommodations": 456,
    "activeAccommodations": 423,
    "totalFeedPosts": 2341,
    "totalFeedComments": 5678,
    "totalFeedLikes": 12345,
    "totalFeedViews": 98765,
    "totalJobs": 234,
    "activeJobs": 198,
    "totalFiles": 3456,
    "storageUsed": 2147483648,
    "recentSignups": 45,
    "recentPosts": 123,
    "systemHealth": {
      "uptime": 345600,
      "memoryUsage": 134217728,
      "databaseConnections": 5
    }
  },
  "message": "Admin stats retrieved successfully"
}
```

**Statistics Included:**

| Field                  | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `totalUsers`           | Total registered users                             |
| `onlineUsers`          | Currently online users (active socket connections) |
| `totalAccommodations`  | Total accommodation listings                       |
| `activeAccommodations` | Currently active accommodation listings            |
| `totalFeedPosts`       | Total feed posts created                           |
| `totalFeedComments`    | Total comments across all feed posts               |
| `totalFeedLikes`       | Total likes across all feed posts                  |
| `totalFeedViews`       | Total views across all feed posts                  |
| `totalJobs`            | Total job postings                                 |
| `activeJobs`           | Job postings that haven't expired                  |
| `totalFiles`           | Total files uploaded to the system                 |
| `storageUsed`          | Total storage used in bytes                        |
| `recentSignups`        | New user registrations in the last 7 days          |
| `recentPosts`          | New feed posts in the last 7 days                  |
| `systemHealth`         | Server health metrics                              |

**Error Responses:**

- `403` - Insufficient permissions (not an admin)
- `500` - Internal server error

---

### User Management

#### Get Current User Profile

```http
GET /v1/user/getuser
Authorization: Bearer {accessToken}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "John Doe",
    "phoneNumber": "+263712345678",
    "idNumber": "ID12345678",
    "dob": "1990-01-15",
    "avatar": {
      "media": "https://...",
      "cache": "..."
    },
    "admin": 0,
    "permissions": 0,
    "currentProffesion": {
      "title": "Software Engineer",
      "description": "Full-stack developer"
    },
    "experiences": [
      {
        "name": "React.js",
        "rating": 5,
        "category": "Frontend"
      }
    ],
    "devices": [
      {
        "deviceId": "device123",
        "deviceName": "iPhone 14",
        "ipAddress": "192.168.1.1",
        "accessToken": "...",
        "refreshToken": "..."
      }
    ],
    "twoFactorEnabled": false,
    "identityVerified": false
  }
}
```

#### Get User by ID

```http
GET /v1/user/person/{userId}
```

**Parameters:**

- `userId` (path) - User ID to retrieve

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "avatar": {...},
    "currentProffesion": {...},
    "experiences": [...]
  }
}
```

#### Get Multiple Users by IDs

```http
POST /v1/user/people
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "userIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "avatar": {...}
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "fullName": "Jane Smith",
      "avatar": {...}
    }
  ]
}
```

#### Get All Users

```http
GET /v1/user/all
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `page` (integer, default: 1) - Page number for pagination
- `limit` (integer, default: 10) - Results per page

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "avatar": {...}
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150
  }
}
```

#### Update User Profile

```http
POST /v1/user/update
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "fullName": "John Updated",
  "phoneNumber": "+263712345679",
  "dob": "1990-01-15"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Updated",
    "phoneNumber": "+263712345679"
  }
}
```

#### Upload Profile Picture

After updating profile information, upload a profile picture:

```http
POST /v1/file/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

documentId: 507f1f77bcf86cd799439011
route: user-profile
type: image
uniqueKey: profile-picture-2026
metadata: {"alt": "John Doe's profile picture", "isPrimary": true}
file: <image_file>
```

#### Update Current Profession

```http
PUT /v1/user/current-profession
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Senior Software Engineer",
  "description": "Full-stack developer with 5+ years experience"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profession updated successfully",
  "data": {
    "title": "Senior Software Engineer",
    "description": "Full-stack developer with 5+ years experience"
  }
}
```

#### Add/Update User Experience

```http
PUT /v1/user/experience
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "React.js",
  "rating": 5,
  "category": "Frontend"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Experience added successfully"
}
```

#### Delete User Experience

```http
DELETE /v1/user/experience/{experienceName}
Authorization: Bearer {accessToken}
```

**Parameters:**

- `experienceName` (path) - Name of the experience to delete

**Response:**

```json
{
  "success": true,
  "message": "Experience deleted successfully"
}
```

#### Get User Devices

```http
GET /v1/user/devices
Authorization: Bearer {accessToken}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "deviceId": "device123",
      "deviceName": "iPhone 14",
      "ipAddress": "192.168.1.1",
      "accessToken": "...",
      "refreshToken": "..."
    }
  ]
}
```

#### Update Chat Token

```http
PATCH /v1/user/chat-token
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "chatToken": "new_chat_token_here"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Chat token updated successfully"
}
```

---

### Feeds & Posts

#### Create Feed Post

```http
POST /v1/feeds/create
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "My Amazing Post",
  "content": "This is the content of my post. It can be quite long and detailed."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Feed created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My Amazing Post",
    "content": "This is the content of my post. It can be quite long and detailed.",
    "user": {
      "_id": "507f1f77bcf86cd799439010",
      "fullName": "John Doe"
    },
    "likes": 0,
    "comments": 0,
    "views": 0,
    "isLiked": false,
    "avatars": [],
    "datePosted": 1671980400000
  }
}
```

#### Upload Feed Images

After creating the feed post, upload images:

```http
POST /v1/file/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

documentId: 507f1f77bcf86cd799439011
route: feeds
type: image
uniqueKey: feed-image-1
metadata: {"alt": "Post image", "caption": "Beautiful sunset", "order": 1}
file: <image_file>
```

#### Get All Feeds

```http
GET /v1/feeds/all
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Results per page
- `search` (string) - Search query

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "My First Post",
      "content": "This is my first post on ComradeConnect",
      "user": {
        "_id": "507f1f77bcf86cd799439010",
        "fullName": "John Doe",
        "avatar": {...}
      },
      "likes": 25,
      "comments": 5,
      "views": 150,
      "isLiked": false,
      "avatars": [...],
      "datePosted": 1671980400000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 245
  }
}
```

#### Get Single Feed/Post

```http
GET /v1/feeds/{postId}
Authorization: Bearer {accessToken}
```

**Parameters:**

- `postId` (path) - Post ID

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My First Post",
    "content": "This is my first post on ComradeConnect",
    "user": {...},
    "likes": 25,
    "comments": 5,
    "views": 150,
    "isLiked": false,
    "datePosted": 1671980400000
  }
}
```

#### Get Feed Comments

```http
GET /v1/feeds/comments/{postId}
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Results per page

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "content": "Great post!",
      "user": {
        "_id": "507f1f77bcf86cd799439012",
        "fullName": "Jane Smith",
        "avatar": {...}
      },
      "datePosted": 1671980500000,
      "likes": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5
  }
}
```

#### Comment on Feed

```http
POST /v1/feeds/comment
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "postId": "507f1f77bcf86cd799439011",
  "content": "Great post! Thanks for sharing."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "content": "Great post! Thanks for sharing.",
    "user": {
      "_id": "507f1f77bcf86cd799439010",
      "fullName": "Current User"
    },
    "datePosted": 1671980500000
  }
}
```

#### Like/Unlike Feed

```http
PATCH /v1/feeds/like/{postId}/{like}
Authorization: Bearer {accessToken}
```

**Parameters:**

- `postId` (path) - Post ID
- `like` (path) - true/false to like or unlike

**Response:**

```json
{
  "success": true,
  "message": "Post liked successfully",
  "data": {
    "postId": "507f1f77bcf86cd799439011",
    "likes": 26,
    "isLiked": true
  }
}
```

---

### Accommodations

#### Create Accommodation Listing

```http
POST /v1/accomodations/new
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Beautiful 2-Bedroom Apartment",
  "description": "Spacious apartment in the city center",
  "price": 1500,
  "category": "Apartment",
  "location": "Harare, Zimbabwe",
  "amenities": ["WiFi", "Parking", "Security"],
  "paymentPlan": "Monthly",
  "activated": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Accommodation created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Beautiful 2-Bedroom Apartment",
    "description": "Spacious apartment in the city center",
    "price": 1500,
    "category": "Apartment",
    "location": "Harare, Zimbabwe",
    "amenities": ["WiFi", "Parking", "Security"],
    "paymentPlan": "Monthly",
    "activated": true,
    "user": {
      "_id": "507f1f77bcf86cd799439010",
      "fullName": "John Doe"
    },
    "likes": 0,
    "views": 0,
    "avatars": []
  }
}
```

#### Upload Accommodation Images

After creating the accommodation, upload images:

```http
POST /v1/file/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

documentId: 507f1f77bcf86cd799439011
route: accomodations
type: image
uniqueKey: accomodation-main-image
metadata: {"alt": "Main apartment view", "caption": "Living room", "isPrimary": true}
file: <image_file>
```

#### Get All Accommodations

```http
GET /v1/accomodations/all
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Results per page
- `search` (string) - Search query
- `category` (string) - Filter by category
- `priceRange` (string) - Price range filter
- `filterString` (string) - Additional filters

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Beautiful 2-Bedroom Apartment",
      "description": "Spacious apartment in the city center",
      "price": 1500,
      "category": "Apartment",
      "location": "Harare, Zimbabwe",
      "amenities": ["WiFi", "Parking", "Security"],
      "paymentPlan": "Monthly",
      "activated": true,
      "user": {
        "_id": "507f1f77bcf86cd799439010",
        "fullName": "John Doe"
      },
      "likes": 15,
      "views": 120,
      "avatars": [
        {
          "media": "https://storage.com/image1.jpg",
          "cache": "https://storage.com/image1_thumb.jpg"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45
  }
}
```

#### Get Single Accommodation

```http
GET /v1/accomodations/{id}
Authorization: Bearer {accessToken}
```

**Parameters:**

- `id` (path) - Accommodation ID

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Beautiful 2-Bedroom Apartment",
    "description": "Spacious apartment in the city center",
    "price": 1500,
    "category": "Apartment",
    "location": "Harare, Zimbabwe",
    "amenities": ["WiFi", "Parking", "Security"],
    "paymentPlan": "Monthly",
    "activated": true,
    "user": {...},
    "likes": 15,
    "views": 120,
    "avatars": [...]
  }
}
```

#### Update Accommodation

```http
PUT /v1/accomodations/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Updated Apartment Title",
  "price": 1600,
  "description": "Updated description"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Accommodation updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Updated Apartment Title",
    "price": 1600
  }
}
```

#### Like/Unlike Accommodation

```http
PATCH /v1/accomodations/like/{id}/{like}
Authorization: Bearer {accessToken}
```

**Parameters:**

- `id` (path) - Accommodation ID
- `like` (path) - true/false to like or unlike

**Response:**

```json
{
  "success": true,
  "message": "Accommodation liked successfully",
  "data": {
    "accommodationId": "507f1f77bcf86cd799439011",
    "likes": 16,
    "isLiked": true
  }
}
```

#### Check Like Status

```http
GET /v1/accomodations/like-status/{id}
Authorization: Bearer {accessToken}
```

**Parameters:**

- `id` (path) - Accommodation ID

**Response:**

```json
{
  "success": true,
  "data": {
    "isLiked": true
  }
}
```

#### Change Accommodation State

```http
PATCH /v1/accomodations/change-state/{id}/{state}
Authorization: Bearer {accessToken}
```

**Parameters:**

- `id` (path) - Accommodation ID
- `state` (path) - true/false to activate or deactivate

**Response:**

```json
{
  "success": true,
  "message": "Accommodation state updated successfully"
}
```

#### Delete Accommodation

```http
DELETE /v1/accomodations/{id}
Authorization: Bearer {accessToken}
```

**Response:**

```json
{
  "success": true,
  "message": "Accommodation deleted successfully"
}
```

---

### Jobs

#### Get All Jobs

```http
GET /v1/jobs/all
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Results per page
- `search` (string) - Search query
- `category` (string) - Filter by job category
- `location` (string) - Filter by location
- `jobType` (string) - Filter by job type (Full-time, Part-time, Contract, etc.)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Senior React Developer",
      "company": "Tech Corp",
      "location": "Harare, Zimbabwe",
      "description": "We are looking for an experienced React developer...",
      "dueDate": "2026-05-18",
      "experienceLevel": "Senior",
      "jobType": "Full-time",
      "minSalary": 5000,
      "maxSalary": 8000,
      "category": "Technology",
      "applicationType": "email",
      "applicationEmail": "jobs@techcorp.com",
      "applicationPhone": "+263712345678",
      "user": {
        "_id": "507f1f77bcf86cd799439010",
        "fullName": "Company Admin",
        "avatar": {...}
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 87
  }
}
```

#### Get Single Job

```http
GET /v1/jobs/{jobId}
Authorization: Bearer {accessToken}
```

**Parameters:**

- `jobId` (path) - Job ID

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Senior React Developer",
    "company": "Tech Corp",
    "location": "Harare, Zimbabwe",
    "description": "We are looking for an experienced React developer...",
    "dueDate": "2026-05-18",
    "experienceLevel": "Senior",
    "jobType": "Full-time",
    "minSalary": 5000,
    "maxSalary": 8000,
    "category": "Technology",
    "applicationType": "email",
    "applicationEmail": "jobs@techcorp.com",
    "applicationPhone": "+263712345678",
    "user": {...}
  }
}
```

#### Create Job Posting

```http
POST /v1/jobs/job
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Senior React Developer",
  "company": "Tech Corp",
  "location": "Harare, Zimbabwe",
  "description": "We are looking for an experienced React developer with 5+ years of experience...",
  "dueDate": "2026-05-18",
  "experienceLevel": "Senior",
  "jobType": "Full-time",
  "minSalary": 5000,
  "maxSalary": 8000,
  "category": "Technology",
  "applicationType": "email",
  "applicationEmail": "jobs@techcorp.com",
  "applicationPhone": "+263712345678"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Job posted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Senior React Developer",
    "company": "Tech Corp"
  }
}
```

#### Upload Job Images/Documents

After creating the job posting, upload company logos or job-related documents:

```http
POST /v1/file/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

documentId: 507f1f77bcf86cd799439011
route: jobs
type: image
uniqueKey: job-company-logo
metadata: {"alt": "Tech Corp logo", "caption": "Company logo", "isPrimary": true}
file: <image_file>
```

#### Update Job Posting

```http
PUT /v1/jobs/job/{jobId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Senior React Developer (Updated)",
  "minSalary": 6000,
  "maxSalary": 9000
}
```

**Response:**

```json
{
  "success": true,
  "message": "Job updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Senior React Developer (Updated)",
    "minSalary": 6000,
    "maxSalary": 9000
  }
}
```

#### Delete Job Posting

```http
DELETE /v1/jobs/job/{jobId}
Authorization: Bearer {accessToken}
```

**Response:**

```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

### Chat

#### Send Text Message

```http
POST /v1/chats/send-text-message
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "receiverId": "507f1f77bcf86cd799439012",
  "content": "Hey! How are you?",
  "mtype": "text"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": "507f1f77bcf86cd799439020",
    "mtype": "text",
    "content": "Hey! How are you?",
    "senderId": "507f1f77bcf86cd799439010",
    "receiverId": "507f1f77bcf86cd799439012",
    "updatedAt": "2026-04-18T10:30:00Z"
  }
}
```

#### Send Delivery Report

```http
POST /v1/chats/delivery-report
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "messageId": "507f1f77bcf86cd799439020",
  "status": "delivered"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Delivery report recorded"
}
```

#### Send Delivery Broadcast

```http
POST /v1/chats/delivery-broadcast
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "receiverIds": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
  "content": "Broadcast message to multiple users",
  "mtype": "broadcast"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Broadcast sent successfully",
  "data": {
    "id": "507f1f77bcf86cd799439025",
    "mtype": "broadcast",
    "content": "Broadcast message to multiple users",
    "senderId": "507f1f77bcf86cd799439010",
    "recipientCount": 2,
    "updatedAt": "2026-04-18T10:35:00Z"
  }
}
```

---

### File Management

#### Upload File

Upload files associated with documents (feeds, accommodations, user profiles, etc.).

```http
POST /v1/file/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

documentId: 507f1f77bcf86cd799439011
route: feeds
type: image
uniqueKey: unique-file-identifier
metadata: {"alt": "Image description", "caption": "Image caption", "order": 1}
file: <file_data>
```

**Required Fields:**

- `documentId` - ID of the document this file belongs to
- `route` - Type of content: `feeds`, `accomodations`, `user-profile`, `jobs`
- `type` - File type: `image`, `document`, `video`, `audio`
- `uniqueKey` - Unique identifier for the file
- `file` - The actual file data

**Optional Fields:**

- `metadata` - JSON string with additional file information

**Supported Routes:**

- `feeds` - Feed post images
- `accomodations` - Accommodation photos
- `user-profile` - Profile pictures and documents
- `jobs` - Job posting images

**Supported File Types:**

- **Images:** JPEG, PNG, GIF, WebP (max 10MB)
- **Documents:** PDF, DOC, DOCX (max 25MB)
- **Videos:** MP4, MOV (max 50MB)
- **Audio:** MP3, WAV (max 25MB)

**Response:**

```json
{
  "success": true,
  "message": "File uploaded successfully"
}
```

**Error Responses:**

- `400` - Invalid document ID, missing required fields
- `404` - Document not found
- `413` - File too large
- `415` - Unsupported file type

**Metadata Examples:**

For images:

```json
{
  "alt": "Alternative text for accessibility",
  "caption": "Image caption",
  "order": 1,
  "isPrimary": true,
  "tags": ["landscape", "nature"]
}
```

For documents:

```json
{
  "title": "Resume 2026",
  "description": "Updated resume",
  "category": "cv",
  "isPublic": false
}
```

---

### ComradeConnect AI

ComradeConnect integrates AI services for intelligent text and image processing.

#### Send Message to AI

```http
POST /v1/comradeconnect/send-message
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "message": "What are the best practices for API design?",
  "model": "deepseek"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "response": "Best practices for API design include: 1. RESTful principles... 2. Versioning...",
    "model": "deepseek",
    "timestamp": "2026-04-18T10:40:00Z"
  }
}
```

#### Send Image to AI

```http
POST /v1/comradeconnect/send-image
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: <image_file>
model: gemini
```

**Response:**

```json
{
  "success": true,
  "data": {
    "text": "This image contains a person standing in front of a building...",
    "model": "gemini",
    "timestamp": "2026-04-18T10:45:00Z"
  }
}
```

---

## WebSocket Events

The API provides real-time communication via WebSocket (Socket.IO).

### Connection

```javascript
import io from "socket.io-client";

const socket = io("https://apiv2.comradeconnect.co.zw", {
  auth: {
    token: accessToken,
  },
});
```

### Server Events

#### `connect`

Emitted when connected to the server.

```javascript
socket.on("connect", () => {
  console.log("Connected to ComradeConnect");
});
```

#### `message`

Received when a new message is sent.

```javascript
socket.on("message", (data) => {
  console.log("New message:", data);
  // {
  //   id: "507f1f77bcf86cd799439020",
  //   senderId: "507f1f77bcf86cd799439010",
  //   content: "Hello!",
  //   timestamp: 1671980400000
  // }
});
```

#### `notification`

Received for various notifications.

```javascript
socket.on("notification", (data) => {
  console.log("Notification:", data);
  // {
  //   type: "feed_comment",
  //   from: "507f1f77bcf86cd799439012",
  //   postId: "507f1f77bcf86cd799439011",
  //   message: "Jane commented on your post"
  // }
});
```

#### `user_status`

Received when a user comes online/offline.

```javascript
socket.on("user_status", (data) => {
  console.log("User status:", data);
  // {
  //   userId: "507f1f77bcf86cd799439010",
  //   status: "online", // or "offline"
  //   timestamp: 1671980400000
  // }
});
```

### Client Events

#### `send_message`

Send a real-time message.

```javascript
socket.emit("send_message", {
  receiverId: "507f1f77bcf86cd799439012",
  content: "Hey there!",
  messageType: "text",
});
```

#### `typing`

Indicate that the user is typing.

```javascript
socket.emit("typing", {
  receiverId: "507f1f77bcf86cd799439012",
  isTyping: true,
});
```

#### `read_message`

Mark a message as read.

```javascript
socket.emit("read_message", {
  messageId: "507f1f77bcf86cd799439020",
});
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Global Rate Limit:** 1000 requests per 15 minutes per IP
- **Auth Endpoints:** 5 login attempts per 15 minutes per IP
- **File Upload:** 10 requests per minute per user

Rate limit information is returned in response headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1671980400
```

When rate limit is exceeded, the API returns:

```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 300
}
```

---

## Pagination

List endpoints support pagination using `page` and `limit` query parameters.

### Query Parameters

- `page` (integer, default: 1) - Page number (1-indexed)
- `limit` (integer, default: 10) - Results per page (1-100)

### Example Request

```http
GET /v1/feeds/all?page=2&limit=20
Authorization: Bearer {accessToken}
```

### Response Structure

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

---

## Data Types

### User Object

```typescript
{
  _id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  idNumber: string;
  dob: string;
  avatar: {
    media: string;
    cache: string;
  }
  admin: number;
  permissions: number;
  currentProffesion: {
    title: string;
    description: string;
  }
  experiences: Array<{
    name: string;
    rating: number;
    category: string;
  }>;
  devices: Array<{
    deviceId: string;
    deviceName: string;
    ipAddress: string;
    accessToken: string;
    refreshToken: string;
  }>;
  twoFactorEnabled: boolean;
  identityVerified: boolean;
  chatToken: string;
}
```

### Feed/Post Object

```typescript
{
  _id: string;
  title: string;
  content: string;
  user: User;
  likes: number;
  comments: number;
  views: number;
  isLiked: boolean;
  avatars: Array<Avatar>;
  datePosted: number; // Unix timestamp
}
```

### Job Object

```typescript
{
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  dueDate: string;
  experienceLevel: string;
  jobType: string;
  minSalary: number;
  maxSalary: number;
  category: string;
  applicationType: string;
  applicationEmail: string;
  applicationPhone: string;
  user: User;
}
```

### Message Object

```typescript
{
  id: string;
  mtype: string;
  content: string;
  senderId: string;
  receiverId: string;
  updatedAt: string;
  tag?: {
    id: string;
    mtype: string;
    content: string;
    senderId: string;
    receiverId: string;
  };
}
```

---

## Best Practices

### 1. Authentication

- Always store tokens securely (use httpOnly cookies or secure storage)
- Refresh tokens before they expire
- Implement token rotation for sensitive operations
- Never expose tokens in URLs or logs

### 2. Request Headers

Always include these headers:

```
Content-Type: application/json
Authorization: Bearer {accessToken}
```

### 3. Error Handling

- Check `success` field in responses
- Handle rate limit errors (429) with exponential backoff
- Implement retry logic for network failures
- Log errors for debugging

### 4. Pagination

- Always use pagination for list endpoints
- Handle `hasNext` field to detect the last page
- Cache results where appropriate

### 5. WebSocket

- Implement reconnection logic with exponential backoff
- Validate events before processing
- Handle disconnection gracefully
- Always authenticate before sending sensitive data

### 6. File Upload

- Keep files under 10MB
- Validate file types on client-side before upload
- Use multipart/form-data for file uploads
- Implement progress tracking for large files

### 7. Security

- Validate all input on client and server
- Use HTTPS only (never HTTP)
- Implement CSRF protection
- Sanitize user inputs
- Keep access tokens short-lived

---

## Health Check

### Ping Endpoint

```http
GET https://apiv2.comradeconnect.co.zw/ping
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-04-18T10:50:00Z"
}
```

---

## Support & Feedback

For issues, feature requests, or general support:

- **Email:** api-support@comradeconnect.co.zw
- **Documentation:** https://docs.comradeconnect.co.zw
- **Status Page:** https://status.comradeconnect.co.zw
- **GitHub:** https://github.com/comradeconnect/api

---

## Version History

| Version | Date       | Changes                                                  |
| ------- | ---------- | -------------------------------------------------------- |
| 1.0.0   | April 2026 | Initial release                                          |
| 1.1.0   | April 2026 | Added two-step file upload system, Accommodations module |
| 1.2.0   | April 2026 | Added admin statistics endpoint                          |

---

## License

This API is proprietary and confidential. Unauthorized use is prohibited.

---

**Last Updated:** April 19, 2026
**API Version:** v1.2.0
**Status:** Active ✓
