import React, { useEffect, useMemo, useState } from "react";

/** ===== Types matching your BE ===== */
export type RobotAbility = {
  id: number;
  robotTypeId: number;
  key: string;
  label: string;
  description?: string | null;
  dataType: string; // "string" | "json" | "enum" | "enum[]" | "bool" | "number" ...
  isRequired: boolean;
  abilityGroup?: string | null;

  lockAtCutoff: boolean;
  isPriceImpacting: boolean;
  isOnSiteAdjustable: boolean;

  uiControl?: string | null; // "text" | "textarea" | "url" | "select" | "multiSelect" | "switch" | "number" | "jsonEditor"
  placeholder?: string | null;

  maxLength?: number | null;
  min?: number | null;
  max?: number | null;

  optionsJson?: string | null; // JSON array for enum / enum[]
  jsonSchema?: string | null;  // optional for json editor
  isActive?: boolean;
};

export type AbilityValueMap = Record<string, any>; // key -> value (string | number | boolean | object | array)

/** ===== Helpers ===== */
function safeJsonParse<T = any>(text?: string | null): T | null {
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function groupBy<T>(items: T[], getKey: (x: T) => string) {
  return items.reduce<Record<string, T[]>>((acc, it) => {
    const k = getKey(it);
    acc[k] ??= [];
    acc[k].push(it);
    return acc;
  }, {});
}

function isEmptyValue(v: any) {
  return v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
}

/** ===== Main Dynamic Form ===== */
type RobotAbilityFormProps = {
  abilities: RobotAbility[];
  initialValues?: AbilityValueMap; // values loaded from event (key -> value)
  mode?: "customer" | "staff";     // customer before cutoff; staff on-site adjustments
  isAfterCutoff?: boolean;         // determine read-only logic
  onSubmit: (values: AbilityValueMap) => Promise<void> | void;
};

export function RobotAbilityForm({
  abilities,
  initialValues = {},
  mode = "customer",
  isAfterCutoff = false,
  onSubmit,
}: RobotAbilityFormProps) {
  const activeAbilities = useMemo(
    () => abilities.filter(a => a.isActive !== false),
    [abilities]
  );

  // Normalize default values
  const [values, setValues] = useState<AbilityValueMap>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Build defaults: if initial has key, use it; else set reasonable default by datatype
    const next: AbilityValueMap = { ...initialValues };

    for (const a of activeAbilities) {
      if (next[a.key] !== undefined) continue;

      const dt = (a.dataType || "").toLowerCase();
      if (dt === "bool" || a.uiControl === "switch") next[a.key] = false;
      else if (dt.includes("enum[]") || a.uiControl === "multiSelect") next[a.key] = [];
      else if (dt === "json" || a.uiControl === "jsonEditor") next[a.key] = null;
      else next[a.key] = "";
    }

    setValues(next);
  }, [activeAbilities, initialValues]);

  const grouped = useMemo(() => {
    const groups = groupBy(activeAbilities, a => a.abilityGroup || "General");
    // optional: stable order by group name
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [activeAbilities]);

  function canEdit(a: RobotAbility) {
    if (!isAfterCutoff) return true;
    // after cutoff:
    // - customer: locked fields readonly
    // - staff: allow only IsOnSiteAdjustable OR unlocked
    if (mode === "customer") return !a.lockAtCutoff;
    return !a.lockAtCutoff || a.isOnSiteAdjustable;
  }

  function setField(key: string, v: any) {
    setValues(prev => ({ ...prev, [key]: v }));
    setErrors(prev => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }

  function validateAll() {
    const nextErrors: Record<string, string> = {};

    for (const a of activeAbilities) {
      if (!a.isRequired) continue;
      const v = values[a.key];

      // If field is not editable (locked), you may skip required validation OR still enforce.
      // Here: still enforce (safer), but only if value is empty.
      if (isEmptyValue(v)) {
        nextErrors[a.key] = "Trường này là bắt buộc.";
        continue;
      }

      // JSON validation
      if ((a.uiControl === "jsonEditor" || a.dataType.toLowerCase() === "json") && typeof v === "string") {
        const parsed = safeJsonParse(v);
        if (v.trim() !== "" && parsed === null) {
          nextErrors[a.key] = "JSON không hợp lệ.";
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateAll()) return;

    // Normalize jsonEditor: if user typed string, parse to object for API
    const payload: AbilityValueMap = { ...values };
    for (const a of activeAbilities) {
      const isJson = a.uiControl === "jsonEditor" || a.dataType.toLowerCase() === "json";
      if (!isJson) continue;

      const v = payload[a.key];
      if (typeof v === "string") {
        const trimmed = v.trim();
        payload[a.key] = trimmed === "" ? null : safeJsonParse(trimmed);
      }
    }

    setSaving(true);
    try {
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      {grouped.map(([groupName, items]) => (
        <section key={groupName} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <h3 style={{ margin: 0 }}>{groupName}</h3>
            <small style={{ opacity: 0.7 }}>
              {items.some(i => i.isPriceImpacting) ? "Có thể ảnh hưởng giá" : ""}
            </small>
          </div>

          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {items.map(a => (
              <AbilityField
                key={a.id}
                ability={a}
                value={values[a.key]}
                error={errors[a.key]}
                disabled={!canEdit(a)}
                onChange={(v) => setField(a.key, v)}
              />
            ))}
          </div>
        </section>
      ))}

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button type="submit" disabled={saving} style={{ padding: "10px 14px" }}>
          {saving ? "Đang lưu..." : "Lưu cấu hình"}
        </button>
      </div>
    </form>
  );
}

/** ===== Field Renderer ===== */
function AbilityField({
  ability,
  value,
  onChange,
  disabled,
  error,
}: {
  ability: RobotAbility;
  value: any;
  onChange: (v: any) => void;
  disabled: boolean;
  error?: string;
}) {
  const options = useMemo(() => {
    const raw = safeJsonParse<any[]>(ability.optionsJson);
    return Array.isArray(raw) ? raw : [];
  }, [ability.optionsJson]);

  const ui = (ability.uiControl || "").toLowerCase();
  const dt = (ability.dataType || "").toLowerCase();

  // Display label + meta
  const requiredMark = ability.isRequired ? " *" : "";
  const lockHint = ability.lockAtCutoff ? " (Lock@Cutoff)" : "";
  const priceHint = ability.isPriceImpacting ? " (Price)" : "";

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontWeight: 600 }}>
        {ability.label}
        <span style={{ opacity: 0.8 }}>{requiredMark}</span>
        <span style={{ opacity: 0.45 }}>{lockHint}{priceHint}</span>
      </label>

      {ability.description ? (
        <div style={{ fontSize: 13, opacity: 0.75 }}>{ability.description}</div>
      ) : null}

      {/* Render by uiControl first, fallback to datatype */}
      {ui === "textarea" ? (
        <textarea
          value={value ?? ""}
          disabled={disabled}
          placeholder={ability.placeholder ?? ""}
          maxLength={ability.maxLength ?? undefined}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight: 90, padding: 10 }}
        />
      ) : ui === "jsoneditor" || dt === "json" ? (
        <textarea
          value={
            typeof value === "string"
              ? value
              : value == null
                ? ""
                : JSON.stringify(value, null, 2)
          }
          disabled={disabled}
          placeholder={ability.placeholder ?? "{ ... }"}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight: 140, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", padding: 10 }}
        />
      ) : ui === "switch" || dt === "bool" ? (
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="checkbox"
            checked={!!value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{!!value ? "Bật" : "Tắt"}</span>
        </label>
      ) : ui === "select" || dt === "enum" ? (
        <select
          value={value ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          style={{ padding: 10 }}
        >
          <option value="" disabled>
            -- Chọn --
          </option>
          {options.map((opt) => (
            <option key={String(opt)} value={String(opt)}>
              {String(opt)}
            </option>
          ))}
        </select>
      ) : ui === "multiselect" || dt === "enum[]" ? (
        <select
          multiple
          value={Array.isArray(value) ? value.map(String) : []}
          disabled={disabled}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map(o => o.value);
            onChange(selected);
          }}
          style={{ padding: 10, minHeight: 90 }}
        >
          {options.map((opt) => (
            <option key={String(opt)} value={String(opt)}>
              {String(opt)}
            </option>
          ))}
        </select>
      ) : ui === "number" || dt === "number" || dt === "int" || dt === "integer" ? (
        <input
          type="number"
          value={value ?? ""}
          disabled={disabled}
          placeholder={ability.placeholder ?? ""}
          min={ability.min ?? undefined}
          max={ability.max ?? undefined}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === "" ? "" : Number(v));
          }}
          style={{ padding: 10 }}
        />
      ) : ui === "url" ? (
        <input
          type="url"
          value={value ?? ""}
          disabled={disabled}
          placeholder={ability.placeholder ?? "https://..."}
          maxLength={ability.maxLength ?? undefined}
          onChange={(e) => onChange(e.target.value)}
          style={{ padding: 10 }}
        />
      ) : (
        // default text
        <input
          type="text"
          value={value ?? ""}
          disabled={disabled}
          placeholder={ability.placeholder ?? ""}
          maxLength={ability.maxLength ?? undefined}
          onChange={(e) => onChange(e.target.value)}
          style={{ padding: 10 }}
        />
      )}

      {error ? <div style={{ color: "crimson", fontSize: 13 }}>{error}</div> : null}
      {ability.jsonSchema ? (
        <details style={{ opacity: 0.8 }}>
          <summary>Gợi ý schema</summary>
          <pre style={{ whiteSpace: "pre-wrap" }}>{ability.jsonSchema}</pre>
        </details>
      ) : null}
    </div>
  );
}

/** ===== Example Page Usage ===== */
export function RobotConfigPageExample({
  eventId,
  robotTypeId,
}: {
  eventId: number;
  robotTypeId: number;
}) {
  const [abilities, setAbilities] = useState<RobotAbility[]>([]);
  const [initialValues, setInitialValues] = useState<AbilityValueMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // TODO: replace by your real API calls
        const abilitiesRes = await fetch(`/api/robot-types/${robotTypeId}/abilities`);
        const abilitiesJson = await abilitiesRes.json();
        setAbilities(abilitiesJson);

        const valuesRes = await fetch(`/api/events/${eventId}/config-values`);
        const valuesJson = await valuesRes.json(); // expected: { "brandName": "...", "languages": ["VI"], "voiceProfile": {...} }
        setInitialValues(valuesJson);
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId, robotTypeId]);

  async function handleSubmit(values: AbilityValueMap) {
    // TODO: normalize payload to your BE expectation
    // Option A: send as map
    await fetch(`/api/events/${eventId}/config-values`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    alert("Saved!");
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Robot Configuration</h2>
      <RobotAbilityForm
        abilities={abilities}
        initialValues={initialValues}
        mode="customer"
        isAfterCutoff={false}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
