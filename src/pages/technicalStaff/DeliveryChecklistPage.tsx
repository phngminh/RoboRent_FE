import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import { getChecklistDeliveryItemByChecklistDeliveryIdAsync } from "../../apis/checklistdeliveryitem.api";
import {
  getChecklistDeliveryByActualDeliveryAsync,
  staffCheckBeforeDeliveryAsync,
} from "../../apis/actualdelivery.api";
import { CreateEvidence } from "../../apis/checklistdeliveryevidence.api";
import { useAuth } from "../../contexts/AuthContext";

/** ===== Types ===== */
type ChecklistDelivery = {
  id: number;
  actualDeliveryId: number;
  checklistNo: string;
  type: number;
  status: number;
  checkedByStaffId: number;
  checkedAt: string | null;
  customerAcceptedAt: string | null;
  customerAcceptedById: number | null;
  customerSignatureUrl: string | null;
  customerNote: string | null;
  overallResult: number;
  overallNote: string | null;
  totalItems: number;
  passItems: number;
  failItems: number;
  metaJson: any;
  createdAt: string;
  updatedAt: string;
};

type ChecklistDeliveryItem = {
  id: number;
  checklistDeliveryId: number;
  key: string;
  label: string;
  category: string;
  severity: number; // 1..3
  isRequired: boolean;
  evidenceRequiredOnFail: boolean;
  mustPassToDispatch: boolean;
  sortOrder: number;
  expected: string | null;

  valueType: "select" | "text" | string;

  valueBool: boolean | null;
  valueNumber: number | null;
  valueText: string | null;
  valueJson: any;

  result: number; // 0 = not set, 1 = pass, 2 = fail
  note: string | null;

  createdAt: string;
  updatedAt: string;
};

/** ===== Draft now stores ALL value fields so UI is fully filled ===== */
type ItemDraft = {
  result: number; // 0 = not set, 1 = pass, 2 = fail
  note: string;

  valueBool: boolean | null;
  valueText: string;
  valueNumber: number | null;
  valueJson: any;
};

type EvidenceDraft = {
  url: string;
  type: number; // 1 = photo, 2 = video
  fileName: string;
  fileSizeBytes: number;
  capturedAt: string;
  metaJson?: string;
};

function cls(...s: (string | false | undefined | null)[]) {
  return s.filter(Boolean).join(" ");
}

function normalizeValueType(v?: string | null) {
  const t = (v ?? "").toLowerCase().trim();
  return t === "text" ? "text" : "select";
}

function severityMeta(sev: number) {
  if (sev >= 3)
    return {
      label: "HIGH",
      badge: "bg-rose-600 text-white ring-rose-700",
      icon: <ShieldAlert className="h-4 w-4" />,
    };
  if (sev === 2)
    return {
      label: "MED",
      badge: "bg-amber-500 text-white ring-amber-600",
      icon: <AlertTriangle className="h-4 w-4" />,
    };
  return {
    label: "LOW",
    badge: "bg-slate-700 text-white ring-slate-800",
    icon: <CheckCircle2 className="h-4 w-4" />,
  };
}

/** ===== Counting helpers ===== */
const countPassItems = (items: ChecklistDeliveryItem[], draft: Record<number, ItemDraft>) =>
  items.filter((it) => (draft[it.id]?.result ?? 0) === 1).length;

const countFailItems = (items: ChecklistDeliveryItem[], draft: Record<number, ItemDraft>) =>
  items.filter((it) => (draft[it.id]?.result ?? 0) === 2).length;

const countDoneItems = (items: ChecklistDeliveryItem[], draft: Record<number, ItemDraft>) =>
  items.filter((it) => (draft[it.id]?.result ?? 0) !== 0).length;

