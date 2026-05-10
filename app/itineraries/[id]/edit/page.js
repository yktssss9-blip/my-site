"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function findDayBySpotId(days, spotId) {
  return days.findIndex((day) => day.spots.some((s) => s.id === spotId));
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className="text-xs px-3 py-1.5 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors shrink-0"
    >
      {copied ? "コピー済み ✓" : "コピー"}
    </button>
  );
}

function SortableSpot({
  spot,
  onUpdate,
  onRemove,
  onPhotoUpload,
  onPhotoRemove,
  onTriggerUpload,
  isUploading,
  setRef,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: spot.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`border-b border-gray-100 pb-5 last:border-0 last:pb-0 ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
        {/* モバイル：ハンドル＋時間＋削除 を横並び */}
        <div className="flex items-center gap-2">
          {/* ドラッグハンドル */}
          <button
            {...attributes}
            {...listeners}
            className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none p-1 shrink-0 rounded"
            aria-label="ドラッグして移動"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="5.5" cy="3" r="1.5" />
              <circle cx="10.5" cy="3" r="1.5" />
              <circle cx="5.5" cy="8" r="1.5" />
              <circle cx="10.5" cy="8" r="1.5" />
              <circle cx="5.5" cy="13" r="1.5" />
              <circle cx="10.5" cy="13" r="1.5" />
            </svg>
          </button>
          <input
            type="time"
            value={spot.time}
            onChange={(e) => onUpdate("time", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28 shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
          />
          {/* モバイル用削除ボタン */}
          <button
            onClick={onRemove}
            className="sm:hidden ml-auto text-gray-300 hover:text-red-400 transition-colors"
            aria-label="削除"
          >
            ✕
          </button>
        </div>

        {/* 場所・メモ */}
        <div className="flex-1 min-w-0 space-y-2">
          <input
            type="text"
            value={spot.place}
            onChange={(e) => onUpdate("place", e.target.value)}
            placeholder="場所・スポット名"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800"
          />
          <input
            type="text"
            value={spot.note}
            onChange={(e) => onUpdate("note", e.target.value)}
            placeholder="メモ（任意）"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-600"
          />
        </div>

        {/* デスクトップ用削除ボタン */}
        <button
          onClick={onRemove}
          className="hidden sm:block text-gray-300 hover:text-red-400 transition-colors mt-2 shrink-0"
          aria-label="削除"
        >
          ✕
        </button>
      </div>

      {/* 写真 */}
      <div className="mt-3">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          ref={setRef}
          onChange={onPhotoUpload}
        />
        {spot.photo ? (
          <div className="flex items-start gap-3">
            <img
              src={spot.photo}
              alt=""
              className="h-24 w-36 object-cover rounded-lg border border-gray-100"
            />
            <div className="flex flex-col gap-2 mt-1">
              <button
                onClick={onTriggerUpload}
                disabled={isUploading}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
              >
                {isUploading ? "アップロード中..." : "写真を変更"}
              </button>
              <button
                onClick={onPhotoRemove}
                className="text-xs text-gray-400 hover:text-red-400"
              >
                削除
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onTriggerUpload}
            disabled={isUploading}
            className="text-sm text-gray-400 hover:text-indigo-600 border border-dashed border-gray-300 hover:border-indigo-400 rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
          >
            {isUploading ? "アップロード中..." : "📷 写真を追加"}
          </button>
        )}
      </div>
    </div>
  );
}

function DroppableDay({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[3rem] rounded-lg transition-colors ${
        isOver ? "bg-indigo-50" : ""
      }`}
    >
      {children}
    </div>
  );
}

function EditContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id;
  const token = searchParams.get("token") ?? "";

  const [itinerary, setItinerary] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [uploadingSpotId, setUploadingSpotId] = useState(null);
  const [draggingSpot, setDraggingSpot] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRefs = useRef({});
  const isLoaded = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!token) return;
    fetch(`/api/itineraries/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setItinerary(data);
      })
      .catch(() => setError("読み込みに失敗しました"));
  }, [id, token]);

  // 初回ロード後の変更を検知して isDirty をセット
  useEffect(() => {
    if (!itinerary) return;
    if (!isLoaded.current) { isLoaded.current = true; return; }
    setIsDirty(true);
  }, [itinerary]);

  // 未保存の変更があるときにブラウザ離脱を警告
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/itineraries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...itinerary, editToken: token }),
      });
      if (res.status === 401) { setUnauthorized(true); setSaving(false); return; }
      if (!res.ok) throw new Error();
      setIsDirty(false);
      router.push(`/itineraries/${id}`);
    } catch {
      setError("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field, value) {
    setItinerary((prev) => ({ ...prev, [field]: value }));
  }

  function updateSharedInfo(field, value) {
    setItinerary((prev) => ({
      ...prev,
      sharedInfo: { ...(prev.sharedInfo ?? {}), [field]: value },
    }));
  }

  function addItem() {
    setItinerary((prev) => ({
      ...prev,
      sharedInfo: {
        ...(prev.sharedInfo ?? {}),
        items: [...(prev.sharedInfo?.items ?? []), ""],
      },
    }));
  }

  function updateItem(index, value) {
    setItinerary((prev) => ({
      ...prev,
      sharedInfo: {
        ...(prev.sharedInfo ?? {}),
        items: prev.sharedInfo.items.map((item, i) => (i === index ? value : item)),
      },
    }));
  }

  function removeItem(index) {
    setItinerary((prev) => ({
      ...prev,
      sharedInfo: {
        ...(prev.sharedInfo ?? {}),
        items: prev.sharedInfo.items.filter((_, i) => i !== index),
      },
    }));
  }

  function addTransport() {
    setItinerary((prev) => ({
      ...prev,
      sharedInfo: {
        ...(prev.sharedInfo ?? {}),
        transports: [
          ...(prev.sharedInfo?.transports ?? []),
          { id: generateId(), type: "新幹線", name: "", date: "", from: "", departureTime: "", to: "", arrivalTime: "" },
        ],
      },
    }));
  }

  function updateTransport(tid, field, value) {
    setItinerary((prev) => ({
      ...prev,
      sharedInfo: {
        ...(prev.sharedInfo ?? {}),
        transports: prev.sharedInfo.transports.map((t) =>
          t.id === tid ? { ...t, [field]: value } : t
        ),
      },
    }));
  }

  function removeTransport(tid) {
    setItinerary((prev) => ({
      ...prev,
      sharedInfo: {
        ...(prev.sharedInfo ?? {}),
        transports: prev.sharedInfo.transports.filter((t) => t.id !== tid),
      },
    }));
  }

  function addSpot(dayIndex) {
    setItinerary((prev) => ({
      ...prev,
      days: prev.days.map((d, i) =>
        i !== dayIndex
          ? d
          : {
              ...d,
              spots: [
                ...d.spots,
                { id: generateId(), time: "", place: "", note: "", photo: "" },
              ],
            }
      ),
    }));
  }

  function updateSpot(dayIndex, spotIndex, field, value) {
    setItinerary((prev) => ({
      ...prev,
      days: prev.days.map((d, i) =>
        i !== dayIndex
          ? d
          : {
              ...d,
              spots: d.spots.map((s, j) =>
                j !== spotIndex ? s : { ...s, [field]: value }
              ),
            }
      ),
    }));
  }

  function removeSpot(dayIndex, spotIndex) {
    setItinerary((prev) => ({
      ...prev,
      days: prev.days.map((d, i) =>
        i !== dayIndex
          ? d
          : { ...d, spots: d.spots.filter((_, j) => j !== spotIndex) }
      ),
    }));
  }

  async function handlePhotoUpload(e, dayIndex, spotIndex, spotId) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSpotId(spotId);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      updateSpot(dayIndex, spotIndex, "photo", data.path);
    } catch {
      setError("写真のアップロードに失敗しました");
    } finally {
      setUploadingSpotId(null);
      e.target.value = "";
    }
  }

  // DnD ハンドラ
  function handleDragStart({ active }) {
    const dayIdx = findDayBySpotId(itinerary.days, active.id);
    const spot = itinerary.days[dayIdx]?.spots.find((s) => s.id === active.id);
    setDraggingSpot(spot ?? null);
  }

  function handleDragOver({ active, over }) {
    if (!over || active.id === over.id) return;

    const activeDayIdx = findDayBySpotId(itinerary.days, active.id);
    if (activeDayIdx === -1) return;

    const overContainerIdx = itinerary.days.findIndex(
      (d) => `day-${d.date}` === over.id
    );
    const overSpotDayIdx = findDayBySpotId(itinerary.days, over.id);
    const overDayIdx = overContainerIdx !== -1 ? overContainerIdx : overSpotDayIdx;

    if (overDayIdx === -1 || overDayIdx === activeDayIdx) return;

    // 別の日へリアルタイム移動
    setItinerary((prev) => {
      const days = prev.days.map((d) => ({ ...d, spots: [...d.spots] }));
      const activeSpotIdx = days[activeDayIdx].spots.findIndex(
        (s) => s.id === active.id
      );
      const [movedSpot] = days[activeDayIdx].spots.splice(activeSpotIdx, 1);

      if (overContainerIdx !== -1) {
        days[overDayIdx].spots.push(movedSpot);
      } else {
        const overSpotIdx = days[overDayIdx].spots.findIndex(
          (s) => s.id === over.id
        );
        days[overDayIdx].spots.splice(overSpotIdx, 0, movedSpot);
      }
      return { ...prev, days };
    });
  }

  function handleDragEnd({ active, over }) {
    setDraggingSpot(null);
    if (!over || active.id === over.id) return;

    // 同じ日内の並び替え（別日への移動は handleDragOver で処理済み）
    const activeDayIdx = findDayBySpotId(itinerary.days, active.id);
    if (activeDayIdx === -1) return;

    const overSpotDayIdx = findDayBySpotId(itinerary.days, over.id);
    if (overSpotDayIdx === -1 || overSpotDayIdx !== activeDayIdx) return;

    const activeIdx = itinerary.days[activeDayIdx].spots.findIndex(
      (s) => s.id === active.id
    );
    const overIdx = itinerary.days[activeDayIdx].spots.findIndex(
      (s) => s.id === over.id
    );

    if (activeIdx !== overIdx) {
      setItinerary((prev) => {
        const days = prev.days.map((d) => ({ ...d, spots: [...d.spots] }));
        days[activeDayIdx].spots = arrayMove(
          days[activeDayIdx].spots,
          activeIdx,
          overIdx
        );
        return { ...prev, days };
      });
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-6">
          <p className="text-5xl mb-4">🔒</p>
          <h1 className="text-xl font-bold text-gray-800 mb-2">編集URLが必要です</h1>
          <p className="text-gray-500 text-sm">作成時に発行された編集URLからアクセスしてください</p>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-6">
          <p className="text-5xl mb-4">🔒</p>
          <h1 className="text-xl font-bold text-gray-800 mb-2">編集権限がありません</h1>
          <p className="text-gray-500 text-sm">tokenが正しくありません</p>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">{error || "読み込み中..."}</p>
      </div>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/itineraries/${id}`;
  const editUrl = `${origin}/itineraries/${id}/edit?token=${token}`;
  const saveLabel = saving ? "保存中..." : "保存する";

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">

        {/* ヘッダー */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 shrink-0">しおりを編集</h1>
          <div className="flex items-center gap-3">
            {isDirty && !saving && (
              <span className="text-xs text-amber-500 font-medium hidden sm:block">
                ● 未保存の変更があります
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`text-white px-5 sm:px-6 py-2 rounded-full font-semibold transition-colors disabled:opacity-50 text-sm sm:text-base shrink-0 ${
                isDirty && !saving
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {saveLabel}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* URL情報 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">🔗 URL情報</h2>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">共有URL（誰でも閲覧できます）</p>
            <div className="flex items-center gap-2">
              <code className="text-xs sm:text-sm text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg flex-1 truncate">
                {shareUrl}
              </code>
              <CopyButton text={shareUrl} />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">編集URL（必ず保存してください ⚠️）</p>
            <div className="flex items-center gap-2">
              <code className="text-xs sm:text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg flex-1 truncate">
                {editUrl}
              </code>
              <CopyButton text={editUrl} />
            </div>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 space-y-5">
          <h2 className="font-semibold text-gray-700">📋 基本情報</h2>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">タイトル</label>
            <input
              type="text"
              value={itinerary.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">目的地</label>
            <input
              type="text"
              value={itinerary.destination}
              onChange={(e) => updateField("destination", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">出発日</label>
              <p className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-600 text-sm">
                {formatDate(itinerary.startDate)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">帰着日</label>
              <p className="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-600 text-sm">
                {formatDate(itinerary.endDate)}
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">概要メモ</label>
            <textarea
              value={itinerary.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
        </div>

        {/* 共有事項 */}
        {(() => {
          const si = itinerary.sharedInfo ?? {};
          return (
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 space-y-5">
              <h2 className="font-semibold text-gray-700">📌 共有事項</h2>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">🏨 宿泊地</label>
                <input
                  type="text"
                  value={si.accommodation ?? ""}
                  onChange={(e) => updateSharedInfo("accommodation", e.target.value)}
                  placeholder="例：京都タワーホテル"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* 電車・飛行機 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">🚄 電車・飛行機</label>
                <div className="space-y-3">
                  {(si.transports ?? []).map((t) => (
                    <div key={t.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
                      {/* 種別・便名・日付・削除 */}
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={t.type}
                          onChange={(e) => updateTransport(t.id, "type", e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 shrink-0"
                        >
                          {["新幹線","飛行機","特急","在来線","バス","フェリー","その他"].map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => updateTransport(t.id, "name", e.target.value)}
                          placeholder="便名（例：のぞみ13号）"
                          className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
                        />
                        <input
                          type="date"
                          value={t.date ?? ""}
                          onChange={(e) => updateTransport(t.id, "date", e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 shrink-0"
                        />
                        <button
                          onClick={() => removeTransport(t.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                          aria-label="削除"
                        >✕</button>
                      </div>
                      {/* 出発→到着 */}
                      <div className="grid grid-cols-2 sm:grid-cols-[1fr_auto_auto_1fr_auto] gap-2 items-center">
                        <input
                          type="text"
                          value={t.from}
                          onChange={(e) => updateTransport(t.id, "from", e.target.value)}
                          placeholder="出発地"
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
                        />
                        <input
                          type="time"
                          value={t.departureTime}
                          onChange={(e) => updateTransport(t.id, "departureTime", e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
                        />
                        <span className="text-gray-400 text-center hidden sm:block">→</span>
                        <input
                          type="text"
                          value={t.to}
                          onChange={(e) => updateTransport(t.id, "to", e.target.value)}
                          placeholder="到着地"
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
                        />
                        <input
                          type="time"
                          value={t.arrivalTime}
                          onChange={(e) => updateTransport(t.id, "arrivalTime", e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addTransport}
                  className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  ＋ 交通手段を追加
                </button>
              </div>

              {/* 集合場所・時間 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">📍 集合場所・時間</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={si.meetingPlace ?? ""}
                    onChange={(e) => updateSharedInfo("meetingPlace", e.target.value)}
                    placeholder="例：東京駅 八重洲北口"
                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <input
                    type="time"
                    value={si.meetingTime ?? ""}
                    onChange={(e) => updateSharedInfo("meetingTime", e.target.value)}
                    className="border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:w-36"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">🎒 持ち物</label>
                <div className="space-y-2">
                  {(si.items ?? []).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateItem(i, e.target.value)}
                        placeholder="例：パスポート"
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <button
                        onClick={() => removeItem(i)}
                        className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                        aria-label="削除"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addItem}
                  className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  ＋ 持ち物を追加
                </button>
              </div>
            </div>
          );
        })()}

        {/* スケジュール（DnD） */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-700">🗓️ スケジュール</h2>
            {itinerary.days.map((day, dayIndex) => {
              const d = new Date(day.date);
              return (
                <div key={day.date} className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
                  <h3 className="font-semibold text-indigo-600 mb-5">
                    {dayIndex + 1}日目（{d.getMonth() + 1}/{d.getDate()}）
                  </h3>

                  <SortableContext
                    items={day.spots.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DroppableDay id={`day-${day.date}`}>
                      <div className="space-y-0">
                        {day.spots.map((spot, spotIndex) => (
                          <SortableSpot
                            key={spot.id}
                            spot={spot}
                            onUpdate={(field, value) =>
                              updateSpot(dayIndex, spotIndex, field, value)
                            }
                            onRemove={() => removeSpot(dayIndex, spotIndex)}
                            onPhotoUpload={(e) =>
                              handlePhotoUpload(e, dayIndex, spotIndex, spot.id)
                            }
                            onPhotoRemove={() =>
                              updateSpot(dayIndex, spotIndex, "photo", "")
                            }
                            onTriggerUpload={() =>
                              fileInputRefs.current[spot.id]?.click()
                            }
                            isUploading={uploadingSpotId === spot.id}
                            setRef={(el) => {
                              if (el) fileInputRefs.current[spot.id] = el;
                              else delete fileInputRefs.current[spot.id];
                            }}
                          />
                        ))}
                      </div>
                    </DroppableDay>
                  </SortableContext>

                  <button
                    onClick={() => addSpot(dayIndex)}
                    className="mt-5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    ＋ スポットを追加
                  </button>
                </div>
              );
            })}
          </div>

          <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
            {draggingSpot && (
              <div className="bg-white rounded-xl px-4 py-3 shadow-2xl border-2 border-indigo-300 flex items-center gap-3">
                <svg className="w-3 h-3 text-indigo-300 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="5.5" cy="3" r="1.5" />
                  <circle cx="10.5" cy="3" r="1.5" />
                  <circle cx="5.5" cy="8" r="1.5" />
                  <circle cx="10.5" cy="8" r="1.5" />
                  <circle cx="5.5" cy="13" r="1.5" />
                  <circle cx="10.5" cy="13" r="1.5" />
                </svg>
                {draggingSpot.time && (
                  <span className="text-indigo-400 font-mono text-sm">{draggingSpot.time}</span>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {draggingSpot.place || "（名称未設定）"}
                </span>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* 下部保存ボタン */}
        <div className="flex flex-col items-end gap-2 pb-10">
          {isDirty && !saving && (
            <span className="text-xs text-amber-500 font-medium">
              ● 未保存の変更があります
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`text-white px-8 py-3 rounded-full font-semibold transition-colors disabled:opacity-50 ${
              isDirty && !saving
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">読み込み中...</p>
        </div>
      }
    >
      <EditContent />
    </Suspense>
  );
}
