import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to join flights with airlines and airports
type FlightWithDetails = {
  id: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  available_seats: number;
  cabin_class: string;
  airline_name: string;
  airline_logo_url?: string;
  airline_country: string;
  origin_city: string;
  origin_code: string;
  origin_country: string;
  destination_city: string;
  destination_code: string;
  destination_country: string;
  aircraft_type: string;
  status: string;
};

export async function GET() {
  // Get current date and time in ISO format
  const now = new Date().toISOString();
  
  // Query flights with airline and airport info, filtering for upcoming flights only
  const { data, error } = await supabase
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
    .gte('departure_time', now) // Only show flights departing from now onwards
    .order('departure_time', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map/flatten the data for frontend
  const flights: FlightWithDetails[] = (data || []).map((f: any) => ({
    id: f.id,
    flight_number: f.flight_number,
    departure_time: f.departure_time,
    arrival_time: f.arrival_time,
    duration: f.duration,
    price: f.price,
    available_seats: f.available_seats,
    cabin_class: f.cabin_class,
    aircraft_type: f.aircraft_type,
    status: f.status,
    airline_name: f.airline?.name || '',
    airline_logo_url: f.airline?.logo_url || '',
    airline_country: f.airline?.country || '',
    origin_city: f.origin?.city || '',
    origin_code: f.origin?.code || '',
    origin_country: f.origin?.country || '',
    destination_city: f.destination?.city || '',
    destination_code: f.destination?.code || '',
    destination_country: f.destination?.country || '',
    origin_name: f.origin?.name || '',
    destination_name: f.destination?.name || '',
  }));

  return NextResponse.json(flights);
}
