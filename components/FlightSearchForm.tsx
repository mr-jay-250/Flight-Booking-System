"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { toast } from "sonner";

const cabinClasses = [
  "Economy",
  "Premium Economy",
  "Business",
  "First",
];

const fieldAnim = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
};

export default function FlightSearchForm({ onSearch, searching }: { onSearch: (params: any) => void; searching: boolean }) {
  const [airports, setAirports] = useState<any[]>([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [tripType, setTripType] = useState<"oneway" | "roundtrip">("oneway");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [outboundCabin, setOutboundCabin] = useState("Economy");
  const [returnCabin, setReturnCabin] = useState("Economy");

  useEffect(() => {
    const fetchAirports = async () => {
      const { data, error } = await supabase.from("airports").select("id,code,name,city,country").order("city");
      if (error) {
        toast.error("Failed to load airports", { description: error.message });
      } else {
        setAirports(data || []);
      }
    };
    fetchAirports();
  }, []);

  const validate = () => {
    if (!origin || !destination) {
      toast.error("Please select both origin and destination airports.");
      return false;
    }
    if (origin === destination) {
      toast.error("Origin and destination cannot be the same.");
      return false;
    }
    if (!departureDate || (tripType === "roundtrip" && !returnDate)) {
      toast.error("Please select all required dates.");
      return false;
    }
    if (adults < 1) {
      toast.error("At least one adult passenger is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const searchParams = {
      origin,
      destination,
      departureDate,
      returnDate: tripType === "roundtrip" ? returnDate : null,
      tripType,
      adults,
      children,
      infants,
      outboundCabin,
      returnCabin: tripType === "roundtrip" ? returnCabin : null,
    };
    
    console.log("FlightSearchForm - Sending search params:", searchParams);
    onSearch(searchParams);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl p-6 md:p-10 border border-blue-100 dark:border-blue-900 backdrop-blur-md relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 pointer-events-none select-none -z-10">
        <svg className="absolute top-0 left-0 w-40 h-40 opacity-20 text-blue-300 dark:text-blue-900" fill="currentColor" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="100" />
        </svg>
        <svg className="absolute bottom-0 right-0 w-32 h-32 opacity-10 text-indigo-400 dark:text-indigo-800" fill="currentColor" viewBox="0 0 200 200">
          <rect width="200" height="200" rx="100" />
        </svg>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <motion.div custom={0} initial="hidden" animate="visible" variants={fieldAnim} className="flex-1">
          <label className="block text-sm font-semibold mb-2 text-blue-900 dark:text-blue-200 flex items-center gap-1">
            <span className="i-mdi:airplane-takeoff text-lg" /> Origin Airport
          </label>
          <select
            className="w-full rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 p-3 text-base shadow-sm transition-all"
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            disabled={searching}
            required
          >
            <option value="">Select origin</option>
            {airports.map((a) => (
              <option key={a.id} value={a.id}>
                {a.city} ({a.code}) - {a.name}
              </option>
            ))}
          </select>
        </motion.div>
        <motion.div custom={1} initial="hidden" animate="visible" variants={fieldAnim} className="flex-1">
          <label className="block text-sm font-semibold mb-2 text-blue-900 dark:text-blue-200 flex items-center gap-1">
            <span className="i-mdi:airplane-landing text-lg" /> Destination Airport
          </label>
          <select
            className="w-full rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 p-3 text-base shadow-sm transition-all"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            disabled={searching}
            required
          >
            <option value="">Select destination</option>
            {airports.map((a) => (
              <option key={a.id} value={a.id}>
                {a.city} ({a.code}) - {a.name}
              </option>
            ))}
          </select>
        </motion.div>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <motion.div custom={2} initial="hidden" animate="visible" variants={fieldAnim} className="flex-1">
          <label className="block text-sm font-semibold mb-2 text-blue-900 dark:text-blue-200">Trip Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              className={`px-5 py-2 rounded-l-xl border-2 border-blue-400 dark:border-blue-700 font-semibold text-base transition-all ${tripType === "oneway" ? "bg-blue-500 text-white shadow-md" : "bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-200"}`}
              onClick={() => setTripType("oneway")}
              disabled={searching}
            >
              One-way
            </button>
            <button
              type="button"
              className={`px-5 py-2 rounded-r-xl border-2 border-blue-400 dark:border-blue-700 font-semibold text-base transition-all ${tripType === "roundtrip" ? "bg-blue-500 text-white shadow-md" : "bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-200"}`}
              onClick={() => setTripType("roundtrip")}
              disabled={searching}
            >
              Round-trip
            </button>
          </div>
        </motion.div>
        <motion.div custom={3} initial="hidden" animate="visible" variants={fieldAnim} className="flex-1 flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2 text-blue-900 dark:text-blue-200">Departure Date</label>
            <input
              type="date"
              className="w-full rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 p-3 text-base shadow-sm transition-all"
              value={departureDate}
              onChange={e => setDepartureDate(e.target.value)}
              disabled={searching}
              required
            />
          </div>
          {tripType === "roundtrip" && (
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2 text-blue-900 dark:text-blue-200">Return Date</label>
              <input
                type="date"
                className="w-full rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 p-3 text-base shadow-sm transition-all"
                value={returnDate}
                onChange={e => setReturnDate(e.target.value)}
                disabled={searching}
                required={tripType === "roundtrip"}
                min={departureDate}
              />
            </div>
          )}
        </motion.div>
      </div>
      <motion.div custom={4} initial="hidden" animate="visible" variants={fieldAnim} className="flex flex-wrap gap-6">
        <div className="flex flex-col flex-1 min-w-[120px]">
          <label className="block text-sm font-semibold mb-2 text-blue-900 dark:text-blue-200">Adults</label>
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 rounded-lg p-2">
            <button type="button" className="px-3 py-1 rounded bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-bold text-lg" onClick={() => setAdults(Math.max(1, adults - 1))} disabled={searching || adults <= 1}>-</button>
            <span className="w-8 text-center text-lg font-semibold">{adults}</span>
            <button type="button" className="px-3 py-1 rounded bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-bold text-lg" onClick={() => setAdults(adults + 1)} disabled={searching}>+</button>
          </div>
        </div>
        <div className="flex flex-col flex-1 min-w-[120px]">
          <label className="block text-sm font-semibold mb-2 text-blue-900 dark:text-blue-200">Children</label>
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 rounded-lg p-2">
            <button type="button" className="px-3 py-1 rounded bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-bold text-lg" onClick={() => setChildren(Math.max(0, children - 1))} disabled={searching || children <= 0}>-</button>
            <span className="w-8 text-center text-lg font-semibold">{children}</span>
            <button type="button" className="px-3 py-1 rounded bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-bold text-lg" onClick={() => setChildren(children + 1)} disabled={searching}>+</button>
          </div>
        </div>
        <div className="flex flex-col flex-1 min-w-[120px]">
          <label className="block text-sm font-semibold mb-2 text-blue-900 dark:text-blue-200">Infants</label>
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 rounded-lg p-2">
            <button type="button" className="px-3 py-1 rounded bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-bold text-lg" onClick={() => setInfants(Math.max(0, infants - 1))} disabled={searching || infants <= 0}>-</button>
            <span className="w-8 text-center text-lg font-semibold">{infants}</span>
            <button type="button" className="px-3 py-1 rounded bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-bold text-lg" onClick={() => setInfants(infants + 1)} disabled={searching}>+</button>
          </div>
        </div>
      </motion.div>
      <motion.div custom={5} initial="hidden" animate="visible" variants={fieldAnim} className="flex flex-wrap gap-6">
        <div className="flex flex-col flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold mb-2 text-blue-900 dark:text-blue-200 flex items-center gap-1">
            <span className="i-mdi:airplane-takeoff text-sm" /> Outbound Cabin Class
          </label>
          <select
            className="w-full rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 p-3 text-base shadow-sm transition-all"
            value={outboundCabin}
            onChange={e => setOutboundCabin(e.target.value)}
            disabled={searching}
          >
            {cabinClasses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        {tripType === "roundtrip" && (
          <div className="flex flex-col flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold mb-2 text-blue-900 dark:text-blue-200 flex items-center gap-1">
              <span className="i-mdi:airplane-landing text-sm" /> Return Cabin Class
            </label>
            <select
              className="w-full rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 p-3 text-base shadow-sm transition-all"
              value={returnCabin}
              onChange={e => setReturnCabin(e.target.value)}
              disabled={searching}
            >
              {cabinClasses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
      </motion.div>
      <motion.div custom={6} initial="hidden" animate="visible" variants={fieldAnim} className="pt-4">
        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-xl shadow-xl hover:scale-[1.04] hover:shadow-2xl transition-all duration-200 disabled:opacity-60 border-none"
          disabled={searching}
        >
          {searching ? "Searching..." : "Search Flights"}
        </button>
      </motion.div>
    </form>
  );
}
