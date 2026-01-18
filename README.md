# Microservice One - API Gateway

This is a Node.js API Gateway microservice that depends on Microservice Two (Data Service). It acts as a proxy and adds additional processing capabilities.

## Features

- API Gateway pattern
- Proxies requests to Microservice Two
- Enhanced endpoints with additional processing
- Health check endpoint
- CORS enabled
- Complete test coverage with mocked dependencies

## Dependencies

This microservice depends on **Microservice Two** running on port 3001.

## API Endpoints

- `GET /health` - Health check
- `GET /` - Welcome message with available endpoints
- `GET /api/users` - Get all users (proxied to Microservice Two)
- `GET /api/users/:id` - Get user by ID (proxied to Microservice Two)
- `POST /api/users` - Create new user (proxied to Microservice Two)
- `PUT /api/users/:id` - Update user (proxied to Microservice Two)
- `DELETE /api/users/:id` - Delete user (proxied to Microservice Two)
- `GET /api/users/:id/profile` - Get enhanced user profile (with gateway-level processing)

## Environment Variables

- `PORT` - Server port (default: 3000)
- `DATA_SERVICE_URL` - URL of Microservice Two (default: http://localhost:3001)

## Installation

```bash
npm install
```

## Running the Service

Make sure Microservice Two is running first, then:

```bash
npm start
```

The service will run on port 3000 by default.

## Running Tests

```bash
npm test
```

Tests use `nock` to mock HTTP requests to Microservice Two.

## Development Mode

```bash
npm run dev
```

## Running Both Services

1. Start Microservice Two (in Microservice_two directory):
   ```bash
   npm install
   npm start
   ```

2. Start Microservice One (in Microservice_One directory):
   ```bash
   npm install
   npm start
   ```

3. Access Microservice One at http://localhost:3000
