"use client";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import FlightCard from "@/components/FlightCard";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  origin_city: string;
  origin_code: string;
  destination_city: string;
  destination_code: string;
}

const skeletons = Array.from({ length: 4 });

export default function FlightsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [cabinClass, setCabinClass] = useState("");
  const [search, setSearch] = useState("");

  // Fetch flights
  useEffect(() => {
    if (!user && !authLoading) {
      window.location.href = "/auth/login";
      return;
    }
    if (!user) return;
    setLoading(true);
    fetch("/api/flights")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setFlights(data);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to load flights");
        toast.error("Failed to load flights");
      })
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  // Filtering
  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      const matchesOrigin = origin ? f.origin_code === origin : true;
      const matchesDest = destination ? f.destination_code === destination : true;
      const matchesCabin = cabinClass ? f.cabin_class === cabinClass : true;
      const matchesSearch = search
        ? f.airline_name.toLowerCase().includes(search.toLowerCase()) ||
          f.flight_number.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchesOrigin && matchesDest && matchesCabin && matchesSearch;
    });
  }, [flights, origin, destination, cabinClass, search]);

  // Unique filter options
  const origins = useMemo(() => Array.from(new Set(flights.map(f => f.origin_code))), [flights]);
  const destinations = useMemo(() => Array.from(new Set(flights.map(f => f.destination_code))), [flights]);
  const cabinClasses = useMemo(() => Array.from(new Set(flights.map(f => f.cabin_class))), [flights]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/60 to-indigo-200/80 dark:from-gray-950 dark:to-blue-950 px-2 py-8 md:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-900 dark:text-white mb-6 text-center drop-shadow-sm">
          ✈️ Available Flights
        </h1>
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <select value={origin} onChange={e => setOrigin((e.target as HTMLSelectElement).value)} className="w-32 rounded-md border px-2 py-1">
            <option value="">Origin</option>
            {origins.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
          <select value={destination} onChange={e => setDestination((e.target as HTMLSelectElement).value)} className="w-32 rounded-md border px-2 py-1">
            <option value="">Destination</option>
            {destinations.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
          <select value={cabinClass} onChange={e => setCabinClass((e.target as HTMLSelectElement).value)} className="w-40 rounded-md border px-2 py-1">
            <option value="">Cabin Class</option>
            {cabinClasses.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <Input
            type="text"
            placeholder="Search airline or flight #"
            value={search}
            onChange={e => setSearch((e.target as HTMLInputElement).value)}
            className="w-48"
          />
          <Button variant="outline" onClick={() => {
            setOrigin(""); setDestination(""); setCabinClass(""); setSearch("");
          }}>
            Reset
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading || authLoading ? (
            skeletons.map((_, i) => (
              <div key={i} className="animate-pulse bg-white/70 dark:bg-gray-900/70 rounded-2xl shadow-lg p-5 h-56" />
            ))
          ) : error ? (
            <div className="col-span-full text-center text-red-500 font-semibold">{error}</div>
          ) : filteredFlights.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 font-medium">No flights found.</div>
          ) : (
            <AnimatePresence>
              {filteredFlights.map(flight => (
                <FlightCard key={flight.id} flight={flight} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
