import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: Request) {
  try {
    // Check admin authorization
    const { admin, error: authError } = await requireAdmin(req);
    if (authError || !admin) {
      return NextResponse.json({ error: authError || "Not authorized as admin" }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const airline = searchParams.get('airline');

    // Get current time in ISO format
    const now = new Date().toISOString();

    // Build the query
    let query = supabaseAdmin
      .from('flights')
      .select(`
        id,
        flight_number,
        departure_time,
        arrival_time,
        duration,
        price,
        available_seats,
        cabin_class,
        aircraft_type,
        status,
        airline:airlines ( name, logo_url, country ),
        origin:airports!flights_origin_airport_id_fkey ( city, code, name, country ),
        destination:airports!flights_destination_airport_id_fkey ( city, code, name, country )
      `)
      .gte('departure_time', now) // Only show upcoming flights
      .order('departure_time', { ascending: true });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (airline && airline !== 'all') {
      query = query.eq('airlines.name', airline);
    }

    if (search) {
      query = query.or(`flight_number.ilike.%${search}%,airlines.name.ilike.%${search}%,airports!flights_origin_airport_id_fkey.city.ilike.%${search}%,airports!flights_destination_airport_id_fkey.city.ilike.%${search}%`);
    }

    const { data: flights, error } = await query;

    if (error) {
      console.error('Error fetching flights:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get booking counts for each flight
    const flightsWithBookings = await Promise.all(
      (flights || []).map(async (flight: any) => {
        const { count: bookingCount } = await supabaseAdmin
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('flight_id', flight.id)
          .eq('booking_status', 'CONFIRMED');

        return {
          ...flight,
          total_bookings: bookingCount || 0
        };
      })
    );

    return NextResponse.json({ 
      flights: flightsWithBookings,
      total: flightsWithBookings.length
    });

  } catch (error: any) {
    console.error('Admin flights API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Check admin authorization
    const { admin, error: authError } = await requireAdmin(req);
    if (authError || !admin) {
      return NextResponse.json({ error: authError || "Not authorized as admin" }, { status: 401 });
    }

    const body = await req.json();
    const {
      flight_number,
      airline_id,
      origin_airport_id,
      destination_airport_id,
      departure_time,
      arrival_time,
      duration,
      price,
      available_seats,
      cabin_class,
      aircraft_type,
      status = 'SCHEDULED'
    } = body;

    // Validate required fields
    if (!flight_number || !airline_id || !origin_airport_id || !destination_airport_id || 
        !departure_time || !arrival_time || !duration || price === undefined || 
        available_seats === undefined || !cabin_class) {
      return NextResponse.json({ 
        error: "Missing required fields. Please provide: flight_number, airline_id, origin_airport_id, destination_airport_id, departure_time, arrival_time, duration, price, available_seats, cabin_class" 
      }, { status: 400 });
    }

    // Validate that origin and destination are different
    if (origin_airport_id === destination_airport_id) {
      return NextResponse.json({ 
        error: "Origin and destination airports must be different" 
      }, { status: 400 });
    }

    // Validate departure time is before arrival time
    if (new Date(departure_time) >= new Date(arrival_time)) {
      return NextResponse.json({ 
        error: "Departure time must be before arrival time" 
      }, { status: 400 });
    }

    // Validate future flight
    if (new Date(departure_time) <= new Date()) {
      return NextResponse.json({ 
        error: "Departure time must be in the future" 
      }, { status: 400 });
    }

    // Validate price and seats
    if (price < 0 || available_seats < 0) {
      return NextResponse.json({ 
        error: "Price and available seats must be non-negative" 
      }, { status: 400 });
    }

    // Validate that airline exists
    const { data: airline, error: airlineError } = await supabaseAdmin
      .from('airlines')
      .select('id')
      .eq('id', airline_id)
      .single();

    if (airlineError || !airline) {
      return NextResponse.json({ 
        error: "Invalid airline ID" 
      }, { status: 400 });
    }

    // Validate that airports exist
    const { data: airports, error: airportsError } = await supabaseAdmin
      .from('airports')
      .select('id')
      .in('id', [origin_airport_id, destination_airport_id]);

    if (airportsError || !airports || airports.length !== 2) {
      return NextResponse.json({ 
        error: "Invalid airport ID(s)" 
      }, { status: 400 });
    }

    // Create the flight
    const { data: newFlight, error: createError } = await supabaseAdmin
      .from('flights')
      .insert({
        flight_number,
        airline_id,
        origin_airport_id,
        destination_airport_id,
        departure_time,
        arrival_time,
        duration,
        price: parseFloat(price),
        available_seats: parseInt(available_seats),
        cabin_class,
        aircraft_type,
        status
      })
      .select(`
        id,
        flight_number,
        departure_time,
        arrival_time,
        duration,
        price,
        available_seats,
        cabin_class,
        aircraft_type,
        status,
        airline:airlines ( name, logo_url, country ),
        origin:airports!flights_origin_airport_id_fkey ( city, code, name, country ),
        destination:airports!flights_destination_airport_id_fkey ( city, code, name, country )
      `)
      .single();

    if (createError) {
      console.error('Error creating flight:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      flight: newFlight,
      message: `Flight ${flight_number} created successfully`
    });

  } catch (error: any) {
    console.error('Admin create flight API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}