import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { pickupAddress, destinationAddress } = await req.json();

    if (!pickupAddress || !destinationAddress) {
      return NextResponse.json(
        { error: "Pickup and destination are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key is missing." },
        { status: 500 }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      pickupAddress
    )}&destinations=${encodeURIComponent(destinationAddress)}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    const element = data.rows?.[0]?.elements?.[0];

    if (!element || element.status !== "OK") {
      return NextResponse.json(
        { error: "Could not calculate distance." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      distanceKm: element.distance.value / 1000,
      durationMinutes: Math.round(element.duration.value / 60),
    });
  } catch {
    return NextResponse.json(
      { error: "Distance calculation failed." },
      { status: 500 }
    );
  }
}
