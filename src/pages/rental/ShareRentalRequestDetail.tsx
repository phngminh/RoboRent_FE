// ===== FULL UPDATED ShareRentalRequestDetail.tsx =====

import {
  Clock,
  Phone,
  Mail,
  User,
  Hash,
  Calendar,
  PenSquare,
  ArrowLeft,
  MapPin,
  Edit3,
  Save,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getRentalByIdAsync,
  staffRequestUpdateRentalAsync,
} from "../../apis/rental.staff.api";
import {
  getRentalDetailsByRentalIdAsync,
  updateRentalDetailsAsync,
} from "../../apis/rentaldetail.api";
import { getGroupScheduleByRentalIdForCustomerAsync } from "../../apis/groupSchedule.customer.api";
import { useAuth } from "../../contexts/AuthContext";

// ✅ fetch schema abilities by activity type
import { getRobotTypesOfActivityAsync } from "../../apis/robottypeofactivity.api";

// ✅ customer update rental
import { customerUpdateRentalAsync } from "../../apis/rental.customer.api";

// ✅ reuse same form component (read-only / editable)
import { RobotAbilityCardForm } from "../../components/robot-config/RobotAbilityCardForm";
import type { RobotAbility } from "../../components/robot-config/AbilityField";

// ✅ IMPORTANT (for image abilities)
import { commitPendingImagesToCloudinary } from "../../components/robot-config/AbilityField";

// ✅ ActivityType + Address (RESTORED)
import { getActivityTypeByEAIdAsync } from "../../apis/activitytype.api";
import { getAllProvincesAsync, getAllWardsAsync } from "../../apis/address.api";

interface ShareRentalRequestDetailProps {
  onBack: () => void;
  onNavigateToScheduleBoard?: (groupId: number) => void;
}

type AbilityValueResponse = {
  id: number;
  rentalDetailId: number;
  robotAbilityId: number;
  valueText: string | null;
  valueJson: string | null;
  updatedAt?: string;
  isUpdated?: boolean;
};

type AbilityValueMap = Record<string, any>;

// ===== ActivityType =====
interface ActivityType {
  id: number;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  minimumMinutes?: number;
  // optional extra fields if BE returns them
  typeName?: string;
  activityTypeName?: string;
  depositPercent?: number;
  depositAmount?: number;
  extraFeePerHour?: number;
  maxRobots?: number;
}

