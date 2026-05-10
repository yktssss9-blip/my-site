import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createItinerary } from "@/lib/itineraries";

function generateDays(startDate, endDate) {
  const days = [];
  const end = new Date(endDate);
  for (let d = new Date(startDate); d <= end; d.setDate(d.getDate() + 1)) {
    days.push({ date: new Date(d).toISOString().split("T")[0], spots: [] });
  }
  return days;
}

export async function POST(request) {
  const { title, destination, startDate, endDate, description } =
    await request.json();

  if (!title || !destination || !startDate || !endDate) {
    return NextResponse.json(
      { error: "必須項目が不足しています" },
      { status: 400 }
    );
  }

  const id = randomBytes(6).toString("hex");
  const editToken = randomBytes(16).toString("hex");

  createItinerary({
    id,
    editToken,
    title,
    destination,
    startDate,
    endDate,
    description: description ?? "",
    days: generateDays(startDate, endDate),
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ id, editToken }, { status: 201 });
}
