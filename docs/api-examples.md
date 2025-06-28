# Flight Booking API - Code Examples

## Table of Contents
1. [JavaScript/TypeScript Examples](#javascript-typescript)
2. [Python Examples](#python)
3. [cURL Examples](#curl)
4. [Node.js SDK Usage](#nodejs-sdk)
5. [Error Handling Examples](#error-handling)
6. [Authentication Examples](#authentication)

---

## JavaScript/TypeScript

### Search Flights
```typescript
interface FlightSearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  tripType: 'oneway' | 'roundtrip';
  outboundCabin?: 'economy' | 'business' | 'first';
  returnCabin?: 'economy' | 'business' | 'first';
}

async function searchFlights(params: FlightSearchRequest) {
  const response = await fetch('/api/flights/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  return await response.json();
}

// Usage
const searchResults = await searchFlights({
  origin: 'jfk-airport-uuid',
  destination: 'lax-airport-uuid',
  departureDate: '2024-02-15',
  tripType: 'oneway',
  outboundCabin: 'economy'
});
```

### Create Booking
```typescript
interface CreateBookingRequest {
  flight_id: string;
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  passport_number: string;
}

async function createBooking(
  params: CreateBookingRequest, 
  accessToken: string
) {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Booking failed');
  }

  return await response.json();
}

// Usage
const booking = await createBooking({
  flight_id: 'flight-uuid-123',
  full_name: 'John Doe',
  date_of_birth: '1990-01-01',
  gender: 'male',
  nationality: 'US',
  passport_number: '123456789'
}, userAccessToken);
```

### Get User Bookings
```typescript
async function getUserBookings(accessToken: string) {
  const response = await fetch('/api/bookings', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }

  return await response.json();
}
```

### Admin Flight Update
```typescript
interface UpdateFlightRequest {
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  status: 'scheduled' | 'delayed' | 'cancelled' | 'boarding' | 'departed' | 'arrived';
}

async function updateFlight(
  flightId: string,
  updates: UpdateFlightRequest,
  adminToken: string
) {
  const response = await fetch(`/api/admin/flights/${flightId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Flight update failed');
  }

  return await response.json();
}
```

---

## Python

### Search Flights
```python
import requests
from typing import Optional, Dict, Any
from datetime import datetime

class FlightBookingAPI:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()

    def search_flights(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        trip_type: str = "oneway",
        return_date: Optional[str] = None,
        outbound_cabin: Optional[str] = None,
        return_cabin: Optional[str] = None
    ) -> Dict[str, Any]:
        """Search for flights"""
        
        payload = {
            "origin": origin,
            "destination": destination,
            "departureDate": departure_date,
            "tripType": trip_type
        }
        
        if return_date:
            payload["returnDate"] = return_date
        if outbound_cabin:
            payload["outboundCabin"] = outbound_cabin
        if return_cabin:
            payload["returnCabin"] = return_cabin

        response = self.session.post(
            f"{self.base_url}/api/flights/search",
            json=payload
        )
        response.raise_for_status()
        return response.json()

    def create_booking(
        self,
        flight_id: str,
        passenger_info: Dict[str, str],
        access_token: str
    ) -> Dict[str, Any]:
        """Create a new booking"""
        
        headers = {"Authorization": f"Bearer {access_token}"}
        payload = {
            "flight_id": flight_id,
            **passenger_info
        }

        response = self.session.post(
            f"{self.base_url}/api/bookings",
            json=payload,
            headers=headers
        )
        response.raise_for_status()
        return response.json()

    def get_user_bookings(self, access_token: str) -> Dict[str, Any]:
        """Get all bookings for user"""
        
        headers = {"Authorization": f"Bearer {access_token}"}
        response = self.session.get(
            f"{self.base_url}/api/bookings",
            headers=headers
        )
        response.raise_for_status()
        return response.json()

    def cancel_booking(self, booking_id: str, access_token: str) -> Dict[str, Any]:
        """Cancel a booking"""
        
        headers = {"Authorization": f"Bearer {access_token}"}
        payload = {
            "booking_id": booking_id,
            "action": "cancel"
        }

        response = self.session.patch(
            f"{self.base_url}/api/bookings",
            json=payload,
            headers=headers
        )
        response.raise_for_status()
        return response.json()

# Usage Example
api = FlightBookingAPI()

# Search flights
flights = api.search_flights(
    origin="jfk-airport-uuid",
    destination="lax-airport-uuid",
    departure_date="2024-02-15",
    trip_type="oneway",
    outbound_cabin="economy"
)

# Create booking
passenger = {
    "full_name": "John Doe",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "nationality": "US",
    "passport_number": "123456789"
}

booking = api.create_booking(
    flight_id=flights["flights"][0]["id"],
    passenger_info=passenger,
    access_token="your-access-token"
)

print(f"Booking created: {booking['booking_reference']}")
```

---

## cURL Examples

### Search Flights
```bash
# One-way flight search
curl -X POST "http://localhost:3000/api/flights/search" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "jfk-airport-uuid",
    "destination": "lax-airport-uuid",
    "departureDate": "2024-02-15",
    "tripType": "oneway",
    "outboundCabin": "economy"
  }'

# Round-trip flight search
curl -X POST "http://localhost:3000/api/flights/search" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "jfk-airport-uuid",
    "destination": "lax-airport-uuid",
    "departureDate": "2024-02-15",
    "returnDate": "2024-02-22",
    "tripType": "roundtrip",
    "outboundCabin": "business",
    "returnCabin": "business"
  }'
```

### Create Booking
```bash
curl -X POST "http://localhost:3000/api/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-access-token" \
  -d '{
    "flight_id": "flight-uuid-123",
    "full_name": "John Doe",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "nationality": "US",
    "passport_number": "123456789"
  }'
```

### Get User Bookings
```bash
curl -X GET "http://localhost:3000/api/bookings" \
  -H "Authorization: Bearer your-access-token"
```

### Cancel Booking
```bash
curl -X PATCH "http://localhost:3000/api/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-access-token" \
  -d '{
    "booking_id": "booking-uuid-123",
    "action": "cancel"
  }'
```

### Admin - Update Flight
```bash
curl -X PATCH "http://localhost:3000/api/admin/flights/flight-uuid-123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-access-token" \
  -d '{
    "departure_time": "2024-02-15T10:30:00Z",
    "arrival_time": "2024-02-15T14:30:00Z",
    "price": 299.99,
    "available_seats": 150,
    "status": "delayed"
  }'
