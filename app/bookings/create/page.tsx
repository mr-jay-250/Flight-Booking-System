"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getSupabaseAccessToken } from '@/lib/getSupabaseToken';

interface Flight {
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
  airline_code?: string;
  airline_country?: string;
  origin_city: string;
  origin_code: string;
  origin_name?: string;
  origin_country?: string;
  destination_city: string;
  destination_code: string;
  destination_name?: string;
  destination_country?: string;
  aircraft_type?: string;
  status?: string;
}

// Create a separate component that uses useSearchParams
function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flight_id = searchParams.get("flight_id");
  const [flight, setFlight] = useState<Flight | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    nationality: "",
    passport_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!flight_id) return;
    fetch(`/api/flights`)
      .then((res) => res.json())
      .then((data: Flight[]) => {
        const found = data.find((f: Flight) => f.id === flight_id);
        setFlight(found || null);
      });
  }, [flight_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!flight_id) {
      setError("No flight selected. Please select a flight first.");
      setLoading(false);
      return;
    }
    // Get access token using utility
    const accessToken = getSupabaseAccessToken();
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ ...form, flight_id }),
    });
    if (res.ok) {
      const data = await res.json();
      setSuccess(`Booking successful!`);
      setTicketUrl(data.ticket_url);
      setTimeout(() => router.push(`/flights`), 10000);
    } else {
      setError(await res.text());
    }
    setLoading(false);
  };

  return (
    <>
      {/* Show error if no flight is selected */}
      {!flight_id && (
        <div className="text-red-500 mb-4 text-center">
          No flight selected. Please go back and select a flight.
        </div>
      )}
      {flight && (
        <div className="mb-8 p-4 bg-gradient-to-r from-blue-100/80 via-indigo-100/70 to-blue-200/60 dark:from-gray-900 dark:via-blue-950 dark:to-blue-900 rounded-2xl shadow flex flex-col sm:flex-row items-center gap-4 sm:gap-8 border border-blue-200 dark:border-gray-800">
          {flight.airline_logo_url && (
            <img src={flight.airline_logo_url} alt={flight.airline_name} className="h-12 w-12 xs:h-16 xs:w-16 sm:h-20 sm:w-20 object-contain rounded-full bg-white border-2 border-blue-200 shadow-lg" />
          )}
          <div className="flex-1">
            <div className="font-extrabold text-lg xs:text-xl sm:text-2xl md:text-3xl text-blue-900 dark:text-white flex items-center gap-2">
              {flight.airline_name}
              {flight.airline_code && <span className="text-sm xs:text-base sm:text-lg text-gray-400 font-normal">({flight.airline_code})</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-lg xs:text-2xl sm:text-3xl font-extrabold text-blue-700 dark:text-blue-300 drop-shadow">{flight.origin_city}</span>
              <span className="text-xs xs:text-base sm:text-xl text-gray-400">({flight.origin_code})</span>
              <span className="text-lg xs:text-xl sm:text-3xl text-blue-500 mx-1">→</span>
              <span className="text-lg xs:text-2xl sm:text-3xl font-extrabold text-indigo-700 dark:text-indigo-300 drop-shadow">{flight.destination_city}</span>
              <span className="text-xs xs:text-base sm:text-xl text-gray-400">({flight.destination_code})</span>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">Departure: <span className="font-semibold text-blue-700 dark:text-blue-300">{new Date(flight.departure_time).toLocaleString()}</span></div>
            <div className="text-xs sm:text-sm text-gray-500">Available Seats: <span className="font-semibold text-blue-700 dark:text-blue-300">{flight.available_seats}</span></div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-green-600 dark:text-green-400 font-extrabold text-xl xs:text-2xl sm:text-3xl">${flight.price}</div>
            <div className="text-xs text-gray-500 mt-1">Cabin: {flight.cabin_class}</div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6 z-10 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="full_name" className="text-blue-900 dark:text-blue-200 font-semibold">Full Name</Label>
            <Input name="full_name" value={form.full_name} onChange={handleChange} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="date_of_birth" className="text-blue-900 dark:text-blue-200 font-semibold">Date of Birth</Label>
            <Input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="gender" className="text-blue-900 dark:text-blue-200 font-semibold">Gender</Label>
            <Input name="gender" value={form.gender} onChange={handleChange} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="nationality" className="text-blue-900 dark:text-blue-200 font-semibold">Nationality</Label>
            <Input name="nationality" value={form.nationality} onChange={handleChange} required className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="passport_number" className="text-blue-900 dark:text-blue-200 font-semibold">Passport Number</Label>
            <Input name="passport_number" value={form.passport_number} onChange={handleChange} required className="mt-1" />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full py-3 text-lg font-bold shadow-lg rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-200">{loading ? "Booking..." : "Confirm Booking"}</Button>
        {error && <div className="text-red-500 mt-2 text-center">{error}</div>}
        {success && <div className="text-green-600 mt-2 text-center">{success}
        </div>}
      </form>
    </>
  );
}

// Loading fallback component
function BookingFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
        <div className="sm:col-span-2 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
    </div>
  );
}

export default function BookingCreatePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200/80 via-indigo-200/70 to-blue-400/60 dark:from-gray-950 dark:via-blue-950 dark:to-blue-900 px-1 py-2 sm:px-2 sm:py-4 md:py-8">
      <div className="w-full max-w-3xl bg-white/95 dark:bg-gray-900/95 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-2 xs:p-3 sm:p-6 md:p-12 border border-blue-200 dark:border-gray-800 mx-auto relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-blue-200 dark:bg-blue-900 rounded-full opacity-20 blur-2xl z-0" />
        <div className="absolute -bottom-8 -left-8 w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-indigo-200 dark:bg-indigo-900 rounded-full opacity-20 blur-2xl z-0" />
        <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-900 dark:text-white mb-4 sm:mb-6 md:mb-10 text-center tracking-tight drop-shadow-lg z-10 relative">Book Flight</h2>
        <Suspense fallback={<BookingFormSkeleton />}>
          <BookingForm />
        </Suspense>
      </div>
    </div>
  );
}
