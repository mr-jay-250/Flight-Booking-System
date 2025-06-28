# Email Setup with Nodemailer

This project uses Nodemailer to send booking confirmation emails. Here's how to set it up:

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# App URL (for ticket links in emails)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `SMTP_PASS`

## Other Email Providers

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo Mail
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Custom SMTP Server
```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Testing

1. Start your development server: `npm run dev`
2. Navigate to `/test-email`
3. Test the SMTP connection
4. Send a test email to verify everything works

## Email Features

- **HTML Email Template**: Beautiful, responsive design
- **Plain Text Fallback**: For email clients that don't support HTML
- **Booking Details**: Complete flight information
- **Ticket Link**: Direct link to view/download ticket
- **Error Handling**: Graceful failure if email sending fails

## Production Considerations

1. **Use a dedicated email service** like SendGrid, Mailgun, or AWS SES for production
2. **Set up proper SPF/DKIM records** to improve deliverability
3. **Monitor email delivery rates** and bounce rates
4. **Consider using email templates** for better maintainability

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Check your SMTP credentials
2. **Connection Timeout**: Verify SMTP host and port
3. **Gmail "Less secure app" error**: Use App Passwords instead of regular passwords
4. **Email not received**: Check spam folder and email provider settings

### Debug Mode

Enable debug logging by adding this to your email configuration:

```typescript
const transporter = nodemailer.createTransporter({
  // ... other options
  debug: true, // Enable debug output
  logger: true // Log to console
});
```

## Security Notes

- Never commit email credentials to version control
- Use environment variables for all sensitive information
- Consider using OAuth2 for Gmail in production
- Regularly rotate app passwords 