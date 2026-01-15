import React, { useEffect, useMemo, useState } from "react";
import { DollarSign, RefreshCcw, Truck, MapPin, CalendarClock } from "lucide-react";
import { getMyDeliveries } from "../../apis/delivery.api";
import { getChecklistDeliveryByActualDeliveryAsync } from "../../apis/actualdelivery.api";
import { useNavigate } from "react-router-dom";

/** ===== Types from your BE DTO ===== */
type GroupScheduleInfo = {
  eventDate?: string | null;
  eventLocation?: string | null;
  eventCity?: string | null;
  deliveryTime?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  finishTime?: string | null;
};

type RentalInfo = {
  rentalId: number;
  eventName?: string | null;
  customerName?: string | null;
  phoneNumber?: string | null;
};

export type ActualDeliveryResponse = {
  id: number;
  groupScheduleId: number;
  staffId?: number | null;
  staffName?: string | null;

  scheduledDeliveryTime?: string | null;
  scheduledPickupTime?: string | null;

  actualDeliveryTime?: string | null;
  actualPickupTime?: string | null;

  status: string;
  notes?: string | null;

  createdAt: string;
  updatedAt?: string | null;

  scheduleInfo?: GroupScheduleInfo | null;
  rentalInfo?: RentalInfo | null;

  // Checklist info (populated client-side)
  checklistStatus?: number | null; // 1=Draft, 3=Approved
  checklistOverallResult?: number | null;
  checklistId?: number | null;
};

/** ===== Helpers ===== */
function fmtDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString();
}

function isReviewed(status: string) {
  const s = status.toLowerCase();
  return s === "reviewed" || s === "completed" || s === "done" || s === "finished" || s === "oke";
}
function isPending(status: string) {
  const s = status.toLowerCase();
  return s === "pending" || s === "scheduled" || s === "intransit" || s === "in transit";
}

