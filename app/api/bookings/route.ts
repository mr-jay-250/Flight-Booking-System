import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { sendBookingConfirmationEmail, sendBookingCancellationEmail, sendBookingModificationEmail } from "@/lib/email";

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function generateSeatNumber() {
  // Example: random seat like '12A', '7C', etc.
  const row = Math.floor(Math.random() * 30) + 1;
  const seat = String.fromCharCode(65 + Math.floor(Math.random() * 6)); // A-F
  return `${row}${seat}`;
}

export async function POST(req: Request) {
  const body = await req.json();
  const { flight_id, full_name, date_of_birth, gender, nationality, passport_number } = body;

  // Try to get access token from Authorization header or cookie
  let accessToken: string | undefined;
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    accessToken = authHeader.slice(7);
  } else {
    // Try to get from Supabase cookie (for local dev)
    const cookie = req.headers.get('cookie');
    if (cookie) {
      const match = cookie.match(/sb-cqinqdanqleqdqypzzfy-auth-token=([^;]+)/);
      if (match) {
        try {
          const value = JSON.parse(decodeURIComponent(match[1]));
          accessToken = value.access_token;
        } catch {}
      }
    }
  }

  if (!accessToken) {
    console.log('No access token provided');
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Verify the JWT and get the user
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
  console.log('Supabase user lookup:', { user, userError });
  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Transaction: create booking, passenger, decrement seat
  const booking_reference = uuidv4().slice(0, 8).toUpperCase();
  const { data: flight, error: flightError } = await supabaseAdmin.from("flights").select("*").eq("id", flight_id).single();
  if (flightError || !flight) return NextResponse.json({ error: "Flight not found" }, { status: 404 });
  if (flight.available_seats < 1) return NextResponse.json({ error: "No seats available" }, { status: 400 });

  // Fetch origin airport
  const { data: originAirport } = await supabaseAdmin
    .from('airports')
    .select('city, code')
    .eq('id', flight.origin_airport_id)
    .single();

  // Fetch destination airport
  const { data: destinationAirport } = await supabaseAdmin
    .from('airports')
    .select('city, code')
    .eq('id', flight.destination_airport_id)
    .single();

  const seat_number = generateSeatNumber();

  const { error: txError } = await supabaseAdmin.rpc("book_flight", {
    p_user_id: user.id,
    p_flight_id: flight_id,
    p_full_name: full_name,
    p_date_of_birth: date_of_birth,
    p_gender: gender,
    p_nationality: nationality,
    p_passport_number: passport_number,
    p_seat_number: seat_number,
    p_booking_reference: booking_reference,
    p_ticket_url: null,
    p_total_price: flight.price
  });
  if (txError) return NextResponse.json({ error: txError.message }, { status: 500 });

  // Fetch the new booking by booking_reference to get its id
  const { data: newBooking, error: fetchError } = await supabaseAdmin
    .from('bookings')
    .select('id')
    .eq('booking_reference', booking_reference)
    .single();
  if (fetchError || !newBooking) {
    return NextResponse.json({ error: "Failed to fetch new booking ID" }, { status: 500 });
  }
  const ticket_url = `/tickets/${newBooking.id}`;
  // Optionally update the ticket_url in the booking record
  await supabaseAdmin.from('bookings').update({ ticket_url }).eq('id', newBooking.id);

  // Send email confirmation using Nodemailer
  try {
    const emailResult = await sendBookingConfirmationEmail({
      to: user.email ?? "",
      booking_reference,
      ticket_url,
      passenger_name: full_name,
      flight_details: {
        origin: originAirport ? `${originAirport.city} (${originAirport.code})` : '-',
        destination: destinationAirport ? `${destinationAirport.city} (${destinationAirport.code})` : '-',
        departure_time: new Date(flight.departure_time).toLocaleString(),
        arrival_time: new Date(flight.arrival_time).toLocaleString(),
        flight_number: flight.flight_number,
        seat_number,
        total_price: flight.price
      }
    });

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error);
      // Don't fail the booking if email fails, just log it
    }
  } catch (emailError) {
    console.error('Error sending confirmation email:', emailError);
    // Don't fail the booking if email fails, just log it
  }

  return NextResponse.json({ ticket_url, booking_id: newBooking.id, booking_reference, seat_number });
}

