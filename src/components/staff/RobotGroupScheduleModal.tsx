// src/components/staff/RobotGroupScheduleModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Calendar,
  MapPin,
  User,
  Clock,
  BadgeCheck,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { addScheduleAsync } from "../../apis/groupSchedule.staff.api";

type ApiResponse<T> = { success: boolean; data: T; message?: string };

// ====== TYPES ======
export type ActivityTypeGroup = {
  id: number;
  activityTypeId: number;
  isDeleted: boolean;
  eventActivityId: number;
  activityTypeName: string;
  eventActivityName: string | null;
};

export type GroupScheduleItem = {
  id: number;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventCity: string;
  setupTime: string | null;
  startTime: string;
  endTime: string;
  finishTime: string;
  status: string;
  isDeleted: boolean;
  activityTypeGroupId: number;
  rentalId: number;
  staffId: number;
  staffFullName: string;
  customerId: number;
  customerFullName: string;
};

export type GroupScheduleDay = {
  eventDate: string;
  items: GroupScheduleItem[];
};

// ====== PROPS ======
type RobotGroupScheduleModalProps = {
  isOpen: boolean;
  onClose: () => void;

  title?: string;
  subtitle?: string;

  rentalId: number;
  staffId?: number | null;
  startTime?: string | null;
  endTime?: string | null;

  rentalStatus?: string | null;

  fetchGroups: () => Promise<ApiResponse<ActivityTypeGroup[]>>;
  fetchGroupSchedule: (groupId: number) => Promise<ApiResponse<GroupScheduleDay[]>>;

  onAssigned?: () => void;
};