export default function ShareRentalRequestDetail({
  onBack,
  onNavigateToScheduleBoard,
}: ShareRentalRequestDetailProps) {
  const { user } = useAuth();
  const userRole = user?.role;

  const { rentalId: rentalIdString } = useParams<{ rentalId: string }>();
  const rentalId = rentalIdString ? parseInt(rentalIdString, 10) : 0;

  const [rental, setRental] = useState<any>(null);
  const [rentalDetails, setRentalDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const detailRef = useRef<HTMLDivElement | null>(null);

  // Grouping state
  const [grouped, setGrouped] = useState<any[]>([]);
  const [activeType, setActiveType] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  // schema abilities for each roboTypeId
  const [abilitiesByType, setAbilitiesByType] = useState<Record<number, RobotAbility[]>>({});

  const [schedule, setSchedule] = useState<any | null>(null);
  const scheduleRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<"details" | "schedule">("details");

  // =======================
  // ✅ EDIT MODE
  // =======================
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // error UI (only for rental main fields + API errors)
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});

  const FieldError = ({ name }: { name: string }) => {
    if (!fieldErrors[name]?.length) return null;
    return <p className="text-red-600 text-xs mt-1 ml-1">{fieldErrors[name][0]}</p>;
  };

  // Rental draft (editable fields)
  const [rentalDraft, setRentalDraft] = useState<any>({
    eventName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    description: "",
    eventDate: "",
    startTime: "",
    endTime: "",
  });

  // Draft values per RentalDetailId
  const [configDraftByDetailId, setConfigDraftByDetailId] = useState<Record<number, AbilityValueMap>>(
    {}
  );

  // ✅ baseline snapshot to detect changes (no create logic)
  const [initialConfigByDetailId, setInitialConfigByDetailId] = useState<Record<number, AbilityValueMap>>(
    {}
  );

  const canCustomerEdit = useMemo(() => {
    const status = String(rental?.status ?? "");
    return userRole === "customer" && status === "AcceptedPriceQuote";
  }, [userRole, rental?.status]);

  // =======================
  // ✅ RESTORED: ActivityType & Address states
  // =======================
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);

  interface Province {
    code: number;
    name: string;
  }
  interface Ward {
    code: number;
    name: string;
    province_code: number;
  }

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | "">("");
  const [selectedWardId, setSelectedWardId] = useState<number | "">("");

  // ---------------- helpers ----------------
  const formatMoney = (v: any, currency = "VND") => {
    const n = Number(v);
    if (!Number.isFinite(n)) return v ?? "";
    try {
      return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(n);
    } catch {
      return `${n.toLocaleString("vi-VN")} ${currency}`;
    }
  };

  const formatMinutes = (m: any) => {
    const n = Number(m);
    if (!Number.isFinite(n)) return m ?? "";
    const hours = Math.floor(n / 60);
    const mins = n % 60;
    if (hours <= 0) return `${mins} phút`;
    if (mins === 0) return `${hours} giờ`;
    return `${hours} giờ ${mins} phút`;
  };

  // ---- time/date validate (only) ----
  const normalizeTime = (t?: string) => (t || "").trim().slice(0, 5);
  const isValidTimeHHmm = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
  const toMinutes = (t: string) => {
    const [hh, mm] = t.split(":").map(Number);
    return hh * 60 + mm;
  };

  const validateTimeAndDateOnly = () => {
    const fe: { [key: string]: string[] } = {};

    const date = (rentalDraft.eventDate || "").trim();
    const start = normalizeTime(rentalDraft.startTime);
    const end = normalizeTime(rentalDraft.endTime);

    if (!date) fe.eventDate = ["Event Date is required."];

    if (!start) fe.startTime = ["Start Time is required."];
    else if (!isValidTimeHHmm(start))
      fe.startTime = ['Invalid time format. Use "HH:mm" (e.g., 09:30).'];

    if (!end) fe.endTime = ["End Time is required."];
    else if (!isValidTimeHHmm(end))
      fe.endTime = ['Invalid time format. Use "HH:mm" (e.g., 18:00).'];

    if (!fe.startTime && !fe.endTime) {
      if (toMinutes(end) <= toMinutes(start)) {
        fe.endTime = ["End Time must be after Start Time."];
      }
    }

    setFieldErrors(fe);
    return Object.keys(fe).length === 0;
  };

  // ---- config value helpers ----
  const safeJsonParse = (text?: string | null) => {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const parseStoredAbilityValue = (ability: RobotAbility, av?: AbilityValueResponse) => {
    if (!av) return undefined;

    const dt = (ability.dataType || "").toLowerCase();
    const ui = (ability.uiControl || "").toLowerCase();

    if (av.valueJson != null && av.valueJson !== "") {
      if (dt === "enum[]" || ui === "multiselect") {
        const parsed = safeJsonParse(av.valueJson);
        return Array.isArray(parsed) ? parsed : [];
      }

      if (dt === "json" || ui === "jsoneditor") {
        const parsed = safeJsonParse(av.valueJson);
        return parsed != null ? JSON.stringify(parsed, null, 2) : av.valueJson;
      }

      const parsed = safeJsonParse(av.valueJson);
      return parsed ?? av.valueJson;
    }

    if (av.valueText == null) return null;

    if (dt === "bool" || ui === "switch") {
      const t = av.valueText.trim().toLowerCase();
      return t === "true" || t === "1" || t === "yes";
    }

    if (dt === "number" || dt === "int" || dt === "integer") {
      const n = Number(av.valueText);
      return Number.isFinite(n) ? n : av.valueText;
    }

    return av.valueText;
  };

  const buildConfigValuesFromAbilityResponses = (
    abilities: RobotAbility[],
    responses: AbilityValueResponse[] | null | undefined
  ): AbilityValueMap => {
    const mapById = new Map<number, AbilityValueResponse>();
    (responses || []).forEach((r) => mapById.set(r.robotAbilityId, r));

    const raw: AbilityValueMap = {};
    abilities
      .filter((a) => a.isActive !== false)
      .forEach((a) => {
        const av = mapById.get(a.id);
        const v = parseStoredAbilityValue(a, av);
        if (v !== undefined) raw[a.key] = v;
      });

    return raw;
  };

  const initDefaults = (abilities: RobotAbility[], current?: AbilityValueMap) => {
    const next: AbilityValueMap = { ...(current || {}) };

    abilities
      .filter((a) => a.isActive !== false)
      .forEach((a) => {
        if (next[a.key] !== undefined) return;

        const dt = (a.dataType || "").toLowerCase();
        const ui = (a.uiControl || "").toLowerCase();

        if (dt === "bool" || ui === "switch") next[a.key] = false;
        else if (dt === "enum[]" || ui === "multiselect") next[a.key] = [];
        else next[a.key] = "";
      });

    return next;
  };

  const toAbilityValuePayload = (ability: RobotAbility, v: any) => {
    const dt = (ability.dataType || "").toLowerCase();
    const ui = (ability.uiControl || "").toLowerCase();

    if (dt === "json" || ui === "jsoneditor") {
      if (v === null || v === undefined || v === "")
        return { valueText: null as string | null, valueJson: null as string | null };

      if (typeof v === "string") {
        const rawText = v.trim();
        if (!rawText) return { valueText: null, valueJson: null };
        try {
          const parsed = JSON.parse(rawText);
          return { valueText: null, valueJson: JSON.stringify(parsed) };
        } catch {
          return { valueText: null, valueJson: rawText };
        }
      }

      return { valueText: null, valueJson: JSON.stringify(v) };
    }

    if (dt === "enum[]" || ui === "multiselect") {
      const arr = Array.isArray(v) ? v : [];
      return { valueText: null, valueJson: JSON.stringify(arr) };
    }

    if (dt === "bool" || ui === "switch") {
      return { valueText: String(!!v), valueJson: null };
    }

    if (dt === "number" || dt === "int" || dt === "integer") {
      if (v === "" || v === null || v === undefined) return { valueText: null, valueJson: null };
      return { valueText: String(v), valueJson: null };
    }

    if (v === "" || v === null || v === undefined) return { valueText: null, valueJson: null };
    return { valueText: String(v), valueJson: null };
  };

  function splitAbilitiesIntoUiSections(abilities: RobotAbility[]) {
    const normalize = (s?: string | null) => (s || "").trim().toLowerCase();

    const branding: RobotAbility[] = [];
    const welcome: RobotAbility[] = [];
    const cta: RobotAbility[] = [];
    const other: RobotAbility[] = [];

    for (const a of abilities) {
      const g = normalize(a.abilityGroup);
      const k = normalize(a.key);
      const l = normalize(a.label);
      const text = `${g} ${k} ${l}`;

      if (
        g.includes("brand") ||
        g.includes("ui") ||
        text.includes("logo") ||
        text.includes("theme")
      ) {
        branding.push(a);
        continue;
      }
      if (g.includes("welcome") || text.includes("welcome") || text.includes("greeting")) {
        welcome.push(a);
        continue;
      }
      if (g.includes("cta") || g.includes("qr") || text.includes("cta") || text.includes("qr")) {
        cta.push(a);
        continue;
      }

      other.push(a);
    }

    if (branding.length === 0 && welcome.length === 0 && cta.length === 0 && other.length > 0) {
      return { branding: other, welcome: [], cta: [], other: [] };
    }

    return { branding, welcome, cta, other };
  }

  // =======================
  // ✅ CHANGE DETECTION HELPERS (for update only)
  // =======================
  const deepClone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

  const deepEqual = (a: any, b: any) => {
    if (a === b) return true;
    if (a == null || b == null) return a == b;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
      return true;
    }

    if (typeof a === "object" && typeof b === "object") {
      const ak = Object.keys(a);
      const bk = Object.keys(b);
      if (ak.length !== bk.length) return false;
      for (const k of ak) if (!deepEqual(a[k], b[k])) return false;
      return true;
    }

    return false;
  };

  const normalizeForCompare = (ability: RobotAbility, v: any) => {
    const dt = (ability.dataType || "").toLowerCase();
    const ui = (ability.uiControl || "").toLowerCase();

    if (v === "") v = null;

    if (dt === "enum[]" || ui === "multiselect") {
      const arr = Array.isArray(v) ? v : [];
      return [...arr].map(String).sort();
    }

    if (dt === "number" || dt === "int" || dt === "integer") {
      if (v == null) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : String(v);
    }

    if (dt === "bool" || ui === "switch") return !!v;

    if (dt === "json" || ui === "jsoneditor") {
      if (v == null) return null;
      if (typeof v === "string") {
        const t = v.trim();
        if (!t) return null;
        try {
          return JSON.stringify(JSON.parse(t));
        } catch {
          return t;
        }
      }
      try {
        return JSON.stringify(v);
      } catch {
        return String(v);
      }
    }

    if (v == null) return null;
    return String(v).trim();
  };

  const isAbilityChanged = (ability: RobotAbility, current: any, initial: any) => {
    const a = normalizeForCompare(ability, current);
    const b = normalizeForCompare(ability, initial);
    return !deepEqual(a, b);
  };

  // =======================
  // ✅ Address helpers (RESTORED)
  // =======================
  const parseAddress = (addr?: string) => {
    if (!addr) return { street: "", wardName: "" };
    const parts = addr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length <= 1) return { street: addr, wardName: "" };
    return {
      street: parts.slice(0, -1).join(", "),
      wardName: parts[parts.length - 1],
    };
  };

  const buildFullAddress = () => {
    const ward =
      wards.find((w) => w.code === selectedWardId)?.name ||
      wards.find((w) => String(w.code) === String(selectedWardId))?.name ||
      "";
    const street = (rentalDraft.address || "").trim();
    if (!street) return ward ? ward : "";
    return `${street}${ward ? `, ${ward}` : ""}`;
  };

  const loadSchedule = async () => {
    try {
      const res = await getGroupScheduleByRentalIdForCustomerAsync(rentalId);
      if (res.success) setSchedule(res.data);
    } catch (err) {
      console.error("Failed to load schedule:", err);
    }
  };

  // =======================
  // ✅ RESTORED: Load activity types
  // =======================
  useEffect(() => {
    (async () => {
      try {
        const res: any = await getActivityTypeByEAIdAsync();
        const list = (res?.data ?? res) as ActivityType[];
        setActivityTypes(Array.isArray(list) ? list : []);
      } catch (e) {
        console.warn("Failed to load activity types:", e);
        setActivityTypes([]);
      }
    })();
  }, []);

  // =======================
  // ✅ RESTORED: Load provinces
  // =======================
  useEffect(() => {
    (async () => {
      try {
        const res: any = await getAllProvincesAsync();
        const list = (res?.data ?? res) as Province[];
        setProvinces(Array.isArray(list) ? list : []);
      } catch (e) {
        console.warn("Failed to load provinces:", e);
        setProvinces([]);
      }
    })();
  }, []);

  // =======================
  // ✅ RESTORED: Load wards when province changes
  // =======================
  useEffect(() => {
    if (!selectedProvinceId) {
      setWards([]);
      setSelectedWardId("");
      return;
    }

    (async () => {
      try {
        const res: any = await getAllWardsAsync();
        const list = (res?.data ?? res) as Ward[];
        setWards(Array.isArray(list) ? list : []);
      } catch (e) {
        console.warn("Failed to load wards:", e);
        setWards([]);
      }
    })();
  }, [selectedProvinceId]);

  // =======================
  // FETCH RENTAL & DETAILS + ABILITY SCHEMA
  // =======================
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);

        const rentalRes = await getRentalByIdAsync(rentalId);
        const rentalObj = (rentalRes as any)?.data ?? rentalRes;
        setRental(rentalObj);

        if (rentalObj?.activityTypeId) {
          try {
            const mapping = await getRobotTypesOfActivityAsync(rentalObj.activityTypeId);
            const dict: Record<number, RobotAbility[]> = {};
            (mapping || []).forEach((m: any) => {
              dict[m.roboTypeId] = (m.robotAbilityResponses || []) as RobotAbility[];
            });
            setAbilitiesByType(dict);
          } catch (e) {
            console.warn("Failed to load robot ability schema:", e);
            setAbilitiesByType({});
          }
        }

        const detailRes = await getRentalDetailsByRentalIdAsync(rentalId);
        if (detailRes.success) setRentalDetails(detailRes.data);
      } catch (err) {
        console.error("Failed to load rental detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [rentalId]);

  // =======================
  // GROUP DETAILS BY ROBOT TYPE
  // =======================
  useEffect(() => {
    if (rentalDetails.length === 0) return;

    const map: Record<number, any[]> = {};
    rentalDetails.forEach((d) => {
      if (!map[d.roboTypeId]) map[d.roboTypeId] = [];
      map[d.roboTypeId].push(d);
    });

    const groups = Object.keys(map).map((id) => ({
      roboTypeId: Number(id),
      robotTypeName: map[Number(id)][0].robotTypeName,
      robotTypeDescription: map[Number(id)][0].robotTypeDescription,
      items: map[Number(id)],
    }));

    setGrouped(groups);
    setActiveType((prev) => prev ?? (groups[0]?.roboTypeId ?? null));
    setPage(0);
  }, [rentalDetails]);

  // =======================
  // MEMOS (restore your ActivityType info)
  // =======================
  const createdDate = useMemo(
    () => (rental?.createdDate ? new Date(rental.createdDate).toLocaleDateString() : ""),
    [rental?.createdDate]
  );
  const updatedDate = useMemo(
    () => (rental?.updatedDate ? new Date(rental.updatedDate).toLocaleDateString() : ""),
    [rental?.updatedDate]
  );
  const eventDateDisplay = useMemo(
    () => (rental?.eventDate ? new Date(rental.eventDate).toLocaleDateString() : ""),
    [rental?.eventDate]
  );

  const activity = useMemo(() => {
    const embedded =
      rental?.activityTypeResponse ??
      rental?.activityType ??
      rental?.activityTypeDto ??
      rental?.activityTypeInfo ??
      null;

    if (embedded) return embedded;

    const found = activityTypes.find((a) => a.id === rental?.activityTypeId);
    return found ?? null;
  }, [rental, activityTypes]);

  const activityName = useMemo(() => {
    return (
      rental?.activityTypeName ??
      activity?.typeName ??
      activity?.name ??
      activity?.activityTypeName ??
      "—"
    );
  }, [rental?.activityTypeName, activity]);

  const currency = useMemo(() => activity?.currency ?? "VND", [activity]);

  const activityExtraRows = useMemo(() => {
    if (!activity) return [];

    const rows: { label: string; value: any; icon?: React.ReactNode }[] = [];

    if (activity.id != null)
      rows.push({
        label: "Activity Type ID",
        value: activity.id,
        icon: <Hash size={16} className="text-green-600" />,
      });

    if (activity.description)
      rows.push({
        label: "Description",
        value: activity.description,
        icon: <PenSquare size={16} className="text-indigo-600" />,
      });

    if (activity.price != null)
      rows.push({
        label: "Package price",
        value: formatMoney(activity.price, currency),
        icon: <Hash size={16} className="text-indigo-600" />,
      });

    if (activity.minimumMinutes != null)
      rows.push({
        label: "Minimum duration",
        value: formatMinutes(activity.minimumMinutes),
        icon: <Clock size={16} className="text-indigo-600" />,
      });

    if (activity.depositPercent != null)
      rows.push({
        label: "Deposit (%)",
        value: `${activity.depositPercent}%`,
        icon: <Hash size={16} className="text-indigo-600" />,
      });

    if (activity.depositAmount != null)
      rows.push({
        label: "Deposit amount",
        value: formatMoney(activity.depositAmount, currency),
        icon: <Hash size={16} className="text-indigo-600" />,
      });

    if (activity.extraFeePerHour != null)
      rows.push({
        label: "Extra fee / hour",
        value: formatMoney(activity.extraFeePerHour, currency),
        icon: <Hash size={16} className="text-indigo-600" />,
      });

    if (activity.maxRobots != null)
      rows.push({
        label: "Max robots",
        value: activity.maxRobots,
        icon: <Hash size={16} className="text-indigo-600" />,
      });

    return rows;
  }, [activity, currency]);

  const currentGroup = useMemo(
    () => grouped.find((g) => g.roboTypeId === activeType) ?? null,
    [grouped, activeType]
  );
  const currentItem = useMemo(
    () => (currentGroup ? currentGroup.items?.[page] ?? null : null),
    [currentGroup, page]
  );

  const currentAbilities = useMemo(() => {
    if (!currentItem) return [];
    return (abilitiesByType[currentItem.roboTypeId] || []).filter((a) => a.isActive !== false);
  }, [currentItem, abilitiesByType]);

  const currentConfigValues = useMemo(() => {
    if (!currentItem) return {};
    if (isEditing && currentItem.id && configDraftByDetailId[currentItem.id]) {
      return configDraftByDetailId[currentItem.id];
    }

    const raw = buildConfigValuesFromAbilityResponses(
      currentAbilities,
      (currentItem.robotAbilityValueResponses || []) as AbilityValueResponse[]
    );
    return initDefaults(currentAbilities, raw);
  }, [currentItem, currentAbilities, isEditing, configDraftByDetailId]);

  const currentSections = useMemo(() => splitAbilitiesIntoUiSections(currentAbilities), [
    currentAbilities,
  ]);

  // =======================
  // EDIT MODE HELPERS
  // =======================
  const beginEdit = () => {
    if (!rental) return;

    setErrors([]);
    setFieldErrors({});
    setIsEditing(true);

    const { street, wardName } = parseAddress(rental.address);

    setRentalDraft({
      eventName: rental.eventName ?? "",
      email: rental.email ?? "",
      phoneNumber: rental.phoneNumber ?? "",
      address: street,
      city: rental.city ?? "",
      description: rental.description ?? "",
      eventDate: rental.eventDate ? String(rental.eventDate).slice(0, 10) : "",
      startTime: (rental.startTime || "").slice(0, 5),
      endTime: (rental.endTime || "").slice(0, 5),
    });

    const province = provinces.find((p) => p.name === rental.city);
    if (province) {
      setSelectedProvinceId(province.code);

      (async () => {
        try {
          const res: any = await getAllWardsAsync();
          const allWards = (res?.data ?? res) as Ward[];
          setWards(Array.isArray(allWards) ? allWards : []);

          const matched = (allWards || []).find(
            (w) => w.province_code === province.code && w.name === wardName
          );
          if (matched) setSelectedWardId(matched.code);
          else setSelectedWardId("");
        } catch (e) {
          console.warn("Failed to init wards:", e);
          setWards([]);
          setSelectedWardId("");
        }
      })();
    } else {
      setSelectedProvinceId("");
      setSelectedWardId("");
    }

    // ✅ build draft + baseline snapshot
    const nextDraft: Record<number, AbilityValueMap> = {};
    const nextInitial: Record<number, AbilityValueMap> = {};

    rentalDetails.forEach((d) => {
      const abilities = (abilitiesByType[d.roboTypeId] || []).filter((a) => a.isActive !== false);
      const raw = buildConfigValuesFromAbilityResponses(
        abilities,
        (d.robotAbilityValueResponses || []) as AbilityValueResponse[]
      );
      const normalized = initDefaults(abilities, raw);

      nextDraft[d.id] = normalized;
      nextInitial[d.id] = deepClone(normalized);
    });

    setConfigDraftByDetailId(nextDraft);
    setInitialConfigByDetailId(nextInitial);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setSaving(false);
    setErrors([]);
    setFieldErrors({});

    setSelectedProvinceId("");
    setSelectedWardId("");
    setWards([]);

    setRentalDraft({
      eventName: "",
      email: "",
      phoneNumber: "",
      address: "",
      city: "",
      description: "",
      eventDate: "",
      startTime: "",
      endTime: "",
    });

    setConfigDraftByDetailId({});
    setInitialConfigByDetailId({});
  };

  const updateDraftValue = (detailId: number, key: string, v: any) => {
    setConfigDraftByDetailId((prev) => {
      const current = prev[detailId] ?? {};
      return {
        ...prev,
        [detailId]: {
          ...current,
          [key]: v,
        },
      };
    });
  };

  // ✅ SAVE: update rental + update rental details (update-only workflow)
  const handleSaveUpdate = async () => {
    if (!validateTimeAndDateOnly()) return;

    try {
      setSaving(true);
      setErrors([]);
      setFieldErrors({});

      const nowIso = new Date().toISOString();

      const cityName = provinces.find((p) => p.code === selectedProvinceId)?.name || rentalDraft.city;

      // 1) update Rental main info
      const body: any = {
        id: rentalId,
        eventName: rentalDraft.eventName,
        phoneNumber: rentalDraft.phoneNumber,
        email: rentalDraft.email,
        description: rentalDraft.description,

        address: buildFullAddress(),
        city: cityName,

        startTime: normalizeTime(rentalDraft.startTime),
        endTime: normalizeTime(rentalDraft.endTime),
        updatedDate: nowIso,
        requestedDate: nowIso,
        eventDate: rentalDraft.eventDate ? new Date(rentalDraft.eventDate).toISOString() : null,

        // keep server-required fields stable
        isDeleted: rental?.isDeleted ?? false,
        status: rental?.status ?? "Draft",
        accountId: rental?.accountId ?? user?.accountId,
        activityTypeId: rental?.activityTypeId,
        createdDate: rental?.createdDate,
      };

      const rentalRes: any = await customerUpdateRentalAsync(body);

      if (rentalRes?.success === false && Array.isArray(rentalRes?.errors) && rentalRes.errors.length > 0) {
        setErrors(rentalRes.errors);
        return;
      }

      // 2) commit pending images (Cloudinary) per detail + build UPDATE payload only
      const payload: any[] = [];
      const committedMap: Record<number, AbilityValueMap> = {};

      for (const d of rentalDetails) {
        if (!d?.id) continue;

        const abilities = (abilitiesByType[d.roboTypeId] || []).filter((a) => a.isActive !== false);
        const draftValues = configDraftByDetailId[d.id] ?? {};
        const initialValues = initialConfigByDetailId[d.id] ?? {};

        const committedValues = await commitPendingImagesToCloudinary(abilities, draftValues, {
          folder: `event-assets/rental_${rentalId}/robotType_${d.roboTypeId}`,
        });

        committedMap[d.id] = deepClone(committedValues);

        // keep UI in sync (optional)
        setConfigDraftByDetailId((prev) => ({ ...prev, [d.id]: committedValues }));

        payload.push({
          id: d.id,
          isDeleted: !!d.isDeleted,
          status: d.status ?? "Draft",
          rentalId,
          roboTypeId: d.roboTypeId,
          isLocked: d.isLocked ?? false,

          // ✅ UPDATE ONLY (no create logic)
          updateRobotAbilityValueRequests: abilities.map((a) => {
            const v = committedValues?.[a.key];
            const { valueText, valueJson } = toAbilityValuePayload(a, v);

            const changed = isAbilityChanged(a, committedValues?.[a.key], initialValues?.[a.key]);

            return {
              rentalDetailId: d.id, // ✅ important for BE (safe even if BE ignores)
              robotAbilityId: a.id,
              valueText,
              valueJson,
              isUpdated: changed, // ✅ only true when changed
            };
          }),
        });
      }

      // 3) update rental details
      await updateRentalDetailsAsync(rentalId, payload);

      // ✅ after success, update baseline so next edit compares correctly
      setInitialConfigByDetailId((prev) => ({ ...prev, ...committedMap }));

      // 4) refresh details from server (optional but safer)
      const detailRes = await getRentalDetailsByRentalIdAsync(rentalId);
      if (detailRes.success) setRentalDetails(detailRes.data);

      // 5) update rental in UI
      setRental((prev: any) => ({
        ...prev,
        ...body,
        eventDate: body.eventDate,
        startTime: body.startTime,
        endTime: body.endTime,
      }));

      setIsEditing(false);
    } catch (err: any) {
      console.log("FE caught:", err?.response?.data);

      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setErrors(err.response.data.errors);
        return;
      }

      if (err?.response?.data?.message) {
        setErrors([err.response.data.message]);
        return;
      }

      if (err?.response?.data?.errors && typeof err.response.data.errors === "object") {
        const fe: any = {};
        for (const key in err.response.data.errors) {
          fe[key] = err.response.data.errors[key];
        }
        setFieldErrors(fe);
        return;
      }

      setErrors([err?.message || "Something went wrong. Please try again."]);
    } finally {
      setSaving(false);
    }
  };

  // =======================
  // LOADING / ERROR STATES
  // =======================
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading rental details...</p>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to load rental details.</p>
        <button onClick={onBack} className="text-blue-600 underline mt-2">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* BACK BUTTON */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
      >
        <ArrowLeft size={18} />
        Back to Requests
      </button>

      {/* PAGE TITLE */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">
          Rental Request: <span className="font-semibold">{rental.eventName}</span>
        </h1>

        {canCustomerEdit && (
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={beginEdit}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Edit3 size={16} />
                Edit
              </button>
            ) : (
              <>
                <button
                  disabled={saving}
                  onClick={handleSaveUpdate}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                    saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save"}
                </button>

                <button
                  disabled={saving}
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <X size={16} />
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ERROR PANEL */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-4 rounded-xl shadow-sm">
          <p className="font-semibold mb-2">Please fix the following issues:</p>
          <div className="space-y-1 text-sm">
            {errors.map((e, i) => (
              <p key={i}>• {e}</p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SECTION */}
        <div className="space-y-6 lg:col-span-1">
          {/* Rental Information */}
          <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Rental Information</h2>

            <div className="space-y-3 text-sm text-gray-700">
              {/* Event Name */}
              <div className="flex items-start gap-3">
                <PenSquare size={16} className="text-blue-600 mt-0.5" />
                <div className="w-full">
                  <div className="font-semibold">Event Name</div>
                  {!isEditing ? (
                    <div>{rental.eventName}</div>
                  ) : (
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={rentalDraft.eventName ?? ""}
                      onChange={(e) => setRentalDraft((p: any) => ({ ...p, eventName: e.target.value }))}
                    />
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-blue-600 mt-0.5" />
                <div className="w-full">
                  <div className="font-semibold">Email</div>
                  {!isEditing ? (
                    <div>{rental.email}</div>
                  ) : (
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={rentalDraft.email ?? ""}
                      onChange={(e) => setRentalDraft((p: any) => ({ ...p, email: e.target.value }))}
                    />
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-blue-600 mt-0.5" />
                <div className="w-full">
                  <div className="font-semibold">Phone</div>
                  {!isEditing ? (
                    <div>{rental.phoneNumber}</div>
                  ) : (
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={rentalDraft.phoneNumber ?? ""}
                      onChange={(e) => setRentalDraft((p: any) => ({ ...p, phoneNumber: e.target.value }))}
                    />
                  )}
                </div>
              </div>

              {/* ✅ Address (Street only in edit mode) */}
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-blue-600 mt-0.5" />
                <div className="w-full">
                  <div className="font-semibold">Street Address</div>
                  {!isEditing ? (
                    <div>{rental.address ?? "—"}</div>
                  ) : (
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={rentalDraft.address ?? ""}
                      onChange={(e) => setRentalDraft((p: any) => ({ ...p, address: e.target.value }))}
                    />
                  )}
                </div>
              </div>

              {/* ✅ Province + Ward (only in edit mode) */}
              {isEditing && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold">Province</label>
                    <select
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={selectedProvinceId}
                      onChange={(e) => setSelectedProvinceId(Number(e.target.value) || "")}
                    >
                      <option value="">Select province</option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold">Ward</label>
                    <select
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={selectedWardId}
                      onChange={(e) => setSelectedWardId(Number(e.target.value) || "")}
                      disabled={!selectedProvinceId}
                    >
                      <option value="">Select ward</option>
                      {wards
                        .filter((w) => w.province_code === selectedProvinceId)
                        .map((w) => (
                          <option key={w.code} value={w.code}>
                            {w.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {/* City (read-only like Create; edit mode derives from province) */}
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-indigo-600 mt-0.5" />
                <div className="w-full">
                  <div className="font-semibold">City</div>
                  {!isEditing ? (
                    <div>{rental.city ?? "—"}</div>
                  ) : (
                    <div className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                      {provinces.find((p) => p.code === selectedProvinceId)?.name ||
                        rentalDraft.city ||
                        "Select province to set city"}
                    </div>
                  )}
                </div>
              </div>

              {/* Event Date */}
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-blue-600 mt-0.5" />
                <div className="w-full">
                  <div className="font-semibold">Event Date</div>
                  {!isEditing ? (
                    <div>{eventDateDisplay}</div>
                  ) : (
                    <>
                      <input
                        type="date"
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={rentalDraft.eventDate ?? ""}
                        onChange={(e) => setRentalDraft((p: any) => ({ ...p, eventDate: e.target.value }))}
                      />
                      <FieldError name="eventDate" />
                    </>
                  )}
                </div>
              </div>

              {/* Start/End Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-blue-600 mt-0.5" />
                  <div className="w-full">
                    <div className="font-semibold">Start Time</div>
                    {!isEditing ? (
                      <div>{(rental.startTime || "").slice(0, 5) || "—"}</div>
                    ) : (
                      <>
                        <input
                          type="time"
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          value={normalizeTime(rentalDraft.startTime) ?? ""}
                          onChange={(e) => setRentalDraft((p: any) => ({ ...p, startTime: e.target.value }))}
                        />
                        <FieldError name="startTime" />
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-blue-600 mt-0.5" />
                  <div className="w-full">
                    <div className="font-semibold">End Time</div>
                    {!isEditing ? (
                      <div>{(rental.endTime || "").slice(0, 5) || "—"}</div>
                    ) : (
                      <>
                        <input
                          type="time"
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          value={normalizeTime(rentalDraft.endTime) ?? ""}
                          onChange={(e) => setRentalDraft((p: any) => ({ ...p, endTime: e.target.value }))}
                        />
                        <FieldError name="endTime" />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Read-only info */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <Row
                  icon={<Calendar size={16} className="text-blue-600" />}
                  label="Created Date"
                  value={createdDate}
                />
                <Row
                  icon={<Calendar size={16} className="text-blue-600" />}
                  label="Updated Date"
                  value={updatedDate}
                />
                <Row icon={<Clock size={16} className="text-yellow-500" />} label="Status" value={rental.status} />
                <Row icon={<User size={16} className="text-green-600" />} label="Account ID" value={rental.accountId} />
                <Row
                  icon={<Hash size={16} className="text-green-600" />}
                  label="Event Activity"
                  value={rental.eventActivityName ?? "—"}
                />

                <Row icon={<Hash size={16} className="text-green-600" />} label="Activity Type" value={activityName} />

                {activity ? (
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    {activityExtraRows.length ? (
                      activityExtraRows.map((r, idx) => (
                        <Row
                          key={idx}
                          icon={r.icon ?? <Hash size={16} className="text-indigo-600" />}
                          label={r.label}
                          value={r.value}
                        />
                      ))
                    ) : (
                      <>
                        {"price" in activity ? (
                          <Row
                            icon={<Hash size={16} className="text-indigo-600" />}
                            label="Package price"
                            value={formatMoney((activity as any).price, currency)}
                          />
                        ) : null}
                        {"minimumMinutes" in activity ? (
                          <Row
                            icon={<Clock size={16} className="text-indigo-600" />}
                            label="Minimum duration"
                            value={formatMinutes((activity as any).minimumMinutes)}
                          />
                        ) : null}
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Actions</h2>

            <div className="space-y-3">
              <button
                onClick={() => setViewMode("details")}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                View Details
              </button>

              <button
                onClick={async () => {
                  setViewMode("schedule");
                  await loadSchedule();
                  if (scheduleRef.current) scheduleRef.current.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
              >
                View Schedules
              </button>

              {userRole === "staff" && (rental.status === "Received" || rental.status === "PendingPriceQuote") && (
                <button
                  onClick={async () => {
                    try {
                      const res = await staffRequestUpdateRentalAsync(rentalId);
                      if (res.success) {
                        alert("Request update has been sent successfully!");
                        onBack();
                      } else {
                        alert(res.message || "Failed to request update.");
                      }
                    } catch (err) {
                      console.error("Failed to request update:", err);
                      alert("Something went wrong. Please try again.");
                    }
                  }}
                  className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600"
                >
                  Request Update
                </button>
              )}

              {canCustomerEdit && (
                <div className="text-xs text-gray-500 pt-2">
                  You can edit this rental because status is <b>AcceptedPriceQuote</b>.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="lg:col-span-2 flex flex-col h-full pb-6">
          {/* TAB BUTTONS */}
          {viewMode === "details" && (
            <div className="flex flex-wrap gap-3 mb-4">
              {grouped.map((g) => (
                <button
                  key={g.roboTypeId}
                  onClick={() => {
                    setActiveType(g.roboTypeId);
                    setPage(0);
                  }}
                  className={`
                    px-4 py-2 rounded-lg font-medium border
                    ${
                      activeType === g.roboTypeId
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }
                  `}
                >
                  {g.robotTypeName}
                </button>
              ))}
            </div>
          )}

          {/* DETAIL CARD */}
          {viewMode === "details" && currentItem && currentGroup ? (
            <div
              ref={detailRef}
              className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col h-full"
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{currentGroup.robotTypeName}</h2>
                <p className="text-gray-600 italic mt-1">{currentGroup.robotTypeDescription}</p>

                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="text-lg font-semibold text-gray-900">Robot Configuration</div>
                    {isEditing && <div className="text-xs text-blue-600 font-semibold">Editing mode is ON</div>}
                  </div>

                  {currentAbilities.length === 0 ? (
                    <div className="text-sm text-gray-500 italic">No config schema for this robot type.</div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <ConfigCard
                        title="Branding & UI Configuration"
                        subtitle="Brand name, logo URL, theme assets (colors/banner/background)."
                      >
                        {currentSections.branding.length ? (
                          <RobotAbilityCardForm
                            abilities={currentSections.branding}
                            values={currentConfigValues}
                            errors={{}} // ✅ no required validation
                            disabled={!isEditing}
                            onChange={(key, v) => {
                              if (!currentItem?.id) return;
                              updateDraftValue(currentItem.id, key, v);
                            }}
                          />
                        ) : (
                          <EmptySection />
                        )}
                      </ConfigCard>

                      <ConfigCard
                        title="Welcome Screen Configuration"
                        subtitle="Welcome text, intro content, optional greeting script."
                      >
                        {currentSections.welcome.length ? (
                          <RobotAbilityCardForm
                            abilities={currentSections.welcome}
                            values={currentConfigValues}
                            errors={{}}
                            disabled={!isEditing}
                            onChange={(key, v) => {
                              if (!currentItem?.id) return;
                              updateDraftValue(currentItem.id, key, v);
                            }}
                          />
                        ) : (
                          <EmptySection />
                        )}
                      </ConfigCard>

                      <ConfigCard title="Call-to-CTA & QR" subtitle="CTA URL / QR content and call-to-action text.">
                        {currentSections.cta.length ? (
                          <RobotAbilityCardForm
                            abilities={currentSections.cta}
                            values={currentConfigValues}
                            errors={{}}
                            disabled={!isEditing}
                            onChange={(key, v) => {
                              if (!currentItem?.id) return;
                              updateDraftValue(currentItem.id, key, v);
                            }}
                          />
                        ) : (
                          <EmptySection />
                        )}

                        {currentSections.other.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="text-xs font-semibold text-gray-700 mb-2">Other Configuration</div>
                            <RobotAbilityCardForm
                              abilities={currentSections.other}
                              values={currentConfigValues}
                              errors={{}}
                              disabled={!isEditing}
                              onChange={(key, v) => {
                                if (!currentItem?.id) return;
                                updateDraftValue(currentItem.id, key, v);
                              }}
                            />
                          </div>
                        )}
                      </ConfigCard>
                    </div>
                  )}
                </div>
              </div>

              {/* PAGINATION */}
              <div className="flex justify-end items-center gap-6 mt-6">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className={`px-4 py-2 rounded-lg border ${
                    page === 0
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Previous
                </button>

                <span className="text-gray-600 text-sm">
                  {page + 1} / {currentGroup.items.length}
                </span>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === currentGroup.items.length - 1}
                  className={`px-4 py-2 rounded-lg border ${
                    page === currentGroup.items.length - 1
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          ) : viewMode === "details" ? (
            <p className="text-gray-500 italic">Select a robot type</p>
          ) : null}

          {/* SCHEDULE SECTION */}
          {viewMode === "schedule" && (
            <div ref={scheduleRef} className="mt-10">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Event Schedule</h2>

              {!schedule ? (
                <p className="text-sm text-gray-500 italic">Click “View Schedules” to show event schedule.</p>
              ) : (
                <div className="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-indigo-600" />
                    <span className="font-semibold text-gray-800">{schedule.eventLocation}</span>
                    <span className="text-gray-500 text-sm">({schedule.eventCity})</span>
                  </div>

                  <div className="text-sm text-gray-700 space-y-1">
                    <div>
                      <strong>Delivery:</strong> {schedule.deliveryTime}
                    </div>
                    <div>
                      <strong>Start – End:</strong> {schedule.startTime} – {schedule.endTime}
                    </div>
                    <div>
                      <strong>Finish:</strong> {schedule.finishTime}
                    </div>
                  </div>

                  <div>
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-lg 
                        ${schedule.status === "planned" ? "bg-yellow-200 text-yellow-900" : ""}
                        ${schedule.status === "completed" ? "bg-green-200 text-green-900" : ""}
                        ${schedule.status === "cancelled" ? "bg-red-200 text-red-900" : ""}
                      `}
                    >
                      {schedule.status}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <div>
                      <strong>Staff:</strong> {schedule.staffFullName}
                    </div>
                    <div>
                      <strong>Customer:</strong> {schedule.customerFullName}
                    </div>
                    <div>
                      <strong>Rental ID:</strong> {schedule.rentalId}
                    </div>
                  </div>

                  {userRole === "staff" && (
                    <button
                      onClick={() => {
                        if (schedule && onNavigateToScheduleBoard) {
                          onNavigateToScheduleBoard(schedule.activityTypeGroupId);
                        }
                      }}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 mt-4"
                    >
                      View Full Schedule Board
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI helpers ---------------- */

function ConfigCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        {subtitle ? <div className="mt-1 text-xs text-gray-500">{subtitle}</div> : null}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function EmptySection() {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
      No fields in this section.
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <div className="flex items-center gap-3">
      <span>{icon}</span>
      <span className="text-sm text-gray-700">
        <strong>{label}:</strong> {value ?? "—"}
      </span>
    </div>
  );
}