export async function PATCH(req: Request) {
  // Try to get access token from Authorization header or cookie
  let accessToken: string | undefined;
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    accessToken = authHeader.slice(7);
  } else {
    // Try to get from Supabase cookie (for local dev)
    const cookie = req.headers.get('cookie');
    if (cookie) {
      const match = cookie.match(/sb-gjonbwyexsraayedfpog-auth-token=([^;]+)/);
      if (match) {
        try {
          const value = JSON.parse(decodeURIComponent(match[1]));
          accessToken = value.access_token;
        } catch {}
      }
    }
  }

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Verify the JWT and get the user
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { booking_id, action, updateData } = body;
  if (!booking_id || !action) {
    return NextResponse.json({ error: "Missing booking_id or action" }, { status: 400 });
  }

  // Check booking ownership
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .select('id, user_id, booking_status')
    .eq('id', booking_id)
    .single();
  if (bookingError || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === 'cancel') {
    // Fetch booking, passenger, and flight details for email BEFORE cancellation
    const { data: bookingDetails } = await supabaseAdmin
      .from('bookings')
      .select('booking_reference, ticket_url, total_price, user_id, flight_id')
      .eq('id', booking_id)
      .single();
    const { data: passenger } = await supabaseAdmin
      .from('passengers')
      .select('full_name, seat_number')
      .eq('booking_id', booking_id)
      .single();
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('email')
      .eq('id', bookingDetails?.user_id)
      .single();
    const { data: flight, error: flightError } = await supabaseAdmin
      .from('flights')
      .select(`
        flight_number,
        departure_time,
        arrival_time,
        price,
        origin_airport_id,
        destination_airport_id
      `)
      .eq('id', bookingDetails?.flight_id)
      .single();
    if (!bookingDetails || !flight) {
      return NextResponse.json({ error: "Failed to fetch booking or flight details for email." }, { status: 500 });
    }
    // Now update booking status to CANCELLED
    const { error: cancelError } = await supabaseAdmin
      .from('bookings')
      .update({ booking_status: 'CANCELLED' })
      .eq('id', booking_id);
    if (cancelError) {
      return NextResponse.json({ error: cancelError.message }, { status: 500 });
    }
    // Fetch airport details directly
    let originStr = '-';
    let destinationStr = '-';
    if (flight.origin_airport_id) {
      const { data: originAirport } = await supabaseAdmin
        .from('airports')
        .select('city, code')
        .eq('id', flight.origin_airport_id)
        .single();
      if (originAirport) originStr = `${originAirport.city} (${originAirport.code})`;
    }
    if (flight.destination_airport_id) {
      const { data: destinationAirport } = await supabaseAdmin
        .from('airports')
        .select('city, code')
        .eq('id', flight.destination_airport_id)
        .single();
      if (destinationAirport) destinationStr = `${destinationAirport.city} (${destinationAirport.code})`;
    }
    // Send cancellation email
    try {
      await sendBookingCancellationEmail({
        to: userProfile?.email ?? "",
        booking_reference: bookingDetails.booking_reference,
        ticket_url: bookingDetails.ticket_url,
        passenger_name: passenger?.full_name ?? "Passenger",
        flight_details: {
          origin: originStr,
          destination: destinationStr,
          departure_time: new Date(flight.departure_time).toLocaleString(),
          arrival_time: new Date(flight.arrival_time).toLocaleString(),
          flight_number: flight.flight_number,
          seat_number: passenger?.seat_number ?? "-",
          total_price: flight.price
        },
      });
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
    }
    return NextResponse.json({ success: true, message: 'Booking cancelled.' });
  } else if (action === 'modify') {
    // Allow updating passenger info (updateData)
    if (!updateData) {
      return NextResponse.json({ error: "No update data provided" }, { status: 400 });
    }
    // For demo: only allow updating full_name, nationality, passport_number
    const allowedFields = ['full_name', 'nationality', 'passport_number'];
    const updateFields: any = {};
    for (const key of allowedFields) {
      if (updateData[key]) updateFields[key] = updateData[key];
    }
    // If a new flight_id is provided and is different, update the booking's flight_id
    let flightIdChanged = false;
    if (updateData.flight_id) {
      // Validate new flight_id exists
      const { data: newFlight, error: newFlightError } = await supabaseAdmin
        .from('flights')
        .select('id')
        .eq('id', updateData.flight_id)
        .single();
      if (newFlightError || !newFlight) {
        console.error('Invalid new flight_id:', updateData.flight_id);
        return NextResponse.json({ error: 'Invalid new flight_id provided.' }, { status: 400 });
      }
      // Fetch current booking to compare
      const { data: currentBooking } = await supabaseAdmin
        .from('bookings')
        .select('flight_id')
        .eq('id', booking_id)
        .single();
      if (currentBooking && currentBooking.flight_id !== updateData.flight_id) {
        // Update the booking's flight_id
        const { error: flightUpdateError } = await supabaseAdmin
          .from('bookings')
          .update({ flight_id: updateData.flight_id })
          .eq('id', booking_id);
        if (flightUpdateError) {
          console.error('Error updating flight_id:', flightUpdateError.message);
          return NextResponse.json({ error: flightUpdateError.message }, { status: 500 });
        }
        flightIdChanged = true;
      }
    }
    if (Object.keys(updateFields).length > 0) {
      // Update passengers table for this booking
      const { error: modifyError } = await supabaseAdmin
        .from('passengers')
        .update(updateFields)
        .eq('booking_id', booking_id);
      if (modifyError) {
        console.error('Error updating passenger info:', modifyError.message);
        return NextResponse.json({ error: modifyError.message }, { status: 500 });
      }
    }
    // Fetch booking, passenger, and flight details for email (after possible flight_id update)
    const { data: bookingDetails, error: bookingDetailsError } = await supabaseAdmin
      .from('bookings')
      .select('booking_reference, ticket_url, total_price, user_id, flight_id')
      .eq('id', booking_id)
      .single();
    if (bookingDetailsError || !bookingDetails) {
      console.error('Failed to fetch booking details for email:', bookingDetailsError?.message);
      return NextResponse.json({ error: 'Failed to fetch booking details for email.' }, { status: 500 });
    }
    const { data: passenger, error: passengerError } = await supabaseAdmin
      .from('passengers')
      .select('full_name, seat_number')
      .eq('booking_id', booking_id)
      .single();
    if (passengerError || !passenger) {
      console.error('Failed to fetch passenger details for email:', passengerError?.message);
      return NextResponse.json({ error: 'Failed to fetch passenger details for email.' }, { status: 500 });
    }
    const { data: userProfile, error: userProfileError } = await supabaseAdmin
      .from('user_profiles')
      .select('email')
      .eq('id', bookingDetails?.user_id)
      .single();
    if (userProfileError || !userProfile) {
      console.error('Failed to fetch user profile for email:', userProfileError?.message);
      return NextResponse.json({ error: 'Failed to fetch user profile for email.' }, { status: 500 });
    }
    // Fetch flight and airport details for email (like POST)
    const { data: flight, error: flightError } = await supabaseAdmin
      .from('flights')
      .select('flight_number, departure_time, arrival_time, price, origin_airport_id, destination_airport_id')
      .eq('id', bookingDetails?.flight_id)
      .single();
    if (flightError || !flight) {
      console.error('Failed to fetch flight details for email:', flightError?.message);
      return NextResponse.json({ error: 'Failed to fetch flight details for email.' }, { status: 500 });
    }
    // Always fetch airport details directly
    let originStr = '-';
    let destinationStr = '-';
    if (flight.origin_airport_id) {
      const { data: originAirport } = await supabaseAdmin
        .from('airports')
        .select('city, code')
        .eq('id', flight.origin_airport_id)
        .single();
      if (originAirport) originStr = `${originAirport.city} (${originAirport.code})`;
    }
    if (flight.destination_airport_id) {
      const { data: destinationAirport } = await supabaseAdmin
        .from('airports')
        .select('city, code')
        .eq('id', flight.destination_airport_id)
        .single();
      if (destinationAirport) destinationStr = `${destinationAirport.city} (${destinationAirport.code})`;
    }

    // Send modification email
    try {
      await sendBookingModificationEmail({
        to: userProfile?.email ?? "",
        booking_reference: bookingDetails.booking_reference,
        ticket_url: bookingDetails.ticket_url,
        passenger_name: passenger?.full_name ?? "Passenger",
        flight_details: {
          origin: originStr,
          destination: destinationStr,
          departure_time: new Date(flight.departure_time).toLocaleString(),
          arrival_time: new Date(flight.arrival_time).toLocaleString(),
          flight_number: flight.flight_number,
          seat_number: passenger?.seat_number ?? "-",
          total_price: flight.price
        },
      });
    } catch (emailError) {
      console.error('Error sending modification email:', emailError);
    }
    return NextResponse.json({ success: true, message: 'Booking modified.' });
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}

