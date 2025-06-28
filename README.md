# Flight Booking System

A modern, full-stack flight booking application built with Next.js, Supabase, and TypeScript. This project enables users to search for flights, book tickets, manage their profiles, and provides an admin dashboard for booking management and analytics.

---

## ✈️ Features
- **Flight Search & Booking**: Search for available flights and book tickets
- **User Authentication**: Secure login/register with Supabase Auth
- **User Profiles**: Manage personal details and preferences
- **Admin Dashboard**: View and manage all bookings, analytics, and ticket access
- **PDF E-Tickets & Email Confirmations**: Automatic email confirmations with attached PDF e-tickets
- **Flight Change Notifications**: Automatic email notifications when admin updates flight details
- **Mobile Friendly**: Responsive design with dark mode support
- **Secure**: JWT authentication and Row Level Security (RLS) on all data

---

## 🛠️ Tech Stack
- [Next.js](https://nextjs.org/) (React framework)
- [Supabase](https://supabase.com/) (Postgres DB, Auth, Storage)
- [TypeScript](https://www.typescriptlang.org/)
- [Nodemailer](https://nodemailer.com/) (for transactional emails)
- [pdf-lib](https://pdf-lib.js.org/) (for PDF ticket generation)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- A Supabase account
- SMTP email service (Gmail, SendGrid, etc.)

### 2. Clone the Repository
```bash
git clone <repository-url>
cd flightbooking
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Set Up Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,admin2@example.com

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Test email for notifications
TEST_EMAIL=test@example.com
```

### 5. Set Up the Database (Supabase)
1. Go to your Supabase project dashboard
2. Open the **SQL Editor**
3. Copy the contents of `supabase_schema.sql` (in the project root)
4. Paste and run it in the SQL Editor
5. Verify that all tables and RLS policies are created

For a detailed explanation of the schema and policies, see [`docs/supabase-schema-setup.md`](docs/supabase-schema-setup.md).

### 6. Set Up Email Service
- Configure your SMTP settings in `.env.local`
- For Gmail: Use App Password instead of regular password
- Test email functionality at `/api/test-email`
- See [`docs/email-setup.md`](docs/email-setup.md) for more details

### 7. Run the Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Project Structure
```
flightbooking/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── admin/         # Admin API endpoints
│   │   ├── flights/       # Flight management
│   │   └── test-email/    # Email testing endpoint
│   ├── admin/             # Admin dashboard pages
│   ├── auth/              # Authentication pages
│   ├── bookings/          # Booking pages
│   └── flights/           # Flight pages
├── components/            # React components
├── lib/                   # Utility libraries (Supabase, email, etc.)
├── store/                 # State management
├── docs/                  # Documentation
├── supabase_schema.sql    # Database schema & RLS setup
└── ...
```

---

## 🛡️ Security & RLS
- All sensitive tables use Row Level Security (RLS) for data protection
- Users can only access their own bookings and profiles
- Admin access is controlled via email addresses in environment variables
- See [`docs/supabase-schema-setup.md`](docs/supabase-schema-setup.md) for full details

---

## 🧑‍💼 Admin Dashboard
- Access at `/admin` (must be logged in as an admin email)
- View all bookings, filter/search, download tickets, and see analytics
- **Flight Management**: Update flight schedules, prices, and status
- **Automatic Notifications**: Passengers are automatically notified of flight changes
- Admins are defined in `NEXT_PUBLIC_ADMIN_EMAILS` in your `.env.local`

---

## 📨 Email & Notification Features

### Booking Confirmations
- Users receive a confirmation email and PDF e-ticket after booking
- Professional email templates with booking details

### Flight Change Notifications
- **Automatic Detection**: System detects significant changes to flights
- **Email Notifications**: Passengers receive detailed change notifications
- **Change Types**: Departure/arrival time changes, status updates, price changes
- **Professional Templates**: Modern, responsive email design
- **Admin Feedback**: Real-time feedback on notification delivery

### Email Testing
- Test email configuration at `/api/test-email`
- Verify SMTP connection and email delivery
- See [`docs/email-notifications.md`](docs/email-notifications.md) for detailed documentation

---

## 🔔 Flight Change Notification System

### How It Works
1. **Admin Updates Flight**: Admin modifies flight details in the dashboard
2. **Change Detection**: System automatically detects significant changes
3. **Notification Trigger**: If changes exceed thresholds, notifications are sent
4. **Email Delivery**: All confirmed passengers receive detailed change emails
5. **Admin Feedback**: Admin receives confirmation of notifications sent

### Change Thresholds
- **Time Changes**: Any departure/arrival time change
- **Status Changes**: Any flight status change (SCHEDULED, DELAYED, CANCELLED, BOARDING)
- **Price Changes**: Changes over $5

### Email Content
- **Before/After Comparison**: Clear display of old vs new values
- **Time Differences**: Calculated time differences in minutes
- **Price Differences**: Calculated price changes
- **Important Information**: Travel reminders and contact details
- **Professional Design**: Modern, responsive email template

### Testing
- Use the test script: `node test-flight-notifications.js`
- Test email configuration: `GET /api/test-email`
- Send test notifications: `POST /api/test-email`

---

## 🆘 Troubleshooting
- **Table already exists**: Ignore if re-running the schema
- **Missing permissions**: Ensure you are a Supabase project owner
- **Email not sending**: Check your SMTP configuration and credentials
- **Notifications not working**: Verify email settings and test connection
- **Other issues**: See the `docs/` folder or contact the development team

---

## 📝 Customization
- Adjust the schema or RLS policies in `supabase_schema.sql` as needed
- Modify email templates in `lib/email.ts`
- Add new features or UI components in the `app/` and `components/` directories
- Configure notification thresholds in `app/api/admin/flights/[id]/route.ts`

---

## 📚 Learn More
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Nodemailer Documentation](https://nodemailer.com/)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [Email Notifications Guide](docs/email-notifications.md)

---

## 🤝 Support
- See the `docs/` folder for detailed guides
- Open an issue on GitHub for bugs or questions
- Contact the project maintainers for help
