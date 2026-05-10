import { NextResponse } from "next/server";
import { getItinerary, updateItinerary } from "@/lib/itineraries";

export async function GET(request, { params }) {
  const { id } = await params;
  const itinerary = await getItinerary(id);
  if (!itinerary)
    return NextResponse.json({ error: "見つかりません" }, { status: 404 });

  const { editToken, ...safe } = itinerary;
  return NextResponse.json(safe);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const itinerary = await getItinerary(id);

  if (!itinerary)
    return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  if (body.editToken !== itinerary.editToken)
    return NextResponse.json({ error: "権限がありません" }, { status: 401 });

  const { editToken, id: _id, createdAt, ...updates } = body;
  await updateItinerary(id, updates);

  return NextResponse.json({ ok: true });
}
