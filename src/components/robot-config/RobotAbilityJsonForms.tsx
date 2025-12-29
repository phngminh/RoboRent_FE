import React from "react";

/**
 * RoboRent - JSON Ability Forms
 * ------------------------------------------------------------
 * These forms let normal users input structured config without typing raw JSON.
 * FE will keep values as JS objects/arrays, and your existing toAbilityValuePayload()
 * can JSON.stringify(value) into valueJson before sending to BE.
 *
 * Exports:
 * - 20+ forms matching your JSON abilities
 * - Small, dependency-free UI primitives: Input, Textarea, Checkbox, Select, Button, TagInput, Grid
 */

export type JsonValue = any;

/* ----------------------------- UI Primitives ----------------------------- */

export function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>;
}

/**
 * ✅ UPDATED VERSION
 * - Added `isUpdated?: boolean`
 * - Shows UPDATED badge on the right
 */
export function FieldLabel({
  label,
  required,
  hint,
  isUpdated,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  isUpdated?: boolean;
}) {
  return (
    <div className="mb-1 flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-medium text-gray-900">
          {label} {required ? <span className="text-red-500">*</span> : null}
        </div>
        {hint ? <div className="text-xs text-gray-500">{hint}</div> : null}
      </div>

      {isUpdated ? (
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-600 text-white">
          UPDATED
        </span>
      ) : null}
    </div>
  );
}

export function Input({
  label,
  hint,
  required,
  className,
  isUpdated,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  required?: boolean;
  isUpdated?: boolean;
}) {
  return (
    <div className={className}>
      <FieldLabel label={label} hint={hint} required={required} isUpdated={isUpdated} />
      <input
        {...props}
        className={[
          "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300",
        ].join(" ")}
      />
    </div>
  );
}

