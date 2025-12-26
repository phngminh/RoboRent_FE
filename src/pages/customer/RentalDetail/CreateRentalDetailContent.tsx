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

interface CreateRentalDetailContentProps {
  onBack: (rentalId: number) => void;
  onSave: () => void;
}

type AbilityValueMap = Record<string, any>;

type DetailRow = {
  key: string;
  id?: number;
  roboTypeId: number;

  // ✅ show đúng theo API getRentalDetailsByRentalIdAsync
  robotTypeName?: string;

  status?: string;
  isDeleted?: boolean;
  configValues: AbilityValueMap;
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

// ---------- helpers ----------
const safeJsonParse = (text?: string | null) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
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
      else if (dt === "json" || ui === "jsoneditor") next[a.key] = "";
      else next[a.key] = "";
    });

  return next;
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

const toAbilityValuePayload = (ability: RobotAbility, v: any) => {
  const dt = (ability.dataType || "").toLowerCase();
  const ui = (ability.uiControl || "").toLowerCase();

  if (dt === "json" || ui === "jsoneditor") {
    const rawText = typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim();
    if (!rawText) return { valueText: null as string | null, valueJson: null as string | null };

    try {
      const parsed = JSON.parse(rawText);
      return { valueText: null, valueJson: JSON.stringify(parsed) };
    } catch {
      return { valueText: null, valueJson: rawText };
    }
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

const CreateRentalDetailContent: React.FC<CreateRentalDetailContentProps> = ({
  onBack,
  onSave,
}) => {
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
          const empty =
            v === null ||
            v === undefined ||
            v === "" ||
            (Array.isArray(v) && v.length === 0);

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

      const rowsCommitted: DetailRow[] = [];
      for (const r of rows) {
        const abilities = abilitiesByType[r.roboTypeId] || [];
        const committedValues = await commitPendingImagesToCloudinary(abilities, r.configValues, {
          folder: `event-assets/rental_${rentalId}/robotType_${r.roboTypeId}`,
        });

        rowsCommitted.push({
          ...r,
          status: "Draft",
          configValues: committedValues,
        });
      }

      setRows(rowsCommitted);

      const payload = rowsCommitted.map((r) => {
        const abilities = (abilitiesByType[r.roboTypeId] || []).filter((a) => a.isActive !== false);

        const item: any = {
          id: r.id, // important when update
          isDeleted: !!r.isDeleted,
          status: "Draft",
          rentalId,
          roboTypeId: r.roboTypeId,
          isLocked: false,
          createRobotAbilityValueRequests: abilities.map((a) => {
            const v = r.configValues?.[a.key];
            const { valueText, valueJson } = toAbilityValuePayload(a, v);

            return {
              robotAbilityId: a.id,
              valueText,
              valueJson,
              isUpdated: true,
            };
          }),
        };

        return item;
      });

      // ✅ if existed => UPDATE else CREATE
      if (hasExistingDetails) {
        await updateRentalDetailsAsync(rentalId, payload);
      } else {
        await createRentalDetailsBulkAsync(payload);
        setHasExistingDetails(true);
      }

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

    (async () => {
      setLoading(true);
      setErrors([]);
      setFieldErrorsByRow({});
      setDraftSaved(false);
      setHasExistingDetails(false);

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

        if (existing.success && existing.data.length > 0) {
          setHasExistingDetails(true);

          const loadedRows: DetailRow[] = existing.data.map((d: any) => {
            const abilities = abilitiesDict[d.roboTypeId] || [];

            const rawFromResponses = buildConfigValuesFromAbilityResponses(
              abilities,
              (d.robotAbilityValueResponses || []) as AbilityValueResponse[]
            );

            return {
              key: `${d.id}-${Math.random().toString(36).slice(2)}`,
              id: d.id,
              roboTypeId: d.roboTypeId,

              // ✅ đúng field từ API getRentalDetailsByRentalIdAsync
              robotTypeName: d.robotTypeName,

              status: d.status ?? "Draft",
              isDeleted: d.isDeleted ?? false,
              configValues: initDefaults(abilities, rawFromResponses),
            };
          });

          setRows(loadedRows);
          setSelectedRowKey((prev) => prev || loadedRows[0]?.key || "");

          const uniqueIds = Array.from(new Set(existing.data.map((d: any) => d.roboTypeId)));
          if (uniqueIds.length) {
            try {
              const infos = await getRoboTypesByIdsAsync(uniqueIds);
              const dict: Record<number, string> = {};

              // giữ fallback cũ nhưng an toàn hơn
              infos.forEach((x: any) => (dict[x.id] = x.name ?? x.typeName ?? x.typeNameName));
              setRoboTypeNames(dict);
            } catch {}
          }

          setDraftSaved(true);
          setLoading(false);
          return;
        }

        const newRows: DetailRow[] = [];
        mapping.forEach((m: any) => {
          const count = Math.max(1, m.amount ?? 1);
          const abilities = abilitiesDict[m.roboTypeId] || [];

          for (let i = 0; i < count; i++) {
            newRows.push({
              key: `${m.roboTypeId}-${i}-${Math.random().toString(36).slice(2)}`,
              roboTypeId: m.roboTypeId,

              // mapping API này có thể là roboTypeName hoặc robotTypeName => dùng fallback
              robotTypeName: m.robotTypeName ?? m.roboTypeName,

              status: "Draft",
              isDeleted: false,
              configValues: initDefaults(abilities),
            });
          }
        });

        setRows(newRows);
        setSelectedRowKey((prev) => prev || newRows[0]?.key || "");

        const uniqueIds = Array.from(new Set(mapping.map((m: any) => m.roboTypeId)));
        if (uniqueIds.length) {
          try {
            const infos = await getRoboTypesByIdsAsync(uniqueIds);
            const dict: Record<number, string> = {};
            infos.forEach((x: any) => (dict[x.id] = x.name ?? x.typeName ?? x.typeNameName));
            setRoboTypeNames(dict);
          } catch {}
        }
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

  const selectedRow = useMemo(
    () => rows.find((r) => r.key === selectedRowKey),
    [rows, selectedRowKey]
  );

  const groupedAbilities = useMemo(() => {
    if (!selectedRow) return null;
    const abilities = (abilitiesByType[selectedRow.roboTypeId] || []).filter(
      (a) => a.isActive !== false
    );
    return splitAbilitiesIntoUiSections(abilities);
  }, [selectedRow, abilitiesByType]);

  // ---------- UI ----------
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
        <div className="mt-3 text-sm text-gray-500">
          {savingDraft ? "Saving draft (uploading images)..." : "Loading..."}
        </div>
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
                    loading || savingDraft || rows.length === 0
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:bg-blue-700",
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

                const name =
                  r.robotTypeName ||
                  roboTypeNames[r.roboTypeId] ||
                  `Robot Type ${r.roboTypeId}`;

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

              return (
                <>
                  <ConfigCard
                    title="Branding & UI Configuration"
                    subtitle="Brand name, logo URL, theme assets (colors/banner/background)."
                  >
                    {sections.branding.length ? (
                      <RobotAbilityCardForm
                        abilities={sections.branding}
                        values={selectedRow.configValues}
                        errors={rowErr}
                        onChange={(fieldKey, v) => handleConfigChange(selectedRow.key, fieldKey, v)}
                      />
                    ) : (
                      <EmptySection />
                    )}
                  </ConfigCard>

                  <ConfigCard
                    title="Welcome Screen Configuration"
                    subtitle="Welcome text, intro content, optional greeting script."
                  >
                    {sections.welcome.length ? (
                      <RobotAbilityCardForm
                        abilities={sections.welcome}
                        values={selectedRow.configValues}
                        errors={rowErr}
                        onChange={(fieldKey, v) => handleConfigChange(selectedRow.key, fieldKey, v)}
                      />
                    ) : (
                      <EmptySection />
                    )}
                  </ConfigCard>

                  <ConfigCard
                    title="Call-to-CTA & QR"
                    subtitle="CTA URL / QR content and call-to-action text."
                  >
                    {sections.cta.length ? (
                      <RobotAbilityCardForm
                        abilities={sections.cta}
                        values={selectedRow.configValues}
                        errors={rowErr}
                        onChange={(fieldKey, v) => handleConfigChange(selectedRow.key, fieldKey, v)}
                      />
                    ) : (
                      <EmptySection />
                    )}

                    {sections.other.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-xs font-semibold text-gray-700 mb-2">
                          Other Configuration
                        </div>
                        <RobotAbilityCardForm
                          abilities={sections.other}
                          values={selectedRow.configValues}
                          errors={rowErr}
                          onChange={(fieldKey, v) => handleConfigChange(selectedRow.key, fieldKey, v)}
                        />
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
