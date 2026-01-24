import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Image as ImageIcon,
  PlayCircle,
  Filter,
  Eye,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X as XIcon,
} from "lucide-react";

import { getChecklistDeliveryItemByChecklistDeliveryIdAsync } from "../../../apis/checklistdeliveryitem.api";
import {customerAcceptChecklistAsync} from "../../../apis/actualdelivery.api";
import {
  getChecklistDeliveryByActualDeliveryAsync,
  getChecklistDeliveryByRentalForCustomerAsync,
} from "../../../apis/actualdelivery.api";
// TODO: replace with your real API
// import { customerAcceptChecklistAsync } from "../../../apis/actualdelivery.api";
import { useAuth } from "../../../contexts/AuthContext";

/** ===== Types ===== */
type ChecklistDelivery = {
  id: number;
  actualDeliveryId: number;
  checklistNo: string;

  checkedAt: string | null;
  checkedByStaffId: number;

  customerAcceptedAt: string | null;
  customerAcceptedById: number | null;
  customerSignatureUrl: string | null;
  customerNote: string | null;

  overallResult: number; // 1 pass, 2 fail, 0 pending
  overallNote: string | null;

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

  severity: number;
  isRequired: boolean;
  evidenceRequiredOnFail: boolean;
  mustPassToDispatch: boolean;

  expected: string | null;
  valueType: "select" | "text" | string;

  valueBool: boolean | null;
  valueNumber: number | null;
  valueText: string | null;
  valueJson: any;

  result: number; // 0 not set, 1 pass, 2 fail
  note: string | null;
};

type Evidence = {
  checklistDeliveryItemId: number;
  url: string;
  type: number; // 1 photo, 2 video
  fileName?: string | null;
};

function cls(...s: (string | false | undefined | null)[]) {
  return s.filter(Boolean).join(" ");
}

// ✅ DÁN Ở ĐÂY (ngoài component)
function formatDateTimeVN(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    // timeZone: "Asia/Ho_Chi_Minh",
  }).format(d);
}

function normalizeValueType(v?: string | null) {
  const t = (v ?? "").toLowerCase().trim();
  return t === "text" ? "text" : "select";
}

function isVideoUrl(url: string) {
  const u = url.toLowerCase();
  return u.includes("/video/") || u.endsWith(".mp4") || u.endsWith(".webm") || u.endsWith(".mov");
}

function extractEvidencesFromMeta(metaJson: any): Evidence[] {
  try {
    if (!metaJson) return [];
    const m = typeof metaJson === "string" ? JSON.parse(metaJson) : metaJson;
    const arr = m?.evidences;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x: any) => x?.checklistDeliveryItemId && x?.url)
      .map((x: any) => ({
        checklistDeliveryItemId: Number(x.checklistDeliveryItemId),
        url: String(x.url),
        type: Number(x.type ?? (isVideoUrl(String(x.url)) ? 2 : 1)),
        fileName: x.fileName ?? null,
      }));
  } catch {
    return [];
  }
}

/** ====== turn staff item -> customer instruction text ======
 * Mục tiêu: khách đọc là làm được.
 */
function buildCustomerInstruction(it: ChecklistDeliveryItem) {
  const vt = normalizeValueType(it.valueType);

  // 1) base: dùng expected nếu có (thường là dạng chuẩn)
  const expected = it.expected?.trim();
  if (expected) {
    return `Bạn kiểm tra theo tiêu chí: ${expected}`;
  }

  // 2) fallback theo valueType
  if (vt === "text")
    return "Bạn kiểm tra bằng cách quan sát/đối chiếu thực tế (mô tả/nhãn/hiển thị) có đúng yêu cầu.";
  if (vt === "select") return "Bạn kiểm tra trạng thái/tuỳ chọn hiển thị có đúng như đã cấu hình.";
  return "Bạn kiểm tra mục này theo quan sát thực tế.";
}

function staffResultLabel(r: number) {
  if (r === 1)
    return {
      text: "PASS",
      badge: "bg-emerald-600 text-white ring-emerald-700",
      icon: <CheckCircle2 className="h-4 w-4" />,
    };
  if (r === 2)
    return {
      text: "FAIL",
      badge: "bg-rose-600 text-white ring-rose-700",
      icon: <XCircle className="h-4 w-4" />,
    };
  return {
    text: "CHƯA CÓ",
    badge: "bg-amber-500 text-white ring-amber-600",
    icon: <AlertTriangle className="h-4 w-4" />,
  };
}

