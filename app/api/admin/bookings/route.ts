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

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabaseAdmin
      .from('bookings')
      .select(`
        id,
        booking_reference,
        booking_status,
        booking_date,
        total_price,
        ticket_url,
        payment_status,
        created_at,
        updated_at,
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
          airline:airlines ( name, logo_url ),
          origin:airports!flights_origin_airport_id_fkey ( city, code ),
          destination:airports!flights_destination_airport_id_fkey ( city, code )
        ),
        passenger:passengers (
          id,
          full_name,
          seat_number,
          passport_number
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('booking_status', status);
    }

    if (search) {
      query = query.or(`booking_reference.ilike.%${search}%,user.email.ilike.%${search}%,user.full_name.ilike.%${search}%`);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Get total count for pagination
    const { count } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    // Get paginated results
    const { data: bookings, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get summary statistics
    const { data: stats } = await supabaseAdmin
      .from('bookings')
      .select('booking_status, total_price');

    const totalBookings = stats?.length || 0;
    const totalRevenue = stats?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0;
    const confirmedBookings = stats?.filter(b => b.booking_status === 'CONFIRMED').length || 0;
    const cancelledBookings = stats?.filter(b => b.booking_status === 'CANCELLED').length || 0;

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats: {
        totalBookings,
        totalRevenue,
        confirmedBookings,
        cancelledBookings,
        averageRevenue: totalBookings > 0 ? totalRevenue / totalBookings : 0
      }
    });

  } catch (error) {
    console.error('Admin bookings API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 