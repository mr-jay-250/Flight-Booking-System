# Supabase Schema Setup Guide

This guide explains the complete database schema for the Flight Booking System, including all tables, functions, RLS policies, and how to set them up.

## 📋 Overview

The Flight Booking System uses PostgreSQL with Supabase and includes the following components:

- **8 Main Tables**: airlines, airports, user_profiles, payment_methods, flights, bookings, passengers, payments
- **Custom Types**: flight_status, cabin_class, booking_status, payment_status, card_type, gender
- **Functions**: book_flight (stored procedure), generate_seat_number, set_admin_emails
- **RLS Policies**: Row Level Security for data protection
- **Views**: flight_search_results, booking_details
- **Indexes**: For optimal query performance

## 🗄️ Database Schema

### Tables Structure

#### 1. Airlines Table
```sql
CREATE TABLE airlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
**Purpose**: Stores airline information (American Airlines, Delta, etc.)

#### 2. Airports Table
```sql
CREATE TABLE airports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
**Purpose**: Stores airport information (JFK, LAX, etc.)

#### 3. User Profiles Table
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    address TEXT,
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
**Purpose**: Extends Supabase auth.users with additional profile information

#### 4. Payment Methods Table
```sql
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    card_type card_type NOT NULL,
    last_four VARCHAR(4) NOT NULL,
    expiry_month INTEGER NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
    expiry_year INTEGER NOT NULL CHECK (expiry_year >= 2024),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
**Purpose**: Stores user payment methods (credit cards)

#### 5. Flights Table
```sql
CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_number VARCHAR(20) NOT NULL,
    airline_id UUID NOT NULL REFERENCES airlines(id) ON DELETE CASCADE,
    origin_airport_id UUID NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
    destination_airport_id UUID NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration VARCHAR(20) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    available_seats INTEGER NOT NULL DEFAULT 0 CHECK (available_seats >= 0),
    cabin_class cabin_class NOT NULL,
    aircraft_type VARCHAR(50),
    status flight_status DEFAULT 'On Time',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT flights_different_airports CHECK (origin_airport_id != destination_airport_id),
    CONSTRAINT flights_valid_times CHECK (departure_time < arrival_time)
);
```
**Purpose**: Stores flight schedules and availability

#### 6. Bookings Table
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
    booking_reference VARCHAR(20) NOT NULL UNIQUE,
    booking_status booking_status DEFAULT 'CONFIRMED',
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    ticket_url TEXT,
    payment_status payment_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
**Purpose**: Stores flight bookings made by users

#### 7. Passengers Table
```sql
CREATE TABLE passengers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender gender,
    nationality VARCHAR(100),
    passport_number VARCHAR(50),
    seat_number VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
**Purpose**: Stores passenger information for each booking

#### 8. Payments Table
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    status payment_status DEFAULT 'PENDING',
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
**Purpose**: Stores payment records for bookings

## 🔧 Functions

### 1. book_flight Function
This is the main stored procedure used for booking flights. It handles:
- Flight availability check
- Booking creation
- Passenger record creation
- Seat allocation
- Available seats decrement
- Transaction management

```sql
CREATE OR REPLACE FUNCTION book_flight(
    p_user_id UUID,
    p_flight_id UUID,
    p_full_name VARCHAR(255),
    p_date_of_birth DATE DEFAULT NULL,
    p_gender gender DEFAULT NULL,
    p_nationality VARCHAR(100) DEFAULT NULL,
    p_passport_number VARCHAR(50) DEFAULT NULL,
    p_seat_number VARCHAR(10) DEFAULT NULL,
    p_booking_reference VARCHAR(20),
    p_ticket_url TEXT DEFAULT NULL,
    p_total_price DECIMAL(10, 2)
)
RETURNS VOID
```

### 2. generate_seat_number Function
Generates random seat numbers for passenger assignment:
```sql
CREATE OR REPLACE FUNCTION generate_seat_number()
RETURNS VARCHAR(10)
```

### 3. set_admin_emails Function
Sets admin email addresses for admin access control:
```sql
CREATE OR REPLACE FUNCTION set_admin_emails(emails TEXT)
RETURNS VOID
```

## 🔒 Row Level Security (RLS) Policies

### User Profiles Policies
- Users can only view, update, and insert their own profile
- Admin access is controlled via email addresses

### Payment Methods Policies
- Users can only manage their own payment methods
- Full CRUD operations for authenticated users

### Flights Policies
- **Public Read**: Anyone can view flights
- **Admin Write**: Only admin emails can insert, update, delete flights

### Bookings Policies
- Users can only view and manage their own bookings
- Admins can view and manage all bookings

### Passengers Policies
- Users can only view passengers for their own bookings
- Admins can view all passengers

### Payments Policies
- Users can only view payments for their own bookings
- Admins can view all payments

### Airlines and Airports Policies
- **Public Read**: Anyone can view airlines and airports
- **Admin Write**: Only admin emails can manage airlines and airports

## 📊 Views

### 1. flight_search_results
Provides a comprehensive view of flights with airline and airport details for search functionality.

### 2. booking_details
Provides detailed booking information with user, passenger, flight, and airline details.

## 🚀 Setup Instructions

### Step 1: Run the Schema Files
Execute the SQL files in this order:

1. `supabase_schema_part1.sql` - Tables and types
2. `supabase_schema_part2.sql` - Indexes, triggers, and functions
3. `supabase_schema_part3.sql` - RLS policies
4. `supabase_schema_part4.sql` - Views and documentation

### Step 2: Set Admin Emails
After running the schema, set your admin email addresses:

```sql
SELECT set_admin_emails('admin@example.com,admin2@example.com');
```

### Step 3: Insert Sample Data (Optional)
Uncomment and modify the sample data section in `supabase_schema_part4.sql` if you want to test with sample data.

### Step 4: Verify Setup
Check that all tables, functions, and policies are created:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check functions
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';

-- Check policies
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

## 🔍 Key Features

### 1. Data Integrity
- Foreign key constraints ensure referential integrity
- Check constraints validate data (e.g., price >= 0, available_seats >= 0)
- Unique constraints prevent duplicates

### 2. Performance
- Indexes on frequently queried columns
- Optimized views for common queries
- Efficient joins for complex queries

### 3. Security
- Row Level Security (RLS) on all sensitive tables
- User isolation (users can only access their own data)
- Admin access control via email addresses

### 4. Scalability
- UUID primary keys for distributed systems
- Proper indexing strategy
- Efficient data types and constraints

## 🛠️ Maintenance

### Regular Tasks
1. **Monitor Performance**: Check query performance and add indexes as needed
2. **Backup Data**: Regular backups of the database
3. **Update Admin Emails**: Update admin email list as needed
4. **Clean Old Data**: Archive old bookings and payments

### Troubleshooting
- **RLS Issues**: Check if user is authenticated and has proper permissions
- **Function Errors**: Verify function parameters and transaction handling
- **Performance Issues**: Check indexes and query optimization

## 📚 Related Documentation
- [Email Setup Guide](email-setup.md)
- [Admin Setup Guide](admin-setup.md)
- [API Documentation](../README.md)

## 🔗 External Resources
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security) 