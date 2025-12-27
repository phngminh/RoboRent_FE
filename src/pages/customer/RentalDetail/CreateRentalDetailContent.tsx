import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save, SendHorizonal } from "lucide-react";
import { useParams } from "react-router-dom";

import { getRobotTypesOfActivityAsync } from "../../../apis/robottypeofactivity.api";
import {
  createRentalDetailsBulkAsync,
  getRentalDetailsByRentalIdAsync,
  updateRentalDetailsAsync,
} from "../../../apis/rentaldetail.api";
import { getRoboTypesByIdsAsync } from "../../../apis/robotype.api";
import { customerSendRentalAsync } from "../../../apis/rental.customer.api";

import { RobotAbilityCardForm } from "../../../components/robot-config/RobotAbilityCardForm";
import type { RobotAbility } from "../../../components/robot-config/AbilityField";
import { commitPendingImagesToCloudinary } from "../../../components/robot-config/AbilityField";

// ✅ JSON Ability Forms (file đang nằm ở: components/robot-config/RobotAbilityJsonForms.tsx)
import {
  renderJsonAbilityForm,
  type AbilityKey,
} from "../../../components/robot-config/RobotAbilityJsonForms";

interface CreateRentalDetailContentProps {
  onBack: (rentalId: number) => void;
  onSave: () => void;
}

type AbilityValueMap = Record<string, any>;

type DetailRow = {
  key: string;
  id?: number; // RentalDetailId
  roboTypeId: number;
  robotTypeName?: string;
  status?: string;
  isDeleted?: boolean;

  configValues: AbilityValueMap;

  // ✅ snapshot giá trị ban đầu (từ DB) để so sánh change
  initialConfigValues?: AbilityValueMap;
};

type AbilityValueResponse = {
  id: number;
  rentalDetailId: number;
  robotAbilityId: number;
  valueText: string | null;
  valueJson: string | null;
  updatedAt?: string;
  isUpdated?: boolean;
};

// ✅ NEW: response type of API /robotypes/by-ids
type RoboTypeInfo = {
  id: number;
  typeName?: string | null;
};

/* -------------------------- helpers / utils -------------------------- */

const safeJsonParse = (text?: string | null) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const deepClone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

const buildDetailIdMap = (data: any[]): Record<number, number> => {
  const map: Record<number, number> = {};
  (data || []).forEach((d) => {
    const detailId = Number(d?.id ?? 0);
    const roboTypeId = Number(d?.roboTypeId ?? 0);
    if (roboTypeId > 0 && detailId > 0) map[roboTypeId] = detailId;
  });
  return map;
};

const isJsonAbility = (a: RobotAbility) => {
  const dt = (a.dataType || "").toLowerCase();
  const ui = (a.uiControl || "").toLowerCase();
  return dt === "json" || ui === "jsoneditor";
};

const deepEqual = (a: any, b: any) => {
  if (a === b) return true;

  // handle null/undefined
  if (a == null || b == null) return a == b;

  // array
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // object
  if (typeof a === "object" && typeof b === "object") {
    const ak = Object.keys(a);
    const bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    for (const k of ak) {
      if (!deepEqual(a[k], b[k])) return false;
    }
    return true;
  }

  return false;
};

// normalize value for compare by ability type
const normalizeForCompare = (ability: RobotAbility, v: any) => {
  const dt = (ability.dataType || "").toLowerCase();
  const ui = (ability.uiControl || "").toLowerCase();

  // treat empty string & null as same
  if (v === "") v = null;

  // multiselect: compare as sorted array (order-insensitive)
  if (dt === "enum[]" || ui === "multiselect") {
    const arr = Array.isArray(v) ? v : [];
    return [...arr].map(String).sort();
  }

  // number: normalize to number if possible
  if (dt === "number" || dt === "int" || dt === "integer") {
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : String(v);
  }

  // bool
  if (dt === "bool" || ui === "switch") return !!v;

  // json: compare by stable JSON string (to avoid key order issues)
  if (dt === "json" || ui === "jsoneditor") {
    if (v == null) return null;
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }

  // default string compare
  if (v == null) return null;
  return String(v).trim();
};

const isAbilityChanged = (ability: RobotAbility, current: any, initial: any) => {
  const a = normalizeForCompare(ability, current);
  const b = normalizeForCompare(ability, initial);
  return !deepEqual(a, b);
};

