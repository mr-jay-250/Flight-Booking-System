import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

function formatDate(dateStr: string) {
  // Expects ISO string, returns e.g. Jun 27, 2025
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export default function FlightCard({ flight }: { flight: any }) {
  const router = useRouter();

  // Destructure flight details (assuming API returns joined airline/airport info)
  const {
    flight_number,
    airline_name,
    airline_logo_url,
    origin_city,
    origin_code,
    destination_city,
    destination_code,
    departure_time,
    arrival_time,
    duration,
    price,
    available_seats,
    cabin_class,
  } = flight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-5 flex flex-col gap-3 border border-blue-100 dark:border-gray-800 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer"
      onClick={() => router.push(`/flights/${flight.id}`)}
    >
      <div className="flex items-center gap-3 mb-2">
        {airline_logo_url && (
          <img src={airline_logo_url} alt={airline_name} className="h-8 w-8 object-contain rounded-full bg-white border" />
        )}
        <div className="font-semibold text-lg text-blue-900 dark:text-white">{airline_name}</div>
        <span className="ml-auto text-xs text-gray-500">{cabin_class}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-blue-700 dark:text-blue-300">{origin_code}</span>
          <span className="text-xs text-gray-500">{origin_city}</span>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-xs text-gray-400">Depart</span>
          <span className="font-mono text-base">{formatTime(departure_time)}</span>
          <span className="text-xs text-gray-400">{formatDate(departure_time)}</span>
          <span className="text-xs text-gray-400">Duration</span>
          <span className="font-mono text-xs">{duration}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{destination_code}</span>
          <span className="text-xs text-gray-500">{destination_city}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="text-sm text-gray-500">Flight #{flight_number}</div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-500">Arrive <span className="font-mono">{formatTime(arrival_time)}</span></span>
          <span className="text-xs text-gray-400">{formatDate(arrival_time)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="text-lg font-bold text-green-600 dark:text-green-400">${price}</div>
        <div className="text-xs text-gray-500">Seats: {available_seats}</div>
      </div>
    </motion.div>
  );
}

function formatTime(time: string) {
  // Expects ISO string or HH:mm, returns HH:mm
  if (!time) return "-";
  try {
    const d = new Date(time);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    // fallback if not ISO
    return time.slice(0, 5);
  } catch {
    return time;
  }
}