```

### Admin - Get All Flights
```bash
curl -X GET "http://localhost:3000/api/admin/flights?status=all&search=AA&airline=all" \
  -H "Authorization: Bearer admin-access-token"
```

---

## Node.js SDK

### Installation
```bash
npm install @flightbooking/sdk
```

### Usage
```typescript
import { FlightBookingSDK } from '@flightbooking/sdk';

const sdk = new FlightBookingSDK({
  baseUrl: 'http://localhost:3000',
  accessToken: 'your-access-token'
});

// Search flights
const flights = await sdk.flights.search({
  origin: 'jfk-airport-uuid',
  destination: 'lax-airport-uuid',
  departureDate: '2024-02-15',
  tripType: 'oneway'
});

// Create booking
const booking = await sdk.bookings.create({
  flightId: flights.flights[0].id,
  passenger: {
    fullName: 'John Doe',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    nationality: 'US',
    passportNumber: '123456789'
  }
});

// Get user bookings
const userBookings = await sdk.bookings.list();

// Cancel booking
await sdk.bookings.cancel(booking.booking_id);

// Admin operations (requires admin token)
const adminSdk = new FlightBookingSDK({
  baseUrl: 'http://localhost:3000',
  accessToken: 'admin-access-token'
});

const adminFlights = await adminSdk.admin.flights.list({
  status: 'scheduled',
  search: 'AA'
});

await adminSdk.admin.flights.update('flight-id', {
  status: 'delayed',
  departure_time: '2024-02-15T11:00:00Z'
});
```

---

## Error Handling

### JavaScript Error Handling
```typescript
async function handleAPICall<T>(apiCall: () => Promise<T>): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    if (error instanceof Response) {
      const errorData = await error.json();
      
      switch (error.status) {
        case 401:
          throw new Error('Authentication required. Please log in.');
        case 403:
          throw new Error('Access denied. Insufficient permissions.');
        case 404:
          throw new Error('Resource not found.');
        case 409:
          throw new Error(`Conflict: ${errorData.error}`);
        case 422:
          throw new Error(`Validation error: ${errorData.error}`);
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(errorData.error || 'An unexpected error occurred.');
      }
    }
    throw error;
  }
}