export default function DeliveryChecklistPage() {
  const { user } = useAuth();
  const staffAccountId = user?.accountId; // FK -> Accounts.Id

  const navigate = useNavigate();
  const { actualDeliveryId } = useParams();
  const actualId = Number(actualDeliveryId);

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const [checklist, setChecklist] = useState<ChecklistDelivery | null>(null);
  const [items, setItems] = useState<ChecklistDeliveryItem[]>([]);
  const [draft, setDraft] = useState<Record<number, ItemDraft>>({});
  const [overallNote, setOverallNote] = useState("");

  // Evidence drafts (per item)
  const [evidenceDraft, setEvidenceDraft] = useState<Record<number, EvidenceDraft>>({});
  const [uploadingEvidence, setUploadingEvidence] = useState<Record<number, boolean>>({});

  const isPassed = checklist?.overallResult === 1;
  const isReadOnly = isPassed; // you can extend later: or checklist.status === Completed

  const fetchData = async () => {
    if (!actualId || Number.isNaN(actualId)) return;

    setLoading(true);
    try {
      const cl = (await getChecklistDeliveryByActualDeliveryAsync(actualId)) as ChecklistDelivery;
      setChecklist(cl);
      setOverallNote(cl.overallNote ?? "");

      const its = (await getChecklistDeliveryItemByChecklistDeliveryIdAsync(cl.id)) as ChecklistDeliveryItem[];

      // Sort: category -> mustPass first -> severity desc -> sortOrder
      const sorted = [...its].sort((a, b) => {
        const ca = (a.category || "Other").toLowerCase();
        const cb = (b.category || "Other").toLowerCase();
        if (ca !== cb) return ca.localeCompare(cb);

        if (a.mustPassToDispatch !== b.mustPassToDispatch) return a.mustPassToDispatch ? -1 : 1;
        if (a.severity !== b.severity) return b.severity - a.severity;
        return a.sortOrder - b.sortOrder;
      });

      setItems(sorted);

      const init: Record<number, ItemDraft> = {};
      for (const it of sorted) {
        init[it.id] = {
          result: it.result ?? 0,
          note: it.note ?? "",
          valueBool: it.valueBool ?? null,
          valueText: it.valueText ?? "",
          valueNumber: it.valueNumber ?? null,
          valueJson: it.valueJson ?? null,
        };
      }
      setDraft(init);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualId]);

  const setItem = (id: number, patch: Partial<ItemDraft>) => {
    setDraft((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {
          result: 0,
          note: "",
          valueBool: null,
          valueText: "",
          valueNumber: null,
          valueJson: null,
        }),
        ...patch,
      },
    }));
  };

  const setEvidence = (itemId: number, patch: Partial<EvidenceDraft>) => {
    setEvidenceDraft((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] ?? {
          url: "",
          type: 1,
          fileName: "",
          fileSizeBytes: 0,
          capturedAt: new Date().toISOString(),
          metaJson: undefined,
        }),
        ...patch,
      },
    }));
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      { method: "POST", body: formData }
    );

    return res.json();
  };

  const grouped = useMemo(() => {
    const map = new Map<string, ChecklistDeliveryItem[]>();
    for (const it of items) {
      const key = it.category || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return Array.from(map.entries()).map(([category, list]) => ({ category, list }));
  }, [items]);

  const stats = useMemo(() => {
    const total = items.length;

    const missingRequired = items.filter((it) => {
      const d = draft[it.id];
      if (!d) return true;

      const vt = normalizeValueType(it.valueType);
      const missingResult = it.isRequired && d.result === 0;

      const missingText = vt === "text" && it.isRequired && (!d.valueText || !d.valueText.trim());

      return missingResult || missingText;
    }).length;

    const pass = countPassItems(items, draft);
    const fail = countFailItems(items, draft);
    const done = countDoneItems(items, draft);

    const blockingFail = items.filter(
      (it) => it.mustPassToDispatch && (draft[it.id]?.result ?? 0) === 2
    ).length;

    const evidenceNeeded = items.filter(
      (it) => it.evidenceRequiredOnFail && (draft[it.id]?.result ?? 0) === 2
    ).length;

    return { total, done, pass, fail, missingRequired, blockingFail, evidenceNeeded };
  }, [items, draft]);

  const missingEvidenceCount = useMemo(() => {
    return items.filter((it) => {
      const r = draft[it.id]?.result ?? 0;
      // only FAIL items (result === 2) require evidence
      if (r !== 2) return false;
      const ev = evidenceDraft[it.id];
      return !ev?.url?.trim();
    }).length;
  }, [items, draft, evidenceDraft]);

  const canConfirm = useMemo(() => {
    if (!staffAccountId) return false;
    if (items.length === 0) return false;

    // must finish required fields + evidence for every FAIL item
    return stats.missingRequired === 0 && missingEvidenceCount === 0;
  }, [items.length, staffAccountId, stats.missingRequired, missingEvidenceCount]);

  const handleConfirmCheck = async () => {
    if (!checklist) return;
    if (!staffAccountId) {
      alert("Missing staff accountId. Please login again.");
      return;
    }
    if (isReadOnly) return;

    const nowIso = new Date().toISOString();

    const totalItems = items.length;
    const passItems = countPassItems(items, draft);
    const failItems = countFailItems(items, draft);

    // 1=passed only when all items are PASS
    const overallResult = failItems > 0 ? 2 : passItems === totalItems && totalItems > 0 ? 1 : 0;

    const payload = {
      checklistDeliveryId: checklist.id,
      checklistNo: checklist.checklistNo ?? "",
      type: checklist.type,
      status: checklist.status,
      checkedByStaffId: staffAccountId,
      checkedAt: nowIso,

      overallResult,
      overallNote: overallNote ?? "",
      totalItems,
      passItems,
      failItems,

      metaJson: checklist.metaJson ?? null,
      updatedAt: nowIso,

      checklistDeliveryItemUpdateRequests: items.map((it) => {
        const d = draft[it.id];
        const vt = normalizeValueType(it.valueType);

        const valueBool = d?.result === 1 ? true : d?.result === 2 ? false : null;

        return {
          id: it.id,
          valueType: vt,
          valueBool,
          valueNumber: d?.valueNumber ?? null,
          valueJson: d?.valueJson ?? null,
          valueText: vt === "text" ? (d?.valueText?.trim() ? d.valueText.trim() : null) : null,
          note: d?.note?.trim() ? d.note.trim() : null,
          result: d?.result ?? 0,
          updatedAt: nowIso,
        };
      }),
    };

    try {
      setConfirming(true);
      await staffCheckBeforeDeliveryAsync(payload);

      // After confirm succeeds, create evidence records for each PASS/FAIL item
      try {
        const evidencesToCreate = items
          .filter((it) => {
            const r = draft[it.id]?.result ?? 0;
            return r === 2; // only FAIL items
          })
          .map((it) => {
            const ev = evidenceDraft[it.id];
            return CreateEvidence({
              checklistDeliveryId: checklist.id,
              checklistDeliveryItemId: it.id,
              scope: 1,
              type: ev?.type ?? 1,
              url: ev?.url ?? "",
              fileName: ev?.fileName ?? `${it.key}-${Date.now()}`,
              fileSizeBytes: ev?.fileSizeBytes ?? 0,
              capturedAt: ev?.capturedAt ?? new Date().toISOString(),
              uploadedByStaffId: staffAccountId,
              metaJson: ev?.metaJson,
              createdAt: new Date().toISOString(),
            });
          });

        if (evidencesToCreate.length > 0) await Promise.all(evidencesToCreate);
      } catch (e) {
        console.error('Error creating evidences:', e);
      }

      alert("Confirmed check + evidences saved ✅");
      await fetchData();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Confirm failed:", err);
      alert("Confirm failed ❌. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  const onPass = (it: ChecklistDeliveryItem) => setItem(it.id, { result: 1, valueBool: true });
  const onFail = (it: ChecklistDeliveryItem) => setItem(it.id, { result: 2, valueBool: false });
  const onReset = (it: ChecklistDeliveryItem) => setItem(it.id, { result: 0, valueBool: null });

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-3 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Delivery Pre-check (Tech Staff)
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Confirm the robot is ready before delivery.
            </p>

            {stats.blockingFail > 0 && (
              <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-900 ring-2 ring-rose-200">
                <b>🚫 NOT READY:</b> {stats.blockingFail} item(s) marked <b>Must pass</b> are <b>FAIL</b>.
              </div>
            )}

            {stats.evidenceNeeded > 0 && (
              <div className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-2 ring-amber-200">
                <b>📎 Evidence Needed:</b> {stats.evidenceNeeded} failed item(s) require evidence.
              </div>
            )}

            {missingEvidenceCount > 0 && (
              <div className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-2 ring-amber-200">
                <b>📸 Evidence Required:</b> Missing evidence for <b>{missingEvidenceCount}</b> checked item(s).
              </div>
            )}

            {stats.fail > 0 && (
              <div className="mt-3 rounded-xl bg-rose-100 px-4 py-3 text-sm font-extrabold text-rose-900 ring-2 ring-rose-300">
                ❌ {stats.fail} item(s) FAILED — fix before confirming
              </div>
            )}

            {stats.total > 0 && stats.pass === stats.total && (
              <div className="mt-3 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-extrabold text-emerald-900 ring-2 ring-emerald-300">
                ✅ All items PASSED — ready to confirm
              </div>
            )}

            {isPassed && (
              <div className="mt-4 rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-extrabold text-emerald-900 ring-2 ring-emerald-300">
                ✅ CONFIRMED (PASSED) — This checklist is <span className="underline">READ-ONLY</span>.
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200 min-w-[320px]">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ClipboardCheck className="h-4 w-4 text-slate-400" />
              Summary
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <div className="text-xs text-slate-500">Done</div>
                <div className="text-xl font-bold text-slate-900">
                  {stats.done}/{stats.total}
                </div>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
                <div className="text-xs text-amber-800">Missing Required</div>
                <div className="text-xl font-bold text-amber-800">{stats.missingRequired}</div>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-200">
                <div className="text-xs text-emerald-800">Pass</div>
                <div className="text-xl font-bold text-emerald-700">{stats.pass}</div>
              </div>
              <div className="rounded-xl bg-rose-50 p-3 ring-1 ring-rose-200">
                <div className="text-xs text-rose-800">Fail</div>
                <div className="text-xl font-bold text-rose-700">{stats.fail}</div>
              </div>
            </div>

            {checklist && (
              <div className="mt-4 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 text-xs text-slate-700 space-y-1">
                <div><b>ChecklistNo:</b> {checklist.checklistNo}</div>
                <div><b>Type:</b> {checklist.type} | <b>Status:</b> {checklist.status}</div>
                <div><b>CheckedByStaffId:</b> {checklist.checkedByStaffId ?? "—"}</div>
                <div><b>CheckedAt:</b> {checklist.checkedAt ?? "—"}</div>
                <div><b>UpdatedAt:</b> {checklist.updatedAt}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 h-px w-full bg-slate-200" />

        {/* Main card */}
        <div className="mt-6 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="text-sm font-semibold text-slate-900">
              Pre-check for ActualDelivery #{actualId}
              {checklist && (
                <span className="ml-2 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  Checklist #{checklist.id}
                </span>
              )}
            </div>
          </div>

          <div className="h-px w-full bg-slate-100" />

          {loading ? (
            <div className="flex items-center gap-2 px-6 py-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading checklist...
            </div>
          ) : !checklist ? (
            <div className="px-6 py-10 text-sm text-slate-500">
              No checklist found for this delivery.
            </div>
          ) : items.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-500">
              Checklist exists but has no items.
            </div>
          ) : (
            <>
              {/* Overall Note */}
              <div className="px-6 pt-6">
                <label className="text-xs font-semibold text-slate-600">Overall Note</label>
                <textarea
                  value={overallNote}
                  onChange={(e) => setOverallNote(e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Overall note (optional)..."
                  rows={3}
                  className={cls(
                    "mt-2 w-full resize-none rounded-xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500",
                    isReadOnly && "bg-slate-100 text-slate-500 cursor-not-allowed"
                  )}
                />
              </div>

              <div className="px-6 py-6 space-y-10">
                {grouped.map(({ category, list }) => (
                  <div key={category}>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                        {category}
                      </div>
                      <div className="text-xs text-slate-500">{list.length} item(s)</div>
                    </div>

                    <div className="space-y-4">
                      {list.map((it) => {
                        const d = draft[it.id] ?? {
                          result: 0,
                          note: "",
                          valueBool: null,
                          valueText: "",
                          valueNumber: null,
                          valueJson: null,
                        };

                        const vt = normalizeValueType(it.valueType);

                        const missingResult = it.isRequired && d.result === 0;
                        const missingText =
                          vt === "text" && it.isRequired && (!d.valueText || !d.valueText.trim());

                        const isFail = d.result === 2;

                        const danger = it.mustPassToDispatch && isFail;
                        const warning = missingResult || missingText;

                        const sev = severityMeta(it.severity);

                        return (
                          <div
                            key={it.id}
                            className={cls(
                              "rounded-2xl border p-5 transition",
                              danger
                                ? "border-rose-300 bg-rose-50 ring-2 ring-rose-200"
                                : warning
                                ? "border-amber-300 bg-amber-50 ring-2 ring-amber-200"
                                : isFail
                                ? "border-rose-200 bg-white"
                                : "border-slate-200 bg-white"
                            )}
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="text-sm font-bold text-slate-900">{it.label}</div>

                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                                    KEY: {it.key}
                                  </span>

                                  <span
                                    className={cls(
                                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ring-1",
                                      sev.badge
                                    )}
                                  >
                                    {sev.icon}
                                    {sev.label}
                                  </span>

                                  {it.isRequired && (
                                    <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs font-bold text-white ring-1 ring-violet-700">
                                      REQUIRED
                                    </span>
                                  )}

                                  {it.mustPassToDispatch && (
                                    <span className="rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white ring-1 ring-rose-700">
                                      BLOCKS DISPATCH
                                    </span>
                                  )}

                                  {it.evidenceRequiredOnFail && (
                                    <span className="rounded-full bg-amber-600 px-2 py-0.5 text-xs font-bold text-white ring-1 ring-amber-700">
                                      EVIDENCE ON FAIL
                                    </span>
                                  )}

                                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-white ring-1 ring-slate-900">
                                    {vt.toUpperCase()}
                                  </span>

                                  {d.result === 1 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white ring-1 ring-emerald-700">
                                      <CheckCircle2 className="h-4 w-4" />
                                      PASS
                                    </span>
                                  )}
                                  {d.result === 2 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white ring-1 ring-rose-700">
                                      <XCircle className="h-4 w-4" />
                                      FAIL
                                    </span>
                                  )}
                                  {d.result === 0 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white ring-1 ring-amber-600">
                                      <AlertTriangle className="h-4 w-4" />
                                      NOT SET
                                    </span>
                                  )}
                                </div>

                                {it.expected && (
                                  <div className="mt-2 text-xs text-slate-700">
                                    <span className="font-bold text-slate-900">Expected:</span>{" "}
                                    {it.expected}
                                  </div>
                                )}

                                {missingText && (
                                  <div className="mt-2 text-xs font-bold text-amber-800">
                                    ✳ Required value is missing (TEXT)
                                  </div>
                                )}

                                {it.evidenceRequiredOnFail && isFail && (
                                  <div className="mt-2 text-xs font-bold text-amber-800">
                                    📎 Evidence required because item is FAIL
                                  </div>
                                )}
                              </div>

                              {/* Buttons */}
                              <div className="flex shrink-0 items-center gap-2">
                                <button
                                  type="button"
                                  disabled={isReadOnly}
                                  onClick={() => onPass(it)}
                                  className={cls(
                                    "rounded-xl px-4 py-2 text-sm font-extrabold ring-2 transition",
                                    isReadOnly && "opacity-50 cursor-not-allowed",
                                    d.result === 1
                                      ? "bg-emerald-700 text-white ring-emerald-800"
                                      : "bg-white text-emerald-700 ring-emerald-300 hover:bg-emerald-50"
                                  )}
                                >
                                  PASS
                                </button>

                                <button
                                  type="button"
                                  disabled={isReadOnly}
                                  onClick={() => onFail(it)}
                                  className={cls(
                                    "rounded-xl px-4 py-2 text-sm font-extrabold ring-2 transition",
                                    isReadOnly && "opacity-50 cursor-not-allowed",
                                    d.result === 2
                                      ? "bg-rose-700 text-white ring-rose-800"
                                      : "bg-white text-rose-700 ring-rose-300 hover:bg-rose-50"
                                  )}
                                >
                                  FAIL
                                </button>

                                <button
                                  type="button"
                                  disabled={isReadOnly}
                                  onClick={() => onReset(it)}
                                  className={cls(
                                    "rounded-xl bg-white px-3 py-2 text-sm font-extrabold text-slate-700 ring-2 ring-slate-200 hover:bg-slate-50",
                                    isReadOnly && "opacity-50 cursor-not-allowed hover:bg-white"
                                  )}
                                  title="Reset"
                                >
                                  —
                                </button>
                              </div>
                            </div>

                            {/* VALUE INPUTS */}
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              {vt === "text" && (
                                <div className="sm:col-span-2">
                                  <label className="text-xs font-extrabold text-slate-700">
                                    VALUE (TEXT){it.isRequired && <span className="text-rose-600">*</span>}
                                  </label>

                                  <input
                                    disabled={isReadOnly}
                                    value={d.valueText}
                                    onChange={(e) => setItem(it.id, { valueText: e.target.value })}
                                    placeholder={it.expected ?? "Enter value..."}
                                    className={cls(
                                      "mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-900 ring-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500",
                                      missingText ? "ring-rose-300" : "ring-slate-200",
                                      isReadOnly && "bg-slate-100 text-slate-500 cursor-not-allowed"
                                    )}
                                  />

                                  {it.expected && (
                                    <div className="mt-1 text-[11px] text-slate-500">
                                      Expected: <span className="font-semibold">{it.expected}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div>
                                <label className="text-xs font-extrabold text-slate-700">VALUE (NUMBER)</label>
                                <input
                                  type="number"
                                  disabled={isReadOnly}
                                  value={d.valueNumber ?? ""}
                                  onChange={(e) =>
                                    setItem(it.id, {
                                      valueNumber: e.target.value === "" ? null : Number(e.target.value),
                                    })
                                  }
                                  placeholder="Enter number..."
                                  className={cls(
                                    "mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-900 ring-2 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500",
                                    isReadOnly && "bg-slate-100 text-slate-500 cursor-not-allowed"
                                  )}
                                />
                                <div className="mt-1 text-[11px] text-slate-500">Optional (if needed)</div>
                              </div>

                              <div>
                                <label className="text-xs font-extrabold text-slate-700">VALUE (SELECT DETAIL)</label>

                                {(() => {
                                  const v = d.valueJson;
                                  const options =
                                    Array.isArray(v) ? v :
                                    Array.isArray(v?.options) ? v.options :
                                    Array.isArray(v?.values) ? v.values :
                                    null;

                                  if (!options) {
                                    return (
                                      <div className="mt-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 ring-1 ring-slate-200">
                                        No options (valueJson). Keep PASS/FAIL only.
                                      </div>
                                    );
                                  }

                                  const normalized = options.map((o: any) => {
                                    if (typeof o === "string" || typeof o === "number") return { label: String(o), value: o };
                                    return { label: String(o.label ?? o.value), value: o.value ?? o.label };
                                  });

                                  const selected = d.valueJson?.selected ?? "";

                                  return (
                                    <select
                                      disabled={isReadOnly}
                                      value={selected}
                                      onChange={(e) =>
                                        setItem(it.id, {
                                          valueJson: { ...(d.valueJson ?? {}), selected: e.target.value },
                                        })
                                      }
                                      className={cls(
                                        "mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-900 ring-2 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500",
                                        isReadOnly && "bg-slate-100 text-slate-500 cursor-not-allowed"
                                      )}
                                    >
                                      <option value="">-- Select --</option>
                                      {normalized.map((o: any, idx: number) => (
                                        <option key={idx} value={o.value}>
                                          {o.label}
                                        </option>
                                      ))}
                                    </select>
                                  );
                                })()}
                              </div>
                            </div>

                            {/* Note */}
                            <div className="mt-4">
                              <label className="text-xs font-extrabold text-slate-700">NOTE</label>
                              <textarea
                                disabled={isReadOnly}
                                value={d.note}
                                onChange={(e) => setItem(it.id, { note: e.target.value })}
                                placeholder="Add note (optional)..."
                                rows={3}
                                className={cls(
                                  "mt-2 w-full resize-none rounded-xl bg-white px-4 py-3 text-sm text-slate-900 ring-2 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500",
                                  isReadOnly && "bg-slate-100 text-slate-500 cursor-not-allowed"
                                )}
                              />
                            </div>

                            {/* Evidence input (temporary UI) */}
                            <div className="mt-4">
                              <label className="text-xs font-extrabold text-slate-700">
                                EVIDENCE URL (PHOTO/VIDEO){d.result === 2 && <span className="text-rose-600">*</span>}
                              </label>

                              <div className="mt-2 flex gap-2">
                                <input
                                  disabled={isReadOnly || d.result !== 2}
                                  value={evidenceDraft[it.id]?.url ?? ""}
                                  onChange={(e) => setEvidence(it.id, { url: e.target.value })}
                                  placeholder="(temporary) paste uploaded URL here..."
                                  className={cls(
                                    "w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-900 ring-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500",
                                    d.result === 2 && !(evidenceDraft[it.id]?.url ?? "").trim()
                                      ? "ring-rose-300"
                                      : "ring-slate-200",
                                    (isReadOnly || d.result !== 2) && "bg-slate-100 text-slate-500 cursor-not-allowed"
                                  )}
                                />
                                <div>
                                  <input
                                    id={`file-${it.id}`}
                                    type="file"
                                    accept="image/*,video/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      setUploadingEvidence((prev) => ({ ...prev, [it.id]: true }));
                                      try {
                                        const res: any = await uploadToCloudinary(file);
                                        setEvidence(it.id, {
                                          url: res.secure_url,
                                          fileName: res.original_filename ?? file.name,
                                          fileSizeBytes: res.bytes ?? file.size,
                                          capturedAt: new Date().toISOString(),
                                          type: file.type.startsWith('video') ? 2 : 1,
                                          metaJson: JSON.stringify(res),
                                        });
                                      } catch (err) {
                                        console.error('Upload failed', err);
                                        alert('Upload failed');
                                      } finally {
                                        setUploadingEvidence((prev) => ({ ...prev, [it.id]: false }));
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    disabled={isReadOnly || d.result !== 2 || uploadingEvidence[it.id]}
                                    onClick={() => document.getElementById(`file-${it.id}`)?.click()}
                                    className={cls(
                                      "rounded-xl bg-white px-3 py-2 text-sm font-extrabold text-slate-700 ring-2 ring-slate-200 hover:bg-slate-50",
                                      (isReadOnly || d.result !== 2) && "opacity-50 cursor-not-allowed hover:bg-white"
                                    )}
                                  >
                                    {uploadingEvidence[it.id] ? 'Uploading...' : 'Upload'}
                                  </button>
                                </div>
                              </div>

                              <div className="mt-1 text-[11px] text-slate-500">
                                Required for FAIL items. You will replace this with real upload later.
                              </div>
                            </div>

                          </div> 
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-extrabold text-white">
              DONE {stats.done}/{stats.total}
            </span>

            <span
              className={cls(
                "rounded-full px-3 py-1 text-xs font-extrabold text-white",
                stats.missingRequired > 0 ? "bg-amber-600" : "bg-emerald-700"
              )}
            >
              REQUIRED MISSING: {stats.missingRequired}
            </span>

            <span
              className={cls(
                "rounded-full px-3 py-1 text-xs font-extrabold text-white",
                stats.blockingFail > 0 ? "bg-rose-700" : "bg-slate-700"
              )}
            >
              BLOCKING FAIL: {stats.blockingFail}
            </span>

            <span className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-extrabold text-white">
              PASS: {stats.pass}
            </span>

            <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-extrabold text-white">
              FAIL: {stats.fail}
            </span>

            {stats.evidenceNeeded > 0 && (
              <span className="rounded-full bg-amber-700 px-3 py-1 text-xs font-extrabold text-white">
                EVIDENCE NEEDED: {stats.evidenceNeeded}
              </span>
            )}

            {missingEvidenceCount > 0 && (
              <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-extrabold text-white">
                MISSING EVIDENCE: {missingEvidenceCount}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isReadOnly || !canConfirm || confirming}
            onClick={handleConfirmCheck}
            className={cls(
              "rounded-xl px-5 py-3 text-sm font-extrabold ring-2 transition",
              isReadOnly
                ? "bg-emerald-100 text-emerald-800 ring-emerald-200 cursor-not-allowed"
                : canConfirm && !confirming
                ? "bg-slate-900 text-white ring-slate-900 hover:bg-slate-800"
                : "bg-slate-100 text-slate-400 ring-slate-200 cursor-not-allowed"
            )}
            title={
              isReadOnly
                ? "Already confirmed (passed)"
                : !staffAccountId
                ? "Missing staff accountId"
                : stats.missingRequired > 0
                ? "Complete all REQUIRED items & required TEXT values"
                : ""
            }
          >
            {isReadOnly ? "✅ CONFIRMED (PASSED)" : confirming ? "CONFIRMING..." : "CONFIRM CHECK"}
          </button>
        </div>
      </div>
    </div>
  );
}
