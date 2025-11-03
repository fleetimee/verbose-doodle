# API Specification

## Dynamic Endpoint Handler

### `POST | GET | PUT | PATCH | DELETE /{endpoint}`

**Behavior:**

1. Search for endpoint in database
2. If not found, return `404`
3. If found and active response exists, send active response
4. Otherwise, return empty object `{}`

**Note:** This endpoint does NOT require authentication

---

## Authentication

All endpoints below require **JWT Bearer Token** authentication.

### Token Payload Structure

```json
{
  "user_id": "user_id",
  "role": "Users.role",
  "username": "username"
}
```

---

## Public Endpoints

### Login

**`POST /login`**

Authenticates a user and returns a JWT token.

**Request:**

```json
{
  "username": "nama",
  "password": "passwordnya"
}
```

**Response:**

```json
{
  "response_code": "00",
  "response_desc": "success",
  "token": "jwt.token.save"
}
```

---

## Configuration Management

**Authorization:** All configuration endpoints require authentication. Role restrictions apply per endpoint.

### Add Endpoint

**`POST /config/endpoints/add`**

Creates a new endpoint configuration.

**Authorization:** Role must be `ADMIN`

**Request:**

```json
{
  "method": "GET",
  "url": "/real/endpoint/used/123",
  "biller_id": 1
}
```

**Response:**

```json
{
  "response_code": "00",
  "response_desc": "success",
  "endpoint_id": 1
}
```

---

### Add Response

**`POST /config/response/add`**

Adds a new response configuration for an endpoint.

**Authorization:** Role must be `ADMIN`

**Request:**

```json
{
  "endpoint_id": 1,
  "json": "{\"abc\": \"def\"}",
  "status_code": 200,
  "activated": true,
  "name": "response_success"
}
```

**Response:**

```json
{
  "response_code": "00",
  "response_desc": "success",
  "response_id": 4
}
```

---

### Activate Response

**`POST /config/response/activate`**

Sets a response as the active response for an endpoint.

**Authorization:** Role must be `ADMIN`

**Request:**

```json
{
  "endpoint_id": 1,
  "response_id": 4
}
```

**Response:**

```json
{
  "response_code": "00",
  "response_desc": "success",
  "endpoint_id": 1,
  "response_id": 4
}
```

---

### List All Endpoints

**`GET /endpoints`**

Returns all configured endpoints with their responses.

**Authorization:** Authenticated users (both `ADMIN` and `USER` roles can view)

**Response:**

```json
{
  "response_code": "00",
  "response_desc": "success",
  "endpoints": [
    {
      "endpoint_id": 1,
      "method": "GET",
      "url": "/real/endpoint/used/123",
      "biller_id": 1,
      "responses": [
        {
          "response_id": 4,
          "json": "{\"abc\": \"def\"}",
          "status_code": 200,
          "activated": true,
          "name": "response_success"
        },
        {
          "response_id": 5,
          "json": "{\"abc\": \"def\"}",
          "status_code": 500,
          "activated": false,
          "name": "response_error"
        }
      ]
    },
    {
      "endpoint_id": 2,
      "method": "POST",
      "url": "/real/actually/add",
      "biller_id": 1,
      "responses": []
    }
  ]
}
```

---

## User Management

**All user management endpoints require `ADMIN` role.**

### List All Users

**`GET /users`**

Returns all users in the system.

**Authorization:** Role must be `ADMIN`

**Response:**

```json
{
  "response_code": "00",
  "response_desc": "success",
  "users": [
    {
      "user_id": 2,
      "username": "user",
      "role": "USER",
      "active": true
    },
    {
      "user_id": 3,
      "username": "resu",
      "role": "USER",
      "active": false
    }
  ]
}
```

---

### Get User by ID

**`GET /users/{user_id}`**

Returns details of a specific user.

**Authorization:** Role must be `ADMIN`

**Response:**

```json
{
  "response_code": "00",
  "response_desc": "success",
  "user": {
    "user_id": 2,
    "username": "user",
    "role": "USER",
    "active": true
  }
}
```

---

### Create User

**`POST /users/add`**

Creates a new user.

**Authorization:** Role must be `ADMIN`

**Request:**

```json
{
  "username": "abcdef",
  "password": "password"
}
```

**Response:**

```json
{
  "response_code": "00",
  "response_desc": "success",
  "user_id": 6
}
```

---

### Update User

**`PATCH /users/{user_id}`**

Updates user information. Multiple request body formats supported.

**Authorization:**

- Role must be `ADMIN`
- Cannot edit users with `ADMIN` role

**Request (Update Username):**

```json
{
  "username": "abcdef"
}
```

**Request (Update Active Status):**

```json
{
  "active": false
}
```

**Response:**

```json
{
  "response_code": "00",
  "response_desc": "success"
}
```

---

### Delete User

**`DELETE /users/{user_id}`**

Deletes a user from the system.

**Authorization:**

- Role must be `ADMIN`
- Cannot delete users with `ADMIN` role

**Response:**

```json
{
  "response_code": "00",
  "response_desc": "success"
}
```

---

## Response Codes

| Code  | Description        |
| ----- | ------------------ |
| `00`  | Success            |
| `404` | Endpoint not found |

_Note: Additional error codes may be defined as needed_
