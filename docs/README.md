# Flight Booking System - API Documentation Suite

## 📚 Complete Documentation Overview

Welcome to the comprehensive API documentation for the Flight Booking System. This documentation suite provides everything developers need to integrate with our flight booking platform.

## 📋 Documentation Files

### 🚀 Quick Start
- **[API Quick Reference](./api-reference-quick.md)** - Fast lookup table of all endpoints, status codes, and quick examples
- **[API Examples](./api-examples.md)** - Comprehensive code examples in JavaScript, Python, cURL, and more

### 📖 Detailed Documentation
- **[API Documentation](./api-documentation.md)** - Complete API reference with detailed endpoint descriptions, schemas, and examples
- **[OpenAPI Specification](./openapi-spec.yaml)** - Machine-readable API specification for generating SDKs and interactive docs

### 🛠️ Development Tools
- **[Postman Collection](./postman-collection.json)** - Ready-to-use Postman collection with all endpoints and examples
- **[Database Schema Setup](./supabase-schema-setup.md)** - Complete database setup instructions
- **[Admin Setup Guide](./admin-setup.md)** - How to set up admin accounts and permissions

### 📧 Email & Notifications
- **[Email Setup](./email-setup.md)** - Configure email notifications
- **[Email Notifications](./email-notifications.md)** - Email templates and notification system

## 🚀 Getting Started

### 1. Quick Start (5 minutes)
1. Review the **[API Quick Reference](./api-reference-quick.md)** for endpoint overview
2. Import the **[Postman Collection](./postman-collection.json)** for immediate testing
3. Set your base URL and access tokens in Postman variables

### 2. Development Setup (15 minutes)
1. Follow **[Database Schema Setup](./supabase-schema-setup.md)** to initialize your database
2. Configure email notifications using **[Email Setup](./email-setup.md)**
3. Set up admin accounts with **[Admin Setup Guide](./admin-setup.md)**

### 3. Integration (30 minutes)
1. Read the **[API Documentation](./api-documentation.md)** for detailed endpoint information
2. Use **[API Examples](./api-examples.md)** for your preferred programming language
3. Import **[OpenAPI Specification](./openapi-spec.yaml)** into your API client or documentation tool

## 🔗 API Endpoints Summary

| Category | Endpoints | Authentication | Description |
|----------|-----------|---------------|-------------|
| **Public** | 5 endpoints | None | Flight search, details, status |
| **User** | 4 endpoints | User Token | Booking management, seats |
| **Admin** | 3 endpoints | Admin Token | Flight/booking administration |

### Public Endpoints (No Authentication)
- `POST /api/flights/search` - Search flights with filters
- `GET /api/flights/{id}` - Get flight details
- `GET /api/flights` - List all available flights
- `GET /api/flights/{id}/status` - Check flight status
- `GET /api/test-email` - Test email service

### User Endpoints (Requires Authentication)
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get user's bookings
- `PATCH /api/bookings` - Modify/cancel booking
- `GET /api/flights/{id}/seats` - Get available seats

### Admin Endpoints (Requires Admin Role)
- `GET /api/admin/flights` - List all flights with admin data
- `PATCH /api/admin/flights/{id}` - Update flight details
- `GET /api/admin/bookings` - List all bookings with admin data

## 🔐 Authentication

The API uses **Supabase JWT authentication**:

```bash
# Include in request headers
Authorization: Bearer <supabase_access_token>

# Or via cookie for browser requests
Cookie: sb-<project>-auth-token=<encoded_session>
```

### Getting Access Tokens
```javascript
// Using Supabase client
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

const accessToken = data.session?.access_token;
```

## 📊 Key Features

### ✅ Implemented Features
- **Flight Search** with advanced filters (cabin class, dates, round-trip)
- **User Authentication** via Supabase JWT
- **Booking Management** (create, view, modify, cancel)
- **Admin Dashboard** with flight and booking management
- **Email Notifications** for bookings and flight changes
- **Real-time Seat Selection**
- **Flight Status Updates** with passenger notifications
- **Comprehensive Error Handling**
- **Rate Limiting** and security

