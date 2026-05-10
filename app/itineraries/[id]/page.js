import { notFound } from "next/navigation";
import { getItinerary } from "@/lib/itineraries";
import PrintButton from "@/components/PrintButton";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const itinerary = await getItinerary(id);
  if (!itinerary) return { title: "Not Found" };
  return { title: `${itinerary.title} | 旅のしおり` };
}

export default async function ItineraryPage({ params }) {
  const { id } = await params;
  const itinerary = await getItinerary(id);
  if (!itinerary) notFound();

  const { title, destination, startDate, endDate, description, days, sharedInfo } =
    itinerary;
  const si = sharedInfo ?? {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 text-white py-10 sm:py-16 px-4 sm:px-6 print:bg-indigo-600">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-2">
            <p className="text-white/70 text-sm">✈️ 旅のしおり</p>
            <PrintButton />
          </div>
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

      {/* 共有事項 */}
      {(si.accommodation || si.transports?.length > 0 || si.meetingPlace || si.meetingTime || si.items?.length > 0) && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
          <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-800">📌 共有事項</h2>

            {si.accommodation && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">🏨 宿泊地</p>
                <p className="text-gray-700">{si.accommodation}</p>
              </div>
            )}

            {si.transports?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">🚄 電車・飛行機</p>
                <div className="space-y-3">
                  {si.transports.map((t, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {t.type}
                        </span>
                        {t.name && <span className="text-sm text-gray-500">{t.name}</span>}
                        {t.date && (
                          <span className="text-xs text-gray-400 font-medium">
                            {new Date(t.date).toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                        {t.from && <span className="font-medium">{t.from}</span>}
                        {t.departureTime && (
                          <span className="font-mono text-indigo-600 font-semibold">{t.departureTime} 発</span>
                        )}
                        {(t.from || t.departureTime) && (t.to || t.arrivalTime) && (
                          <span className="text-gray-400">→</span>
                        )}
                        {t.to && <span className="font-medium">{t.to}</span>}
                        {t.arrivalTime && (
                          <span className="font-mono text-indigo-600 font-semibold">{t.arrivalTime} 着</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(si.meetingPlace || si.meetingTime) && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">📍 集合</p>
                <div className="flex items-center gap-3">
                  {si.meetingTime && (
                    <span className="font-mono text-indigo-600 font-bold text-lg">{si.meetingTime}</span>
                  )}
                  {si.meetingPlace && <span className="text-gray-700">{si.meetingPlace}</span>}
                </div>
              </div>
            )}

            {si.items?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">🎒 持ち物</p>
                <ul className="space-y-1.5">
                  {si.items.filter(Boolean).map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-4 h-4 rounded border-2 border-gray-300 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

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
                                    className="print:hidden text-xs text-indigo-500 hover:text-indigo-700 border border-indigo-200 rounded-full px-2 py-0.5 hover:bg-indigo-50 transition-colors"
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
