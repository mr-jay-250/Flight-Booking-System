"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FlightCard from "@/components/FlightCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSupabaseAccessToken } from '@/lib/getSupabaseToken';

// Create a separate component that uses useSearchParams
function RoundTripBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const outboundId = searchParams.get("outboundId");
  const returnId = searchParams.get("returnId");
  const [outboundFlight, setOutboundFlight] = useState<any>(null);
  const [returnFlight, setReturnFlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    nationality: "",
    passport_number: "",
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [ticketUrls, setTicketUrls] = useState<{ outbound: string; return: string } | null>(null);
  const [bookingError, setBookingError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError("");
      try {
        const [outboundRes, returnRes] = await Promise.all([
          fetch(`/api/flights/${outboundId}`),
          fetch(`/api/flights/${returnId}`),
        ]);
        if (!outboundRes.ok || !returnRes.ok) throw new Error("Failed to fetch flight details");
        setOutboundFlight(await outboundRes.json());
        setReturnFlight(await returnRes.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (outboundId && returnId) fetchFlights();
  }, [outboundId, returnId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setBookingError("");
    setBookingSuccess(false);
    setTicketUrls(null);
    try {
      // Get access token using utility
      const accessToken = getSupabaseAccessToken();
      // Book outbound flight
      const outboundRes = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ ...form, flight_id: outboundId }),
      });
      if (!outboundRes.ok) throw new Error(await outboundRes.text());
      const outboundData = await outboundRes.json();
      // Book return flight
      const returnRes = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ ...form, flight_id: returnId }),
      });
      if (!returnRes.ok) throw new Error(await returnRes.text());
      const returnData = await returnRes.json();
      setBookingSuccess(true);
      setTicketUrls({
        outbound: `/api/tickets/${outboundData.booking_reference}`,
        return: `/api/tickets/${returnData.booking_reference}`,
      });
      setTimeout(() => router.push("/search"), 10000);
    } catch (err: any) {
      setBookingError(err.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {loading ? (
        <div className="text-center text-blue-700 dark:text-blue-300">Loading flight details...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-2">Outbound Flight</div>
              <FlightCard flight={outboundFlight} />
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">Return Flight</div>
              <FlightCard flight={returnFlight} />
            </div>
          </div>
          {/* Booking form and result */}
          <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-6 mt-4">
            {bookingSuccess && ticketUrls ? (
              <div className="text-center text-green-600 mb-4">
                Booking successful for both flights!<br />
                <div className="mt-4 flex flex-col md:flex-row gap-4 justify-center items-center">
                  <a href={ticketUrls.outbound} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Download Outbound E-Ticket (PDF)</a>
                  <a href={ticketUrls.return} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">Download Return E-Ticket (PDF)</a>
                </div>
                <div className="mt-4 text-blue-900 dark:text-blue-200 text-sm">Redirecting to search page in 10 seconds...</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-blue-900 dark:text-blue-200">Full Name</label>
                    <Input name="full_name" value={form.full_name} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-blue-900 dark:text-blue-200">Date of Birth</label>
                    <Input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-blue-900 dark:text-blue-200">Gender</label>
                    <Input name="gender" value={form.gender} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-blue-900 dark:text-blue-200">Nationality</label>
                    <Input name="nationality" value={form.nationality} onChange={handleChange} required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1 text-blue-900 dark:text-blue-200">Passport Number</label>
                    <Input name="passport_number" value={form.passport_number} onChange={handleChange} required />
                  </div>
                </div>
                <Button type="submit" disabled={submitting} className="w-full py-3 text-lg font-bold shadow-lg rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-200">{submitting ? "Booking..." : "Book Both Flights"}</Button>
                {bookingError && <div className="text-red-500 mt-2 text-center">{bookingError}</div>}
              </form>
            )}
          </div>
        </>
      )}
    </>
  );
}

// Loading fallback component
function RoundTripBookingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
          <div className="md:col-span-2 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export default function RoundTripBookingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200/80 via-indigo-200/70 to-blue-400/60 dark:from-gray-950 dark:via-blue-950 dark:to-blue-900 px-1 py-2 sm:px-2 sm:py-4 md:py-8">
      <div className="w-full max-w-3xl bg-white/95 dark:bg-gray-900/95 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-2 xs:p-3 sm:p-6 md:p-12 border border-blue-200 dark:border-gray-800 mx-auto relative overflow-hidden">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-blue-900 dark:text-white mb-6 text-center tracking-tight drop-shadow-lg z-10 relative">Book Round-Trip</h2>
        <Suspense fallback={<RoundTripBookingSkeleton />}>
          <RoundTripBookingForm />
        </Suspense>
      </div>
    </div>
  );
} 