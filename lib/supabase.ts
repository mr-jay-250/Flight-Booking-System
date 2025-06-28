import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

export type Tables = {
  user_profiles: {
    id: string;
    email: string;
    full_name?: string;
    phone_number?: string;
    address?: string;
    preferred_language?: string;
    created_at: string;
    updated_at: string;
  };
  payment_methods: {
    id: string;
    user_id: string;
    card_type: 'visa' | 'mastercard' | 'amex' | 'discover';
    last_four: string;
    expiry_month: number;
    expiry_year: number;
    is_default: boolean;
    created_at: string;
    updated_at: string;
  };
  airports: {
    id: string;
    code: string;
    name: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
  airlines: {
    id: string;
    code: string;
    name: string;
    logo_url?: string;
    country?: string;
  };
  flights: {
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
    cabin_class: string;
    aircraft_type?: string;
    status?: string;
    created_at: string;
    updated_at: string;
  };
  bookings: {
    id: string;
    user_id: string;
    flight_id: string;
    booking_reference: string;
    booking_status: string;
    booking_date: string;
    total_price: number;
    ticket_url?: string | null;
    payment_status: string;
    created_at: string;
    updated_at: string;
  };
  passengers: {
    id: string;
    booking_id: string;
    full_name: string;
    date_of_birth?: string;
    gender?: string;
    nationality?: string;
    passport_number?: string;
    seat_number?: string;
    created_at: string;
    updated_at: string;
  };
  payments: {
    id: string;
    booking_id: string;
    amount: number;
    status: string;
    payment_method: string;
    transaction_id?: string;
    payment_date: string;
    created_at: string;
    updated_at: string;
  };
};
