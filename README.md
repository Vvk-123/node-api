# Node.js Production REST API — PostgreSQL + Sequelize

A production-ready REST API boilerplate with Express, PostgreSQL, and Sequelize ORM.

## Project Structure

```
src/
├── config/
│   └── database.js          # Sequelize config (dev/test/prod)
├── controllers/
│   └── itemController.js    # Request/response handling
├── middleware/
│   ├── errorHandler.js      # Global error handler
│   └── validate.js          # Joi request validation
├── models/
│   ├── index.js             # Sequelize init + associations
│   └── item.js              # Item model
├── routes/
│   ├── index.js             # Route aggregator
│   └── items.js             # Item routes
├── services/
│   └── itemService.js       # Business logic layer
├── utils/
│   ├── AppError.js          # Custom error class
│   ├── catchAsync.js        # Async error wrapper
│   ├── logger.js            # Winston logger
│   └── response.js          # Response helpers
├── app.js                   # Express app setup
└── server.js                # Entry point
tests/
└── integration/
    └── items.test.js        # Supertest API tests
```

## Features

- **Layered architecture** — routes → controllers → services → models
- **Joi validation** on all request bodies and query params
- **Global error handling** with operational vs unexpected errors
- **Soft deletes** via Sequelize `paranoid: true`
- **Pagination, filtering, sorting, search** on list endpoints
- **Rate limiting** (100 req / 15 min per IP)
- **Helmet** security headers
- **Winston** structured logging (JSON in prod)
- **Request ID** on every request for traceability
- **Graceful shutdown** on SIGTERM
- **Docker + docker-compose** with health checks

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Start with Docker (recommended)
```bash
docker-compose up
```

### 3b. Start locally (requires running PostgreSQL)
```bash
npm run dev
```

## API Endpoints

| Method | URL                  | Description                          |
|--------|----------------------|--------------------------------------|
| GET    | /health              | Health check                         |
| GET    | /api/v1/items        | List items (paginated)               |
| POST   | /api/v1/items        | Create item                          |
| GET    | /api/v1/items/:id    | Get item by ID                       |
| PUT    | /api/v1/items/:id    | Replace item                         |
| PATCH  | /api/v1/items/:id    | Partial update item                  |
| DELETE | /api/v1/items/:id    | Soft-delete item                     |

### Query Parameters (GET /api/v1/items)

| Param     | Type   | Default     | Description                        |
|-----------|--------|-------------|-------------------------------------|
| page      | number | 1           | Page number                         |
| limit     | number | 10          | Items per page (max 100)            |
| status    | string | —           | Filter: active, inactive, archived  |
| search    | string | —           | Search name and description         |
| sortBy    | string | createdAt   | Sort field                          |
| sortOrder | string | DESC        | ASC or DESC                         |

### Example Requests

```bash
# Create
curl -X POST http://localhost:3000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Widget","description":"A great widget","status":"active"}'

# List with filters
curl "http://localhost:3000/api/v1/items?status=active&search=widget&page=1&limit=5"

# Update
curl -X PATCH http://localhost:3000/api/v1/items/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"inactive"}'

# Delete
curl -X DELETE http://localhost:3000/api/v1/items/<id>
```

## Adding a New Resource

1. Create model in `src/models/`
2. Register it in `src/models/index.js`
3. Add service in `src/services/`
4. Add controller in `src/controllers/`
5. Add Joi schemas in `src/middleware/validate.js`
6. Add routes in `src/routes/` and register in `src/routes/index.js`

## Testing

```bash
npm test
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Set `DATABASE_URL` (connection string)
3. Run migrations: `npm run db:migrate`
4. Start: `npm start` or use the Docker image
