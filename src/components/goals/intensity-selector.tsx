"use client";

import { cn } from "@/lib/utils";

interface IntensitySelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const INTENSITIES = [
  {
    level: 1,
    emoji: "🌱",
    label: "순한맛",
    description: "부드럽게 알려줘",
    example: "오늘 운동 계획 있어? 화이팅!",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-500",
    textColor: "text-green-700 dark:text-green-300",
  },
  {
    level: 2,
    emoji: "⚡",
    label: "중간맛",
    description: "적당히 채찍질",
    example: "야 오늘 운동 했어? 안 했으면 지금이라도 해",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    borderColor: "border-yellow-500",
    textColor: "text-yellow-700 dark:text-yellow-300",
  },
  {
    level: 3,
    emoji: "🔥",
    label: "매운맛",
    description: "진짜 잔소리",
    example: "또 운동 빼먹었어? 진짜 맨날 내일부터라며",
    bgColor: "bg-red-50 dark:bg-red-950",
    borderColor: "border-red-500",
    textColor: "text-red-700 dark:text-red-300",
  },
];

export function IntensitySelector({ value, onChange }: IntensitySelectorProps) {
  return (
    <div className="grid gap-3">
      {INTENSITIES.map((intensity) => (
        <button
          key={intensity.level}
          type="button"
          onClick={() => onChange(intensity.level)}
          className={cn(
            "p-4 rounded-lg border-2 text-left transition-all",
            intensity.bgColor,
            value === intensity.level
              ? intensity.borderColor
              : "border-transparent hover:border-gray-300"
          )}
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">{intensity.emoji}</span>
            <span className={cn("font-semibold", intensity.textColor)}>
              {intensity.label}
            </span>
            <span className="text-sm text-muted-foreground">
              - {intensity.description}
            </span>
          </div>
          <p className="text-sm text-muted-foreground italic pl-10">
            &quot;{intensity.example}&quot;
          </p>
        </button>
      ))}
    </div>
  );
}
