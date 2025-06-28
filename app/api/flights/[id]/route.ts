import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  // Await the params from the request URL
  const url = new URL(req.url);
  const id = url.pathname.split('/').filter(Boolean).pop();
  const supabase = createClient();
  if (!id) {
    return NextResponse.json({ error: 'Missing flight id' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('flights')
    .select(`
      id,
      flight_number,
      airline_id,
      origin_airport_id,
      destination_airport_id,
      departure_time,
      arrival_time,
      duration,
      price,
      available_seats,
      airlines ( name, logo_url ),
      origin:airports!flights_origin_airport_id_fkey ( city, code ),
      destination:airports!flights_destination_airport_id_fkey ( city, code )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Flight not found' }, { status: 404 });
  }

  // Fix: handle possible array returns from joins
  const airline = Array.isArray(data.airlines) ? data.airlines[0] : data.airlines;
  const origin = Array.isArray(data.origin) ? data.origin[0] : data.origin;
  const destination = Array.isArray(data.destination) ? data.destination[0] : data.destination;

  const flight = {
    id: data.id,
    flight_number: data.flight_number,
    airline_name: airline?.name || '',
    airline_logo_url: airline?.logo_url || '',
    origin_city: origin?.city || '',
    origin_code: origin?.code || '',
    destination_city: destination?.city || '',
    destination_code: destination?.code || '',
    departure_time: data.departure_time,
    arrival_time: data.arrival_time,
    duration: data.duration,
    price: data.price,
    available_seats: data.available_seats,
  };

  return NextResponse.json(flight);
}
