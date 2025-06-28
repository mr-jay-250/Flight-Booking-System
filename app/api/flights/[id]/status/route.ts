import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const flightId = searchParams.get("flight_id");

  if (!flightId) {
    return new Response("Missing flight_id", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      let count = 0;
      const statuses = ["Scheduled", "Boarding", "Departed", "In Air", "Landed", "Cancelled"];
      const interval = setInterval(() => {
        const status = statuses[count % statuses.length];
        controller.enqueue(encoder.encode(`data: {\"status\":\"${status}\"}\n\n`));
        count++;
        if (count > 10) {
          clearInterval(interval);
          controller.close();
        }
      }, 5000);
    },
    cancel() {}
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
} 