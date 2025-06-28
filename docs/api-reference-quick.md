# Flight Booking API - Quick Reference

## Endpoints Overview

| Method | Endpoint | Authentication | Description |
|--------|----------|---------------|-------------|
| **PUBLIC ENDPOINTS** |
| POST | `/api/flights/search` | None | Search flights with filters |
| GET | `/api/flights/{id}` | None | Get flight details |
| GET | `/api/flights` | None | Get all available flights |
| GET | `/api/flights/{id}/status` | None | Get flight status |
| GET | `/api/test-email` | None | Test email service |
| **USER ENDPOINTS** |
| POST | `/api/bookings` | User | Create new booking |
| GET | `/api/bookings` | User | Get user's bookings |
| PATCH | `/api/bookings` | User | Modify/cancel booking |
| GET | `/api/flights/{id}/seats` | User | Get available seats |
| **ADMIN ENDPOINTS** |
| GET | `/api/admin/flights` | Admin | Get all flights (admin view) |
| PATCH | `/api/admin/flights/{id}` | Admin | Update flight details |
| GET | `/api/admin/bookings` | Admin | Get all bookings (admin view) |

## Response Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET/PATCH requests |
| 201 | Created | Successful POST requests |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Business logic conflict (e.g., no seats) |
| 422 | Unprocessable Entity | Validation errors |
| 500 | Internal Server Error | Server-side errors |

## Authentication Quick Guide

### User Authentication
```bash
# Include in headers
Authorization: Bearer <supabase_access_token>

# Or via cookie (browser)
Cookie: sb-<project>-auth-token=<encoded_session>
```

### Admin Authentication
Same as user authentication, but requires admin role in database.

## Common Request Examples

### Search Flights
```bash
curl -X POST '/api/flights/search' \
  -H 'Content-Type: application/json' \
  -d '{
    "origin": "airport_uuid",
    "destination": "airport_uuid", 
    "departureDate": "2024-02-15",
    "tripType": "oneway"
  }'
```

### Create Booking
```bash
curl -X POST '/api/bookings' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "flight_id": "flight_uuid",
    "full_name": "John Doe",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "nationality": "US",
    "passport_number": "123456789"
  }'
```

### Update Flight (Admin)
```bash
curl -X PATCH '/api/admin/flights/{id}' \
  -H 'Authorization: Bearer <admin_token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "departure_time": "2024-02-15T10:30:00Z",
    "arrival_time": "2024-02-15T14:30:00Z",
    "price": 299.99,
    "available_seats": 150,
    "status": "scheduled"
  }'
```

## Key Data Models

### Flight Response
```typescript
interface Flight {
  id: string;
  flight_number: string;
  airline_name: string;
  origin_city: string;
  origin_code: string;
  destination_city: string;
  destination_code: string;
  departure_time: string; // ISO 8601
  arrival_time: string;   // ISO 8601
  duration: string;       // "2h 30m"
  price: number;
  available_seats: number;
  status: 'scheduled' | 'delayed' | 'cancelled' | 'boarding' | 'departed' | 'arrived';
}
```

### Booking Response
```typescript
interface Booking {
  id: string;
  booking_reference: string; // 8-char uppercase
  booking_status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  total_price: number;
  ticket_url: string;
  flight: Flight;
  passenger: {
    full_name: string;
    seat_number: string;
    date_of_birth: string;
    gender: string;
    nationality: string;
    passport_number: string;
  };
}
```

## Error Response Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE", // optional
  "details": {}          // optional
}
```

## Rate Limits
- General: 100 req/min per IP
- Search: 20 req/min per IP  
- Admin: 200 req/min per admin

## Environment URLs
- Production: `https://api.yourflightbooking.com`
- Test: `https://api-test.yourflightbooking.com`
- Local: `http://localhost:3000` 