### 🏗️ Technical Architecture
- **Framework**: Next.js 15+ with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT
- **Email**: Nodemailer with multiple provider support
- **Validation**: Built-in request validation
- **Error Handling**: Standardized error responses

## 📝 Code Examples

### Quick JavaScript Example
```javascript
// Search flights
const response = await fetch('/api/flights/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    origin: 'jfk-airport-uuid',
    destination: 'lax-airport-uuid',
    departureDate: '2024-02-15',
    tripType: 'oneway'
  })
});

const { flights } = await response.json();

// Create booking
const booking = await fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    flight_id: flights[0].id,
    full_name: 'John Doe',
    date_of_birth: '1990-01-01',
    gender: 'male',
    nationality: 'US',
    passport_number: '123456789'
  })
});
```

### Quick Python Example
```python
import requests

# Search flights
response = requests.post('http://localhost:3000/api/flights/search', json={
    'origin': 'jfk-airport-uuid',
    'destination': 'lax-airport-uuid',
    'departureDate': '2024-02-15',
    'tripType': 'oneway'
})

flights = response.json()['flights']

# Create booking
booking_response = requests.post(
    'http://localhost:3000/api/bookings',
    headers={'Authorization': f'Bearer {access_token}'},
    json={
        'flight_id': flights[0]['id'],
        'full_name': 'John Doe',
        'date_of_birth': '1990-01-01',
        'gender': 'male',
        'nationality': 'US',
        'passport_number': '123456789'
    }
)
```

## 🛠️ Development Tools

### Postman
1. Import `postman-collection.json`
2. Set environment variables:
   - `base_url`: Your API endpoint
   - `access_token`: User authentication token
   - `admin_token`: Admin authentication token

### OpenAPI/Swagger
The `openapi-spec.yaml` file can be used with:
- **Swagger UI** for interactive documentation
- **Code generators** for client SDKs
- **API testing tools** like Insomnia
- **Documentation generators**

### VS Code Extensions
Recommended extensions for development:
- **REST Client** - Use with `.http` files
- **OpenAPI (Swagger) Editor** - Edit OpenAPI specs
- **Postman** - Direct integration

## 🔒 Security & Rate Limiting

### Rate Limits
- **General endpoints**: 100 requests/minute per IP
- **Search endpoints**: 20 requests/minute per IP
- **Admin endpoints**: 200 requests/minute per admin

### Security Features
- JWT-based authentication
- Role-based access control (User/Admin)
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Request logging

## 🚨 Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "additional": "context"
  }
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Server Error

## 📞 Support & Resources

### Documentation Links
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Contact & Support
- **API Support**: api-support@yourflightbooking.com
- **Documentation Issues**: docs@yourflightbooking.com
- **Technical Support**: tech-support@yourflightbooking.com

### Status & Monitoring
- **API Status**: https://status.yourflightbooking.com
- **Documentation**: https://docs.yourflightbooking.com
- **Developer Portal**: https://developer.yourflightbooking.com

## 🔄 Changelog

### Version 1.0.0 (Latest)
- Initial release with complete API documentation
- All core endpoints implemented
- Email notification system
- Admin panel functionality
- Comprehensive error handling
- Rate limiting implementation

---

## 🎯 Next Steps

1. **Choose your documentation** based on your needs:
   - Quick integration → Use [Quick Reference](./api-reference-quick.md)
   - Detailed development → Use [API Documentation](./api-documentation.md)
   - Code examples → Use [API Examples](./api-examples.md)
   - Testing → Import [Postman Collection](./postman-collection.json)

2. **Set up your environment**:
   - Configure database with [Schema Setup](./supabase-schema-setup.md)
   - Set up emails with [Email Setup](./email-setup.md)
   - Create admin users with [Admin Setup](./admin-setup.md)

3. **Start integrating**:
   - Test endpoints with Postman
   - Review code examples for your language
   - Build your application using the API

Happy coding! 🚀 