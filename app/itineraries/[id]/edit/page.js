"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
  const id = params.id;
  const token = searchParams.get("token") ?? "";

  const [itinerary, setItinerary] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [uploadingSpotId, setUploadingSpotId] = useState(null);
  const [draggingSpot, setDraggingSpot] = useState(null);
  const fileInputRefs = useRef({});

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
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field, value) {
    setItinerary((prev) => ({ ...prev, [field]: value }));
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
  const saveLabel = saving ? "保存中..." : saved ? "保存しました ✓" : "保存する";

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">

        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">しおりを編集</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 text-white px-5 sm:px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            {saveLabel}
          </button>
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
        <div className="flex justify-end pb-10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
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