const isEmptyValue = (v: any) => {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v).length === 0;
  return false;
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
      else if (dt === "json" || ui === "jsoneditor") next[a.key] = null; // ✅ JSON form will set object/array
      else next[a.key] = "";
    });

  return next;
};

const parseStoredAbilityValue = (ability: RobotAbility, av?: AbilityValueResponse) => {
  if (!av) return undefined;

  const dt = (ability.dataType || "").toLowerCase();
  const ui = (ability.uiControl || "").toLowerCase();

  if (av.valueJson != null && av.valueJson !== "") {
    const parsed = safeJsonParse(av.valueJson);

    if (dt === "enum[]" || ui === "multiselect") {
      return Array.isArray(parsed) ? parsed : [];
    }

    if (dt === "json" || ui === "jsoneditor") {
      // ✅ return object/array directly for JSON forms
      return parsed ?? null;
    }

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

const toAbilityValuePayload = (ability: RobotAbility, v: any) => {
  const dt = (ability.dataType || "").toLowerCase();
  const ui = (ability.uiControl || "").toLowerCase();

  // ✅ JSON editor / json datatype: accept object/array directly
  if (dt === "json" || ui === "jsoneditor") {
    if (v === null || v === undefined || v === "") {
      return { valueText: null as string | null, valueJson: null as string | null };
    }

    // legacy: if string, try parse
    if (typeof v === "string") {
      const rawText = v.trim();
      if (!rawText) return { valueText: null, valueJson: null };

      try {
        const parsed = JSON.parse(rawText);
        return { valueText: null, valueJson: JSON.stringify(parsed) };
      } catch {
        // keep raw string if cannot parse
        return { valueText: null, valueJson: rawText };
      }
    }

    // ✅ object/array
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

/* -------------------------- JSON Ability UI -------------------------- */

function JsonAbilitySection({
  abilities,
  values,
  onChange,
  errors,
}: {
  abilities: RobotAbility[];
  values: AbilityValueMap;
  onChange: (fieldKey: string, v: any) => void;
  errors?: Record<string, string>;
}) {
  const jsonAbilities = (abilities || []).filter((a) => a.isActive !== false).filter(isJsonAbility);
  if (!jsonAbilities.length) return null;

  return (
    <div className="space-y-4">
      {jsonAbilities.map((a) => {
        const key = a.key as AbilityKey;
        const err = errors?.[a.key];

        return (
          <div key={a.id} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {a.label} {a.isRequired ? <span className="text-red-500">*</span> : null}
                </div>
                {a.description ? (
                  <div className="mt-1 text-xs text-gray-500">{a.description}</div>
                ) : null}
              </div>

              {err ? (
                <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-lg">
                  {err}
                </div>
              ) : null}
            </div>

            <div className="mt-3">
              {renderJsonAbilityForm(key, values?.[a.key], (v) => onChange(a.key, v))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------- main component -------------------------- */

const CreateRentalDetailContent: React.FC<CreateRentalDetailContentProps> = ({ onBack, onSave }) => {
  const { rentalId: rentalIdString } = useParams<{ rentalId: string }>();
  const rentalId = rentalIdString ? parseInt(rentalIdString, 10) : 0;

  const { activityTypeId: activityTypeIdString } = useParams<{ activityTypeId: string }>();
  const activityTypeId = activityTypeIdString ? parseInt(activityTypeIdString, 10) : 0;

  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [rows, setRows] = useState<DetailRow[]>([]);
  const [roboTypeNames, setRoboTypeNames] = useState<Record<number, string>>({});

  const [abilitiesByType, setAbilitiesByType] = useState<Record<number, RobotAbility[]>>({});

  const [fieldErrorsByRow, setFieldErrorsByRow] = useState<Record<string, Record<string, string>>>(
    {}
  );

  const [selectedRowKey, setSelectedRowKey] = useState<string>("");

  const [draftSaved, setDraftSaved] = useState(false);

  // remember if rental details already exist => use updateRentalDetailsAsync
  const [hasExistingDetails, setHasExistingDetails] = useState(false);

  // ✅ map roboTypeId -> RentalDetailId (id)
  const [detailIdByRoboType, setDetailIdByRoboType] = useState<Record<number, number>>({});

  const cardTitle = (row: DetailRow, idxWithinType: number) => {
    const nameFromRow = row.robotTypeName;
    const fallbackName = roboTypeNames[row.roboTypeId];
    const name = nameFromRow || fallbackName || `Robot Type ${row.roboTypeId}`;
    return `${name} (#${idxWithinType + 1})`;
  };

  const indexWithinTypeByKey = (rowKey: string) => {
    const row = rows.find((r) => r.key === rowKey);
    if (!row) return 0;
    const sameType = rows.filter((r) => r.roboTypeId === row.roboTypeId).map((r) => r.key);
    return Math.max(0, sameType.indexOf(rowKey));
  };

  const handleConfigChange = (rowKey: string, fieldKey: string, value: any) => {
    setRows((prev) =>
      prev.map((r) =>
        r.key === rowKey ? { ...r, configValues: { ...r.configValues, [fieldKey]: value } } : r
      )
    );

    setDraftSaved(false);

    setFieldErrorsByRow((prev) => {
      const copy = { ...prev };
      if (copy[rowKey]?.[fieldKey]) {
        copy[rowKey] = { ...copy[rowKey] };
        delete copy[rowKey][fieldKey];
      }
      return copy;
    });
  };

  const validateBeforeSend = () => {
    const missing: string[] = [];
    const perRowErr: Record<string, Record<string, string>> = {};

    rows.forEach((r) => {
      const idxWithinType = indexWithinTypeByKey(r.key);
      const label = cardTitle(r, idxWithinType);
      const abilities = abilitiesByType[r.roboTypeId] || [];

      abilities
        .filter((a) => a.isActive !== false)
        .forEach((a) => {
          if (!a.isRequired) return;

          const v = r.configValues?.[a.key];
          const empty = isEmptyValue(v);

          if (empty) {
            perRowErr[r.key] ??= {};
            perRowErr[r.key][a.key] = "Required";
            missing.push(`${label}: ${a.label} is required.`);
          }
        });
    });

    setFieldErrorsByRow(perRowErr);

    if (missing.length > 0) {
      setErrors(missing);
      return false;
    }

    return true;
  };

  const handleSaveAsDraft = async () => {
    setErrors([]);

    try {
      setSavingDraft(true);

      // 1) commit images nhưng ĐỪNG overwrite initialConfigValues trước
      const rowsCommitted: DetailRow[] = [];
      for (const r of rows) {
        const abilities = abilitiesByType[r.roboTypeId] || [];
        const committedValues = await commitPendingImagesToCloudinary(abilities, r.configValues, {
          folder: `event-assets/rental_${rentalId}/robotType_${r.roboTypeId}`,
        });

        rowsCommitted.push({
          ...r,
          status: "Draft",
          configValues: committedValues, // current mới
          // initialConfigValues GIỮ NGUYÊN để so sánh change
        });
      }

      // ✅ 1.5) If updating: refetch latest RentalDetails and build id map
      let freshIdMap = detailIdByRoboType;

      if (hasExistingDetails) {
        const latest = await getRentalDetailsByRentalIdAsync(rentalId);
        if (latest?.success) {
          freshIdMap = buildDetailIdMap(latest.data || []);
          setDetailIdByRoboType(freshIdMap);
        }
      }

      // ✅ 1.6) Ensure each row has correct RentalDetailId (id)
      const rowsFixed: DetailRow[] = rowsCommitted.map((r) => {
        const fromState = Number(r.id ?? 0);
        const fromMap = Number(freshIdMap[r.roboTypeId] ?? 0);
        const finalId = fromState > 0 ? fromState : fromMap;
        return { ...r, id: finalId };
      });

      // ✅ 1.7) Block update if any id is missing
      if (hasExistingDetails) {
        const missing = rowsFixed.filter((r) => !r.id || Number(r.id) <= 0);
        if (missing.length) {
          setErrors([
            `Update failed: missing RentalDetailId for roboTypeId: ${missing
              .map((m) => m.roboTypeId)
              .join(", ")}. Please refresh page or re-open this rental.`,
          ]);
          return;
        }
      }

      // 2) build payload: so sánh current vs initial (baseline cũ)
      const payload = rowsFixed.map((r) => {
        const abilities = (abilitiesByType[r.roboTypeId] || []).filter((a) => a.isActive !== false);

        const item: any = {
          id: Number(r.id ?? 0), // ✅ must be correct in update mode
          isDeleted: !!r.isDeleted,
          status: "Draft",
          rentalId,
          roboTypeId: r.roboTypeId,
          isLocked: false,
        };

        const abilityRequests = abilities.map((a) => {
          const currentV = r.configValues?.[a.key]; // committed
          const initialV = r.initialConfigValues?.[a.key]; // baseline cũ
          const changed = hasExistingDetails ? isAbilityChanged(a, currentV, initialV) : false;

          const { valueText, valueJson } = toAbilityValuePayload(a, currentV);

          return {
            robotAbilityId: a.id,
            rentalDetailId: r.id,
            valueText,
            valueJson,
            isUpdated: changed, // ✅ chỉ true khi changed
          };
        });

        if (hasExistingDetails) item.updateRobotAbilityValueRequests = abilityRequests;
        else item.createRobotAbilityValueRequests = abilityRequests;

        return item;
      });

      // 3) gọi API
      if (hasExistingDetails) await updateRentalDetailsAsync(rentalId, payload);
      else {
        await createRentalDetailsBulkAsync(payload);
        setHasExistingDetails(true);

        // ✅ after create, fetch again to get real IDs
        const latest = await getRentalDetailsByRentalIdAsync(rentalId);
        if (latest?.success) {
          const newMap = buildDetailIdMap(latest.data || []);
          setDetailIdByRoboType(newMap);
          // also patch rows with newly created ids
          const patched = rowsFixed.map((r) => ({
            ...r,
            id: Number(newMap[r.roboTypeId] ?? r.id ?? 0),
          }));
          // 4) reset baseline after OK
          setRows(patched.map((r) => ({ ...r, initialConfigValues: deepClone(r.configValues) })));
          setDraftSaved(true);
          onSave();
          return;
        }
      }

      // 4) chỉ sau khi API OK mới “reset baseline”
      setRows(rowsFixed.map((r) => ({ ...r, initialConfigValues: deepClone(r.configValues) })));
      setDraftSaved(true);
      onSave();
    } catch (err: any) {
      console.error("Save draft error:", err);
      setErrors([err?.response?.data?.message || err?.message || "Failed to save draft."]);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSend = async () => {
    setErrors([]);

    if (!validateBeforeSend()) return;

    if (!draftSaved) {
      setErrors([
        "Please click 'Save as Draft' first. Images and config values must be stored before sending.",
      ]);
      return;
    }

    try {
      setLoading(true);
      await customerSendRentalAsync(rentalId);
      onSave();
    } catch (err: any) {
      console.error("Error sending rental:", err);
      setErrors([err?.response?.data?.message || err?.message || "Failed to send rental."]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // ✅ helper load roboTypeNames by ids using new API
    const loadRoboTypeNamesByIds = async (ids: number[]) => {
      const uniqueIds = Array.from(new Set((ids || []).filter((x) => typeof x === "number" && x > 0)));
      if (!uniqueIds.length) return;

      try {
        const infos = (await getRoboTypesByIdsAsync(uniqueIds)) as RoboTypeInfo[];

        const dict: Record<number, string> = {};
        infos.forEach((x) => {
          dict[x.id] = (x.typeName ?? "").trim() || `Robot Type ${x.id}`;
        });

        if (mounted) setRoboTypeNames(dict);
      } catch (err) {
        console.warn("Failed to load robo type names", err);
      }
    };

    (async () => {
      setLoading(true);
      setErrors([]);
      setFieldErrorsByRow({});
      setDraftSaved(false);
      setHasExistingDetails(false);
      setDetailIdByRoboType({});

      try {
        const mapping = await getRobotTypesOfActivityAsync(activityTypeId);
        if (!mounted) return;

        const abilitiesDict: Record<number, RobotAbility[]> = {};
        mapping.forEach((m: any) => {
          abilitiesDict[m.roboTypeId] = (m.robotAbilityResponses || []) as RobotAbility[];
        });
        setAbilitiesByType(abilitiesDict);

        const existing = await getRentalDetailsByRentalIdAsync(rentalId);
        if (!mounted) return;

        // ✅ CASE A: already have rental details
        if (existing.success && existing.data.length > 0) {
          setHasExistingDetails(true);

          const idMap = buildDetailIdMap(existing.data || []);
          setDetailIdByRoboType(idMap);

          const loadedRows: DetailRow[] = (existing.data || []).map((d: any) => {
            const abilities = abilitiesDict[d.roboTypeId] || [];

            const rawFromResponses = buildConfigValuesFromAbilityResponses(
              abilities,
              (d.robotAbilityValueResponses || []) as AbilityValueResponse[]
            );

            const normalized = initDefaults(abilities, rawFromResponses);

            return {
              key: `${d.id}-${Math.random().toString(36).slice(2)}`,
              id: Number(d.id ?? 0),
              roboTypeId: Number(d.roboTypeId ?? 0),
              robotTypeName: d.robotTypeName,
              status: d.status ?? "Draft",
              isDeleted: d.isDeleted ?? false,

              configValues: normalized,

              // ✅ snapshot (để detect change)
              initialConfigValues: deepClone(normalized),
            };
          });

          setRows(loadedRows);
          setSelectedRowKey((prev) => prev || loadedRows[0]?.key || "");

          await loadRoboTypeNamesByIds(existing.data.map((d: any) => d.roboTypeId));

          setDraftSaved(true);
          setLoading(false);
          return;
        }

        // ✅ CASE B: no existing details
        const uniqueMapping = Array.from(
          new Map<number, any>((mapping || []).map((m: any) => [m.roboTypeId, m])).values()
        );

        const newRows: DetailRow[] = uniqueMapping.map((m: any) => {
          const abilities = abilitiesDict[m.roboTypeId] || [];

          return {
            key: `${m.roboTypeId}-${Math.random().toString(36).slice(2)}`,
            roboTypeId: m.roboTypeId,

            robotTypeName: m.robotTypeName ?? m.roboTypeName,

            status: "Draft",
            isDeleted: false,
            configValues: initDefaults(abilities),

            // baseline empty
            initialConfigValues: deepClone(initDefaults(abilities)),
          };
        });

        setRows(newRows);
        setSelectedRowKey((prev) => prev || newRows[0]?.key || "");

        await loadRoboTypeNamesByIds(uniqueMapping.map((m: any) => m.roboTypeId));
      } catch (e: any) {
        setErrors([e?.message || "Failed to load rental details."]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [rentalId, activityTypeId]);

  const selectedRow = useMemo(() => rows.find((r) => r.key === selectedRowKey), [rows, selectedRowKey]);

  const groupedAbilities = useMemo(() => {
    if (!selectedRow) return null;
    const abilities = (abilitiesByType[selectedRow.roboTypeId] || []).filter((a) => a.isActive !== false);
    return splitAbilitiesIntoUiSections(abilities);
  }, [selectedRow, abilitiesByType]);

  /* ------------------------------- UI ------------------------------- */

  return (
    <div className="w-full">
      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {(loading || savingDraft) && (
        <div className="mt-3 text-sm text-gray-500">{savingDraft ? "Saving draft (uploading images)..." : "Loading..."}</div>
      )}

      {!loading && rows.length === 0 && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
          No required robot types found for this activity type.
        </div>
      )}

      {/* Select Robots SECTION (Back + actions here) */}
      {!loading && rows.length > 0 && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <button
                  onClick={() => onBack(rentalId)}
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  type="button"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>

                <div className="mt-3">
                  <h2 className="text-xl font-semibold text-gray-900">Create Rental Details</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload images only happens when you click <b>Save as Draft</b>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  disabled={loading || savingDraft || rows.length === 0}
                  onClick={handleSaveAsDraft}
                  className={[
                    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium",
                    "bg-blue-600 text-white shadow-sm",
                    loading || savingDraft || rows.length === 0 ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700",
                  ].join(" ")}
                  title={
                    hasExistingDetails
                      ? "Update Draft (THIS is where images upload to Cloudinary)"
                      : "Save Draft (THIS is where images upload to Cloudinary)"
                  }
                  type="button"
                >
                  <Save size={16} />
                  {hasExistingDetails ? "Update Draft" : "Save Draft"}
                </button>

                <button
                  disabled={loading || savingDraft || rows.length === 0 || !draftSaved}
                  onClick={handleSend}
                  className={[
                    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium",
                    "border border-gray-200 bg-white text-gray-800",
                    loading || savingDraft || rows.length === 0 || !draftSaved
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:bg-gray-50",
                  ].join(" ")}
                  title={!draftSaved ? "Please save as draft before sending." : "Send"}
                  type="button"
                >
                  <SendHorizonal size={16} />
                  Send
                </button>
              </div>
            </div>

            <div className="my-5 border-t border-gray-100" />

            <div className="text-sm font-semibold text-gray-900 mb-3">Select Robots</div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {rows.map((r) => {
                const idx = indexWithinTypeByKey(r.key) + 1;

                const name = r.robotTypeName || roboTypeNames[r.roboTypeId] || `Robot Type ${r.roboTypeId}`;

                const active = r.key === selectedRowKey;

                return (
                  <RobotSelectCard
                    key={r.key}
                    title={name}
                    subtitle={`#${idx}`}
                    active={active}
                    onClick={() => setSelectedRowKey(r.key)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Right config area */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {!selectedRow ? (
          <div className="lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
            Select a robot above to view its configuration.
          </div>
        ) : (
          <>
            <div className="lg:col-span-3 -mb-1">
              <div className="text-sm text-gray-500">Selected RoboType</div>
              <div className="text-lg font-semibold text-gray-900">
                {((selectedRow.robotTypeName ||
                  roboTypeNames[selectedRow.roboTypeId] ||
                  `Robot Type ${selectedRow.roboTypeId}`) +
                  ` (#${indexWithinTypeByKey(selectedRow.key) + 1})`) as any}
              </div>
            </div>

            {(() => {
              const allAbilities = abilitiesByType[selectedRow.roboTypeId] || [];
              const rowErr = fieldErrorsByRow[selectedRow.key] || {};

              if (allAbilities.length === 0) {
                return (
                  <div className="lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
                    No config schema for this robot type.
                  </div>
                );
              }

              const sections = groupedAbilities ?? {
                branding: allAbilities,
                welcome: [],
                cta: [],
                other: [],
              };

              const renderSection = (abilities: RobotAbility[]) => {
                const normal = (abilities || [])
                  .filter((a) => a.isActive !== false)
                  .filter((a) => !isJsonAbility(a));
                const hasNormal = normal.length > 0;
                const hasJson = (abilities || []).some((a) => a.isActive !== false && isJsonAbility(a));

                if (!hasNormal && !hasJson) return <EmptySection />;

                return (
                  <div className="space-y-4">
                    {hasNormal ? (
                      <RobotAbilityCardForm
                        abilities={normal}
                        values={selectedRow.configValues}
                        errors={rowErr}
                        onChange={(fieldKey, v) => handleConfigChange(selectedRow.key, fieldKey, v)}
                      />
                    ) : null}

                    {hasJson ? (
                      <JsonAbilitySection
                        abilities={abilities}
                        values={selectedRow.configValues}
                        errors={rowErr}
                        onChange={(fieldKey, v) => handleConfigChange(selectedRow.key, fieldKey, v)}
                      />
                    ) : null}
                  </div>
                );
              };

              return (
                <>
                  <ConfigCard
                    title="Branding & UI Configuration"
                    subtitle="Brand name, logo URL, theme assets (colors/banner/background)."
                  >
                    {renderSection(sections.branding)}
                  </ConfigCard>

                  <ConfigCard
                    title="Welcome Screen Configuration"
                    subtitle="Welcome text, intro content, optional greeting script."
                  >
                    {renderSection(sections.welcome)}
                  </ConfigCard>

                  <ConfigCard title="Call-to-CTA & QR" subtitle="CTA URL / QR content and call-to-action text.">
                    {renderSection(sections.cta)}

                    {sections.other.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-xs font-semibold text-gray-700 mb-2">Other Configuration</div>
                        {renderSection(sections.other)}
                      </div>
                    )}
                  </ConfigCard>
                </>
              );
            })()}
          </>
        )}
      </div>

      {!draftSaved && rows.length > 0 ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Bạn phải bấm <b>Save Draft</b> trước để hệ thống upload ảnh và lưu cấu hình vào database, sau đó mới Send.
        </div>
      ) : null}
    </div>
  );
};

export default CreateRentalDetailContent;

/* ---------------- UI helpers ---------------- */

function RobotSelectCard({
  title,
  subtitle,
  active,
  onClick,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "min-w-[140px] max-w-[170px] flex-shrink-0 rounded-2xl border p-3 text-left transition",
        active ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-200 bg-white hover:bg-gray-50",
      ].join(" ")}
      title={`${title} ${subtitle}`}
      type="button"
    >
      <div
        className={[
          "h-16 w-full rounded-xl flex items-center justify-center",
          active ? "bg-white" : "bg-gray-100",
        ].join(" ")}
      >
        <div className="text-2xl">🤖</div>
      </div>

      <div className="mt-2">
        <div className="text-sm font-semibold text-gray-900 line-clamp-1">{title}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
      </div>
    </button>
  );
}

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

    if (g.includes("brand") || g.includes("ui") || text.includes("logo") || text.includes("theme")) {
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
