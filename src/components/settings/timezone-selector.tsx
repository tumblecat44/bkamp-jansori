"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimezoneSelectorProps {
  initialTimezone: string;
}

const TIMEZONES = [
  { value: "Asia/Seoul", label: "한국 (KST)" },
  { value: "UTC", label: "UTC" },
];

export function TimezoneSelector({ initialTimezone }: TimezoneSelectorProps) {
  const [timezone, setTimezone] = useState(initialTimezone);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = async (value: string) => {
    setTimezone(value);
    setIsSaving(true);

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone: value }),
      });

      if (!response.ok) throw new Error("Failed to save");
    } catch (error) {
      console.error("Failed to save timezone:", error);
      setTimezone(initialTimezone);
      alert("시간대 저장 실패");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) {
    return (
      <div className="w-[140px] h-8 text-sm border rounded-md flex items-center px-3 text-muted-foreground">
        {TIMEZONES.find((tz) => tz.value === initialTimezone)?.label || "KST"}
      </div>
    );
  }

  return (
    <Select value={timezone} onValueChange={handleChange} disabled={isSaving}>
      <SelectTrigger className="w-[140px] h-8 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TIMEZONES.map((tz) => (
          <SelectItem key={tz.value} value={tz.value}>
            {tz.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
