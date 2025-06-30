import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: NextRequest) {
  try {
    // Extract booking ID from URL
    const url = new URL(req.url);
    const bookingId = url.pathname.split('/').filter(Boolean).pop();
    
    if (!bookingId) {
      return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
    }

    // Fetch complete booking details
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        booking_reference,
        booking_status,
        booking_date,
        total_price,
        payment_status,
        created_at,
        user:user_profiles!bookings_user_id_fkey (
          id,
          email,
          full_name,
          phone_number
        ),
        flight:flights (
          id,
          flight_number,
          departure_time,
          arrival_time,
          duration,
          price,
          cabin_class,
          aircraft_type,
          status,
          airline:airlines ( name, logo_url, code, country ),
          origin:airports!flights_origin_airport_id_fkey ( city, code, name, country ),
          destination:airports!flights_destination_airport_id_fkey ( city, code, name, country )
        ),
        passengers (
          id,
          full_name,
          date_of_birth,
          gender,
          nationality,
          passport_number,
          seat_number
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if booking is cancelled
    if (booking.booking_status === 'CANCELLED') {
      return NextResponse.json({ error: 'This booking has been cancelled' }, { status: 400 });
    }

    // Generate HTML ticket
    const ticketHtml = generateTicketHtml(booking);

    return new Response(ticketHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Ticket API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateTicketHtml(booking: any): string {
  const flight = Array.isArray(booking.flight) ? booking.flight[0] : booking.flight;
  const passenger = Array.isArray(booking.passengers) ? booking.passengers[0] : booking.passengers;
  const user = Array.isArray(booking.user) ? booking.user[0] : booking.user;
  const airline = flight?.airline;
  const origin = flight?.origin?.[0] || flight?.origin;
  const destination = flight?.destination?.[0] || flight?.destination;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>E-Ticket - ${booking.booking_reference}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: #f5f5f5;
            }
            .ticket {
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                overflow: hidden;
                margin: 20px 0;
            }
            .ticket-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .booking-ref {
                font-size: 24px;
                font-weight: bold;
                margin: 10px 0;
                letter-spacing: 2px;
            }
            .status {
                display: inline-block;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
                background: rgba(34, 197, 94, 0.2);
                color: #15803d;
            }
            .ticket-body {
                padding: 40px 30px;
            }
            .flight-route {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 30px 0;
                padding: 20px;
                background: #f8fafc;
                border-radius: 8px;
                border-left: 4px solid #667eea;
            }
            .city {
                text-align: center;
                flex: 1;
            }
            .city-code {
                font-size: 32px;
                font-weight: bold;
                color: #667eea;
                margin-bottom: 5px;
            }
            .city-name {
                font-size: 14px;
                color: #6b7280;
                font-weight: 500;
            }
            .route-arrow {
                flex: 0 0 auto;
                margin: 0 30px;
                color: #667eea;
                font-size: 24px;
            }
            .details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            .detail-item {
                background: #f8fafc;
                padding: 15px;
                border-radius: 8px;
                border-left: 3px solid #667eea;
            }
            .detail-label {
                font-size: 12px;
                color: #6b7280;
                text-transform: uppercase;
                font-weight: 600;
                margin-bottom: 5px;
            }
            .detail-value {
                font-size: 16px;
                font-weight: 600;
                color: #1f2937;
            }
            .passenger-info {
                background: #fef3c7;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #f59e0b;
            }
            .print-btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                margin: 20px auto;
                display: block;
            }
            @media print {
                body { background: white; }
                .print-btn { display: none; }
                .ticket { box-shadow: none; }
            }
        </style>
    </head>
    <body>
        <div class="ticket">
            <div class="ticket-header">
                <h1>✈️ Electronic Ticket</h1>
                <div class="booking-ref">${booking.booking_reference}</div>
                <span class="status">${booking.booking_status}</span>
            </div>
            
            <div class="ticket-body">
                <div class="flight-route">
                    <div class="city">
                        <div class="city-code">${origin?.code || 'N/A'}</div>
                        <div class="city-name">${origin?.city || 'Unknown'}</div>
                    </div>
                    <div class="route-arrow">✈</div>
                    <div class="city">
                        <div class="city-code">${destination?.code || 'N/A'}</div>
                        <div class="city-name">${destination?.city || 'Unknown'}</div>
                    </div>
                </div>

                <div class="details-grid">
                    <div class="detail-item">
                        <div class="detail-label">Flight Number</div>
                        <div class="detail-value">${flight?.flight_number || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Airline</div>
                        <div class="detail-value">${airline?.name || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Departure</div>
                        <div class="detail-value">${flight?.departure_time ? formatDate(flight.departure_time) : 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Arrival</div>
                        <div class="detail-value">${flight?.arrival_time ? formatDate(flight.arrival_time) : 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Duration</div>
                        <div class="detail-value">${flight?.duration || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Seat</div>
                        <div class="detail-value">${passenger?.seat_number || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Class</div>
                        <div class="detail-value">${flight?.cabin_class || 'Economy'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Total Price</div>
                        <div class="detail-value">$${booking.total_price?.toFixed(2) || '0.00'}</div>
                    </div>
                </div>

                <div class="passenger-info">
                    <h3 style="margin-top: 0; color: #92400e;">Passenger Information</h3>
                    <p><strong>Name:</strong> ${passenger?.full_name || user?.full_name || 'N/A'}</p>
                    <p><strong>Email:</strong> ${user?.email || 'N/A'}</p>
                    ${passenger?.passport_number ? `<p><strong>Passport:</strong> ${passenger.passport_number}</p>` : ''}
                    ${passenger?.nationality ? `<p><strong>Nationality:</strong> ${passenger.nationality}</p>` : ''}
                </div>

                <button class="print-btn" onclick="window.print()">Print Ticket</button>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
                    <p>Booking Reference: ${booking.booking_reference}</p>
                    <p>Issued on: ${booking.created_at ? formatDate(booking.created_at) : 'N/A'}</p>
                    <p>This is an electronic ticket. No physical ticket required.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
} 