export function Textarea({
  label,
  hint,
  required,
  className,
  isUpdated,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  required?: boolean;
  isUpdated?: boolean;
}) {
  return (
    <div className={className}>
      <FieldLabel label={label} hint={hint} required={required} isUpdated={isUpdated} />
      <textarea
        {...props}
        className={[
          "w-full min-h-[92px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300",
        ].join(" ")}
      />
    </div>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
  hint,
  isUpdated,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
  isUpdated?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(!!e.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">{label}</div>
            {hint ? <div className="text-xs text-gray-500">{hint}</div> : null}
          </div>
        </div>

        {isUpdated ? (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-600 text-white">
            UPDATED
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function Select({
  label,
  value,
  options,
  onChange,
  hint,
  required,
  isUpdated,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  hint?: string;
  required?: boolean;
  isUpdated?: boolean;
}) {
  return (
    <div>
      <FieldLabel label={label} hint={hint} required={required} isUpdated={isUpdated} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300",
        ].join(" ")}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition";
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[base, styles, disabled ? "opacity-60 cursor-not-allowed" : ""].join(" ")}
    >
      {children}
    </button>
  );
}

/**
 * Simple tag input:
 * - User types a tag then presses Enter or clicks Add
 * - Can remove tags via ✕
 */
export function TagInput({
  label,
  hint,
  tags,
  onChange,
  placeholder = "Type and press Enter...",
  isUpdated,
}: {
  label: string;
  hint?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  isUpdated?: boolean;
}) {
  const [draft, setDraft] = React.useState("");

  const addTag = () => {
    const t = draft.trim();
    if (!t) return;
    if (tags.includes(t)) {
      setDraft("");
      return;
    }
    onChange([...tags, t]);
    setDraft("");
  };

  return (
    <div>
      <FieldLabel label={label} hint={hint} isUpdated={isUpdated} />
      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-800"
            >
              {t}
              <button
                type="button"
                className="text-gray-500 hover:text-gray-900"
                onClick={() => onChange(tags.filter((x) => x !== t))}
                aria-label={`Remove ${t}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            className={[
              "flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900",
              "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300",
            ].join(" ")}
          />
          <Button variant="secondary" onClick={addTag}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Helper utils ----------------------------- */

function normalizeCommaList(text: string): string[] {
  return text
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function ensureNumber(v: any, fallback?: number) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/* =========================================================================
 *  22 JSON FORMS (matching your RobotAbility json schemas)
 * ========================================================================= */

/** 1) themeAssets: { bannerUrl, backgroundUrl, primaryColor, secondaryColor } */
export function ThemeAssetsForm({
  value,
  onChange,
  isUpdated,
}: {
  value: { bannerUrl?: string; backgroundUrl?: string; primaryColor?: string; secondaryColor?: string } | null;
  onChange: (v: any) => void;
  isUpdated?: boolean;
}) {
  const v = value || {};
  return (
    <div className="space-y-3">
      <Input
        label="Banner URL"
        type="url"
        value={v.bannerUrl || ""}
        onChange={(e) => onChange({ ...v, bannerUrl: e.target.value })}
        placeholder="https://..."
        isUpdated={isUpdated}
      />
      <Input
        label="Background URL"
        type="url"
        value={v.backgroundUrl || ""}
        onChange={(e) => onChange({ ...v, backgroundUrl: e.target.value })}
        placeholder="https://..."
        isUpdated={isUpdated}
      />
      <Grid>
        <Input
          label="Primary Color"
          type="color"
          value={v.primaryColor || "#000000"}
          onChange={(e) => onChange({ ...v, primaryColor: e.target.value })}
          isUpdated={isUpdated}
        />
        <Input
          label="Secondary Color"
          type="color"
          value={v.secondaryColor || "#ffffff"}
          onChange={(e) => onChange({ ...v, secondaryColor: e.target.value })}
          isUpdated={isUpdated}
        />
      </Grid>
    </div>
  );
}

/** 2) sponsorAssets: string[] (asset URLs) */
export function SponsorAssetsForm({
  value,
  onChange,
  isUpdated,
}: {
  value: string[] | null;
  onChange: (v: string[]) => void;
  isUpdated?: boolean;
}) {
  const list = Array.isArray(value) ? value : [];
  const [draft, setDraft] = React.useState("");

  return (
    <div className="space-y-3">
      <FieldLabel
        label="Sponsor Assets"
        hint="Add sponsor image/video URLs. Displayed in rotation."
        isUpdated={isUpdated}
      />

      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <div className="space-y-2">
          {list.map((url, idx) => (
            <div key={`${url}-${idx}`} className="flex items-center gap-2">
              <input
                value={url}
                onChange={(e) => {
                  const next = [...list];
                  next[idx] = e.target.value;
                  onChange(next);
                }}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                placeholder="https://..."
              />
              <Button variant="danger" onClick={() => onChange(list.filter((_, i) => i !== idx))}>
                Remove
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="https://..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const t = draft.trim();
                if (!t) return;
                onChange([...list, t]);
                setDraft("");
              }
            }}
          />
          <Button
            variant="secondary"
            onClick={() => {
              const t = draft.trim();
              if (!t) return;
              onChange([...list, t]);
              setDraft("");
            }}
          >
            Add URL
          </Button>
        </div>
      </div>
    </div>
  );
}

/** 3) voiceProfile: { voiceName, rate, pitch, volume } */
export function VoiceProfileForm({
  value,
  onChange,
  title = "Voice Profile",
  isUpdated,
}: {
  value: { voiceName?: string; rate?: number; pitch?: number; volume?: number } | null;
  onChange: (v: any) => void;
  title?: string;
  isUpdated?: boolean;
}) {
  const v = value || {};
  return (
    <div className="space-y-3">
      <FieldLabel
        label={title}
        hint="Configure speaking voice: name + rate/pitch/volume."
        isUpdated={isUpdated}
      />
      <Grid>
        <Input
          label="Voice Name"
          value={v.voiceName || ""}
          onChange={(e) => onChange({ ...v, voiceName: e.target.value })}
          placeholder="e.g., en-US-JennyNeural"
          isUpdated={isUpdated}
        />
        <Input
          label="Rate (0.5–2.0)"
          type="number"
          step={0.1}
          value={(v.rate ?? "").toString()}
          onChange={(e) => onChange({ ...v, rate: ensureNumber(e.target.value, 1.0) })}
          isUpdated={isUpdated}
        />
        <Input
          label="Pitch (-10–10)"
          type="number"
          step={1}
          value={(v.pitch ?? "").toString()}
          onChange={(e) => onChange({ ...v, pitch: ensureNumber(e.target.value, 0) })}
          isUpdated={isUpdated}
        />
        <Input
          label="Volume (0–100)"
          type="number"
          step={1}
          value={(v.volume ?? "").toString()}
          onChange={(e) => onChange({ ...v, volume: ensureNumber(e.target.value, 80) })}
          isUpdated={isUpdated}
        />
      </Grid>
    </div>
  );
}

/** 4) faqItems: Array<{ question, answer, keywords: string[] }> */
export function FaqItemsForm({
  value,
  onChange,
  isUpdated,
}: {
  value: Array<{ question?: string; answer?: string; keywords?: string[] }> | null;
  onChange: (v: any[]) => void;
  isUpdated?: boolean;
}) {
  const list = Array.isArray(value) ? value : [];

  const update = (idx: number, patch: any) => {
    const next = [...list];
    next[idx] = { ...(next[idx] || {}), ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <FieldLabel
        label="FAQ Items"
        hint="Add Q/A items and optional keyword tags to help the robot route questions."
        isUpdated={isUpdated}
      />

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          No FAQ items. Click “Add FAQ” to create one.
        </div>
      ) : null}

      <div className="space-y-3">
        {list.map((item, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">FAQ #{idx + 1}</div>
              <Button variant="danger" onClick={() => onChange(list.filter((_, i) => i !== idx))}>
                Remove
              </Button>
            </div>

            <div className="mt-3 space-y-3">
              <Input
                label="Question"
                value={item.question || ""}
                onChange={(e) => update(idx, { question: e.target.value })}
                placeholder="e.g., How do I register?"
              />
              <Textarea
                label="Answer"
                value={item.answer || ""}
                onChange={(e) => update(idx, { answer: e.target.value })}
                placeholder="e.g., Please scan the QR code and fill the form..."
              />
              <TagInput
                label="Keywords"
                hint="Optional. Example: checkin, register, booth"
                tags={Array.isArray(item.keywords) ? item.keywords : []}
                onChange={(tags) => update(idx, { keywords: tags })}
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        onClick={() => onChange([...list, { question: "", answer: "", keywords: [] }])}
      >
        Add FAQ
      </Button>
    </div>
  );
}

/** 5) pois: Array<{ name, description, locationHint }> */
export function PoisForm({
  value,
  onChange,
  isUpdated,
}: {
  value: Array<{ name?: string; description?: string; locationHint?: string }> | null;
  onChange: (v: any[]) => void;
  isUpdated?: boolean;
}) {
  const list = Array.isArray(value) ? value : [];

  const update = (idx: number, patch: any) => {
    const next = [...list];
    next[idx] = { ...(next[idx] || {}), ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <FieldLabel
        label="Points of Interest (POI)"
        hint="Define booths/places the robot can guide visitors to."
        isUpdated={isUpdated}
      />

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          No POIs. Click “Add POI” to create one.
        </div>
      ) : null}

      <div className="space-y-3">
        {list.map((poi, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">POI #{idx + 1}</div>
              <Button variant="danger" onClick={() => onChange(list.filter((_, i) => i !== idx))}>
                Remove
              </Button>
            </div>

            <div className="mt-3 space-y-3">
              <Input
                label="Name"
                required
                value={poi.name || ""}
                onChange={(e) => update(idx, { name: e.target.value })}
                placeholder="e.g., Registration Booth"
              />
              <Input
                label="Description"
                value={poi.description || ""}
                onChange={(e) => update(idx, { description: e.target.value })}
                placeholder="Optional"
              />
              <Input
                label="Location Hint"
                value={poi.locationHint || ""}
                onChange={(e) => update(idx, { locationHint: e.target.value })}
                placeholder="e.g., Near the main entrance, left side"
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        onClick={() => onChange([...list, { name: "", description: "", locationHint: "" }])}
      >
        Add POI
      </Button>
    </div>
  );
}

/** 6) navigationRules: { maxSpeed, noGoZones: string[], preferredPaths: string[] } */
export function NavigationRulesForm({
  value,
  onChange,
  isUpdated,
}: {
  value: { maxSpeed?: number; noGoZones?: string[]; preferredPaths?: string[] } | null;
  onChange: (v: any) => void;
  isUpdated?: boolean;
}) {
  const v = value || {};
  return (
    <div className="space-y-3">
      <FieldLabel label="Navigation Rules" hint="Set speed and navigation restrictions." isUpdated={isUpdated} />
      <Grid>
        <Input
          label="Max Speed (m/s)"
          type="number"
          step={0.1}
          value={(v.maxSpeed ?? "").toString()}
          onChange={(e) => onChange({ ...v, maxSpeed: ensureNumber(e.target.value, 0.8) })}
        />
        <Input
          label="No-Go Zones"
          hint="Comma separated. Example: stage, backstage"
          value={(Array.isArray(v.noGoZones) ? v.noGoZones : []).join(", ")}
          onChange={(e) => onChange({ ...v, noGoZones: normalizeCommaList(e.target.value) })}
        />
        <Input
          label="Preferred Paths"
          hint="Comma separated. Example: aisle A, aisle B"
          value={(Array.isArray(v.preferredPaths) ? v.preferredPaths : []).join(", ")}
          onChange={(e) => onChange({ ...v, preferredPaths: normalizeCommaList(e.target.value) })}
        />
      </Grid>
    </div>
  );
}

/** 7) showSets: Array<{ setName, musicTrackUrl, choreographyId, durationSec, repeatCount }> */
export function ShowSetsForm({
  value,
  onChange,
  isUpdated,
}: {
  value: Array<{
    setName?: string;
    musicTrackUrl?: string;
    choreographyId?: string;
    durationSec?: number;
    repeatCount?: number;
  }> | null;
  onChange: (v: any[]) => void;
  isUpdated?: boolean;
}) {
  const list = Array.isArray(value) ? value : [];

  const update = (idx: number, patch: any) => {
    const next = [...list];
    next[idx] = { ...(next[idx] || {}), ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <FieldLabel label="Show Sets" hint="Configure dance sets (music + choreography + duration + repeat)." isUpdated={isUpdated} />

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          No show sets. Click “Add Show Set”.
        </div>
      ) : null}

      <div className="space-y-3">
        {list.map((set, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Set #{idx + 1}</div>
              <Button variant="danger" onClick={() => onChange(list.filter((_, i) => i !== idx))}>
                Remove
              </Button>
            </div>

            <div className="mt-3 space-y-3">
              <Input
                label="Set Name"
                required
                value={set.setName || ""}
                onChange={(e) => update(idx, { setName: e.target.value })}
                placeholder="e.g., Opening Dance"
              />
              <Grid>
                <Input
                  label="Music Track URL"
                  type="url"
                  value={set.musicTrackUrl || ""}
                  onChange={(e) => update(idx, { musicTrackUrl: e.target.value })}
                  placeholder="https://..."
                />
                <Input
                  label="Choreography ID"
                  value={set.choreographyId || ""}
                  onChange={(e) => update(idx, { choreographyId: e.target.value })}
                  placeholder="e.g., CHO-001"
                />
                <Input
                  label="Duration (sec)"
                  type="number"
                  min={10}
                  value={(set.durationSec ?? 10).toString()}
                  onChange={(e) => update(idx, { durationSec: ensureNumber(e.target.value, 10) })}
                />
                <Input
                  label="Repeat Count"
                  type="number"
                  min={1}
                  value={(set.repeatCount ?? 1).toString()}
                  onChange={(e) => update(idx, { repeatCount: ensureNumber(e.target.value, 1) })}
                />
              </Grid>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        onClick={() =>
          onChange([
            ...list,
            { setName: "", musicTrackUrl: "", choreographyId: "", durationSec: 10, repeatCount: 1 },
          ])
        }
      >
        Add Show Set
      </Button>
    </div>
  );
}

/** 8) showOrder: number[] */
export function ShowOrderForm({
  value,
  onChange,
  isUpdated,
}: {
  value: number[] | null;
  onChange: (v: number[]) => void;
  isUpdated?: boolean;
}) {
  const arr = Array.isArray(value) ? value : [];
  const text = arr.join(", ");

  return (
    <Input
      label="Show Order"
      hint="Comma-separated indices. Example: 0, 2, 1"
      value={text}
      onChange={(e) => {
        const nums = normalizeCommaList(e.target.value).map((x) => Number(x));
        onChange(nums.filter((n) => Number.isFinite(n)));
      }}
      placeholder="0, 1, 2"
      isUpdated={isUpdated}
    />
  );
}

/** 9) cuePoints: Array<{ timecodeSec, action, note }> */
export function CuePointsForm({
  value,
  onChange,
  isUpdated,
}: {
  value: Array<{ timecodeSec?: number; action?: string; note?: string }> | null;
  onChange: (v: any[]) => void;
  isUpdated?: boolean;
}) {
  const list = Array.isArray(value) ? value : [];

  const update = (idx: number, patch: any) => {
    const next = [...list];
    next[idx] = { ...(next[idx] || {}), ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <FieldLabel label="Cue Points" hint="Timecoded actions used during show playback." isUpdated={isUpdated} />

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          No cue points. Click “Add Cue”.
        </div>
      ) : null}

      <div className="space-y-3">
        {list.map((cue, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Cue #{idx + 1}</div>
              <Button variant="danger" onClick={() => onChange(list.filter((_, i) => i !== idx))}>
                Remove
              </Button>
            </div>

            <div className="mt-3 space-y-3">
              <Grid>
                <Input
                  label="Timecode (sec)"
                  type="number"
                  min={0}
                  value={(cue.timecodeSec ?? 0).toString()}
                  onChange={(e) => update(idx, { timecodeSec: ensureNumber(e.target.value, 0) })}
                />
                <Input
                  label="Action"
                  required
                  value={cue.action || ""}
                  onChange={(e) => update(idx, { action: e.target.value })}
                  placeholder="e.g., waveHand"
                />
              </Grid>
              <Input
                label="Note"
                value={cue.note || ""}
                onChange={(e) => update(idx, { note: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>
        ))}
      </div>

      <Button variant="secondary" onClick={() => onChange([...list, { timecodeSec: 0, action: "", note: "" }])}>
        Add Cue
      </Button>
    </div>
  );
}

/** 10) stageZone: { widthM, depthM, safeDistanceM } */
export function StageZoneForm({
  value,
  onChange,
  isUpdated,
}: {
  value: { widthM?: number; depthM?: number; safeDistanceM?: number } | null;
  onChange: (v: any) => void;
  isUpdated?: boolean;
}) {
  const v = value || {};
  return (
    <div className="space-y-3">
      <FieldLabel label="Stage Zone" hint="Define stage size and required safe distance." isUpdated={isUpdated} />
      <Grid>
        <Input
          label="Width (m)"
          type="number"
          min={1}
          step={0.1}
          value={(v.widthM ?? "").toString()}
          onChange={(e) => onChange({ ...v, widthM: ensureNumber(e.target.value, 1) })}
        />
        <Input
          label="Depth (m)"
          type="number"
          min={1}
          step={0.1}
          value={(v.depthM ?? "").toString()}
          onChange={(e) => onChange({ ...v, depthM: ensureNumber(e.target.value, 1) })}
        />
        <Input
          label="Safe Distance (m)"
          type="number"
          min={0.5}
          step={0.1}
          value={(v.safeDistanceM ?? "").toString()}
          onChange={(e) => onChange({ ...v, safeDistanceM: ensureNumber(e.target.value, 0.5) })}
        />
      </Grid>
    </div>
  );
}

/** 11) safetyLimits: { maxJointSpeed, maxLimbAngle, emergencyStopRequired } */
export function SafetyLimitsForm({
  value,
  onChange,
  isUpdated,
}: {
  value: { maxJointSpeed?: number; maxLimbAngle?: number; emergencyStopRequired?: boolean } | null;
  onChange: (v: any) => void;
  isUpdated?: boolean;
}) {
  const v = value || {};
  return (
    <div className="space-y-3">
      <FieldLabel label="Safety Limits" hint="Optional advanced safety boundaries." isUpdated={isUpdated} />
      <Grid>
        <Input
          label="Max Joint Speed"
          type="number"
          step={0.1}
          value={(v.maxJointSpeed ?? "").toString()}
          onChange={(e) => onChange({ ...v, maxJointSpeed: ensureNumber(e.target.value, 1.0) })}
        />
        <Input
          label="Max Limb Angle"
          type="number"
          step={1}
          value={(v.maxLimbAngle ?? "").toString()}
          onChange={(e) => onChange({ ...v, maxLimbAngle: ensureNumber(e.target.value, 90) })}
        />
      </Grid>

      <Checkbox
        label="Emergency Stop Required"
        checked={!!v.emergencyStopRequired}
        onChange={(checked) => onChange({ ...v, emergencyStopRequired: checked })}
        hint="If enabled, staff must have e-stop ready before performance."
        isUpdated={isUpdated}
      />
    </div>
  );
}

/** 12) scriptBlocks: Array<{ blockTitle, timecode, text, language, estimatedDurationSec, interactionPrompts:string[] }> */
export function ScriptBlocksForm({
  value,
  onChange,
  isUpdated,
}: {
  value: Array<{
    blockTitle?: string;
    timecode?: string;
    text?: string;
    language?: string;
    estimatedDurationSec?: number;
    interactionPrompts?: string[];
  }> | null;
  onChange: (v: any[]) => void;
  isUpdated?: boolean;
}) {
  const list = Array.isArray(value) ? value : [];

  const update = (idx: number, patch: any) => {
    const next = [...list];
    next[idx] = { ...(next[idx] || {}), ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <FieldLabel label="Script Blocks" hint="MC timeline blocks (title, text, timecode, etc.)." isUpdated={isUpdated} />

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          No script blocks. Click “Add Block”.
        </div>
      ) : null}

      <div className="space-y-3">
        {list.map((b, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Block #{idx + 1}</div>
              <Button variant="danger" onClick={() => onChange(list.filter((_, i) => i !== idx))}>
                Remove
              </Button>
            </div>

            <div className="mt-3 space-y-3">
              <Grid>
                <Input
                  label="Block Title"
                  required
                  value={b.blockTitle || ""}
                  onChange={(e) => update(idx, { blockTitle: e.target.value })}
                  placeholder="e.g., Opening"
                />
                <Input
                  label="Timecode"
                  hint="Optional. e.g., 09:30"
                  value={b.timecode || ""}
                  onChange={(e) => update(idx, { timecode: e.target.value })}
                  placeholder="HH:MM or any label"
                />
              </Grid>

              <Textarea
                label="Text"
                required
                value={b.text || ""}
                onChange={(e) => update(idx, { text: e.target.value })}
                placeholder="What the robot will say..."
              />

              <Grid>
                <Input
                  label="Language"
                  value={b.language || ""}
                  onChange={(e) => update(idx, { language: e.target.value })}
                  placeholder="VI / EN / ..."
                />
                <Input
                  label="Estimated Duration (sec)"
                  type="number"
                  min={5}
                  value={(b.estimatedDurationSec ?? 5).toString()}
                  onChange={(e) => update(idx, { estimatedDurationSec: ensureNumber(e.target.value, 5) })}
                />
              </Grid>

              <TagInput
                label="Interaction Prompts"
                hint="Optional. Add short prompts or cue phrases."
                tags={Array.isArray(b.interactionPrompts) ? b.interactionPrompts : []}
                onChange={(tags) => update(idx, { interactionPrompts: tags })}
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        onClick={() =>
          onChange([
            ...list,
            { blockTitle: "", timecode: "", text: "", language: "", estimatedDurationSec: 5, interactionPrompts: [] },
          ])
        }
      >
        Add Block
      </Button>
    </div>
  );
}

/** 13) pronunciationDict: Array<{ term, phonetic }> */
export function PronunciationDictForm({
  value,
  onChange,
  isUpdated,
}: {
  value: Array<{ term?: string; phonetic?: string }> | null;
  onChange: (v: any[]) => void;
  isUpdated?: boolean;
}) {
  const list = Array.isArray(value) ? value : [];

  const update = (idx: number, patch: any) => {
    const next = [...list];
    next[idx] = { ...(next[idx] || {}), ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <FieldLabel label="Pronunciation Dictionary" hint="Help the robot pronounce names/brands correctly." isUpdated={isUpdated} />

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          No entries. Click “Add Entry”.
        </div>
      ) : null}

      <div className="space-y-3">
        {list.map((item, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Entry #{idx + 1}</div>
              <Button variant="danger" onClick={() => onChange(list.filter((_, i) => i !== idx))}>
                Remove
              </Button>
            </div>

            <div className="mt-3">
              <Grid>
                <Input
                  label="Term"
                  required
                  value={item.term || ""}
                  onChange={(e) => update(idx, { term: e.target.value })}
                  placeholder="e.g., RoboRent"
                />
                <Input
                  label="Phonetic"
                  required
                  value={item.phonetic || ""}
                  onChange={(e) => update(idx, { phonetic: e.target.value })}
                  placeholder="e.g., roh-boh-rent"
                />
              </Grid>
            </div>
          </div>
        ))}
      </div>

      <Button variant="secondary" onClick={() => onChange([...list, { term: "", phonetic: "" }])}>
        Add Entry
      </Button>
    </div>
  );
}

/** 14) screenAssets: Array<{ type, url, displayDurationSec }> */
export function ScreenAssetsForm({
  value,
  onChange,
  isUpdated,
}: {
  value: Array<{ type?: string; url?: string; displayDurationSec?: number }> | null;
  onChange: (v: any[]) => void;
  isUpdated?: boolean;
}) {
  const list = Array.isArray(value) ? value : [];

  const update = (idx: number, patch: any) => {
    const next = [...list];
    next[idx] = { ...(next[idx] || {}), ...patch };
    onChange(next);
  };

  const assetTypes = ["Image", "Video", "QR", "Slide"];

  return (
    <div className="space-y-3">
      <FieldLabel label="On-screen Assets" hint="Assets the screen will show (QR/Image/Slide) with duration." isUpdated={isUpdated} />

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          No screen assets. Click “Add Asset”.
        </div>
      ) : null}

      <div className="space-y-3">
        {list.map((item, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Asset #{idx + 1}</div>
              <Button variant="danger" onClick={() => onChange(list.filter((_, i) => i !== idx))}>
                Remove
              </Button>
            </div>

            <div className="mt-3 space-y-3">
              <Grid>
                <Select
                  label="Type"
                  value={item.type || assetTypes[0]}
                  options={assetTypes}
                  onChange={(v) => update(idx, { type: v })}
                />
                <Input
                  label="URL"
                  type="url"
                  required
                  value={item.url || ""}
                  onChange={(e) => update(idx, { url: e.target.value })}
                  placeholder="https://..."
                />
                <Input
                  label="Display Duration (sec)"
                  type="number"
                  min={1}
                  value={(item.displayDurationSec ?? 5).toString()}
                  onChange={(e) => update(idx, { displayDurationSec: ensureNumber(e.target.value, 5) })}
                />
              </Grid>
            </div>
          </div>
        ))}
      </div>

      <Button variant="secondary" onClick={() => onChange([...list, { type: "Image", url: "", displayDurationSec: 5 }])}>
        Add Asset
      </Button>
    </div>
  );
}

/** 15) countdownSettings: { enabled: boolean, targetTime: string } */
export function CountdownSettingsForm({
  value,
  onChange,
  isUpdated,
}: {
  value: { enabled?: boolean; targetTime?: string } | null;
  onChange: (v: any) => void;
  isUpdated?: boolean;
}) {
  const v = value || {};
  return (
    <div className="space-y-3">
      <FieldLabel label="Countdown Settings" hint="Optional countdown timer configuration." isUpdated={isUpdated} />

      <Checkbox
        label="Enabled"
        checked={!!v.enabled}
        onChange={(checked) => onChange({ ...v, enabled: checked })}
        isUpdated={isUpdated}
      />

      <Input
        label="Target Time"
        hint="Use local datetime."
        type="datetime-local"
        value={v.targetTime || ""}
        onChange={(e) => onChange({ ...v, targetTime: e.target.value })}
        isUpdated={isUpdated}
      />
    </div>
  );
}

/** 16) handoffCues: Array<{ cue, who }> */
export function HandoffCuesForm({
  value,
  onChange,
  isUpdated,
}: {
  value: Array<{ cue?: string; who?: string }> | null;
  onChange: (v: any[]) => void;
  isUpdated?: boolean;
}) {
  const list = Array.isArray(value) ? value : [];

  const update = (idx: number, patch: any) => {
    const next = [...list];
    next[idx] = { ...(next[idx] || {}), ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <FieldLabel label="Handoff Cues" hint="Cues to hand off between Robot and Human MC." isUpdated={isUpdated} />

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          No cues. Click “Add Cue”.
        </div>
      ) : null}

      <div className="space-y-3">
        {list.map((item, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Cue #{idx + 1}</div>
              <Button variant="danger" onClick={() => onChange(list.filter((_, i) => i !== idx))}>
                Remove
              </Button>
            </div>

            <div className="mt-3">
              <Grid>
                <Input
                  label="Cue"
                  required
                  value={item.cue || ""}
                  onChange={(e) => update(idx, { cue: e.target.value })}
                  placeholder="e.g., Now please welcome our MC..."
                />
                <Select
                  label="Who"
                  value={item.who || "Robot"}
                  options={["Robot", "Human"]}
                  onChange={(v) => update(idx, { who: v })}
                />
              </Grid>
            </div>
          </div>
        ))}
      </div>

      <Button variant="secondary" onClick={() => onChange([...list, { cue: "", who: "Robot" }])}>
        Add Cue
      </Button>
    </div>
  );
}

/** 17) adPlaylist: Array<{ assetUrl, assetType, durationSec, order }> */
export function AdPlaylistForm({
  value,
  onChange,
  isUpdated,
}: {
  value: Array<{ assetUrl?: string; assetType?: string; durationSec?: number; order?: number }> | null;
  onChange: (v: any[]) => void;
  isUpdated?: boolean;
}) {
  const list = Array.isArray(value) ? value : [];

  const update = (idx: number, patch: any) => {
    const next = [...list];
    next[idx] = { ...(next[idx] || {}), ...patch };
    onChange(next);
  };

  const types = ["Image", "Video"];

  return (
    <div className="space-y-3">
      <FieldLabel label="Ad Playlist" hint="Playlist of ads (image/video) with duration and order." isUpdated={isUpdated} />

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          No items. Click “Add Ad”.
        </div>
      ) : null}

      <div className="space-y-3">
        {list.map((item, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Ad #{idx + 1}</div>
              <Button variant="danger" onClick={() => onChange(list.filter((_, i) => i !== idx))}>
                Remove
              </Button>
            </div>

            <div className="mt-3 space-y-3">
              <Input
                label="Asset URL"
                type="url"
                required
                value={item.assetUrl || ""}
                onChange={(e) => update(idx, { assetUrl: e.target.value })}
                placeholder="https://..."
              />
              <Grid>
                <Select
                  label="Asset Type"
                  value={item.assetType || "Image"}
                  options={types}
                  onChange={(v) => update(idx, { assetType: v })}
                />
                <Input
                  label="Duration (sec)"
                  type="number"
                  min={1}
                  value={(item.durationSec ?? 5).toString()}
                  onChange={(e) => update(idx, { durationSec: ensureNumber(e.target.value, 5) })}
                />
                <Input
                  label="Order"
                  type="number"
                  min={0}
                  value={(item.order ?? idx).toString()}
                  onChange={(e) => update(idx, { order: ensureNumber(e.target.value, idx) })}
                />
              </Grid>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        onClick={() => onChange([...list, { assetUrl: "", assetType: "Image", durationSec: 5, order: list.length }])}
      >
        Add Ad
      </Button>
    </div>
  );
}

/** 18) scheduleRules: { start, end, peakMode, intervalSec } */
export function ScheduleRulesForm({
  value,
  onChange,
  isUpdated,
}: {
  value: { start?: string; end?: string; peakMode?: boolean; intervalSec?: number } | null;
  onChange: (v: any) => void;
  isUpdated?: boolean;
}) {
  const v = value || {};
  return (
    <div className="space-y-3">
      <FieldLabel label="Schedule Rules" hint="When and how often to run playlist items." isUpdated={isUpdated} />
      <Grid>
        <Input
          label="Start"
          type="time"
          value={v.start || ""}
          onChange={(e) => onChange({ ...v, start: e.target.value })}
        />
        <Input
          label="End"
          type="time"
          value={v.end || ""}
          onChange={(e) => onChange({ ...v, end: e.target.value })}
        />
        <Input
          label="Interval (sec)"
          type="number"
          min={5}
          value={(v.intervalSec ?? 10).toString()}
          onChange={(e) => onChange({ ...v, intervalSec: ensureNumber(e.target.value, 10) })}
        />
      </Grid>

      <Checkbox
        label="Peak Mode"
        checked={!!v.peakMode}
        onChange={(checked) => onChange({ ...v, peakMode: checked })}
        hint="If enabled, robot may run ads more aggressively during peak hours."
        isUpdated={isUpdated}
      />
    </div>
  );
}

/** 19) audioPlaylist: string[] */
export function AudioPlaylistForm({
  value,
  onChange,
  isUpdated,
}: {
  value: string[] | null;
  onChange: (v: string[]) => void;
  isUpdated?: boolean;
}) {
  const arr = Array.isArray(value) ? value : [];
  return (
    <Input
      label="Audio Playlist"
      hint="Comma separated audio URLs."
      value={arr.join(", ")}
      onChange={(e) => onChange(normalizeCommaList(e.target.value))}
      placeholder="https://.../track1.mp3, https://.../track2.mp3"
      isUpdated={isUpdated}
    />
  );
}

/** 20) volumeRules: { defaultVolume, quietHoursVolume? } */
export function VolumeRulesForm({
  value,
  onChange,
  withQuietHours = true,
  isUpdated,
}: {
  value: { defaultVolume?: number; quietHoursVolume?: number } | null;
  onChange: (v: any) => void;
  withQuietHours?: boolean;
  isUpdated?: boolean;
}) {
  const v = value || {};
  return (
    <div className="space-y-3">
      <FieldLabel label="Volume Rules" hint="Set default volume (and optional quiet-hours volume)." isUpdated={isUpdated} />
      <Grid>
        <Input
          label="Default Volume (0–100)"
          type="number"
          min={0}
          max={100}
          value={(v.defaultVolume ?? 80).toString()}
          onChange={(e) => onChange({ ...v, defaultVolume: ensureNumber(e.target.value, 80) })}
        />
        {withQuietHours ? (
          <Input
            label="Quiet Hours Volume (0–100)"
            type="number"
            min={0}
            max={100}
            value={(v.quietHoursVolume ?? 40).toString()}
            onChange={(e) => onChange({ ...v, quietHoursVolume: ensureNumber(e.target.value, 40) })}
          />
        ) : null}
      </Grid>
    </div>
  );
}

/** 21) routePoints: Array<{ name, stopDurationSec }> */
export function RoutePointsForm({
  value,
  onChange,
  isUpdated,
}: {
  value: Array<{ name?: string; stopDurationSec?: number }> | null;
  onChange: (v: any[]) => void;
  isUpdated?: boolean;
}) {
  const list = Array.isArray(value) ? value : [];

  const update = (idx: number, patch: any) => {
    const next = [...list];
    next[idx] = { ...(next[idx] || {}), ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <FieldLabel label="Route Points" hint="Patrol mode stops. Each point has a name and stop duration." isUpdated={isUpdated} />

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          No route points. Click “Add Point”.
        </div>
      ) : null}

      <div className="space-y-3">
        {list.map((p, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Point #{idx + 1}</div>
              <Button variant="danger" onClick={() => onChange(list.filter((_, i) => i !== idx))}>
                Remove
              </Button>
            </div>

            <div className="mt-3">
              <Grid>
                <Input
                  label="Name"
                  required
                  value={p.name || ""}
                  onChange={(e) => update(idx, { name: e.target.value })}
                  placeholder="e.g., Booth A"
                />
                <Input
                  label="Stop Duration (sec)"
                  type="number"
                  min={1}
                  value={(p.stopDurationSec ?? 5).toString()}
                  onChange={(e) => update(idx, { stopDurationSec: ensureNumber(e.target.value, 5) })}
                />
              </Grid>
            </div>
          </div>
        ))}
      </div>

      <Button variant="secondary" onClick={() => onChange([...list, { name: "", stopDurationSec: 5 }])}>
        Add Point
      </Button>
    </div>
  );
}

/** 22) avoidZones: string[] */
export function AvoidZonesForm({
  value,
  onChange,
  isUpdated,
}: {
  value: string[] | null;
  onChange: (v: string[]) => void;
  isUpdated?: boolean;
}) {
  const arr = Array.isArray(value) ? value : [];
  return (
    <Input
      label="Avoid Zones"
      hint="Comma-separated zone labels to avoid."
      value={arr.join(", ")}
      onChange={(e) => onChange(normalizeCommaList(e.target.value))}
      placeholder="stage, backstage, VIP"
      isUpdated={isUpdated}
    />
  );
}

/* =========================================================================
 * Ability -> Form mapping
 * ========================================================================= */

export type AbilityKey =
  | "themeAssets"
  | "sponsorAssets"
  | "voiceProfile"
  | "faqItems"
  | "pois"
  | "navigationRules"
  | "showSets"
  | "showOrder"
  | "cuePoints"
  | "stageZone"
  | "safetyLimits"
  | "scriptBlocks"
  | "pronunciationDict"
  | "screenAssets"
  | "countdownSettings"
  | "handoffCues"
  | "adPlaylist"
  | "scheduleRules"
  | "audioPlaylist"
  | "volumeRules"
  | "routePoints"
  | "avoidZones";

/**
 * ✅ Updated:
 * - added `isUpdated?: boolean` passthrough
 */
export function renderJsonAbilityForm(
  key: AbilityKey,
  value: any,
  onChange: (v: any) => void,
  isUpdated?: boolean
): React.ReactNode {
  switch (key) {
    case "themeAssets":
      return <ThemeAssetsForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "sponsorAssets":
      return <SponsorAssetsForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "voiceProfile":
      return <VoiceProfileForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "faqItems":
      return <FaqItemsForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "pois":
      return <PoisForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "navigationRules":
      return <NavigationRulesForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "showSets":
      return <ShowSetsForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "showOrder":
      return <ShowOrderForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "cuePoints":
      return <CuePointsForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "stageZone":
      return <StageZoneForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "safetyLimits":
      return <SafetyLimitsForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "scriptBlocks":
      return <ScriptBlocksForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "pronunciationDict":
      return <PronunciationDictForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "screenAssets":
      return <ScreenAssetsForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "countdownSettings":
      return <CountdownSettingsForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "handoffCues":
      return <HandoffCuesForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "adPlaylist":
      return <AdPlaylistForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "scheduleRules":
      return <ScheduleRulesForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "audioPlaylist":
      return <AudioPlaylistForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "volumeRules":
      return <VolumeRulesForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "routePoints":
      return <RoutePointsForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    case "avoidZones":
      return <AvoidZonesForm value={value} onChange={onChange} isUpdated={isUpdated} />;
    default:
      return null;
  }
}
