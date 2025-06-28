# Admin Dashboard Setup

This document explains how to set up the admin dashboard for the flight booking system.

## Overview

The admin system uses environment variables to define admin users, eliminating the need for a separate admin table in the database. This approach is simple and secure for small to medium applications.

## Setup Instructions

### 1. Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,admin2@example.com
```

**Important Notes:**
- Use comma-separated email addresses for multiple admins
- The `NEXT_PUBLIC_` prefix is required for client-side access
- Only users with these email addresses will have admin access

### 2. Creating Admin Users

1. **Register normally**: Admin users should register through the normal registration process
2. **Verify email**: Complete email verification
3. **Login**: Once logged in with an admin email, the "Admin" button will appear in the navbar

### 3. Accessing the Admin Dashboard

- Navigate to `/admin` in your browser
- Or click the "Admin" button in the navbar (only visible to admin users)
- The system will automatically redirect non-admin users

## Features

### Admin Dashboard (`/admin`)

The admin dashboard provides:

- **Statistics Overview**: Total bookings, revenue, confirmed/cancelled bookings
- **Booking History**: Complete list of all user bookings
- **Filtering**: Search by booking reference, email, or name
- **Status Filtering**: Filter by booking status (Confirmed, Pending, Cancelled)
- **Date Filtering**: Filter by date range
- **Pagination**: Navigate through large datasets
- **Actions**: View booking details and download tickets

### API Endpoints

- `GET /api/admin/bookings` - Fetch all bookings with filtering and pagination
- Protected by admin authentication middleware

## Security

- Admin access is controlled by email addresses in environment variables
- All admin API endpoints require authentication
- Non-admin users are automatically redirected
- Admin routes are protected by the `AdminGuard` component

## Customization

### Adding More Admin Features

To extend the admin system:

1. **New API endpoints**: Create routes in `app/api/admin/`
2. **New pages**: Add pages in `app/admin/`
3. **Use the admin guard**: Wrap new admin pages with `AdminGuard`

### Example: Adding User Management

```typescript
// app/api/admin/users/route.ts
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(req: Request) {
  const { admin, error } = await requireAdmin(req);
  if (error || !admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  
  // Your admin logic here
}
```

## Troubleshooting

### Admin Button Not Showing

1. Check that the email is in `NEXT_PUBLIC_ADMIN_EMAILS`
2. Ensure the user has verified their email
3. Try logging out and back in

### Access Denied Errors

1. Verify the environment variable is set correctly
2. Check that the user's email matches exactly
3. Ensure the user is properly authenticated

### API Errors

1. Check server logs for detailed error messages
2. Verify the `SUPABASE_SERVICE_ROLE_KEY` is set
3. Ensure database permissions are correct

## Best Practices

1. **Keep admin emails secure**: Don't commit admin emails to version control
2. **Use strong passwords**: Admin accounts should have strong passwords
3. **Regular audits**: Review admin access periodically
4. **Backup admin emails**: Keep a secure backup of admin email addresses
5. **Monitor access**: Log admin actions for security purposes

## Production Considerations

For production deployment:

1. **Environment variables**: Set admin emails in your hosting platform
2. **HTTPS**: Ensure all admin access is over HTTPS
3. **Rate limiting**: Consider adding rate limiting to admin endpoints
4. **Logging**: Implement comprehensive logging for admin actions
5. **Backup**: Regular backups of admin configuration 