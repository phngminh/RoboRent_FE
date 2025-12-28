import React, { useMemo, useRef, useState } from "react";

export type RobotAbility = {
  id: number;
  robotTypeId: number;
  key: string;
  label: string;
  description?: string | null;
  dataType: string;
  isRequired: boolean;
  abilityGroup?: string | null;

  lockAtCutoff: boolean;
  isPriceImpacting: boolean;
  isOnSiteAdjustable: boolean;

  uiControl?: string | null;
  placeholder?: string | null;

  maxLength?: number | null;
  min?: number | null;
  max?: number | null;

  optionsJson?: string | null;
  jsonSchema?: string | null;
  isActive?: boolean;
};

function safeJsonParse<T = any>(text?: string | null): T | null {
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** Heuristic: url fields that are likely image assets for customer UI */
function isLikelyImageUrlField(ability: RobotAbility) {
  const ui = String(ability.uiControl || "").toLowerCase();
  if (ui !== "url") return false;

  const key = String(ability.key || "").toLowerCase();
  const label = String(ability.label || "").toLowerCase();

  const tokens = [
    "logo",
    "banner",
    "background",
    "image",
    "img",
    "thumbnail",
    "avatar",
    "poster",
    "cover",
    "asset",
  ];

  if (tokens.some((t) => key.includes(t))) return true;
  if (tokens.some((t) => label.includes(t))) return true;

  return false;
}

/**
 * Pending image value (LOCAL ONLY):
 * - stores file and previewUrl
 * - MUST NOT upload here
 * - upload only on Save Draft in CreateRentalDetailContent
 */
export type PendingImageValue = {
  __type: "pending-image";
  file: File;
  previewUrl: string; // objectURL for preview
  fileName?: string;
};

export function isPendingImageValue(v: any): v is PendingImageValue {
  return (
    v &&
    typeof v === "object" &&
    v.__type === "pending-image" &&
    v.file instanceof File &&
    typeof v.previewUrl === "string"
  );
}

/**
 * Upload one image file to Cloudinary (unsigned preset).
 * Called ONLY by page Save Draft.
 */
async function uploadImageToCloudinary(params: {
  file: File;
  folder: string;
}): Promise<{ url: string; publicId: string }> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Missing VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET"
    );
  }

  const form = new FormData();
  form.append("file", params.file);
  form.append("upload_preset", uploadPreset);
  form.append("folder", params.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id };
}

/**
 * ✅ IMPORTANT: Commit (upload) ONLY image-url fields that are pending.
 * - abilities are provided so we ONLY upload fields that are "image url fields"
 * - returns new values where pending images replaced by URL
 * - revokes objectURLs to avoid memory leaks
 */
export async function commitPendingImagesToCloudinary(
  abilities: RobotAbility[],
  values: Record<string, any>,
  opts: { folder: string }
): Promise<Record<string, any>> {
  const next: Record<string, any> = { ...values };

  const imageUrlAbilities = abilities
    .filter((a) => a.isActive !== false)
    .filter((a) => (a.uiControl || "").toLowerCase() === "url")
    .filter((a) => isLikelyImageUrlField(a));

  for (const a of imageUrlAbilities) {
    const v = next[a.key];

    if (isPendingImageValue(v)) {
      const { url } = await uploadImageToCloudinary({
        file: v.file,
        folder: opts.folder,
      });

      // replace pending with actual cloudinary URL
      next[a.key] = url;

      // cleanup preview object URL
      try {
        URL.revokeObjectURL(v.previewUrl);
      } catch {
        // ignore
      }
    }
  }

  return next;
}

