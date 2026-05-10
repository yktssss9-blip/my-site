import { notFound } from "next/navigation";
import { getItinerary } from "@/lib/itineraries";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const itinerary = getItinerary(id);
  if (!itinerary) return { title: "Not Found" };
  return { title: `${itinerary.title} | 旅のしおり` };
}

export default async function ItineraryPage({ params }) {
  const { id } = await params;
  const itinerary = getItinerary(id);
  if (!itinerary) notFound();

  const { title, destination, startDate, endDate, description, days } =
    itinerary;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 text-white py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-white/70 text-sm mb-2">✈️ 旅のしおり</p>
          <h1 className="text-2xl sm:text-4xl font-bold mb-4">{title}</h1>
          <div className="flex flex-wrap gap-4 text-white/90 text-sm">
            <span>📍 {destination}</span>
            <span>
              📅 {formatDate(startDate)} 〜 {formatDate(endDate)}
            </span>
          </div>
          {description && (
            <p className="mt-4 text-white/80 text-sm leading-relaxed max-w-xl">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Schedule */}
      <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        {days.length === 0 || days.every((d) => d.spots.length === 0) ? (
          <p className="text-center text-gray-400 py-16">
            まだスケジュールが登録されていません
          </p>
        ) : (
          <div className="space-y-10">
            {days.map((day, i) => {
              const d = new Date(day.date);
              return (
                <section key={day.date}>
                  <h2 className="text-lg font-bold text-indigo-600 mb-4 pb-2 border-b border-indigo-100">
                    {i + 1}日目（{d.getMonth() + 1}/{d.getDate()}）
                  </h2>
                  {day.spots.length === 0 ? (
                    <p className="text-gray-400 text-sm">スポットなし</p>
                  ) : (
                    <div className="space-y-4">
                      {day.spots.map((spot) => (
                        <div
                          key={spot.id}
                          className="bg-white rounded-xl p-5 shadow-sm"
                        >
                          <div className="flex gap-4">
                            <div className="text-indigo-400 font-mono text-sm w-16 shrink-0 pt-0.5">
                              {spot.time || "--:--"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-800">
                                  {spot.place}
                                </span>
                                {spot.place && (
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.place)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-200 rounded-full px-2 py-0.5 hover:bg-indigo-50 transition-colors"
                                  >
                                    地図で見る 🗺️
                                  </a>
                                )}
                              </div>
                              {spot.note && (
                                <p className="text-gray-500 text-sm mt-1">
                                  {spot.note}
                                </p>
                              )}
                            </div>
                          </div>
                          {spot.photo && (
                            <img
                              src={spot.photo}
                              alt={spot.place}
                              className="mt-3 w-full max-h-64 object-cover rounded-lg"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
