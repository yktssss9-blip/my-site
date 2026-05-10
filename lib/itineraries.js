import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "itineraries.json");

function readAll() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeAll(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export function getItinerary(id) {
  return readAll()[id] ?? null;
}

export function createItinerary(itinerary) {
  const all = readAll();
  all[itinerary.id] = itinerary;
  writeAll(all);
}

export function updateItinerary(id, updates) {
  const all = readAll();
  if (!all[id]) return false;
  all[id] = { ...all[id], ...updates, updatedAt: new Date().toISOString() };
  writeAll(all);
  return true;
}
