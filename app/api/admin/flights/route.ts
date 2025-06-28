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