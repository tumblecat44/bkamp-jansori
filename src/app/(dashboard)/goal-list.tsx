"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoalCard } from "@/components/goals/goal-card";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  intensity: number;
  frequency: number;
  startHour: number;
  endHour: number;
  isActive: boolean;
}

interface GoalListProps {
  initialGoals: Goal[];
}

export function GoalList({ initialGoals }: GoalListProps) {
  const [goals, setGoals] = useState(initialGoals);
  const router = useRouter();

  const handleToggle = async (id: string, isActive: boolean) => {
    // Optimistic update
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isActive } : g))
    );

    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }
    } catch (error) {
      // Revert on error
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, isActive: !isActive } : g))
      );
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const original = goals;
    setGoals((prev) => prev.filter((g) => g.id !== id));

    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      router.refresh();
    } catch (error) {
      setGoals(original);
      console.error(error);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
