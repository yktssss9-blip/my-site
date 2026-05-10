import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export async function getItinerary(id) {
  return (await redis.get(`itinerary:${id}`)) ?? null;
}

export async function createItinerary(itinerary) {
  await redis.set(`itinerary:${itinerary.id}`, itinerary);
}

export async function updateItinerary(id, updates) {
  const existing = await redis.get(`itinerary:${id}`);
  if (!existing) return false;
  await redis.set(`itinerary:${id}`, {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  });
  return true;
}