export async function GET(req: Request) {
  // Try to get access token from Authorization header or cookie
  let accessToken: string | undefined;
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    accessToken = authHeader.slice(7);
  } else {
    // Try to get from Supabase cookie (for local dev)
    const cookie = req.headers.get('cookie');
    if (cookie) {
      const match = cookie.match(/sb-cqinqdanqleqdqypzzfy-auth-token=([^;]+)/);
      if (match) {
        try {
          const value = JSON.parse(decodeURIComponent(match[1]));
          accessToken = value.access_token;
        } catch {}
      }
    }
  }

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Verify the JWT and get the user
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // First, fetch bookings for the user
  const { data: bookings, error: bookingsError } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (bookingsError) {
    console.error('Database error fetching bookings:', bookingsError);
    return NextResponse.json({ error: bookingsError.message }, { status: 500 });
  }

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ bookings: [] });
  }

  // Get all flight IDs from bookings
  const flightIds = bookings.map(booking => booking.flight_id);

  // Fetch flights with their related data
  const { data: flights, error: flightsError } = await supabaseAdmin
    .from('flights')
    .select(`
      id,
      flight_number,
      departure_time,
      arrival_time,
      duration,
      price,
      airline_id,
      origin_airport_id,
      destination_airport_id
    `)
    .in('id', flightIds);

  if (flightsError) {
    console.error('Database error fetching flights:', flightsError);
    return NextResponse.json({ error: flightsError.message }, { status: 500 });
  }

  // Get all unique airline and airport IDs
  const airlineIds = [...new Set(flights?.map(f => f.airline_id) || [])];
  const airportIds = [...new Set([
    ...(flights?.map(f => f.origin_airport_id) || []),
    ...(flights?.map(f => f.destination_airport_id) || [])
  ])];

  // Fetch airlines
  const { data: airlines, error: airlinesError } = await supabaseAdmin
    .from('airlines')
    .select('id, name, logo_url')
    .in('id', airlineIds);

  if (airlinesError) {
    console.error('Database error fetching airlines:', airlinesError);
    return NextResponse.json({ error: airlinesError.message }, { status: 500 });
  }

  // Fetch airports
  const { data: airports, error: airportsError } = await supabaseAdmin
    .from('airports')
    .select('id, city, code')
    .in('id', airportIds);

  if (airportsError) {
    console.error('Database error fetching airports:', airportsError);
    return NextResponse.json({ error: airportsError.message }, { status: 500 });
  }

  // Fetch passengers for all bookings
  const bookingIds = bookings.map(booking => booking.id);
  const { data: passengers, error: passengersError } = await supabaseAdmin
    .from('passengers')
    .select('*')
    .in('booking_id', bookingIds);

  if (passengersError) {
    console.error('Database error fetching passengers:', passengersError);
    return NextResponse.json({ error: passengersError.message }, { status: 500 });
  }

  // Create lookup maps
  const flightsMap = new Map(flights?.map(f => [f.id, f]) || []);
  const airlinesMap = new Map(airlines?.map(a => [a.id, a]) || []);
  const airportsMap = new Map(airports?.map(a => [a.id, a]) || []);
  const passengersMap = new Map();
  passengers?.forEach(p => {
    if (!passengersMap.has(p.booking_id)) {
      passengersMap.set(p.booking_id, []);
    }
    passengersMap.get(p.booking_id).push(p);
  });

  // Transform the data to match the expected format in the frontend
  const transformedBookings = bookings.map(booking => {
    const flight = flightsMap.get(booking.flight_id);
    const airline = flight ? airlinesMap.get(flight.airline_id) : null;
    const origin = flight ? airportsMap.get(flight.origin_airport_id) : null;
    const destination = flight ? airportsMap.get(flight.destination_airport_id) : null;
    const bookingPassengers = passengersMap.get(booking.id) || [];

    return {
      ...booking,
      flight: flight ? {
        ...flight,
        airline,
        origin,
        destination
      } : null,
      passengers: bookingPassengers
    };
  });

  return NextResponse.json({ bookings: transformedBookings });
}