function statusPill(status: string) {
  const s = status.toLowerCase();

  // tweak mapping freely
  if (s === "oke" || isReviewed(status)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }
  if (s === "intransit" || s === "in transit") {
    return "bg-blue-50 text-blue-700 ring-blue-200";
  }
  if (s === "canceled" || s === "cancelled") {
    return "bg-rose-50 text-rose-700 ring-rose-200";
  }
  if (isPending(status)) {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

function checklistPill(status?: number | null) {
  if (status === 3) return "bg-emerald-50 text-emerald-700 ring-emerald-200"; // Approved
  if (status === 1) return "bg-amber-50 text-amber-700 ring-amber-200"; // Draft
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

function EmptyCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-200">
        <DollarSign className="h-7 w-7 text-slate-300" />
      </div>
      <div className="text-base font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-500">{subtitle}</div>
    </div>
  );
}

function MetaBlock({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="text-sm text-slate-700">{value}</div>
    </div>
  );
}

export default function ActualDeliveryManagement() {
    const navigate = useNavigate();

const openChecklist = (actualDeliveryId: number) => {
  navigate(`/technicalstaff/deliveries/${actualDeliveryId}/checklist`);
};

  const [data, setData] = useState<ActualDeliveryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchDeliveries() {
    setLoading(true);
    try {
      const deliveries = await getMyDeliveries();
      const list = Array.isArray(deliveries) ? deliveries : [];

      // Fetch checklist info for each delivery (non-blocking style using Promise.all)
      const withChecklist = await Promise.all(
        list.map(async (d) => {
          try {
            const cl = await getChecklistDeliveryByActualDeliveryAsync(d.id);
            return {
              ...d,
              checklistStatus: cl?.status ?? null,
              checklistOverallResult: cl?.overallResult ?? null,
              checklistId: cl?.id ?? null,
            };
          } catch (err) {
            // if checklist fetch fails, keep nulls — we still show deliveries
            return { ...d, checklistStatus: null, checklistOverallResult: null, checklistId: null };
          }
        })
      );

      setData(withChecklist);
    } catch (error) {
      console.error("Failed to load deliveries", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const counts = useMemo(() => {
    const pending = data.filter((x) => isPending(x.status) && !isReviewed(x.status)).length;
    const reviewed = data.filter((x) => isReviewed(x.status)).length;
    return { pending, reviewed };
  }, [data]);

  const checklistCounts = useMemo(() => {
    const draft = data.filter((x) => x.checklistStatus === 1).length;
    const approved = data.filter((x) => x.checklistStatus === 3).length;
    return { draft, approved };
  }, [data]);

  const filtered = data; // no search/tabs

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Actual Delivery Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review and track delivery & pickup execution
            </p>
          </div>

          {/* Right counters */}
          <div className="flex items-center gap-10">
            <div className="text-right">
              <div className="text-xs text-slate-500">Pending Review</div>
              <div className="text-2xl font-semibold text-amber-600">
                {counts.pending}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Reviewed</div>
              <div className="text-2xl font-semibold text-emerald-600">
                {counts.reviewed}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500">Checklists (Draft)</div>
              <div className="text-2xl font-semibold text-amber-600">{checklistCounts.draft}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Checklists (Approved)</div>
              <div className="text-2xl font-semibold text-emerald-600">{checklistCounts.approved}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 h-px w-full bg-slate-200" />

        {/* Content Card */}
        <div className="mt-6 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          {/* Card top actions */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Truck className="h-4 w-4 text-slate-400" />
              My Deliveries
              <span className="ml-1 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                {filtered.length}
              </span>
            </div>

            <button
              type="button"
              onClick={fetchDeliveries}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="h-px w-full bg-slate-100" />

          {loading ? (
            <div className="px-6 py-10 text-sm text-slate-500">Loading...</div>
          ) : filtered.length === 0 ? (
            <EmptyCard
              title="No deliveries found"
              subtitle="No actual deliveries created yet"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="text-left">
                    {[
                      "Delivery",
                      "Rental",
                      "Customer",
                      "Event",
                      "Location",
                      "Scheduled",
                      "Actual",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="border-b border-slate-100 px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((d) => (
<tr
  key={d.id}
  onClick={() => openChecklist(d.id)}
  className="cursor-pointer border-b border-slate-50 hover:bg-slate-50/60"
>

                      {/* Delivery */}
                      <td className="px-6 py-5 align-top">
                        <div className="text-sm font-semibold text-slate-900">
                          #{d.id}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Schedule #{d.groupScheduleId}
                        </div>
                      </td>

                      {/* Rental */}
                      <td className="px-6 py-5 align-top">
                        <div className="text-sm font-medium text-slate-900">
                          {d.rentalInfo?.rentalId ?? "—"}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-5 align-top">
                        <div className="text-sm font-semibold text-slate-900">
                          {d.rentalInfo?.customerName ?? "—"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {d.rentalInfo?.phoneNumber ?? "—"}
                        </div>
                      </td>

                      {/* Event */}
                      <td className="px-6 py-5 align-top">
                        <div className="text-sm font-semibold text-slate-900">
                          {d.rentalInfo?.eventName ?? "—"}
                        </div>

                        <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200">
                          <CalendarClock className="h-4 w-4 text-slate-400" />
                          <span className="font-semibold text-slate-700">Event date:</span>
                          <span>{fmtDateTime(d.scheduleInfo?.eventDate)}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-5 align-top">
                        <div className="inline-flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {d.scheduleInfo?.eventLocation ?? "—"}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {d.scheduleInfo?.eventCity ?? ""}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Scheduled */}
                      <td className="px-6 py-5 align-top">
                        <div className="space-y-3">
                          <MetaBlock label="Delivery" value={fmtDateTime(d.scheduledDeliveryTime)} />
                          <MetaBlock label="Pickup" value={fmtDateTime(d.scheduledPickupTime)} />
                        </div>
                      </td>

                      {/* Actual */}
                      <td className="px-6 py-5 align-top">
                        <div className="space-y-3">
                          <MetaBlock label="Delivery" value={fmtDateTime(d.actualDeliveryTime)} />
                          <MetaBlock label="Pickup" value={fmtDateTime(d.actualPickupTime)} />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5 align-top">

                        <div className="mt-3 space-y-1 text-xs text-slate-500">
                          {d.staffName && (
                            <div>
                              <span className="font-semibold text-slate-600">Staff:</span>{" "}
                              {d.staffName}
                            </div>
                          )}

                          {d.checklistStatus != null && (
                            <div className="mt-2 inline-flex items-center gap-2">
                              <div className={["inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1", checklistPill(d.checklistStatus)].join(" ")}>{d.checklistStatus === 3 ? "Approved" : "Draft"}</div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 text-xs text-slate-500">
                <div>Showing {filtered.length} record(s)</div>
                <div className="text-slate-400">
                  Last updated: {fmtDateTime(new Date().toISOString())}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
