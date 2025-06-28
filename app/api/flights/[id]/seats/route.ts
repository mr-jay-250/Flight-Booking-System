import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// Generate a simple seat map for demonstration
function generateSeatMap(totalSeats: number = 180): string[] {
  const seatMap: string[] = [];
  const rows = Math.ceil(totalSeats / 6); // Assuming 6 seats per row (A-F)
  const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  for (let row = 1; row <= rows; row++) {
    for (const letter of seatLetters) {
      seatMap.push(`${row}${letter}`);
      if (seatMap.length >= totalSeats) break;
    }
    if (seatMap.length >= totalSeats) break;
  }
  
  return seatMap;
}

export async function GET(req: NextRequest) {
  try {
    // Extract flight ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').filter(Boolean)[2]; // flights/[id]/seats
    
    if (!id) {
      return NextResponse.json({ error: 'Missing flight id' }, { status: 400 });
    }

    const supabase = createClient();

    // Get flight information
    const { data: flight, error: flightError } = await supabase
      .from('flights')
      .select('id, available_seats, flight_number')
      .eq('id', id)
      .single();

    if (flightError || !flight) {
      return NextResponse.json({ 
        error: flightError?.message || 'Flight not found' 
      }, { status: 404 });
    }

    // Get all confirmed bookings for this flight to determine occupied seats
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_status,
        passengers (
          seat_number
        )
      `)
      .eq('flight_id', id)
      .eq('booking_status', 'CONFIRMED');

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return NextResponse.json({ 
        error: 'Failed to fetch seat information' 
      }, { status: 500 });
    }

    // Extract occupied seat numbers
    const occupiedSeats: string[] = [];
    if (bookings) {
      bookings.forEach(booking => {
        if (booking.passengers) {
          // Handle both single passenger and array of passengers
          const passengers = Array.isArray(booking.passengers) 
            ? booking.passengers 
            : [booking.passengers];
          
          passengers.forEach((passenger: any) => {
            if (passenger?.seat_number) {
              occupiedSeats.push(passenger.seat_number);
            }
          });
        }
      });
    }

    // Generate seat map (assuming standard aircraft configuration)
    const totalSeats = flight.available_seats + occupiedSeats.length;
    const seatMap = generateSeatMap(totalSeats);

    // Response format based on API documentation
    const response = {
      flight_id: flight.id,
      flight_number: flight.flight_number,
      available_seats: flight.available_seats,
      total_seats: totalSeats,
      occupied_seats: occupiedSeats,
      seat_map: seatMap
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Seats API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