function fmtDate(dateIso: string) {
  const d = new Date(dateIso);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function fmtTime(t: string | null | undefined) {
  return t ? t.slice(0, 5) : "";
}

function dateKey(iso: string) {
  // "2026-01-10T00:00:00Z" -> "2026-01-10"
  return iso?.slice(0, 10) ?? "";
}

function StatusPill({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  const cls =
    s === "planned"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : s === "done" || s === "completed"
        ? "bg-green-50 text-green-700 border-green-100"
        : s === "cancelled" || s === "canceled"
          ? "bg-red-50 text-red-700 border-red-100"
          : "bg-gray-50 text-gray-700 border-gray-100";

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full border ${cls}`}>
      <BadgeCheck className="w-3.5 h-3.5 mr-1" />
      {status}
    </span>
  );
}

export default function RobotGroupScheduleModal({
  isOpen,
  onClose,
  title = "Robot Groups",
  subtitle = "Select a group to view schedule",
  rentalId,
  staffId,
  startTime,
  endTime,
  rentalStatus,
  fetchGroups,
  fetchGroupSchedule,
  onAssigned,
}: RobotGroupScheduleModalProps) {
  const [groups, setGroups] = useState<ActivityTypeGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const [scheduleDays, setScheduleDays] = useState<GroupScheduleDay[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  const [isAssigning, setIsAssigning] = useState(false);

  // ✅ NEW: selected date filter (YYYY-MM-DD)
  const [selectedDateKey, setSelectedDateKey] = useState<string>("");

  // Load groups when open
  useEffect(() => {
    if (!isOpen) return;

    const run = async () => {
      setIsLoadingGroups(true);
      try {
        const res = await fetchGroups();
        setGroups(res.data || []);
        if (res.data?.length && selectedGroupId == null) {
          setSelectedGroupId(res.data[0].id);
        }
      } finally {
        setIsLoadingGroups(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Load schedule when selected group changes
  useEffect(() => {
    if (!isOpen) return;
    if (!selectedGroupId) {
      setScheduleDays([]);
      return;
    }

    const run = async () => {
      setIsLoadingSchedule(true);
      try {
        const res = await fetchGroupSchedule(selectedGroupId);
        setScheduleDays(res.data || []);
      } finally {
        setIsLoadingSchedule(false);
      }
    };

    run();
  }, [isOpen, selectedGroupId, fetchGroupSchedule]);

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId) || null,
    [groups, selectedGroupId]
  );

  // ✅ Flatten items
  const allItems = useMemo(() => {
    const flat: GroupScheduleItem[] = [];
    for (const d of scheduleDays) {
      for (const it of d.items || []) flat.push(it);
    }
    return flat;
  }, [scheduleDays]);

  // ✅ Build list of available dates for the select box
  const availableDates = useMemo(() => {
    const keys = Array.from(new Set(allItems.map((it) => dateKey(it.eventDate)).filter(Boolean)));
    keys.sort((a, b) => a.localeCompare(b)); // ascending
    return keys;
  }, [allItems]);

  // ✅ Auto-pick first date when schedule loads (or when group changes)
  useEffect(() => {
    if (!isOpen) return;

    // if current selectedDateKey is still valid, keep it
    if (selectedDateKey && availableDates.includes(selectedDateKey)) return;

    // otherwise pick first available
    if (availableDates.length > 0) {
      setSelectedDateKey(availableDates[0]);
    } else {
      setSelectedDateKey("");
    }
  }, [isOpen, availableDates, selectedDateKey]);

  // ✅ Filter items by selected date
  const filteredItems = useMemo(() => {
    if (!selectedDateKey) return [];
    return allItems
      .filter((it) => dateKey(it.eventDate) === selectedDateKey)
      .sort((a, b) => (a.setupTime || a.startTime).localeCompare(b.setupTime || b.startTime));
  }, [allItems, selectedDateKey]);

  if (!isOpen) return null;

  // ✅ BE rule: can only create schedule when status == AcceptedPriceQuote
  const isRentalEligibleToAssign = (rentalStatus || "") === "AcceptedPriceQuote";

  const canAssign =
    isRentalEligibleToAssign &&
    !!selectedGroupId &&
    !!staffId &&
    !!startTime &&
    !!endTime &&
    !isAssigning;

  const assignDisabledReason =
    !isRentalEligibleToAssign
      ? `Cannot assign. Rental status must be "AcceptedPriceQuote" (current: ${rentalStatus || "Unknown"})`
      : !staffId
        ? "Missing staffId from rentalInfo"
        : !selectedGroupId
          ? "Select a group first"
          : !startTime || !endTime
            ? "Missing rental start/end time"
            : "";

  const handleAssign = async () => {
    if (!canAssign || !selectedGroupId || !staffId || !startTime || !endTime) return;

    setIsAssigning(true);
    try {
      const payload = {
        startTime,
        endTime,
        activityTypeGroupId: selectedGroupId,
        rentalId,
      };

      const res = await addScheduleAsync(staffId, payload);

      if (res?.success === false) {
        toast.error(res?.message || "Assign failed");
        return;
      }

      toast.success("✅ Assigned group to rental successfully!");

      // refresh schedule for this group
      try {
        const refreshed = await fetchGroupSchedule(selectedGroupId);
        setScheduleDays(refreshed.data || []);
      } catch {}

      onAssigned?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Unexpected error");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Body */}
          <div className="grid grid-cols-12 min-h-[560px]">
            {/* LEFT: Groups */}
            <div className="col-span-4 border-r bg-gray-50">
              <div className="p-4">
                <div className="text-sm font-semibold text-gray-900 mb-2">Groups</div>

                {isLoadingGroups ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600 py-3">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading groups...
                  </div>
                ) : groups.length === 0 ? (
                  <div className="text-sm text-gray-500 py-3">No groups found.</div>
                ) : (
                  <div className="space-y-2">
                    {groups.map((g) => {
                      const active = g.id === selectedGroupId;
                      return (
                        <button
                          key={g.id}
                          onClick={() => setSelectedGroupId(g.id)}
                          className={`w-full text-left p-3 rounded-xl border transition ${
                            active
                              ? "bg-white border-blue-200 shadow-sm"
                              : "bg-white/60 border-gray-200 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">Group #{g.id}</div>
                              <div className="text-xs text-gray-600 mt-0.5">{g.activityTypeName}</div>
                              {g.eventActivityName && (
                                <div className="text-xs text-gray-500 mt-1">{g.eventActivityName}</div>
                              )}
                            </div>
                            {active && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                Selected
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Assign button */}
              <div className="px-4 pb-4">
                <div className="bg-white rounded-2xl border p-4">
                  <div className="text-sm font-semibold text-gray-900">Assign group to rental</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Rental #{rentalId} • Time: {fmtTime(startTime)} – {fmtTime(endTime)}
                  </div>

                  <div className="mt-3 relative group">
                    <button
                      onClick={handleAssign}
                      disabled={!canAssign}
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                        canAssign
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                      title={!canAssign ? assignDisabledReason : "Assign this group to rental"}
                    >
                      {isAssigning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" />
                          Assign this group to rental
                        </>
                      )}
                    </button>

                    {!canAssign && assignDisabledReason && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {assignDisabledReason}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-[11px] text-gray-500">
                    * Server auto-sets setupTime = startTime - 30m, finishTime = endTime + 30m.
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Schedule */}
            <div className="col-span-8 bg-white">
              <div className="p-5 border-b">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-gray-500">Selected group</div>
                    <div className="text-base font-bold text-gray-900">
                      {selectedGroup ? `Group #${selectedGroup.id} • ${selectedGroup.activityTypeName}` : "—"}
                    </div>
                  </div>

                  {/* ✅ NEW: Date filter select box */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <select
                      value={selectedDateKey}
                      onChange={(e) => setSelectedDateKey(e.target.value)}
                      disabled={availableDates.length === 0}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                      title="Filter schedule by event date"
                    >
                      {availableDates.length === 0 ? (
                        <option value="">No dates</option>
                      ) : (
                        availableDates.map((k) => (
                          <option key={k} value={k}>
                            {fmtDate(`${k}T00:00:00Z`)}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-5 overflow-y-auto max-h-[480px]">
                {isLoadingSchedule ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600 py-3">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading schedule...
                  </div>
                ) : !selectedGroupId ? (
                  <div className="text-sm text-gray-500">Select a group to view schedule.</div>
                ) : availableDates.length === 0 ? (
                  <div className="text-sm text-gray-500">No schedule items for this group.</div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-sm text-gray-500">No schedule items for selected date.</div>
                ) : (
                  <div className="space-y-3">
                    {filteredItems.map((it) => (
                      <div key={it.id} className="border rounded-xl p-4 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {it.eventName}{" "}
                              <span className="text-gray-400 font-normal">• Rental #{it.rentalId}</span>
                            </div>

                            <div className="mt-2 space-y-1 text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span>
                                  {it.setupTime ? (
                                    <span className="text-gray-500">setup {fmtTime(it.setupTime)} • </span>
                                  ) : null}
                                  {fmtTime(it.startTime)} – {fmtTime(it.endTime)}
                                  {it.finishTime ? (
                                    <span className="text-gray-500"> • finish {fmtTime(it.finishTime)}</span>
                                  ) : null}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span>
                                  {it.eventLocation} • {it.eventCity}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-800">
                                  Staff: <span className="font-medium">{it.staffFullName}</span>
                                </span>
                                <span className="text-gray-400">|</span>
                                <span className="text-gray-800">
                                  Customer: <span className="font-medium">{it.customerFullName}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <StatusPill status={it.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t bg-white flex items-center justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
          {/* end body */}
        </div>
      </div>
    </div>
  );
}
