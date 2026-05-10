import { kv } from "@vercel/kv";

export async function getItinerary(id) {
  return (await kv.get(`itinerary:${id}`)) ?? null;
}

export async function createItinerary(itinerary) {
  await kv.set(`itinerary:${itinerary.id}`, itinerary);
}

export async function updateItinerary(id, updates) {
  const existing = await kv.get(`itinerary:${id}`);
  if (!existing) return false;
  await kv.set(`itinerary:${id}`, {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  });
  return true;
}