function compactValue(it: ChecklistDeliveryItem) {
  const vt = normalizeValueType(it.valueType);

  // “tech đã check gì” -> tóm tắt dễ đọc
  const parts: string[] = [];

  if (vt === "text" && it.valueText?.trim()) parts.push(`Text: ${it.valueText.trim()}`);
  if (it.valueNumber !== null && it.valueNumber !== undefined) parts.push(`Number: ${it.valueNumber}`);
  if (it.valueJson) {
    // ưu tiên selected
    const selected = it.valueJson?.selected ?? it.valueJson?.value ?? null;
    if (selected !== null && selected !== undefined && String(selected).trim() !== "") {
      parts.push(`Selected: ${String(selected)}`);
    } else {
      // nếu json dài quá -> rút gọn
      const s = JSON.stringify(it.valueJson);
      parts.push(`Detail: ${s.length > 80 ? s.slice(0, 80) + "…" : s}`);
    }
  }

  return parts.length ? parts.join(" • ") : "Không có giá trị chi tiết";
}

export default function CustomerChecklistVerifyFormPage() {
  const { user } = useAuth();
  const customerAccountId = user?.accountId;

  const navigate = useNavigate();
  const { actualDeliveryId, rentalId } = useParams();
  const actualId = Number(actualDeliveryId);

  const [resolvedActualId, setResolvedActualId] = useState<number | null>(actualId || null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  const [checklist, setChecklist] = useState<ChecklistDelivery | null>(null);
  const [items, setItems] = useState<ChecklistDeliveryItem[]>([]);
  const [customerNote, setCustomerNote] = useState("");

  const [evidences, setEvidences] = useState<Evidence[]>([]);

  // UI controls
  const [activeTab, setActiveTab] = useState<"verify" | "staff">("verify");
  const [onlyFail, setOnlyFail] = useState(false);
  const [onlyHasEvidence, setOnlyHasEvidence] = useState(false);
  const [onlyMustPass, setOnlyMustPass] = useState(false);

  // ===== NEW: Instruction modal state (ONLY ADD) =====
  const [instructionOpen, setInstructionOpen] = useState(false);
  const [instructionStep, setInstructionStep] = useState(0);

  const isAccepted = !!checklist?.customerAcceptedAt;

  const fetchData = async () => {
    let actualIdToUse = actualId;

    if ((!actualIdToUse || Number.isNaN(actualIdToUse)) && rentalId) {
      const rId = Number(rentalId);
      if (!Number.isNaN(rId)) {
        try {
          const returnedActual = await getChecklistDeliveryByRentalForCustomerAsync(rId);
          if (returnedActual !== null && returnedActual !== undefined) {
            actualIdToUse = Number(returnedActual);
            if (!Number.isNaN(actualIdToUse)) setResolvedActualId(actualIdToUse);
          }
        } catch (e) {
          console.error("resolve actualDeliveryId failed:", e);
        }
      }
    }

    if (!actualIdToUse || Number.isNaN(actualIdToUse)) return;

    setLoading(true);
    try {
      const cl = (await getChecklistDeliveryByActualDeliveryAsync(actualIdToUse)) as ChecklistDelivery;
      setChecklist(cl);
      setCustomerNote(cl.customerNote ?? "");

      const its = (await getChecklistDeliveryItemByChecklistDeliveryIdAsync(cl.id)) as ChecklistDeliveryItem[];

      // Sort: category -> severity desc -> sortOrder
      const sorted = [...its].sort((a, b) => {
        const ca = (a.category || "Other").toLowerCase();
        const cb = (b.category || "Other").toLowerCase();
        if (ca !== cb) return ca.localeCompare(cb);
        if (a.severity !== b.severity) return b.severity - a.severity;
        return (a as any).sortOrder - (b as any).sortOrder;
      });

      setItems(sorted);
      setEvidences(extractEvidencesFromMeta(cl.metaJson));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualId]);

  const evidenceByItemId = useMemo(() => {
    const map = new Map<number, Evidence[]>();
    for (const ev of evidences) {
      if (!map.has(ev.checklistDeliveryItemId)) map.set(ev.checklistDeliveryItemId, []);
      map.get(ev.checklistDeliveryItemId)!.push(ev);
    }
    return map;
  }, [evidences]);

  const stats = useMemo(() => {
    const total = items.length;
    const pass = items.filter((x) => x.result === 1).length;
    const fail = items.filter((x) => x.result === 2).length;
    const done = items.filter((x) => x.result !== 0).length;
    const mustFix = items.filter((x) => x.mustPassToDispatch && x.result === 2).length;
    return { total, pass, fail, done, mustFix };
  }, [items]);

  /** Tab verify: ưu tiên những mục quan trọng cho khách xem
   * - FAIL trước
   * - MustPassToDispatch
   * - EvidenceRequiredOnFail
   */
  const verifyList = useMemo(() => {
    const enriched = items.map((it) => {
      const evCount = (evidenceByItemId.get(it.id) ?? []).length;
      const priority =
        (it.result === 2 ? 100 : 0) +
        (it.mustPassToDispatch ? 30 : 0) +
        (it.evidenceRequiredOnFail ? 10 : 0) +
        (it.severity >= 3 ? 5 : it.severity === 2 ? 3 : 1);
      return { it, evCount, priority };
    });

    let list = enriched.sort((a, b) => b.priority - a.priority);

    if (onlyFail) list = list.filter((x) => x.it.result === 2);
    if (onlyHasEvidence) list = list.filter((x) => x.evCount > 0);
    if (onlyMustPass) list = list.filter((x) => x.it.mustPassToDispatch);

    return list;
  }, [items, evidenceByItemId, onlyFail, onlyHasEvidence, onlyMustPass]);

  const staffListGrouped = useMemo(() => {
    // Tab staff: group by category như UI cũ nhưng item gọn
    const map = new Map<string, ChecklistDeliveryItem[]>();
    for (const it of items) {
      const key = it.category || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    }
    return Array.from(map.entries()).map(([category, list]) => ({ category, list }));
  }, [items]);

  const canAccept = useMemo(() => {
    if (!customerAccountId) return false;
    if (!checklist) return false;
    if (items.length === 0) return false;
    if (isAccepted) return false;
    const allChecked = items.every((x) => x.result === 1 || x.result === 2);
    return allChecked;
  }, [customerAccountId, checklist, items, isAccepted]);

const handleAccept = async () => {
  if (!checklist) return;

  if (!customerAccountId) {
    alert("Bạn cần đăng nhập để xác nhận.");
    return;
  }

  if (isAccepted) return;

  try {
    setAccepting(true);
    const nowIso = new Date().toISOString();

    // ✅ CALL REAL API HERE
    await customerAcceptChecklistAsync(checklist.id, {
      customerAcceptedAt: nowIso,
      customerAcceptedById: customerAccountId,
      customerNote: customerNote?.trim() ? customerNote.trim() : null,
    });

    alert("Bạn đã xác nhận checklist ✅");
    await fetchData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {
    console.error(e);
    alert("Xác nhận thất bại ❌");
  } finally {
    setAccepting(false);
  }
};


  // ===== NEW: Instruction content (ONLY ADD) =====
  const instructionSteps = useMemo(() => {
    const mustPassFails = items.filter((x) => x.mustPassToDispatch && x.result === 2).length;
    const anyFail = items.some((x) => x.result === 2);
    const anyEvidence = evidences.length > 0;

    return [
      {
        title: "Bước 1: Quan sát tổng quan robot",
        desc: [
          "Kiểm tra ngoại hình robot: trầy xước, móp méo, nứt vỡ, bẩn/ướt bất thường.",
          "Đối chiếu ảnh/video evidence (nếu có) để xác nhận tình trạng thực tế.",
          "Quan sát khu vực cổng sạc/cổng kết nối: không gãy, không lỏng.",
        ],
        tip: anyFail
          ? "Hiện checklist có mục FAIL — nên soi kỹ phần ngoại hình và evidence."
          : "Dù không có FAIL, bạn vẫn nên kiểm nhanh ngoại hình để tránh phát sinh tranh chấp.",
      },
      {
        title: "Bước 2: Nguồn điện & phụ kiện",
        desc: [
          "Xác nhận sạc/adapter/dây nguồn đầy đủ, cắm chắc, không lỏng/đứt.",
          "Kiểm tra nguồn điện vào: đèn báo (nếu có) hoạt động bình thường.",
          "Nếu robot dùng pin: đảm bảo pin đủ dùng cho thời gian thuê (hoặc theo hướng dẫn Tech).",
        ],
        tip: mustPassFails > 0
          ? `Có ${mustPassFails} mục MUST-PASS đang FAIL — cần xử lý ngay với Tech Staff trước khi nhận.`
          : "Ưu tiên kiểm tra các mục gắn nhãn MUST-PASS trong checklist.",
      },
      {
        title: "Bước 3: Khởi động & trạng thái hệ thống",
        desc: [
          "Bật robot và chờ khởi động hoàn tất (không treo, không lặp restart).",
          "Quan sát màn hình/đèn báo: không hiện cảnh báo bất thường.",
          "Kiểm tra âm thanh cơ bản (nếu robot có loa): không rè, không mất tiếng.",
        ],
        tip: "Nếu thấy báo lỗi: chụp ảnh màn hình lỗi + ghi lại thời điểm để làm bằng chứng.",
      },
      {
        title: "Bước 4: Kiểm tra chức năng cơ bản",
        desc: [
          "Thử thao tác cơ bản theo loại robot (chào, phát âm thanh, hiển thị nội dung, di chuyển nếu có).",
          "Nếu có tương tác cảm ứng: chạm thử 2–3 lần, đảm bảo phản hồi ổn định.",
          "Nếu có mạng/WiFi: kiểm tra biểu tượng kết nối (nếu checklist có yêu cầu).",
        ],
        tip: "Nếu robot có di chuyển: đảm bảo không lệch bánh/khựng, quan sát an toàn xung quanh khi thử.",
      },
      {
        title: "Bước 5: Đối chiếu theo checklist từng mục",
        desc: [
          "Vào tab “Cần bạn kiểm tra” để xem các mục quan trọng (FAIL/MUST-PASS được ưu tiên).",
          "Ở mỗi mục: đọc “HƯỚNG DẪN BẠN KIỂM TRA” + “Gợi ý đối chiếu”.",
          "Nếu có “Ghi chú Tech Staff”: đọc kỹ để hiểu tình trạng đã xử lý/đã xác nhận.",
        ],
        tip: anyEvidence
          ? "Checklist có evidence — hãy mở evidence để đối chiếu nhanh trước khi xác nhận."
          : "Chưa có evidence: nếu bạn phát hiện vấn đề, hãy ghi chú rõ (và yêu cầu Tech bổ sung evidence).",
      },
      {
        title: "Bước 6: Ghi chú & xác nhận",
        desc: [
          "Nếu bạn đồng ý: có thể ghi ngắn gọn ‘Đã kiểm tra và đồng ý’ rồi nhấn “ACCEPT CHECKLIST”.",
          "Nếu có điểm chưa rõ: ghi chú cụ thể (vị trí/triệu chứng) để làm căn cứ sau này.",
          "Nếu có MUST-PASS FAIL: KHÔNG nên xác nhận — liên hệ Tech Staff để xử lý.",
        ],
        tip: "Sau khi xác nhận, hệ thống sẽ ghi nhận thời điểm xác nhận của bạn.",
      },
    ];
  }, [items, evidences]);

  const currentStep = instructionSteps[Math.min(Math.max(instructionStep, 0), instructionSteps.length - 1)];

  const openInstruction = () => {
    setInstructionStep(0);
    setInstructionOpen(true);
  };
  const closeInstruction = () => setInstructionOpen(false);

  // ESC / Arrow keys
  useEffect(() => {
    if (!instructionOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeInstruction();
      if (e.key === "ArrowRight") setInstructionStep((s) => Math.min(s + 1, instructionSteps.length - 1));
      if (e.key === "ArrowLeft") setInstructionStep((s) => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [instructionOpen, instructionSteps.length]);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="mx-auto w-full max-w-[1000px] px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-3 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Form hướng dẫn kiểm tra robot (Customer)
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Xem hướng dẫn kiểm tra nhanh, đối chiếu với kết quả Tech Staff, rồi nhấn <b>Xác nhận</b>.
            </p>

            {/* ===== NEW: BIG Instruction button (ONLY ADD) ===== */}
            <button
              type="button"
              onClick={openInstruction}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-extrabold text-white shadow-sm ring-2 ring-indigo-700 hover:bg-indigo-700"
            >
              <BookOpen className="h-5 w-5" />
              INSTRUCTION — XEM TỪNG BƯỚC KIỂM TRA
            </button>

            {checklist?.overallResult === 1 && (
              <div className="mt-4 rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-extrabold text-emerald-900 ring-2 ring-emerald-300">
                ✅ Kết luận Tech Staff: TẤT CẢ ĐẠT (PASS)
              </div>
            )}
            {checklist?.overallResult === 2 && (
              <div className="mt-4 rounded-2xl bg-rose-100 px-4 py-3 text-sm font-extrabold text-rose-900 ring-2 ring-rose-300">
                ❌ Kết luận Tech Staff: CÓ MỤC FAIL — vui lòng xem kỹ “Cần bạn kiểm tra”
              </div>
            )}

{isAccepted && (
  <div className="mt-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white ring-2 ring-slate-900">
    ✅ Bạn đã xác nhận lúc: {formatDateTimeVN(checklist?.customerAcceptedAt)}
  </div>
)}

          </div>

          {/* Summary */}
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200 min-w-[320px]">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ClipboardCheck className="h-4 w-4 text-slate-400" />
              Tóm tắt
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <div className="text-xs text-slate-500">Delivery</div>
                <div className="text-lg font-extrabold text-slate-900">
                  #{resolvedActualId ?? actualId}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                <div className="text-xs text-slate-500">ChecklistNo</div>
                <div className="text-sm font-bold text-slate-900">
                  {checklist?.checklistNo ?? "—"}
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-200">
                <div className="text-xs text-emerald-800">PASS</div>
                <div className="text-xl font-bold text-emerald-700">{stats.pass}</div>
              </div>
              <div className="rounded-xl bg-rose-50 p-3 ring-1 ring-rose-200">
                <div className="text-xs text-rose-800">FAIL</div>
                <div className="text-xl font-bold text-rose-700">{stats.fail}</div>
              </div>
            </div>

            {checklist && (
              <div className="mt-4 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 text-xs text-slate-700 space-y-1">
                <div><b>CheckedAt:</b> {checklist.checkedAt ?? "—"}</div>
                <div><b>Overall note:</b> {checklist.overallNote ?? "—"}</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 h-px w-full bg-slate-200" />

        {/* Main */}
        <div className="mt-6 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          {/* Top bar: tabs + filters */}
          <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("verify")}
                className={cls(
                  "rounded-xl px-4 py-2 text-sm font-extrabold ring-2 transition",
                  activeTab === "verify"
                    ? "bg-slate-900 text-white ring-slate-900"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                )}
              >
                Cần bạn kiểm tra
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("staff")}
                className={cls(
                  "rounded-xl px-4 py-2 text-sm font-extrabold ring-2 transition",
                  activeTab === "staff"
                    ? "bg-slate-900 text-white ring-slate-900"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                )}
              >
                Tech staff đã kiểm
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-2 font-bold text-slate-700 ring-1 ring-slate-200">
                <Filter className="h-4 w-4" /> Lọc
              </span>

              <button
                type="button"
                onClick={() => setOnlyFail((v) => !v)}
                className={cls(
                  "rounded-full px-3 py-2 font-extrabold ring-2 transition",
                  onlyFail ? "bg-rose-600 text-white ring-rose-700" : "bg-white text-slate-700 ring-slate-200"
                )}
              >
                Chỉ FAIL
              </button>

              <button
                type="button"
                onClick={() => setOnlyHasEvidence((v) => !v)}
                className={cls(
                  "rounded-full px-3 py-2 font-extrabold ring-2 transition",
                  onlyHasEvidence ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200"
                )}
              >
                Có evidence
              </button>

              <button
                type="button"
                onClick={() => setOnlyMustPass((v) => !v)}
                className={cls(
                  "rounded-full px-3 py-2 font-extrabold ring-2 transition",
                  onlyMustPass ? "bg-amber-600 text-white ring-amber-700" : "bg-white text-slate-700 ring-slate-200"
                )}
              >
                Must-pass
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100" />

          {loading ? (
            <div className="flex items-center gap-2 px-6 py-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải...
            </div>
          ) : !checklist ? (
            <div className="px-6 py-10 text-sm text-slate-500">Không tìm thấy checklist.</div>
          ) : items.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-500">Checklist không có item.</div>
          ) : activeTab === "verify" ? (
            <div className="px-6 py-6 space-y-3">
              {verifyList.map(({ it, evCount }) => {
                const status = staffResultLabel(it.result);
                const evs = evidenceByItemId.get(it.id) ?? [];
                const expanded = true;

                return (
                  <div
                    key={it.id}
                    className={cls(
                      "rounded-2xl border p-4",
                      it.result === 2 ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-white"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-extrabold text-slate-900">{it.label}</div>

                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                            {it.key}
                          </span>

                          {it.mustPassToDispatch && (
                            <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[11px] font-extrabold text-white ring-1 ring-amber-700">
                              MUST-PASS
                            </span>
                          )}

                          <span className={cls("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-extrabold ring-1", status.badge)}>
                            {status.icon}
                            Tech: {status.text}
                          </span>

                          {evCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-extrabold text-white ring-1 ring-slate-900">
                              <Eye className="h-4 w-4" />
                              {evCount} evidence
                            </span>
                          )}
                        </div>

                        {/* instruction */}
                        <div className="mt-2 rounded-xl bg-white/70 p-3 ring-1 ring-slate-200">
                          <div className="text-[11px] font-extrabold text-slate-500">HƯỚNG DẪN BẠN KIỂM TRA</div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">• {buildCustomerInstruction(it)}</div>
                          <div className="mt-1 text-xs text-slate-600">
                            • Gợi ý đối chiếu: <span className="font-bold">{compactValue(it)}</span>
                          </div>
                        </div>

                        {it.note && (
                          <div className="mt-2 rounded-xl bg-white/70 p-3 ring-1 ring-slate-200">
                            <div className="text-[11px] font-extrabold text-slate-500">GHI CHÚ TECH STAFF</div>
                            <div className="mt-1 text-sm font-semibold text-slate-900">{it.note}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* evidence section */}
                    {expanded && (
                      <div className="mt-3">
                        {evs.length === 0 ? (
                          <div className="rounded-xl bg-white/70 p-3 text-xs text-slate-600 ring-1 ring-slate-200">Chưa có evidence.</div>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {evs.map((ev, idx) => {
                              const video = ev.type === 2 || isVideoUrl(ev.url);
                              return (
                                <a
                                  key={`${ev.url}-${idx}`}
                                  href={ev.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="group overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 hover:ring-slate-300"
                                >
                                  <div className="relative aspect-video w-full bg-slate-100">
                                    {video ? (
                                      <div className="flex h-full w-full items-center justify-center text-slate-500">
                                        <PlayCircle className="h-10 w-10" />
                                      </div>
                                    ) : (
                                      <img
                                        src={ev.url}
                                        alt={ev.fileName ?? "evidence"}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                      />
                                    )}
                                    <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-extrabold text-white">
                                      {video ? <PlayCircle className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                                      {video ? "VIDEO" : "PHOTO"}
                                    </div>
                                  </div>
                                  <div className="px-4 py-3">
                                    <div className="text-xs font-bold text-slate-900 line-clamp-1">{ev.fileName ?? "Evidence"}</div>
                                    <div className="mt-1 text-[11px] text-slate-500">Bấm để mở xem</div>
                                  </div>
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {verifyList.length === 0 && (
                <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600 ring-1 ring-slate-200">
                  Không có mục nào theo bộ lọc hiện tại.
                </div>
              )}
            </div>
          ) : (
            // STAFF TAB (simple grouped list)
            <div className="px-6 py-6 space-y-8">
              {staffListGrouped.map(({ category, list }) => (
                <div key={category}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-extrabold uppercase tracking-wide text-slate-900">{category}</div>
                    <div className="text-xs text-slate-500">{list.length} mục</div>
                  </div>

                  <div className="space-y-2">
                    {list.map((it) => {
                      const status = staffResultLabel(it.result);
                      const evCount = (evidenceByItemId.get(it.id) ?? []).length;

                      return (
                        <div
                          key={it.id}
                          className={cls(
                            "flex items-start justify-between gap-3 rounded-2xl border p-4",
                            it.result === 2 ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-white"
                          )}
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="text-sm font-bold text-slate-900">{it.label}</div>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200">
                                {it.key}
                              </span>
                              {it.mustPassToDispatch && (
                                <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[11px] font-extrabold text-white ring-1 ring-amber-700">
                                  MUST-PASS
                                </span>
                              )}
                              <span className={cls("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-extrabold ring-1", status.badge)}>
                                {status.icon}
                                {status.text}
                              </span>
                              {evCount > 0 && (
                                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-extrabold text-white ring-1 ring-slate-900">
                                  {evCount} evidence
                                </span>
                              )}
                            </div>

                            <div className="mt-1 text-xs text-slate-600">
                              Đối chiếu: <span className="font-bold text-slate-900">{compactValue(it)}</span>
                            </div>

                            {it.note && (
                              <div className="mt-2 text-xs text-slate-700">
                                <b>Note:</b> {it.note}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== NEW: Instruction Modal Popup (ONLY ADD) ===== */}
      {instructionOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeInstruction();
          }}
        >
          <div className="w-full max-w-[720px] rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-700 ring-1 ring-indigo-200">
                  <BookOpen className="h-4 w-4" />
                  INSTRUCTION
                </div>
                <h3 className="mt-2 text-lg font-extrabold text-slate-900">{currentStep?.title ?? "Hướng dẫn kiểm tra"}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Bước {instructionStep + 1}/{instructionSteps.length} • Dùng phím ← → để chuyển bước • ESC để đóng
                </p>
              </div>

              <button
                type="button"
                onClick={closeInstruction}
                className="rounded-2xl bg-slate-50 p-2 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                aria-label="Close"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="text-xs font-extrabold text-slate-600">CẦN LÀM</div>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm font-semibold text-slate-900">
                  {currentStep?.desc?.map((x: string, idx: number) => (
                    <li key={idx}>{x}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
                <div className="text-xs font-extrabold text-amber-800">GỢI Ý</div>
                <div className="mt-2 text-sm font-semibold text-amber-900">{currentStep?.tip ?? "—"}</div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInstructionStep((s) => Math.max(s - 1, 0))}
                    disabled={instructionStep === 0}
                    className={cls(
                      "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold ring-2 transition",
                      instructionStep === 0
                        ? "bg-slate-100 text-slate-400 ring-slate-200 cursor-not-allowed"
                        : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </button>

                  <button
                    type="button"
                    onClick={() => setInstructionStep((s) => Math.min(s + 1, instructionSteps.length - 1))}
                    disabled={instructionStep === instructionSteps.length - 1}
                    className={cls(
                      "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold ring-2 transition",
                      instructionStep === instructionSteps.length - 1
                        ? "bg-slate-100 text-slate-400 ring-slate-200 cursor-not-allowed"
                        : "bg-slate-900 text-white ring-slate-900 hover:bg-slate-800"
                    )}
                  >
                    Tiếp
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInstructionStep(0)}
                    className="rounded-2xl bg-white px-4 py-2 text-sm font-extrabold text-slate-700 ring-2 ring-slate-200 hover:bg-slate-50"
                  >
                    Về bước 1
                  </button>
                  <button
                    type="button"
                    onClick={closeInstruction}
                    className="rounded-2xl bg-indigo-600 px-5 py-2 text-sm font-extrabold text-white ring-2 ring-indigo-700 hover:bg-indigo-700"
                  >
                    Đã hiểu
                  </button>
                </div>
              </div>

              {/* Step dots */}
              <div className="mt-5 flex flex-wrap gap-2">
                {instructionSteps.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInstructionStep(idx)}
                    className={cls(
                      "h-2.5 w-10 rounded-full ring-1 transition",
                      idx === instructionStep ? "bg-indigo-600 ring-indigo-700" : "bg-slate-200 ring-slate-300 hover:bg-slate-300"
                    )}
                    aria-label={`Step ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky accept bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1000px] flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="text-xs font-extrabold text-slate-700">Ghi chú của bạn (tuỳ chọn)</div>
            <input
              disabled={isAccepted}
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Ví dụ: Tôi đã kiểm tra và đồng ý..."
              className={cls(
                "mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-900 ring-2 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500",
                isAccepted && "bg-slate-100 text-slate-500 cursor-not-allowed"
              )}
            />
          </div>

          <button
            type="button"
            disabled={!canAccept || accepting}
            onClick={handleAccept}
            className={cls(
              "shrink-0 rounded-xl px-6 py-3 text-sm font-extrabold ring-2 transition",
              canAccept && !accepting
                ? "bg-slate-900 text-white ring-slate-900 hover:bg-slate-800"
                : "bg-slate-100 text-slate-400 ring-slate-200 cursor-not-allowed"
            )}
            title={
              isAccepted
                ? "Bạn đã xác nhận rồi"
                : !customerAccountId
                ? "Bạn cần đăng nhập"
                : items.some((x) => x.result === 0)
                ? "Checklist chưa đủ kết quả"
                : ""
            }
          >
            {isAccepted ? "✅ ĐÃ XÁC NHẬN" : accepting ? "ĐANG XÁC NHẬN..." : "ACCEPT CHECKLIST"}
          </button>
        </div>
      </div>
    </div>
  );
}