// Usage
try {
  const booking = await handleAPICall(() => createBooking(bookingData, token));
  console.log('Booking created:', booking);
} catch (error) {
  console.error('Booking failed:', error.message);
  // Handle specific error cases
  if (error.message.includes('No seats available')) {
    // Show seat selection UI
  } else if (error.message.includes('Authentication required')) {
    // Redirect to login
  }
}
```

### Python Error Handling
```python
import requests
from typing import Dict, Any

class FlightBookingError(Exception):
    """Base exception for Flight Booking API errors"""
    pass

class AuthenticationError(FlightBookingError):
    """Authentication required"""
    pass

class AuthorizationError(FlightBookingError):
    """Insufficient permissions"""
    pass

class ValidationError(FlightBookingError):
    """Invalid request data"""
    pass

class ConflictError(FlightBookingError):
    """Business logic conflict"""
    pass

def handle_api_response(response: requests.Response) -> Dict[str, Any]:
    """Handle API response and raise appropriate exceptions"""
    
    if response.status_code == 200 or response.status_code == 201:
        return response.json()
    
    try:
        error_data = response.json()
        error_message = error_data.get('error', 'Unknown error')
    except:
        error_message = response.text or 'Unknown error'
    
    if response.status_code == 401:
        raise AuthenticationError(error_message)
    elif response.status_code == 403:
        raise AuthorizationError(error_message)
    elif response.status_code == 404:
        raise FlightBookingError(f"Resource not found: {error_message}")
    elif response.status_code == 409:
        raise ConflictError(error_message)
    elif response.status_code == 422:
        raise ValidationError(error_message)
    elif response.status_code == 500:
        raise FlightBookingError(f"Server error: {error_message}")
    else:
        raise FlightBookingError(f"API error ({response.status_code}): {error_message}")

# Usage
try:
    response = requests.post('/api/bookings', json=booking_data, headers=headers)
    booking = handle_api_response(response)
    print(f"Booking created: {booking['booking_reference']}")
except ConflictError as e:
    if "No seats available" in str(e):
        print("Flight is full. Please select another flight.")
    else:
        print(f"Booking conflict: {e}")
except AuthenticationError:
    print("Please log in to continue.")
except ValidationError as e:
    print(f"Invalid booking data: {e}")
except FlightBookingError as e:
    print(f"Booking failed: {e}")
```

---

## Authentication

### Getting Access Token (Supabase)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'your-supabase-url',
  'your-supabase-anon-key'
);

// Sign in user
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

if (error) {
  console.error('Login failed:', error.message);
} else {
  const accessToken = data.session?.access_token;
  // Use this token for API calls
}

// Get current session
const { data: { session } } = await supabase.auth.getSession();
const accessToken = session?.access_token;
```

### Refresh Token Handling
```typescript
class APIClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.accessToken}`
    };

    let response = await fetch(url, { ...options, headers });

    // If token expired, try to refresh
    if (response.status === 401 && this.refreshToken) {
      const newTokens = await this.refreshAccessToken();
      if (newTokens) {
        headers['Authorization'] = `Bearer ${newTokens.access_token}`;
        response = await fetch(url, { ...options, headers });
      }
    }

    return response;
  }

  private async refreshAccessToken() {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: this.refreshToken!
    });

    if (error || !data.session) {
      // Redirect to login
      return null;
    }

    this.accessToken = data.session.access_token;
    this.refreshToken = data.session.refresh_token;
    
    return data.session;
  }
}
```

---

## Rate Limiting Handling

### JavaScript with Retry Logic
```typescript
async function makeAPICallWithRetry<T>(
  apiCall: () => Promise<Response>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await apiCall();

      if (response.status === 429) {
        // Rate limited
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
        
        console.log(`Rate limited. Retrying after ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxRetries) break;
      
      // Exponential backoff for other errors
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
```

This comprehensive documentation provides developers with practical examples for integrating with your Flight Booking API across multiple programming languages and scenarios. 