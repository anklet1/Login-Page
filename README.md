# Simple REST API

A simple REST API built with Node.js and Express.js that provides endpoints for managing items.

## Features

- GET `/items` - Retrieve all items
- POST `/items` - Create a new item
- JSON response format
- Input validation
- Error handling

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

## API Endpoints

### GET /items

Retrieves all items.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Item 1",
      "description": "First item"
    },
    {
      "id": 2,
      "name": "Item 2", 
      "description": "Second item"
    }
  ],
  "count": 2
}
```

### POST /items

Creates a new item.

**Request Body:**
```json
{
  "name": "New Item",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "New Item",
    "description": "Optional description"
  },
  "message": "Item created successfully"
}
```

**Validation:**
- `name` field is required
- `description` field is optional

## Testing the API

You can test the API using curl or any HTTP client:

### Get all items:
```bash
curl http://localhost:3000/items
```

### Create a new item:
```bash
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "This is a test item"}'
```

## Project Structure

```
├── package.json    # Project dependencies and scripts
├── server.js       # Main Express server file
└── README.md       # This documentation
```

## Technologies Used

- Node.js
- Express.js
- JSON for data format
