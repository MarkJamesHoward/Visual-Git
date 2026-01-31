# Rate Limiting Configuration

This API implements rate limiting using ASP.NET Core's built-in rate limiting middleware to protect against abuse and ensure fair usage.

## Rate Limiting Policies

### 1. Global Policy (Applied to all requests)

- **Limit**: 100 requests per minute per IP address
- **Window**: 1 minute (fixed window)
- **Purpose**: Overall protection against excessive requests

### 2. API Policy (Applied to GET endpoints)

- **Limit**: 10 requests per minute per IP address
- **Window**: 1 minute (fixed window)
- **Queue**: Up to 5 requests can be queued
- **Applied to**:
  - `GET /api/GitInternals/{userId}`
  - `GET /api/GitInternals/{userId}/{id}`

### 3. Strict Policy (Applied to POST endpoints)

- **Limit**: 5 requests per minute per IP address
- **Window**: 1 minute (fixed window)
- **Queue**: Up to 2 requests can be queued
- **Applied to**:
  - `POST /api/GitInternals`

## Configuration

Rate limiting settings are configurable via `appsettings.json`:

```json
{
  "RateLimiting": {
    "GlobalPolicy": {
      "PermitLimit": 100,
      "WindowInMinutes": 1
    },
    "ApiPolicy": {
      "PermitLimit": 10,
      "WindowInMinutes": 1,
      "QueueLimit": 5
    },
    "StrictPolicy": {
      "PermitLimit": 5,
      "WindowInMinutes": 1,
      "QueueLimit": 2
    }
  }
}
```

## HTTP Response Codes

- **200**: Request successful
- **429**: Too Many Requests - Rate limit exceeded

## Rate Limiting Headers

When rate limits are enforced, the following headers are included in responses:

- `X-RateLimit-Limit`: The rate limit ceiling for the endpoint
- `X-RateLimit-Remaining`: The number of requests remaining in the current window
- `X-RateLimit-Reset`: The time when the rate limit window resets
- `Retry-After`: Number of seconds to wait before making another request (included in 429 responses)

## Implementation Details

- **Partitioning**: Rate limits are applied per IP address
- **Algorithm**: Fixed window rate limiting
- **Queuing**: Requests can be queued when limits are reached (configurable per policy)
- **Order**: Queued requests are processed in FIFO order (OldestFirst)

## Testing Rate Limits

You can test the rate limits by making multiple rapid requests to the API endpoints:

```bash
# Test API policy (GET endpoints)
for i in {1..15}; do curl http://localhost:5078/api/GitInternals/testuser; done

# Test Strict policy (POST endpoints)
for i in {1..10}; do curl -X POST http://localhost:5078/api/GitInternals -H "Content-Type: application/json" -d '{"userId":"test","id":"test","data":"test"}'; done
```

## Monitoring

Rate limiting events are logged and can be monitored through:

- Application logs
- Custom metrics (if implemented)
- HTTP response codes and headers
