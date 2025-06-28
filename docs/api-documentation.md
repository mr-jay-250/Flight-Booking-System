# Flight Booking System API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Public Endpoints](#public-endpoints)
3. [User Endpoints](#user-endpoints)
4. [Admin Endpoints](#admin-endpoints)
5. [Error Handling](#error-handling)
6. [Data Schemas](#data-schemas)

## Authentication

The API uses JWT-based authentication with Supabase. Authentication is provided via:
- **Authorization Header**: `Bearer <access_token>`
- **Cookie**: Supabase session cookie (for browser-based requests)

### Admin Authentication
Admin endpoints require additional verification through the `requireAdmin` middleware.

---

## Public Endpoints

### 1. Search Flights
Search for flights based on origin, destination, dates, and preferences.

**Endpoint**: `POST /api/flights/search`

**Request Body**:
```json
{
  "origin": "string (airport_id)",
  "destination": "string (airport_id)",
  "departureDate": "string (YYYY-MM-DD)",
  "returnDate": "string (YYYY-MM-DD, optional)",
  "tripType": "string (oneway|roundtrip)",
  "outboundCabin": "string (economy|business|first, optional)",
  "returnCabin": "string (economy|business|first, optional)"
}
```

**Response**:
```json
{
  "flights": [
    {
      "id": "string",
      "flight_number": "string",
      "airline_id": "string",
      "airline_name": "string",
      "airline_logo_url": "string",
      "airline_code": "string",
      "airline_country": "string",
      "origin_airport_id": "string",
      "origin_city": "string",
      "origin_code": "string",
      "origin_name": "string",
      "origin_country": "string",
      "destination_airport_id": "string",
      "destination_city": "string",
      "destination_code": "string",
      "destination_name": "string",
      "destination_country": "string",
      "departure_time": "string (ISO 8601)",
      "arrival_time": "string (ISO 8601)",
      "duration": "string",
      "price": "number",
      "available_seats": "number",
      "cabin_class": "string",
      "aircraft_type": "string",
      "status": "string"
    }
  ],
  "returnFlights": [
    "array (same structure as flights, only for roundtrip)"
  ],
  "searchCriteria": {
    "origin": "string",
    "destination": "string",
    "departureDate": "string",
    "returnDate": "string (optional)",
    "tripType": "string",
    "outboundCabin": "string",
    "returnCabin": "string (optional)"
  }
}
```

### 2. Get Flight Details
Retrieve detailed information about a specific flight.

**Endpoint**: `GET /api/flights/{id}`

**Response**:
```json
{
  "id": "string",
  "flight_number": "string",
  "airline_name": "string",
  "airline_logo_url": "string",
  "origin_city": "string",
  "origin_code": "string",
  "destination_city": "string",
  "destination_code": "string",
  "departure_time": "string (ISO 8601)",
  "arrival_time": "string (ISO 8601)",
  "duration": "string",
  "price": "number",
  "available_seats": "number"
}
```

### 3. Get Available Flights
Retrieve all available flights.

**Endpoint**: `GET /api/flights`

**Response**:
```json
{
  "flights": [
    "array (same structure as flight search results)"
  ]
}
```

### 4. Get Flight Status
Check the current status of a specific flight.

**Endpoint**: `GET /api/flights/{id}/status`

**Response**:
```json
{
  "flight_id": "string",
  "status": "string (scheduled|delayed|cancelled|boarding|departed|arrived)",
  "departure_time": "string (ISO 8601)",
  "arrival_time": "string (ISO 8601)",
  "delay_minutes": "number (optional)",
  "gate": "string (optional)",
  "terminal": "string (optional)"
}
```

### 5. Test Email Service
Test the email notification system.

**Endpoint**: `GET /api/test-email`

**Response**:
```json
{
  "success": "boolean",
  "message": "string",
  "emailResult": "object"
}
```

---

## User Endpoints
*Requires Authentication*

### 1. Create Booking
Create a new flight booking.

**Endpoint**: `POST /api/bookings`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "flight_id": "string",
  "full_name": "string",
  "date_of_birth": "string (YYYY-MM-DD)",
  "gender": "string (male|female|other)",
  "nationality": "string",
  "passport_number": "string"
}
```

**Response**:
```json
{
  "ticket_url": "string",
  "booking_id": "string",
  "booking_reference": "string",
  "seat_number": "string"
}
```

### 2. Get User Bookings
Retrieve all bookings for the authenticated user.

**Endpoint**: `GET /api/bookings`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response**:
```json
{
  "bookings": [
    {
      "id": "string",
      "booking_reference": "string",
      "booking_status": "string (CONFIRMED|CANCELLED|PENDING)",
      "total_price": "number",
      "created_at": "string (ISO 8601)",
      "ticket_url": "string",
      "flight": {
        "id": "string",
        "flight_number": "string",
        "departure_time": "string (ISO 8601)",
        "arrival_time": "string (ISO 8601)",
        "duration": "string",
        "price": "number",
        "airline": {
          "name": "string",
          "logo_url": "string"
        },
        "origin": {
          "city": "string",
          "code": "string"
        },
        "destination": {
          "city": "string",
          "code": "string"
        }
      },
      "passenger": {
        "full_name": "string",
        "seat_number": "string",
        "date_of_birth": "string",
        "gender": "string",
        "nationality": "string",
        "passport_number": "string"
      }
    }
  ]
}
```

### 3. Modify/Cancel Booking
Update or cancel an existing booking.

**Endpoint**: `PATCH /api/bookings`

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body (Cancel)**:
```json
{
  "booking_id": "string",
  "action": "cancel"
}
```

**Request Body (Modify)**:
```json
{
  "booking_id": "string",
  "action": "modify",
  "updateData": {
    "full_name": "string (optional)",
    "nationality": "string (optional)",
    "passport_number": "string (optional)",
    "flight_id": "string (optional, change flight)"
  }
}
```

**Response**:
```json
{
  "success": "boolean",
  "message": "string"
}
```

### 4. Get Flight Seats
Retrieve available seats for a flight.

**Endpoint**: `GET /api/flights/{id}/seats`

**Response**:
```json
{
  "available_seats": "number",
  "seat_map": "array (seat configuration)",
  "occupied_seats": "array (list of occupied seat numbers)"
}
```

---

## Admin Endpoints
*Requires Admin Authentication*

### 1. Get All Flights (Admin)
Retrieve all flights with advanced filtering and booking statistics.

**Endpoint**: `GET /api/admin/flights`

**Headers**:
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters**:
- `status`: Filter by flight status (all|scheduled|delayed|cancelled)
- `search`: Search by flight number, airline, or city
- `airline`: Filter by specific airline

**Response**:
```json
{
  "flights": [
    {
      "id": "string",
      "flight_number": "string",
      "departure_time": "string (ISO 8601)",
      "arrival_time": "string (ISO 8601)",
      "duration": "string",
      "price": "number",
      "available_seats": "number",
      "cabin_class": "string",
      "aircraft_type": "string",
      "status": "string",
      "total_bookings": "number",
      "airline": {
        "name": "string",
        "logo_url": "string",
        "country": "string"
      },
      "origin": {
        "city": "string",
        "code": "string",
        "name": "string",
        "country": "string"
      },
      "destination": {
        "city": "string",
        "code": "string",
        "name": "string",
        "country": "string"
      }
    }
  ],
  "total": "number"
}
```

### 2. Update Flight (Admin)
Update flight details and automatically notify affected passengers.

**Endpoint**: `PATCH /api/admin/flights/{id}`

**Headers**:
```
Authorization: Bearer <admin_access_token>
```

**Request Body**:
```json
{
  "departure_time": "string (ISO 8601)",
  "arrival_time": "string (ISO 8601)",
  "price": "number",
  "available_seats": "number",
  "status": "string (scheduled|delayed|cancelled|boarding|departed|arrived)"
}
```

**Response**:
```json
{
  "success": "boolean",
  "message": "string",
  "notificationsSent": "number",
  "totalBookings": "number",
  "hasChanges": "boolean",
  "changes": "array (list of changes made)",
  "notificationDetails": [
    {
      "email": "string",
      "passenger": "string",
      "booking_ref": "string",
      "status": "string (sent|failed)",
      "error": "string (optional)"
    }
  ],
  "flightNumber": "string"
}
```

### 3. Get All Bookings (Admin)
Retrieve all bookings in the system with filtering options.

**Endpoint**: `GET /api/admin/bookings`

**Headers**:
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters**:
- `status`: Filter by booking status
- `flight_id`: Filter by specific flight
- `date_from`: Filter bookings from date
- `date_to`: Filter bookings to date

**Response**:
```json
{
  "bookings": [
    {
      "id": "string",
      "booking_reference": "string",
      "booking_status": "string",
      "total_price": "number",
      "created_at": "string (ISO 8601)",
      "user": {
        "email": "string",
        "full_name": "string"
      },
      "flight": {
        "flight_number": "string",
        "departure_time": "string (ISO 8601)",
        "airline": { "name": "string" },
        "origin": { "city": "string", "code": "string" },
        "destination": { "city": "string", "code": "string" }
      },
      "passenger": {
        "full_name": "string",
        "seat_number": "string"
      }
    }
  ],
  "total": "number",
  "statistics": {
    "total_revenue": "number",
    "confirmed_bookings": "number",
    "cancelled_bookings": "number"
  }
}
```

---

## Error Handling

All endpoints return standardized error responses:

### Error Response Format
```json
{
  "error": "string (error message)",
  "code": "string (optional error code)",
  "details": "object (optional additional details)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., seat already booked)
- `422` - Unprocessable Entity (validation errors)
- `500` - Internal Server Error

### Example Error Responses

**Authentication Error (401)**:
```json
{
  "error": "Not authenticated"
}
```

**Validation Error (400)**:
```json
{
  "error": "Missing required fields",
  "details": {
    "missing_fields": ["departure_time", "arrival_time"]
  }
}
```

**Not Found Error (404)**:
```json
{
  "error": "Flight not found"
}
```

**Business Logic Error (409)**:
```json
{
  "error": "No seats available",
  "details": {
    "available_seats": 0,
    "requested_seats": 1
  }
}
```

---

## Data Schemas

### Flight Schema
```json
{
  "id": "string (UUID)",
  "flight_number": "string",
  "airline_id": "string (UUID)",
  "origin_airport_id": "string (UUID)",
  "destination_airport_id": "string (UUID)",
  "departure_time": "string (ISO 8601)",
  "arrival_time": "string (ISO 8601)",
  "duration": "string (e.g., '2h 30m')",
  "price": "number (decimal)",
  "available_seats": "integer",
  "cabin_class": "string (economy|business|first)",
  "aircraft_type": "string",
  "status": "string (scheduled|delayed|cancelled|boarding|departed|arrived)",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

### Booking Schema
```json
{
  "id": "string (UUID)",
  "user_id": "string (UUID)",
  "flight_id": "string (UUID)",
  "booking_reference": "string (8 chars uppercase)",
  "booking_status": "string (CONFIRMED|CANCELLED|PENDING)",
  "total_price": "number (decimal)",
  "ticket_url": "string",
  "created_at": "string (ISO 8601)",
  "updated_at": "string (ISO 8601)"
}
```

### Passenger Schema
```json
{
  "id": "string (UUID)",
  "booking_id": "string (UUID)",
  "full_name": "string",
  "date_of_birth": "string (YYYY-MM-DD)",
  "gender": "string (male|female|other)",
  "nationality": "string",
  "passport_number": "string",
  "seat_number": "string (e.g., '12A')",
  "created_at": "string (ISO 8601)"
}
```

### Airport Schema
```json
{
  "id": "string (UUID)",
  "code": "string (3 chars, e.g., 'JFK')",
  "name": "string",
  "city": "string",
  "country": "string",
  "timezone": "string",
  "latitude": "number (optional)",
  "longitude": "number (optional)"
}
```

### Airline Schema
```json
{
  "id": "string (UUID)",
  "name": "string",
  "code": "string (2-3 chars, e.g., 'AA')",
  "country": "string",
  "logo_url": "string (optional)",
  "website": "string (optional)"
}
```

---

## Rate Limiting

The API implements rate limiting to ensure fair usage:
- **General endpoints**: 100 requests per minute per IP
- **Search endpoints**: 20 requests per minute per IP
- **Admin endpoints**: 200 requests per minute per authenticated admin

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Pagination

List endpoints support pagination using query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (default: created_at)
- `order`: Sort order (asc|desc, default: desc)

**Example**:
```
GET /api/admin/bookings?page=2&limit=50&sort=created_at&order=desc
```

**Pagination Response**:
```json
{
  "data": "array",
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 1250,
    "pages": 25,
    "hasNext": true,
    "hasPrev": true
  }
}
```

---

## Webhooks

The system supports webhooks for real-time notifications:

### Booking Events
- `booking.created`
- `booking.modified`
- `booking.cancelled`

### Flight Events
- `flight.delayed`
- `flight.cancelled`
- `flight.gate_changed`

### Webhook Payload Example
```json
{
  "event": "booking.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "booking_id": "string",
    "booking_reference": "string",
    "user_id": "string",
    "flight_id": "string"
  }
}
```

---

## SDK and Client Libraries

Official SDKs are available for:
- JavaScript/TypeScript
- Python
- PHP
- Ruby

**JavaScript Example**:
```javascript
import { FlightBookingAPI } from '@flightbooking/sdk';

const api = new FlightBookingAPI({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.yourflightbooking.com'
});

// Search flights
const flights = await api.flights.search({
  origin: 'JFK',
  destination: 'LAX',
  departureDate: '2024-02-15',
  tripType: 'oneway'
});

// Create booking
const booking = await api.bookings.create({
  flightId: 'flight-uuid',
  passenger: {
    fullName: 'John Doe',
    dateOfBirth: '1990-01-01',
    // ... other passenger details
  }
});
```

---

## Testing

### Test Environment
Base URL: `https://api-test.yourflightbooking.com`

### Test Data
The test environment includes sample flights, airlines, and airports for testing purposes.

### Postman Collection
Download the official Postman collection: [Flight Booking API.postman_collection.json](./postman/Flight-Booking-API.postman_collection.json)

---

## Support

For API support, please contact:
- Email: api-support@yourflightbooking.com
- Documentation: https://docs.yourflightbooking.com
- Status Page: https://status.yourflightbooking.com

---

*Last updated: January 2024* 