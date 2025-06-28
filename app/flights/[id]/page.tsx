"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import FlightCard from "@/components/FlightCard";

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

export default function FlightDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/flights/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setFlight(data);
        setError(null);
      })
      .catch(() => setError("Failed to load flight details"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = () => {
    // Route to booking creation page for this flight
    router.push(`/bookings/create?flight_id=${id}`);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!flight) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200/80 via-indigo-200/70 to-blue-400/60 dark:from-gray-950 dark:via-blue-950 dark:to-blue-900 px-1 py-2 sm:px-2 sm:py-4 md:py-8">
      <div className="w-full max-w-4xl bg-white/95 dark:bg-gray-900/95 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-2 xs:p-3 sm:p-6 md:p-12 border border-blue-200 dark:border-gray-800 mx-auto relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-blue-200 dark:bg-blue-900 rounded-full opacity-20 blur-2xl z-0" />
        <div className="absolute -bottom-8 -left-8 w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-indigo-200 dark:bg-indigo-900 rounded-full opacity-20 blur-2xl z-0" />
        <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-900 dark:text-white mb-4 sm:mb-6 md:mb-10 text-center tracking-tight drop-shadow-lg z-10 relative">Flight Details</h1>
        {flight && (
          <div className="space-y-6 sm:space-y-8 md:space-y-10 z-10 relative">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
              {flight.airline_logo_url && (
                <img src={flight.airline_logo_url} alt={flight.airline_name} className="h-12 w-12 xs:h-16 xs:w-16 sm:h-20 sm:w-20 object-contain rounded-full bg-white border-2 border-blue-200 shadow-lg" />
              )}
              <div className="flex flex-col items-center sm:items-start">
                <div className="font-extrabold text-lg xs:text-xl sm:text-2xl md:text-3xl text-blue-900 dark:text-white flex items-center gap-2">
                  {flight.airline_name}
                  {flight.airline_code && <span className="text-sm xs:text-base sm:text-lg text-gray-400 font-normal">({flight.airline_code})</span>}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Country: <span className="font-semibold text-blue-700 dark:text-blue-300">{flight.airline_country || '-'}</span></div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <div className="flex flex-wrap items-center justify-center gap-1 xs:gap-2 sm:gap-4">
                <span className="text-lg xs:text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-blue-300 drop-shadow">{flight.origin_city}</span>
                <span className="text-xs xs:text-base sm:text-xl text-gray-400">({flight.origin_code})</span>
                <span className="text-lg xs:text-xl sm:text-3xl text-blue-500 mx-1">→</span>
                <span className="text-lg xs:text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-700 dark:text-indigo-300 drop-shadow">{flight.destination_city}</span>
                <span className="text-xs xs:text-base sm:text-xl text-gray-400">({flight.destination_code})</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs xs:text-base sm:text-lg text-gray-700 dark:text-gray-200 mt-1 font-semibold">
                <span>{flight.origin_name} <span className="text-xs text-gray-400">({flight.origin_country})</span></span>
                <span className="hidden sm:inline text-blue-400">→</span>
                <span>{flight.destination_name} <span className="text-xs text-gray-400">({flight.destination_country})</span></span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 text-sm xs:text-base sm:text-lg mt-4 sm:mt-8">
              <div>
                <div className="font-semibold text-gray-700 dark:text-gray-200">Departure</div>
                <div className="text-blue-900 dark:text-blue-200 font-mono text-xs xs:text-sm sm:text-base">{new Date(flight.departure_time).toLocaleString()}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 dark:text-gray-200">Arrival</div>
                <div className="text-blue-900 dark:text-blue-200 font-mono text-xs xs:text-sm sm:text-base">{new Date(flight.arrival_time).toLocaleString()}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 dark:text-gray-200">Duration</div>
                <div>{flight.duration}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 dark:text-gray-200">Cabin Class</div>
                <div>{flight.cabin_class}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 dark:text-gray-200">Aircraft Type</div>
                <div>{flight.aircraft_type || '-'}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 dark:text-gray-200">Status</div>
                <div>{flight.status || '-'}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 dark:text-gray-200">Available Seats</div>
                <div>{flight.available_seats}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 dark:text-gray-200">Price</div>
                <div className="text-green-600 dark:text-green-400 font-extrabold text-xl xs:text-2xl sm:text-3xl">${flight.price}</div>
              </div>
            </div>
          </div>
        )}
        <div className="mt-8 sm:mt-10 flex justify-center z-10 relative">
          <Button size="lg" className="w-full sm:w-auto px-6 xs:px-8 sm:px-12 py-3 xs:py-4 sm:py-5 text-base xs:text-lg sm:text-2xl shadow-lg rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-200" onClick={handleBook}>
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
