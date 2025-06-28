export interface Airline {
  id: string;
  code: string;
  name: string;
  logo_url?: string;
  country: string;
  created_at: string;
}

export interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  created_at: string;
}

export type FlightStatus = 'On Time' | 'Delayed' | 'Cancelled' | 'Boarding' | 'In Air' | 'Landed';
export type CabinClass = 'Economy' | 'Premium Economy' | 'Business' | 'First';

export interface Flight {
  id: string;
  flight_number: string;
  airline_id: string;
  origin_airport_id: string;
  destination_airport_id: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  available_seats: number;
  cabin_class: CabinClass;
  aircraft_type: string | null;
  status: FlightStatus;
  created_at: string;
  updated_at: string;
  
  // These will be populated by Supabase joins
  airline?: Airline;
  origin_airport?: Airport;
  destination_airport?: Airport;
}

// Types for the search form
export interface FlightSearchCriteria {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass: CabinClass;
  tripType: 'one-way' | 'round-trip';
}

// Type for transformed flight data sent to frontend
export interface TransformedFlight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  duration: string;
  cabinClass: CabinClass;
  availableSeats: number;
  status: FlightStatus;
  aircraftType?: string;
  originAirport: {
    name: string;
    city: string;
    country: string;
  };
  destinationAirport: {
    name: string;
    city: string;
    country: string;
  };
  airline_details: {
    name: string;
    code: string;
    logo_url?: string;
  };
}

// Types for the API response
export interface FlightSearchResponse {
  flights: TransformedFlight[];
  returnFlights?: TransformedFlight[];
  searchCriteria: FlightSearchCriteria;
}
