"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AnimatePresence, motion } from "framer-motion";
import FlightSearchForm from "@/components/FlightSearchForm";
import FlightCard from "@/components/FlightCard";
import { toast } from "sonner";

interface Flight {
  id: string;
  flight_number: string;
  airline_name: string;
  airline_logo_url?: string;
  origin_city: string;
  origin_code: string;
  destination_city: string;
  destination_code: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  available_seats: number;
  cabin_class: string;
}

interface SearchResult {
  flights: Flight[];
  returnFlights?: Flight[];
  searchCriteria: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    tripType: string;
    outboundCabin?: string;
    returnCabin?: string;
  };
}

export default function SearchPage() {
  const router = useRouter();
  const { user, isLoading, checkAuth } = useAuthStore();
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  // Protect route: redirect if not authenticated
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [user, isLoading, router]);

  // Handle search form submit
  const handleSearch = async (params: any) => {
    console.log("SearchPage - Received search params:", params);
    setSearching(true);
    setSearched(false);
    setSearchResults(null);
    try {
      const res = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      
      console.log("SearchPage - API response:", data);
      setSearchResults(data);
      setSearched(true);
      
      if (!data.flights || data.flights.length === 0) {
        toast("No flights found for your search.", { description: "Try different dates or airports." });
      } else if (data.searchCriteria.tripType === "roundtrip" && (!data.returnFlights || data.returnFlights.length === 0)) {
        toast("Outbound flights found, but no return flights available.", { description: "Try different return dates." });
      }
    } catch (err: any) {
      toast.error("Error searching flights", { description: err.message });
    } finally {
      setSearching(false);
    }
  };

  // Render flight combinations for round-trip
  const renderRoundTripCombinations = () => {
    if (!searchResults || !searchResults.returnFlights) return null;

    const combinations: React.JSX.Element[] = [];
    
    searchResults.flights.forEach((outboundFlight) => {
      searchResults.returnFlights!.forEach((returnFlight) => {
        const totalPrice = outboundFlight.price + returnFlight.price;
        combinations.push(
          <motion.div
            key={`${outboundFlight.id}-${returnFlight.id}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-blue-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-200"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-white mb-2">
                Round-Trip Combination
              </h3>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                Total: ${totalPrice}
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Outbound Flight */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="text-sm text-gray-500 mb-2">Outbound</div>
                <FlightCard flight={outboundFlight} />
              </div>
              
              {/* Return Flight */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <div className="text-sm text-gray-500 mb-2">Return</div>
                <FlightCard flight={returnFlight} />
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  router.push(`/flights/roundtrip/booking?outboundId=${outboundFlight.id}&returnId=${returnFlight.id}`);
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
              >
                Book Round-Trip
              </button>
            </div>
          </motion.div>
        );
      });
    });

    return combinations;
  };

  // Animated background
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start py-8 px-2 md:px-0 bg-gradient-to-br from-blue-100 via-sky-200 to-indigo-200 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-colors duration-500 overflow-x-hidden">
      {/* Travel-themed background SVG or particles */}
      <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none select-none">
        {/* Example: subtle SVG or animated background */}
        <svg viewBox="0 0 800 600" fill="none" className="w-full h-full">
          <circle cx="700" cy="100" r="120" fill="#60a5fa" fillOpacity="0.15" />
          <circle cx="200" cy="500" r="180" fill="#818cf8" fillOpacity="0.12" />
        </svg>
      </div>
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-3xl md:text-4xl font-bold text-center mb-6 text-blue-900 dark:text-white drop-shadow-lg"
      >
        Search Flights
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-full max-w-2xl bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl p-4 md:p-8 mb-8 backdrop-blur-md"
      >
        <FlightSearchForm onSearch={handleSearch} searching={searching} />
      </motion.div>
      <div className="w-full max-w-6xl">
        <AnimatePresence>
          {searching && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-12"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-60"></div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {searched && searchResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="mt-4"
            >
              {searchResults.searchCriteria.tripType === "roundtrip" && searchResults.returnFlights ? (
                // Round-trip results
                <div>
                  <h2 className="text-2xl font-bold text-center mb-6 text-blue-900 dark:text-white">
                    Round-Trip Flight Combinations
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {renderRoundTripCombinations()}
                  </div>
                </div>
              ) : (
                // One-way results
                <div>
                  <h2 className="text-2xl font-bold text-center mb-6 text-blue-900 dark:text-white">
                    Available Flights
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.flights.map((flight) => (
                      <FlightCard key={flight.id} flight={flight} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
