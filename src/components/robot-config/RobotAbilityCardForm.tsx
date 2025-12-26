import React, { useMemo } from "react";
import { AbilityField } from "./AbilityField";
import type { RobotAbility } from "./AbilityField";

export type AbilityValueMap = Record<string, any>;

function groupBy<T>(items: T[], getKey: (x: T) => string) {
  return items.reduce<Record<string, T[]>>((acc, it) => {
    const k = getKey(it);
    acc[k] ??= [];
    acc[k].push(it);
    return acc;
  }, {});
}

export function RobotAbilityCardForm({
  abilities,
  values,
  errors,
  disabled, // ✅ NEW
  onChange,
}: {
  abilities: RobotAbility[];
  values: AbilityValueMap;
  errors?: Record<string, string>;
  disabled?: boolean; // ✅ NEW
  onChange: (key: string, v: any) => void;
}) {
  const active = useMemo(() => abilities.filter((a) => a.isActive !== false), [abilities]);

  const grouped = useMemo(() => {
    const groups = groupBy(active, (a) => a.abilityGroup || "General");
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [active]);

  return (
    <div className="space-y-4">
      {grouped.map(([groupName, items]) => (
        <div key={groupName} className="space-y-3">
          <div className="text-sm font-semibold text-gray-800">{groupName}</div>

          <div className="grid grid-cols-1 gap-3">
            {items.map((a) => (
              <AbilityField
                key={a.id}
                ability={a}
                value={values[a.key]}
                disabled={!!disabled} // ✅ NEW
                error={errors?.[a.key]}
                onChange={(v) => onChange(a.key, v)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
