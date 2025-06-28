import { NextRequest, NextResponse } from 'next/server';
import { testEmailConnection, sendFlightChangeNotification } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    // Test SMTP connection
    const smtpConnected = await testEmailConnection();
    
    if (!smtpConnected) {
      return NextResponse.json({ 
        error: 'SMTP connection failed',
        smtpConnected: false,
        emailSent: false
      }, { status: 500 });
    }

    // Send a test flight change notification
    const testEmailData = {
      to: process.env.TEST_EMAIL || 'test@example.com',
      booking_reference: 'TEST123',
      passenger_name: 'Test Passenger',
      flight_details: {
        flight_number: 'TEST123',
        origin: 'New York (JFK)',
        destination: 'Los Angeles (LAX)',
        old_departure_time: '2/15/2024, 2:00:00 PM',
        new_departure_time: '2/15/2024, 3:30:00 PM',
        old_arrival_time: '2/15/2024, 4:30:00 PM',
        new_arrival_time: '2/15/2024, 6:00:00 PM',
        old_price: 299.99,
        new_price: 349.99,
        old_status: 'SCHEDULED',
        new_status: 'DELAYED',
        seat_number: '12A'
      }
    };

    const emailResult = await sendFlightChangeNotification(testEmailData);
    
    return NextResponse.json({
      smtpConnected: true,
      emailSent: emailResult.success,
      messageId: emailResult.messageId,
      error: emailResult.error
    });

  } catch (error: any) {
    console.error('Email test error:', error);
    return NextResponse.json({ 
      error: error.message || 'Email test failed',
      smtpConnected: false,
      emailSent: false
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Just test SMTP connection
    const smtpConnected = await testEmailConnection();
    
    return NextResponse.json({
      smtpConnected,
      message: smtpConnected ? 'SMTP connection successful' : 'SMTP connection failed'
    });
  } catch (error: any) {
    console.error('SMTP test error:', error);
    return NextResponse.json({ 
      error: error.message || 'SMTP test failed',
      smtpConnected: false
    }, { status: 500 });
  }
} 