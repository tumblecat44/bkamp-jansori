"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Goal {
  id: string;
  title: string;
  description?: string | null;
  intensity: number;
  frequency: number;
  startHour: number;
  endHour: number;
  isActive: boolean;
}

interface GoalCardProps {
  goal: Goal;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

const INTENSITY_LABELS = {
  1: { emoji: "🌱", label: "순한맛", color: "text-green-600" },
  2: { emoji: "⚡", label: "중간맛", color: "text-yellow-600" },
  3: { emoji: "🔥", label: "매운맛", color: "text-red-600" },
};

export function GoalCard({ goal, onToggle, onDelete }: GoalCardProps) {
  const intensity = INTENSITY_LABELS[goal.intensity as 1 | 2 | 3] || INTENSITY_LABELS[2];

  return (
    <Card className={`transition-opacity ${!goal.isActive ? "opacity-50" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{goal.title}</CardTitle>
        <Switch
          checked={goal.isActive}
          onCheckedChange={(checked) => onToggle(goal.id, checked)}
        />
      </CardHeader>
      <CardContent>
        {goal.description && (
          <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
        )}
        <div className="flex flex-wrap gap-2 text-sm mb-4">
          <span className={`${intensity.color} font-medium`}>
            {intensity.emoji} {intensity.label}
          </span>
          <span className="text-muted-foreground">•</span>
          <span>하루 {goal.frequency}회</span>
          <span className="text-muted-foreground">•</span>
          <span>
            {goal.startHour}시 ~ {goal.endHour}시
          </span>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/goals/${goal.id}`}>수정</Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(goal.id)}
          >
            삭제
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
