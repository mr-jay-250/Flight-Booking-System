"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Create a separate component that uses useSearchParams
function ModifyBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [passenger, setPassenger] = useState<any>(null);
  const [flights, setFlights] = useState<any[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [form, setForm] = useState({
    full_name: "",
    nationality: "",
    passport_number: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;
        if (!accessToken || !bookingId) throw new Error("Not authenticated or missing booking");
        // Fetch booking
        const res = await fetch(`/api/bookings`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        const found = (data.bookings || []).find((b: any) => b.id === bookingId);
        setBooking(found);
        setSelectedFlight(found?.flight);
        // Fetch passenger
        const { data: passengerData } = await supabase
          .from("passengers")
          .select("*")
          .eq("booking_id", bookingId)
          .single();
        setPassenger(passengerData);
        setForm({
          full_name: passengerData?.full_name || "",
          nationality: passengerData?.nationality || "",
          passport_number: passengerData?.passport_number || "",
        });
      } catch (err: any) {
        toast.error(err.message || "Failed to load booking");
      } finally {
        setLoading(false);
      }
    };
    if (user && !authLoading) fetchData();
  }, [user, authLoading, bookingId]);

  // Flight search (simple demo: fetch all flights)
  useEffect(() => {
    const fetchFlights = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("flights")
        .select("*")
        .gte("departure_time", now) // Only show upcoming flights
        .order("departure_time", { ascending: true });
      setFlights(data || []);
    };
    fetchFlights();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFlightChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const flight = flights.find((f) => f.id === e.target.value);
    setSelectedFlight(flight);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken || !bookingId) throw new Error("Not authenticated or missing booking");
      // PATCH for passenger info
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          booking_id: bookingId,
          action: "modify",
          updateData: {
            ...form,
            flight_id: selectedFlight?.id,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to modify booking");
      toast.success("Booking updated successfully");
      router.push("/destinations");
    } catch (err: any) {
      toast.error(err.message || "Failed to modify booking");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4" />
        <span className="text-lg text-gray-600">Loading booking...</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-lg text-red-500">Booking not found.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
      <div>
        <label className="block font-semibold mb-1">Passenger Name</label>
        <input
          type="text"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Nationality</label>
        <input
          type="text"
          name="nationality"
          value={form.nationality}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Passport Number</label>
        <input
          type="text"
          name="passport_number"
          value={form.passport_number}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Select New Flight</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedFlight?.id || ""}
          onChange={handleFlightChange}
        >
          {flights.map((flight) => (
            <option key={flight.id} value={flight.id}>
              {flight.origin} → {flight.destination} | {new Date(flight.departure_time).toLocaleString()}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="btn-gradient w-full py-2 font-semibold text-lg rounded"
        disabled={loading}
      >
        Update Booking
      </button>
    </form>
  );
}

// Loading fallback component
function ModifyBookingSkeleton() {
  return (
    <div className="space-y-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-28" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  );
}

export default function ModifyBookingPage() {
  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">Modify Booking</h1>
      <Suspense fallback={<ModifyBookingSkeleton />}>
        <ModifyBookingForm />
      </Suspense>
    </div>
  );
} 