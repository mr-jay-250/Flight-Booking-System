import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { origin, destination, departureDate, returnDate, tripType, outboundCabin, returnCabin } = body;

    // Debug: log incoming params
    console.log("Flight search params:", body);

    // Get current date and time in ISO format
    const now = new Date().toISOString();

    // Helper function to build flight query
    const buildFlightQuery = (originAirportId: string, destinationAirportId: string, date: string, cabinClass?: string) => {
      let query = supabase
        .from("flights")
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
          cabin_class,
          aircraft_type,
          status,
          airlines:airline_id ( name, logo_url, code, country ),
          origin:origin_airport_id ( city, code, name, country ),
          destination:destination_airport_id ( city, code, name, country )
        `)
        .eq("origin_airport_id", originAirportId)
        .eq("destination_airport_id", destinationAirportId)
        .filter("departure_time", "gte", `${date}T00:00:00`)
        .filter("departure_time", "lt", `${date}T23:59:59.999`)
        .gte("departure_time", now)
        .order("departure_time", { ascending: true });

      // Add cabin class filter if specified
      if (cabinClass) {
        query = query.eq("cabin_class", cabinClass);
      }

      return query;
    };

    // Helper function to map flight data
    const mapFlightData = (flight: any) => ({
      id: flight.id,
      flight_number: flight.flight_number,
      airline_id: flight.airline_id,
      airline_name: flight.airlines?.name || "",
      airline_logo_url: flight.airlines?.logo_url || "",
      airline_code: flight.airlines?.code || "",
      airline_country: flight.airlines?.country || "",
      origin_airport_id: flight.origin_airport_id,
      origin_city: flight.origin?.city || "",
      origin_code: flight.origin?.code || "",
      origin_name: flight.origin?.name || "",
      origin_country: flight.origin?.country || "",
      destination_airport_id: flight.destination_airport_id,
      destination_city: flight.destination?.city || "",
      destination_code: flight.destination?.code || "",
      destination_name: flight.destination?.name || "",
      destination_country: flight.destination?.country || "",
      departure_time: flight.departure_time,
      arrival_time: flight.arrival_time,
      duration: flight.duration,
      price: flight.price,
      available_seats: flight.available_seats,
      cabin_class: flight.cabin_class,
      aircraft_type: flight.aircraft_type,
      status: flight.status,
    });

    // Search for outbound flights with cabin class filter
    const outboundQuery = buildFlightQuery(origin, destination, departureDate, outboundCabin);
    const { data: outboundFlights, error: outboundError } = await outboundQuery;

    if (outboundError) {
      return NextResponse.json({ error: outboundError.message }, { status: 500 });
    }

    // For round-trip, also search for return flights with cabin class filter
    let returnFlights: any[] = [];
    if (tripType === "roundtrip" && returnDate) {
      const returnQuery = buildFlightQuery(destination, origin, returnDate, returnCabin);
      const { data: returnData, error: returnError } = await returnQuery;

      if (returnError) {
        return NextResponse.json({ error: returnError.message }, { status: 500 });
      }

      returnFlights = (returnData || []).map(mapFlightData);
    }

    const flights = (outboundFlights || []).map(mapFlightData);

    return NextResponse.json({
      flights,
      returnFlights: tripType === "roundtrip" ? returnFlights : undefined,
      searchCriteria: {
        origin,
        destination,
        departureDate,
        returnDate: tripType === "roundtrip" ? returnDate : undefined,
        tripType,
        outboundCabin,
        returnCabin: tripType === "roundtrip" ? returnCabin : undefined,
      },
    });
  } catch (error) {
    console.error("Flight search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
