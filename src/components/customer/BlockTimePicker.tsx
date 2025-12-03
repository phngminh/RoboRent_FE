import React, { useEffect, useState } from "react";

interface BlockTimePickerProps {
  label: string;
  value: string;                    // "HH:mm" OR ""
  onChange: (value: string) => void; // callback returns "HH:mm"
}

export default function BlockTimePicker({ label, value, onChange }: BlockTimePickerProps) {
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");

  // -----------------------------
  // Load initial value from props
  // -----------------------------
  useEffect(() => {
    if (!value) return;

    const [h, m] = value.split(":");
    setHour(h.padStart(2, "0"));
    setMinute(m.padStart(2, "0"));
  }, [value]);

  // -----------------------------
  // Emit updated value
  // -----------------------------
  useEffect(() => {
    if (!hour || !minute) return;

    const formatted = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
    onChange(formatted);
  }, [hour, minute]);

  // -----------------------------
  // Handlers with validation
  // -----------------------------
  const handleHourChange = (v: string) => {
    let num = Number(v);

    if (isNaN(num)) return;
    if (num < 1) num = 1;
    if (num > 24) num = 24;

    setHour(num.toString().padStart(2, "0"));
  };

  const handleMinuteChange = (v: string) => {
    let num = Number(v);

    if (isNaN(num)) return;
    if (num < 0) num = 0;
    if (num > 59) num = 59;

    setMinute(num.toString().padStart(2, "0"));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 text-center">
        {label}
      </label>

      <div className="flex items-center justify-center gap-3">
        {/* Hour */}
        <input
          type="number"
          value={hour}
          min={1}
          max={24}
          onChange={(e) => handleHourChange(e.target.value)}
          className="w-20 p-2 border rounded-lg text-center border-purple-400 focus:ring-2 focus:ring-purple-500"
        />

        <span className="text-xl font-semibold">:</span>

        {/* Minute */}
        <input
          type="number"
          value={minute}
          min={0}
          max={59}
          onChange={(e) => handleMinuteChange(e.target.value)}
          className="w-20 p-2 border rounded-lg text-center border-purple-400 focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>
  );
}
