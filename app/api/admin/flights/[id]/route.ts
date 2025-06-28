import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";
import { sendFlightChangeNotification } from "@/lib/email";

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Define types for better type safety
interface NotificationDetail {
  email: string;
  passenger: string;
  booking_ref: string;
  status: 'sent' | 'failed';
  error?: string;
}

interface FlightData {
  id: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  status: string;
  airline: { name: string }[] | null;
  origin: { city: string; code: string }[] | null;
  destination: { city: string; code: string }[] | null;
}

export async function PATCH(req: NextRequest) {
  try {
    // Check admin authorization
    const { admin, error: authError } = await requireAdmin(req);
    if (authError || !admin) {
      return NextResponse.json({ error: authError || "Not authorized as admin" }, { status: 401 });
    }

    // Extract flightId from the URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const flightId = pathParts[pathParts.length - 1];
    const updateData = await req.json();

    // Validate required fields
    const { departure_time, arrival_time, price, available_seats, status } = updateData;
    
    if (!departure_time || !arrival_time || price === undefined || available_seats === undefined || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get current flight data to compare changes (JOIN airports for city names)
    const { data: currentFlight, error: fetchError } = await supabaseAdmin
      .from('flights')
      .select(`
        id,
        flight_number,
        departure_time,
        arrival_time,
        price,
        available_seats,
        status,
        airline:airlines ( name ),
        origin:airports!flights_origin_airport_id_fkey ( city, code ),
        destination:airports!flights_destination_airport_id_fkey ( city, code )
      `)
      .eq('id', flightId)
      .single();

    if (fetchError || !currentFlight) {
      return NextResponse.json({ error: "Flight not found" }, { status: 404 });
    }

    // Type assertion for currentFlight
    const typedCurrentFlight = currentFlight as FlightData;

    // Helper function to safely extract city names
    const getCityName = (location: { city: string; code: string }[] | null): string => {
      if (!location || !Array.isArray(location) || location.length === 0) {
        return 'Unknown';
      }
      return location[0]?.city || 'Unknown';
    };

    // Calculate duration from departure and arrival times
    const departureDate = new Date(departure_time);
    const arrivalDate = new Date(arrival_time);
    const durationMs = arrivalDate.getTime() - departureDate.getTime();
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${durationHours}h ${durationMinutes}m`;

    // Update the flight
    const { error: updateError } = await supabaseAdmin
      .from('flights')
      .update({
        departure_time,
        arrival_time,
        duration,
        price,
        available_seats,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', flightId);

    if (updateError) {
      console.error('Error updating flight:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Check if there are significant changes that require notifications
    const hasSignificantChanges = 
      typedCurrentFlight.departure_time !== departure_time ||
      typedCurrentFlight.arrival_time !== arrival_time ||
      typedCurrentFlight.status !== status ||
      Math.abs(typedCurrentFlight.price - price) > 5; // Reduced threshold to $5 for better sensitivity

    let notificationsSent = 0;
    let notificationDetails: NotificationDetail[] = [];
    let bookings: any[] = []; // Declare bookings at function level

    if (hasSignificantChanges) {
      // Get all confirmed bookings for this flight
      const { data: bookingsData, error: bookingsError } = await supabaseAdmin
        .from('bookings')
        .select(`
          id,
          booking_reference,
          user:user_profiles!bookings_user_id_fkey ( email, full_name ),
          passenger:passengers ( full_name, seat_number )
        `)
        .eq('flight_id', flightId)
        .eq('booking_status', 'CONFIRMED');

      if (bookingsError) {
        console.error('Error fetching bookings for notifications:', bookingsError);
      } else {
        bookings = bookingsData || []; // Assign to the function-level variable
        
        if (bookings.length > 0) {
          // Send notifications to all passengers
          const notificationPromises = bookings.map(async (booking) => {
            try {
              const userEmail = booking.user?.email;
              const passengerName = booking.passenger?.full_name || booking.user?.full_name || 'Passenger';
              
              if (userEmail) {
                const result = await sendFlightChangeNotification({
                  to: userEmail,
                  booking_reference: booking.booking_reference,
                  passenger_name: passengerName,
                  flight_details: {
                    flight_number: typedCurrentFlight.flight_number,
                    origin: getCityName(typedCurrentFlight.origin),
                    destination: getCityName(typedCurrentFlight.destination),
                    old_departure_time: new Date(typedCurrentFlight.departure_time).toLocaleString(),
                    new_departure_time: new Date(departure_time).toLocaleString(),
                    old_arrival_time: new Date(typedCurrentFlight.arrival_time).toLocaleString(),
                    new_arrival_time: new Date(arrival_time).toLocaleString(),
                    old_price: typedCurrentFlight.price,
                    new_price: price,
                    old_status: typedCurrentFlight.status,
                    new_status: status,
                    seat_number: booking.passenger?.seat_number || 'TBD'
                  }
                });
                
                if (result.success) {
                  notificationDetails.push({
                    email: userEmail,
                    passenger: passengerName,
                    booking_ref: booking.booking_reference,
                    status: 'sent'
                  });
                  return true;
                } else {
                  notificationDetails.push({
                    email: userEmail,
                    passenger: passengerName,
                    booking_ref: booking.booking_reference,
                    status: 'failed',
                    error: result.error
                  });
                  return false;
                }
              }
            } catch (emailError) {
              console.error('Error sending flight change notification:', emailError);
              notificationDetails.push({
                email: booking.user?.email || 'unknown',
                passenger: booking.passenger?.full_name || booking.user?.full_name || 'Passenger',
                booking_ref: booking.booking_reference,
                status: 'failed',
                error: emailError instanceof Error ? emailError.message : 'Unknown error'
              });
            }
            return false;
          });

          const results = await Promise.all(notificationPromises);
          notificationsSent = results.filter(Boolean).length;
        }
      }
    }

    // Prepare change summary for admin feedback
    const changes = [];
    if (typedCurrentFlight.departure_time !== departure_time) {
      const oldTime = new Date(typedCurrentFlight.departure_time);
      const newTime = new Date(departure_time);
      const diffMinutes = Math.round((newTime.getTime() - oldTime.getTime()) / (1000 * 60));
      changes.push(`Departure time: ${diffMinutes > 0 ? '+' : ''}${diffMinutes} minutes`);
    }
    if (typedCurrentFlight.arrival_time !== arrival_time) {
      const oldTime = new Date(typedCurrentFlight.arrival_time);
      const newTime = new Date(arrival_time);
      const diffMinutes = Math.round((newTime.getTime() - oldTime.getTime()) / (1000 * 60));
      changes.push(`Arrival time: ${diffMinutes > 0 ? '+' : ''}${diffMinutes} minutes`);
    }
    if (typedCurrentFlight.status !== status) {
      changes.push(`Status: ${typedCurrentFlight.status} → ${status}`);
    }
    if (Math.abs(typedCurrentFlight.price - price) > 0.01) {
      const priceDiff = price - typedCurrentFlight.price;
      changes.push(`Price: ${priceDiff > 0 ? '+' : ''}$${priceDiff.toFixed(2)}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Flight updated successfully',
      notificationsSent,
      totalBookings: bookings?.length || 0,
      hasChanges: hasSignificantChanges,
      changes: changes,
      notificationDetails: notificationDetails,
      flightNumber: typedCurrentFlight.flight_number
    });

  } catch (error: any) {
    console.error('Admin flight update API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 