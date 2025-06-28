"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaPlaneDeparture, FaPlaneArrival, FaTicketAlt } from "react-icons/fa";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getSupabaseAccessToken } from "@/lib/getSupabaseToken";

const fetchUserBookings = async () => {
  const accessToken = getSupabaseAccessToken();
  const res = await fetch("/api/bookings", {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('Failed to fetch bookings:', res.status, text);
    throw new Error("Failed to fetch bookings");
  }
  return res.json();
};

export default function DestinationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'upcoming' | 'traveled' | 'cancelled'>('upcoming');
  const router = useRouter();

  // Split bookings into upcoming and traveled
  const now = useMemo(() => new Date(), []);
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (filter === 'cancelled') return booking.booking_status === 'CANCELLED';
      const arrival = new Date(booking.flight?.arrival_time);
      return filter === 'upcoming'
        ? arrival >= now && booking.booking_status !== 'CANCELLED'
        : arrival < now && booking.booking_status !== 'CANCELLED';
    });
  }, [bookings, filter, now]);

  useEffect(() => {
    const getBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUserBookings();
        setBookings(data.bookings || []);
      } catch (err: any) {
        setError(err.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    if (user && !authLoading) getBookings();
  }, [user, authLoading]);

  // Cancel booking handler
  const handleCancel = async (booking_id: string) => {
    try {
      const accessToken = getSupabaseAccessToken();
      if (!accessToken) throw new Error("Not authenticated");
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ booking_id, action: "cancel" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel booking");
      toast.success("Booking cancelled successfully");
      setBookings((prev) => prev.map(b => b.id === booking_id ? { ...b, booking_status: 'CANCELLED' } : b));
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel booking");
    }
  };

  // Modify booking handler (simple prompt for demo)
  const handleModify = async (booking: any) => {
    const full_name = prompt("Enter new passenger name:", booking.passengers?.[0]?.full_name || "");
    if (!full_name) return;
    try {
      const accessToken = getSupabaseAccessToken();
      if (!accessToken) throw new Error("Not authenticated");
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ booking_id: booking.id, action: "modify", updateData: { full_name } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to modify booking");
      toast.success("Booking modified successfully");
      // Optionally, refetch bookings or update UI
    } catch (err: any) {
      toast.error(err.message || "Failed to modify booking");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4" />
        <span className="text-lg text-gray-200">Loading your bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-lg text-red-400">{error}</span>
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-2xl font-bold text-white mb-2">No bookings found</span>
        <span className="text-gray-400">You haven't booked any flights yet.</span>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 
      bg-gradient-to-br 
      from-blue-100 via-indigo-100 to-purple-100 
      dark:from-blue-900 dark:via-indigo-900 dark:to-gray-900 
      bg-gradient-animate py-8 px-2`}>
      <h1 className={`text-5xl font-extrabold mb-4 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-xl tracking-tight animate-pulse-subtle`}>
        ✈️ Your Booked Flights
      </h1>
      {/* Filter Toggle */}
      <div className="flex justify-center mb-8 gap-4">
        <button
          className={`px-6 py-2 rounded-full font-semibold transition-all shadow-md text-base focus:outline-none focus:ring-2 focus:ring-blue-400
            ${filter === 'upcoming' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-105' : 'bg-white/80 dark:bg-white/10 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900'}`}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming Flights
        </button>
        <button
          className={`px-6 py-2 rounded-full font-semibold transition-all shadow-md text-base focus:outline-none focus:ring-2 focus:ring-pink-400
            ${filter === 'traveled' ? 'bg-gradient-to-r from-pink-500 to-yellow-400 text-white scale-105' : 'bg-white/80 dark:bg-white/10 text-pink-700 dark:text-pink-200 border border-pink-200 dark:border-pink-700 hover:bg-pink-100 dark:hover:bg-pink-900'}`}
          onClick={() => setFilter('traveled')}
        >
          Traveled Flights
        </button>
        <button
          className={`px-6 py-2 rounded-full font-semibold transition-all shadow-md text-base focus:outline-none focus:ring-2 focus:ring-purple-400
            ${filter === 'cancelled' ? 'bg-gradient-to-r from-purple-500 to-red-500 text-white scale-105' : 'bg-white/80 dark:bg-white/10 text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900'}`}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled Flights
        </button>
      </div>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {filteredBookings.map((booking) => {
          const flight = booking.flight;
          const airline = flight?.airline;
          const origin = flight?.origin;
          const destination = flight?.destination;
          const isUpcoming = new Date(flight?.arrival_time) >= now;
          return (
            <div
              key={booking.id}
              className="glassmorphism card-hover rounded-2xl shadow-2xl border border-blue-400/30 p-0 overflow-hidden relative bg-white/90 dark:bg-white/10 dark:backdrop-blur-xl min-h-[320px] max-w-md w-full mx-auto flex flex-col justify-between mb-8"
              style={{ fontSize: '1rem' }}
            >
              {/* Airline and Flight */}
              <div className="flex items-center gap-4 px-6 pt-6 pb-3 border-b border-gray-200 dark:border-white/10 bg-white/60 dark:bg-transparent">
                {airline?.logo_url ? (
                  <img src={airline.logo_url} alt={airline.name} className="h-10 w-10 object-contain rounded-full border-2 border-blue-300 bg-white shadow-md" />
                ) : (
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-800 text-white text-lg"><FaPlaneDeparture /></div>
                )}
                <div>
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-300 gradient-underline leading-tight">{airline?.name || "Unknown Airline"}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">Flight <span className="font-semibold">#{flight?.flight_number}</span></div>
                </div>
              </div>
              {/* Route */}
              <div className="flex items-center justify-between px-6 pt-4 pb-1">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 text-base text-gray-800 dark:text-gray-200 font-semibold"><FaPlaneDeparture className="text-blue-400" /> {origin?.city} <span className="text-xs text-gray-500 dark:text-gray-400">({origin?.code})</span></span>
                  <span className="flex items-center gap-2 text-base text-gray-800 dark:text-gray-200 font-semibold"><FaPlaneArrival className="text-pink-400" /> {destination?.city} <span className="text-xs text-gray-500 dark:text-gray-400">({destination?.code})</span></span>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>Departure</span>
                  <span className="font-semibold text-blue-500 dark:text-blue-300 text-sm">{new Date(flight?.departure_time).toLocaleString()}</span>
                  <span className="mt-1">Arrival</span>
                  <span className="font-semibold text-pink-500 dark:text-pink-300 text-sm">{new Date(flight?.arrival_time).toLocaleString()}</span>
                </div>
              </div>
              {/* Booking Info */}
              <div className="px-6 py-3 flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <FaTicketAlt className="text-yellow-500 dark:text-yellow-400 text-base" />
                  <span className="font-mono">Booking Ref:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-500 break-all">{booking.booking_reference}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-gray-600 dark:text-gray-500">Status:</span>
                  <span className="font-bold text-green-500 dark:text-green-400 uppercase tracking-wide">{booking.booking_status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-gray-600 dark:text-gray-500">Total Price:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">${booking.total_price}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-gray-600 dark:text-gray-500">Passenger:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-200 break-all">{booking.passengers?.[0]?.full_name || user?.email}</span>
                </div>
              </div>
              {/* Actions: Only show for upcoming flights */}
              {isUpcoming && booking.booking_status !== 'CANCELLED' && (
                <div className="flex gap-3 px-6 pb-6 pt-2">
                  <button className="btn-gradient w-full shadow-md hover:cursor-pointer text-base py-2 font-semibold" onClick={() => router.push(`/bookings/modify?id=${booking.id}`)}>Modify Booking</button>
                  <button className="btn-gradient w-full bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors hover:cursor-pointer text-base py-2 font-semibold" onClick={() => handleCancel(booking.id)}>Cancel Booking</button>
                </div>
              )}
              {/* Decorative gradient bar */}
              <div className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400 animate-pulse-subtle" />
            </div>
          );
        })}
      </div>
    </div>
  );
}