import nodemailer from 'nodemailer';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface BookingEmailData {
  to: string;
  booking_reference: string;
  ticket_url: string;
  passenger_name: string;
  flight_details: {
    origin: string;
    destination: string;
    departure_time: string;
    arrival_time: string;
    flight_number: string;
    seat_number: string;
    total_price: number;
  };
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  const {
    to,
    booking_reference,
    ticket_url,
    passenger_name,
    flight_details
  } = data;

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Flight Booking Confirmation</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }
            .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }
            .booking-details {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #667eea;
            }
            .flight-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
            }
            .info-item {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
            }
            .info-label {
                font-weight: bold;
                color: #667eea;
                font-size: 12px;
                text-transform: uppercase;
            }
            .info-value {
                font-size: 16px;
                margin-top: 5px;
            }
            .cta-button {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: bold;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>✈️ Flight Booking Confirmed!</h1>
            <p>Your booking has been successfully confirmed</p>
        </div>
        
        <div class="content">
            <p>Dear ${passenger_name},</p>
            
            <p>Thank you for choosing our airline! Your flight booking has been confirmed and your ticket is ready.</p>
            
            <div class="booking-details">
                <h3>Booking Reference: <strong>${booking_reference}</strong></h3>
                
                <div class="flight-info">
                    <div class="info-item">
                        <div class="info-label">From</div>
                        <div class="info-value">${flight_details.origin}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">To</div>
                        <div class="info-value">${flight_details.destination}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Flight Number</div>
                        <div class="info-value">${flight_details.flight_number}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Seat</div>
                        <div class="info-value">${flight_details.seat_number}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Departure</div>
                        <div class="info-value">${flight_details.departure_time}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Arrival</div>
                        <div class="info-value">${flight_details.arrival_time}</div>
                    </div>
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                    <strong>Total Amount: $${flight_details.total_price}</strong>
                </div>
            </div>
            
            <p>Please arrive at the airport at least 2 hours before your departure time. Don't forget to bring your passport and this booking confirmation.</p>
            
            
            <p>If you have any questions or need to make changes to your booking, please contact our customer service team.</p>
            
            <div class="footer">
                <p>Safe travels! 🛫</p>
                <p>This is an automated email. Please do not reply to this message.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const emailText = `
Flight Booking Confirmation

Dear ${passenger_name},

Thank you for choosing our airline! Your flight booking has been confirmed.

Booking Reference: ${booking_reference}

Flight Details:
- From: ${flight_details.origin}
- To: ${flight_details.destination}
- Flight Number: ${flight_details.flight_number}
- Seat: ${flight_details.seat_number}
- Departure: ${flight_details.departure_time}
- Arrival: ${flight_details.arrival_time}
- Total Amount: $${flight_details.total_price}

Please arrive at the airport at least 2 hours before your departure time.

View your ticket: ${process.env.NEXT_PUBLIC_APP_URL}${ticket_url}

Safe travels!
  `;

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: to,
      subject: `Flight Booking Confirmation - ${booking_reference}`,
      text: emailText,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendBookingCancellationEmail(data: BookingEmailData) {
  const {
    to,
    booking_reference,
    ticket_url,
    passenger_name,
    flight_details
  } = data;

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Flight Booking Cancelled</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e53e3e 0%, #b83280 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e53e3e; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>❌ Flight Booking Cancelled</h1>
            <p>Your booking has been cancelled</p>
        </div>
        <div class="content">
            <p>Dear ${passenger_name},</p>
            <p>Your flight booking with reference <strong>${booking_reference}</strong> has been <b>cancelled</b>.</p>
            <div class="booking-details">
                <h3>Booking Reference: <strong>${booking_reference}</strong></h3>
                <p><b>From:</b> ${flight_details.origin} <br/>
                <b>To:</b> ${flight_details.destination} <br/>
                <b>Flight Number:</b> ${flight_details.flight_number} <br/>
                <b>Seat:</b> ${flight_details.seat_number} <br/>
                <b>Departure:</b> ${flight_details.departure_time} <br/>
                <b>Arrival:</b> ${flight_details.arrival_time} <br/>
                <b>Total Amount:</b> $${flight_details.total_price}</p>
            </div>
            <p>If you have any questions, please contact our customer service team.</p>
            <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
            </div>
        </div>
    </body>
    </html>
  `;
  const emailText = `Your flight booking (${booking_reference}) has been cancelled.\nFrom: ${flight_details.origin}\nTo: ${flight_details.destination}\nFlight Number: ${flight_details.flight_number}\nSeat: ${flight_details.seat_number}\nDeparture: ${flight_details.departure_time}\nArrival: ${flight_details.arrival_time}\nTotal Amount: $${flight_details.total_price}`;
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: to,
      subject: `Flight Booking Cancelled - ${booking_reference}`,
      text: emailText,
      html: emailHtml,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Cancellation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendBookingModificationEmail(data: BookingEmailData) {
  const {
    to,
    booking_reference,
    ticket_url,
    passenger_name,
    flight_details
  } = data;
  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Flight Booking Modified</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3182ce 0%, #38a169 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3182ce; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>✏️ Flight Booking Modified</h1>
            <p>Your booking has been updated</p>
        </div>
        <div class="content">
            <p>Dear ${passenger_name},</p>
            <p>Your flight booking with reference <strong>${booking_reference}</strong> has been <b>modified</b>. Here are your updated details:</p>
            <div class="booking-details">
                <h3>Booking Reference: <strong>${booking_reference}</strong></h3>
                <p><b>From:</b> ${flight_details.origin} <br/>
                <b>To:</b> ${flight_details.destination} <br/>
                <b>Flight Number:</b> ${flight_details.flight_number} <br/>
                <b>Seat:</b> ${flight_details.seat_number} <br/>
                <b>Departure:</b> ${flight_details.departure_time} <br/>
                <b>Arrival:</b> ${flight_details.arrival_time} <br/>
                <b>Total Amount:</b> $${flight_details.total_price}</p>
            </div>
            <p>If you have any questions, please contact our customer service team.</p>
            <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
            </div>
        </div>
    </body>
    </html>
  `;
  const emailText = `Your flight booking (${booking_reference}) has been modified.\nFrom: ${flight_details.origin}\nTo: ${flight_details.destination}\nFlight Number: ${flight_details.flight_number}\nSeat: ${flight_details.seat_number}\nDeparture: ${flight_details.departure_time}\nArrival: ${flight_details.arrival_time}\nTotal Amount: $${flight_details.total_price}`;
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: to,
      subject: `Flight Booking Modified - ${booking_reference}`,
      text: emailText,
      html: emailHtml,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Modification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending modification email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export interface FlightChangeEmailData {
  to: string;
  booking_reference: string;
  passenger_name: string;
  flight_details: {
    flight_number: string;
    origin: string;
    destination: string;
    old_departure_time: string;
    new_departure_time: string;
    old_arrival_time: string;
    new_arrival_time: string;
    old_price: number;
    new_price: number;
    old_status: string;
    new_status: string;
    seat_number: string;
  };
}

export async function sendFlightChangeNotification(data: FlightChangeEmailData) {
  const {
    to,
    booking_reference,
    passenger_name,
    flight_details
  } = data;

  // Calculate time differences for better user experience
  const oldDeparture = new Date(flight_details.old_departure_time);
  const newDeparture = new Date(flight_details.new_departure_time);
  const departureDiff = Math.round((newDeparture.getTime() - oldDeparture.getTime()) / (1000 * 60)); // in minutes
  
  const oldArrival = new Date(flight_details.old_arrival_time);
  const newArrival = new Date(flight_details.new_arrival_time);
  const arrivalDiff = Math.round((newArrival.getTime() - oldArrival.getTime()) / (1000 * 60)); // in minutes

  // Determine change type for subject line
  let changeType = 'Update';
  if (flight_details.old_status !== flight_details.new_status) {
    if (flight_details.new_status === 'CANCELLED') changeType = 'Cancellation';
    else if (flight_details.new_status === 'DELAYED') changeType = 'Delay';
  } else if (Math.abs(departureDiff) > 30) {
    changeType = departureDiff > 0 ? 'Delay' : 'Schedule Change';
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Flight ${changeType} Notification</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 650px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            .header p {
                margin: 10px 0 0 0;
                opacity: 0.9;
                font-size: 16px;
            }
            .content {
                padding: 40px 30px;
            }
            .booking-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
                border-left: 4px solid #f59e0b;
            }
            .booking-info h3 {
                margin: 0 0 15px 0;
                color: #1f2937;
                font-size: 18px;
            }
            .flight-route {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 20px;
                margin: 20px 0;
                font-size: 18px;
                font-weight: 600;
            }
            .airport {
                text-align: center;
            }
            .airport-code {
                font-size: 24px;
                font-weight: bold;
                color: #1f2937;
            }
            .airport-city {
                font-size: 14px;
                color: #6b7280;
                margin-top: 5px;
            }
            .arrow {
                font-size: 20px;
                color: #f59e0b;
            }
            .changes-section {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                margin: 30px 0;
                overflow: hidden;
            }
            .changes-header {
                background: #fef3c7;
                padding: 15px 20px;
                border-bottom: 1px solid #e5e7eb;
            }
            .changes-header h4 {
                margin: 0;
                color: #92400e;
                font-size: 16px;
                font-weight: 600;
            }
            .change-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid #f3f4f6;
            }
            .change-item:last-child {
                border-bottom: none;
            }
            .change-label {
                font-weight: 600;
                color: #374151;
                min-width: 120px;
            }
            .change-values {
                text-align: right;
                flex: 1;
            }
            .old-value {
                color: #dc2626;
                text-decoration: line-through;
                font-size: 14px;
                display: block;
            }
            .new-value {
                color: #059669;
                font-weight: bold;
                font-size: 16px;
                display: block;
            }
            .no-change {
                color: #6b7280;
                font-size: 14px;
            }
            .time-difference {
                font-size: 12px;
                color: #6b7280;
                margin-top: 2px;
            }
            .price-difference {
                font-size: 12px;
                color: #6b7280;
                margin-top: 2px;
            }
            .important-notice {
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 8px;
                padding: 20px;
                margin: 30px 0;
            }
            .important-notice h4 {
                color: #dc2626;
                margin: 0 0 10px 0;
                font-size: 16px;
            }
            .important-notice ul {
                margin: 10px 0;
                padding-left: 20px;
            }
            .important-notice li {
                margin: 5px 0;
                color: #374151;
            }
            .contact-info {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 8px;
                padding: 20px;
                margin: 30px 0;
            }
            .contact-info h4 {
                color: #0369a1;
                margin: 0 0 10px 0;
                font-size: 16px;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 30px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
            .footer p {
                margin: 5px 0;
            }
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
            }
            .status-scheduled { background: #d1fae5; color: #065f46; }
            .status-delayed { background: #fef3c7; color: #92400e; }
            .status-cancelled { background: #fee2e2; color: #991b1b; }
            .status-boarding { background: #dbeafe; color: #1e40af; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⚠️ Flight ${changeType} Notification</h1>
                <p>Important changes to your flight schedule</p>
            </div>
            
            <div class="content">
                <p>Dear ${passenger_name},</p>
                
                <p>We want to inform you about important changes to your flight schedule. Please review the updated details below carefully.</p>
                
                <div class="booking-info">
                    <h3>📋 Booking Information</h3>
                    <p><strong>Booking Reference:</strong> <span style="font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${booking_reference}</span></p>
                    <p><strong>Flight Number:</strong> ${flight_details.flight_number}</p>
                    
                    <div class="flight-route">
                        <div class="airport">
                            <div class="airport-code">${flight_details.origin.split(' ')[0]}</div>
                            <div class="airport-city">${flight_details.origin}</div>
                        </div>
                        <div class="arrow">→</div>
                        <div class="airport">
                            <div class="airport-code">${flight_details.destination.split(' ')[0]}</div>
                            <div class="airport-city">${flight_details.destination}</div>
                        </div>
                    </div>
                </div>
                
                <div class="changes-section">
                    <div class="changes-header">
                        <h4>🔄 Schedule Changes</h4>
                    </div>
                    
                    <div class="change-item">
                        <span class="change-label">Departure Time</span>
                        <div class="change-values">
                            ${flight_details.old_departure_time !== flight_details.new_departure_time ? 
                              `<span class="old-value">${flight_details.old_departure_time}</span>
                               <span class="new-value">${flight_details.new_departure_time}</span>
                               <span class="time-difference">${departureDiff > 0 ? '+' : ''}${departureDiff} minutes</span>` : 
                              `<span class="no-change">${flight_details.new_departure_time}</span>`
                            }
                        </div>
                    </div>
                    
                    <div class="change-item">
                        <span class="change-label">Arrival Time</span>
                        <div class="change-values">
                            ${flight_details.old_arrival_time !== flight_details.new_arrival_time ? 
                              `<span class="old-value">${flight_details.old_arrival_time}</span>
                               <span class="new-value">${flight_details.new_arrival_time}</span>
                               <span class="time-difference">${arrivalDiff > 0 ? '+' : ''}${arrivalDiff} minutes</span>` : 
                              `<span class="no-change">${flight_details.new_arrival_time}</span>`
                            }
                        </div>
                    </div>
                    
                    <div class="change-item">
                        <span class="change-label">Flight Status</span>
                        <div class="change-values">
                            ${flight_details.old_status !== flight_details.new_status ? 
                              `<span class="old-value">${flight_details.old_status}</span>
                               <span class="new-value">
                                 <span class="status-badge status-${flight_details.new_status.toLowerCase()}">${flight_details.new_status}</span>
                               </span>` : 
                              `<span class="no-change">
                                 <span class="status-badge status-${flight_details.new_status.toLowerCase()}">${flight_details.new_status}</span>
                               </span>`
                            }
                        </div>
                    </div>
                    
                    <div class="change-item">
                        <span class="change-label">Ticket Price</span>
                        <div class="change-values">
                            ${flight_details.old_price !== flight_details.new_price ? 
                              `<span class="old-value">$${flight_details.old_price.toFixed(2)}</span>
                               <span class="new-value">$${flight_details.new_price.toFixed(2)}</span>
                               <span class="price-difference">${flight_details.new_price > flight_details.old_price ? '+' : ''}$${(flight_details.new_price - flight_details.old_price).toFixed(2)}</span>` : 
                              `<span class="no-change">$${flight_details.new_price.toFixed(2)}</span>`
                            }
                        </div>
                    </div>
                    
                    <div class="change-item">
                        <span class="change-label">Seat Number</span>
                        <span class="no-change">${flight_details.seat_number}</span>
                    </div>
                </div>
                
                <div class="important-notice">
                    <h4>⚠️ Important Information</h4>
                    <ul>
                        <li>Please arrive at the airport at least <strong>2 hours before your new departure time</strong></li>
                        <li>Check your flight status online or through our mobile app before heading to the airport</li>
                        <li>If your flight is delayed by more than 3 hours, you may be eligible for compensation</li>
                        <li>Keep this email for your records and present it if needed at the airport</li>
                    </ul>
                </div>
                
                <div class="contact-info">
                    <h4>📞 Need Help?</h4>
                    <p>If you have any questions or need assistance with your booking, please contact our customer service team:</p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li><strong>Phone:</strong> +1-800-FLIGHTS (available 24/7)</li>
                        <li><strong>Email:</strong> support@flightbooking.com</li>
                        <li><strong>Live Chat:</strong> Available on our website</li>
                    </ul>
                </div>
                
                <div class="footer">
                    <p>Thank you for your understanding and patience.</p>
                    <p>Safe travels! ✈️</p>
                    <p style="font-size: 12px; margin-top: 20px;">This is an automated email. Please do not reply to this message.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  const emailText = `
Flight ${changeType} Notification

Dear ${passenger_name},

Important changes have been made to your flight schedule.

BOOKING INFORMATION:
Booking Reference: ${booking_reference}
Flight Number: ${flight_details.flight_number}
Route: ${flight_details.origin} → ${flight_details.destination}

SCHEDULE CHANGES:
${flight_details.old_departure_time !== flight_details.new_departure_time ? 
  `Departure Time: ${flight_details.old_departure_time} → ${flight_details.new_departure_time} (${departureDiff > 0 ? '+' : ''}${departureDiff} minutes)` : 
  `Departure Time: ${flight_details.new_departure_time} (no change)`
}

${flight_details.old_arrival_time !== flight_details.new_arrival_time ? 
  `Arrival Time: ${flight_details.old_arrival_time} → ${flight_details.new_arrival_time} (${arrivalDiff > 0 ? '+' : ''}${arrivalDiff} minutes)` : 
  `Arrival Time: ${flight_details.new_arrival_time} (no change)`
}

${flight_details.old_status !== flight_details.new_status ? 
  `Flight Status: ${flight_details.old_status} → ${flight_details.new_status}` : 
  `Flight Status: ${flight_details.new_status} (no change)`
}

${flight_details.old_price !== flight_details.new_price ? 
  `Ticket Price: $${flight_details.old_price.toFixed(2)} → $${flight_details.new_price.toFixed(2)} (${flight_details.new_price > flight_details.old_price ? '+' : ''}$${(flight_details.new_price - flight_details.old_price).toFixed(2)})` : 
  `Ticket Price: $${flight_details.new_price.toFixed(2)} (no change)`
}

Seat Number: ${flight_details.seat_number}

IMPORTANT INFORMATION:
- Please arrive at the airport at least 2 hours before your new departure time
- Check your flight status online before heading to the airport
- If your flight is delayed by more than 3 hours, you may be eligible for compensation
- Keep this email for your records

CUSTOMER SERVICE:
Phone: +1-800-FLIGHTS (24/7)
Email: support@flightbooking.com
Live Chat: Available on our website

Thank you for your understanding and patience.
Safe travels!
  `;

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: to,
      subject: `Flight ${changeType} - ${booking_reference} (${flight_details.flight_number})`,
      text: emailText,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Flight change notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending flight change notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Test email function for development
export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection failed:', error);
    return false;
  }
} 