# Email Notification System

## Overview

The flight booking system includes a comprehensive email notification system that automatically notifies passengers when their flight details are updated by administrators. This ensures passengers are always informed of important changes to their travel plans.

## Features

### Flight Change Notifications

When an admin updates a flight's details, the system automatically:

1. **Detects Significant Changes**: Monitors for changes in:
   - Departure time (any change)
   - Arrival time (any change)
   - Flight status (SCHEDULED, DELAYED, CANCELLED, BOARDING)
   - Ticket price (changes over $5)

2. **Sends Email Notifications**: Automatically emails all confirmed passengers with:
   - Detailed change information
   - Before and after values
   - Time differences in minutes
   - Price differences
   - Important travel reminders
   - Customer service contact information

3. **Provides Admin Feedback**: Gives administrators detailed feedback about:
   - Number of notifications sent
   - Total passengers affected
   - Specific changes made
   - Any notification failures

## Email Templates

### Flight Change Notification Email

The flight change notification email includes:

#### Visual Design
- **Modern, responsive layout** with gradient headers
- **Color-coded changes** (red for old values, green for new values)
- **Status badges** for flight status
- **Professional styling** with proper spacing and typography

#### Content Sections
1. **Booking Information**
   - Booking reference number
   - Flight number
   - Route visualization (origin → destination)

2. **Schedule Changes**
   - Departure time changes with time difference
   - Arrival time changes with time difference
   - Flight status changes
   - Price changes with difference amount
   - Seat number (unchanged)

3. **Important Information**
   - Arrival time recommendations
   - Flight status checking advice
   - Compensation eligibility information
   - Record keeping reminders

4. **Customer Service**
   - 24/7 phone support
   - Email support
   - Live chat availability

## Technical Implementation

### API Endpoint
```
PATCH /api/admin/flights/[id]
```

### Change Detection Logic
```typescript
const hasSignificantChanges = 
  currentFlight.departure_time !== departure_time ||
  currentFlight.arrival_time !== arrival_time ||
  currentFlight.status !== status ||
  Math.abs(currentFlight.price - price) > 5;
```

### Email Sending Process
1. Fetch all confirmed bookings for the flight
2. For each passenger:
   - Extract email and name
   - Prepare flight change data
   - Send notification email
   - Track success/failure

### Email Configuration
The system uses nodemailer with SMTP configuration:
- **Host**: Configurable via `SMTP_HOST` environment variable
- **Port**: Configurable via `SMTP_PORT` environment variable
- **Authentication**: Uses `SMTP_USER` and `SMTP_PASS`
- **From Address**: Uses `SMTP_FROM` or falls back to `SMTP_USER`

## Admin Interface

### Flight Management Page
- **Edit Flight Modal**: Allows updating flight details
- **Real-time Feedback**: Shows notification status after updates
- **Detailed Toast Messages**: Provides comprehensive feedback about changes and notifications

### Success Messages
- Shows specific changes made (e.g., "Departure time: +30 minutes")
- Displays notification count (e.g., "3 passengers notified")
- Indicates if no significant changes were detected

## Email Content Examples

### Subject Lines
- `Flight Delay - ABC123 (FL123)`
- `Flight Cancellation - ABC123 (FL123)`
- `Flight Update - ABC123 (FL123)`

### Change Detection Examples
- **Time Change**: "Departure time: +45 minutes"
- **Status Change**: "Status: SCHEDULED → DELAYED"
- **Price Change**: "Price: +$25.00"

## Error Handling

### Email Sending Failures
- Individual email failures are logged
- Admin receives feedback about failed notifications
- System continues processing other passengers
- Failed notifications are tracked in response

### Database Errors
- Proper error handling for booking queries
- Graceful degradation if passenger data is unavailable
- Detailed error logging for debugging

## Configuration

### Environment Variables
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Thresholds
- **Price Change Threshold**: $5 (configurable in code)
- **Time Change Threshold**: Any change triggers notification
- **Status Change Threshold**: Any status change triggers notification

## Testing

### Email Testing
Use the test endpoint to verify email configuration:
```typescript
// Test email connection
await testEmailConnection();
```

### Notification Testing
1. Create a test booking
2. Update flight details as admin
3. Check email delivery
4. Verify email content and formatting

## Best Practices

### For Administrators
1. **Review Changes**: Always review changes before saving
2. **Monitor Notifications**: Check notification feedback after updates
3. **Test Changes**: Test with small changes first
4. **Document Changes**: Keep records of significant schedule changes

### For Passengers
1. **Check Email**: Monitor email for flight updates
2. **Verify Changes**: Confirm changes on the website
3. **Contact Support**: Reach out if changes cause issues
4. **Keep Records**: Save notification emails for reference

## Troubleshooting

### Common Issues

#### Emails Not Sending
- Check SMTP configuration
- Verify environment variables
- Test email connection
- Check server logs

#### Incorrect Change Detection
- Verify change thresholds
- Check data types and formats
- Review comparison logic

#### Missing Passenger Data
- Ensure bookings have associated user profiles
- Check passenger data integrity
- Verify email addresses are valid

### Debug Information
The system provides detailed debug information:
- Notification success/failure counts
- Individual email sending results
- Change detection details
- Error messages and stack traces

## Future Enhancements

### Planned Features
1. **SMS Notifications**: Add SMS support for urgent changes
2. **Push Notifications**: Mobile app notifications
3. **Customizable Templates**: Admin-configurable email templates
4. **Notification Preferences**: User-configurable notification settings
5. **Bulk Operations**: Mass flight updates with notifications
6. **Notification History**: Track all sent notifications
7. **Retry Logic**: Automatic retry for failed notifications
8. **Analytics**: Notification delivery and engagement metrics 