export function AbilityField({
  ability,
  value,
  disabled,
  error,
  onChange,
}: {
  ability: RobotAbility;
  value: any;
  disabled?: boolean;
  error?: string;
  onChange: (v: any) => void;
}) {
  const options = useMemo(() => {
    const raw = safeJsonParse<any[]>(ability.optionsJson);
    return Array.isArray(raw) ? raw : [];
  }, [ability.optionsJson]);

  const ui = (ability.uiControl || "").toLowerCase();
  const dt = (ability.dataType || "").toLowerCase();

  const baseCls =
    "w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500";

  const errorView = error ? (
    <div className="text-xs text-red-600 mt-1">{error}</div>
  ) : null;

  const labelView = (
    <div className="flex items-baseline gap-2">
      <span className="text-sm font-medium text-gray-700">
        {ability.label}
        {ability.isRequired ? <span className="text-red-500"> *</span> : null}
      </span>
      {ability.isPriceImpacting ? (
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
          Price
        </span>
      ) : null}
    </div>
  );

  const hint = ability.description ? (
    <div className="text-xs text-gray-500">{ability.description}</div>
  ) : null;

  // ---------------------------
  // Image URL field (LOCAL PICK ONLY, NO UPLOAD HERE)
  // ---------------------------
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [imgBroken, setImgBroken] = useState(false);

  if (ui === "url" && isLikelyImageUrlField(ability)) {
    const pending = isPendingImageValue(value) ? value : null;
    const previewOrUrl =
      pending?.previewUrl ??
      (typeof value === "string" ? value : value == null ? "" : String(value));

    return (
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            {labelView}
            {hint}
            {pending ? (
              <div className="text-[11px] text-blue-600">
                Ảnh đang giữ tạm (local). Chỉ upload khi bấm <b>Save as Draft</b>.
              </div>
            ) : null}
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={disabled}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;

                // cleanup old preview url
                if (pending?.previewUrl) {
                  try {
                    URL.revokeObjectURL(pending.previewUrl);
                  } catch {}
                }

                const previewUrl = URL.createObjectURL(f);
                setImgBroken(false);

                // ✅ store pending locally ONLY
                onChange({
                  __type: "pending-image",
                  file: f,
                  previewUrl,
                  fileName: f.name,
                } satisfies PendingImageValue);

                // allow re-pick same file
                if (fileRef.current) fileRef.current.value = "";
              }}
            />

            <button
              type="button"
              disabled={disabled}
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-60"
            >
              Tải ảnh lên
            </button>

            {pending ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  try {
                    URL.revokeObjectURL(pending.previewUrl);
                  } catch {}
                  setImgBroken(false);
                  onChange(""); // clear
                }}
                className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-60"
              >
                Bỏ ảnh
              </button>
            ) : null}
          </div>
        </div>

        {/* If pending, we disable manual URL input to avoid confusion */}
        <input
          type="url"
          value={pending ? "" : typeof value === "string" ? value : ""}
          disabled={disabled || !!pending}
          placeholder={
            pending
              ? "Ảnh sẽ upload khi bấm Save as Draft"
              : ability.placeholder ?? "Dán link ảnh hoặc tải ảnh lên"
          }
          maxLength={ability.maxLength ?? undefined}
          onChange={(e) => {
            setImgBroken(false);
            onChange(e.target.value);
          }}
          className={`${baseCls} ${
            error ? "border-red-400" : "border-gray-200"
          }`}
        />

        {/* Preview */}
        {previewOrUrl.trim() ? (
          <div className="border rounded-lg p-2 bg-gray-50">
            <div className="text-xs text-gray-500 mb-2">Xem trước</div>

            {!imgBroken ? (
              <img
                src={previewOrUrl}
                alt="preview"
                className="max-h-44 w-auto rounded-md border bg-white"
                onError={() => setImgBroken(true)}
              />
            ) : (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                Không thể tải ảnh. Hãy kiểm tra lại link hoặc tải ảnh lên.
              </div>
            )}
          </div>
        ) : null}

        {errorView}
      </div>
    );
  }

  // ---------------------------
  // json editor
  // ---------------------------
  if (ui === "jsoneditor" || dt === "json") {
    const text =
      typeof value === "string"
        ? value
        : value == null
        ? ""
        : JSON.stringify(value, null, 2);

    const schemaExample = ability.jsonSchema
      ? safeJsonParse<any>(ability.jsonSchema)
      : null;

    return (
      <div className="space-y-1">
        {labelView}
        {hint}
        <textarea
          value={text}
          disabled={disabled}
          placeholder={ability.placeholder ?? "{ ... }"}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseCls} min-h-[140px] font-mono`}
        />

        {schemaExample ? (
          <details className="text-xs text-gray-600">
            <summary className="cursor-pointer select-none">
              Xem cấu trúc gợi ý
            </summary>
            <pre className="whitespace-pre-wrap mt-2">
              {JSON.stringify(schemaExample, null, 2)}
            </pre>
          </details>
        ) : null}

        {errorView}
      </div>
    );
  }

  // ---------------------------
  // textarea
  // ---------------------------
  if (ui === "textarea") {
    return (
      <div className="space-y-1">
        {labelView}
        {hint}
        <textarea
          value={value ?? ""}
          disabled={disabled}
          placeholder={ability.placeholder ?? ""}
          maxLength={ability.maxLength ?? undefined}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseCls} min-h-[72px]`}
        />
        {errorView}
      </div>
    );
  }

  // ---------------------------
  // switch / bool
  // ---------------------------
  if (ui === "switch" || dt === "bool") {
    return (
      <div className="space-y-1">
        {labelView}
        {hint}
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="text-gray-700">{!!value ? "Bật" : "Tắt"}</span>
        </label>
        {errorView}
      </div>
    );
  }

  // ---------------------------
  // select / enum
  // ---------------------------
  if (ui === "select" || dt === "enum") {
    return (
      <div className="space-y-1">
        {labelView}
        {hint}
        <select
          value={value ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={baseCls}
        >
          <option value="" disabled>
            -- Chọn --
          </option>
          {options.map((o) => (
            <option key={String(o)} value={String(o)}>
              {String(o)}
            </option>
          ))}
        </select>
        {errorView}
      </div>
    );
  }

  // ---------------------------
  // multiselect / enum[]
  // ---------------------------
  if (ui === "multiselect" || dt === "enum[]") {
    const arr = Array.isArray(value) ? value.map(String) : [];
    return (
      <div className="space-y-2">
        <div className="space-y-1">
          {labelView}
          {hint}
        </div>

        {arr.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {arr.map((x) => (
              <span
                key={x}
                className="text-xs px-2 py-1 rounded-full bg-gray-100 border text-gray-700"
              >
                {x}
              </span>
            ))}
          </div>
        ) : null}

        <select
          multiple
          value={arr}
          disabled={disabled}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map(
              (x) => x.value
            );
            onChange(selected);
          }}
          className={`${baseCls} min-h-[96px]`}
        >
          {options.map((o) => (
            <option key={String(o)} value={String(o)}>
              {String(o)}
            </option>
          ))}
        </select>

        {errorView}
      </div>
    );
  }

  // ---------------------------
  // number
  // ---------------------------
  if (ui === "number" || dt === "number" || dt === "int" || dt === "integer") {
    return (
      <div className="space-y-1">
        {labelView}
        {hint}
        <input
          type="number"
          value={value ?? ""}
          disabled={disabled}
          placeholder={ability.placeholder ?? ""}
          min={ability.min ?? undefined}
          max={ability.max ?? undefined}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : Number(e.target.value))
          }
          className={baseCls}
        />
        {errorView}
      </div>
    );
  }

  // ---------------------------
  // url (non-image)
  // ---------------------------
  if (ui === "url") {
    return (
      <div className="space-y-1">
        {labelView}
        {hint}
        <input
          type="url"
          value={value ?? ""}
          disabled={disabled}
          placeholder={ability.placeholder ?? "https://..."}
          maxLength={ability.maxLength ?? undefined}
          onChange={(e) => onChange(e.target.value)}
          className={baseCls}
        />
        {errorView}
      </div>
    );
  }

  // ---------------------------
  // default text
  // ---------------------------
  return (
    <div className="space-y-1">
      {labelView}
      {hint}
      <input
        type="text"
        value={value ?? ""}
        disabled={disabled}
        placeholder={ability.placeholder ?? ""}
        maxLength={ability.maxLength ?? undefined}
        onChange={(e) => onChange(e.target.value)}
        className={baseCls}
      />
      {errorView}
    </div>
  );
}
