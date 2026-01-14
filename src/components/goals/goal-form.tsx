"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { IntensitySelector } from "./intensity-selector";

interface GoalFormProps {
  initialData?: {
    id?: string;
    title: string;
    description?: string | null;
    intensity: number;
    frequency: number;
    startHour: number;
    endHour: number;
  };
}

export function GoalForm({ initialData }: GoalFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    intensity: initialData?.intensity || 2,
    frequency: initialData?.frequency || 3,
    startHour: initialData?.startHour ?? 9,
    endHour: initialData?.endHour ?? 22,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);

    try {
      const url = initialData?.id ? `/api/goals/${initialData.id}` : "/api/goals";
      const method = initialData?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/");
        router.refresh();
      } else {
        throw new Error("Failed to save goal");
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 목표 제목 */}
      <div className="space-y-2">
        <Label htmlFor="title">목표</Label>
        <Input
          id="title"
          placeholder="예: 다이어트, 토익 900점, 이직 준비"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      {/* 상세 설명 */}
      <div className="space-y-2">
        <Label htmlFor="description">상세 설명 (선택)</Label>
        <Input
          id="description"
          placeholder="목표에 대한 추가 설명"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* 잔소리 강도 */}
      <div className="space-y-2">
        <Label>잔소리 강도</Label>
        <IntensitySelector
          value={formData.intensity}
          onChange={(value) => setFormData({ ...formData, intensity: value })}
        />
      </div>

      {/* 하루 잔소리 횟수 */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label>하루 잔소리 횟수</Label>
          <span className="text-sm font-medium">{formData.frequency}회</span>
        </div>
        <Slider
          value={[formData.frequency]}
          onValueChange={(value) => setFormData({ ...formData, frequency: value[0] })}
          min={1}
          max={10}
          step={1}
        />
      </div>

      {/* 시간대 설정 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startHour">시작 시간</Label>
          <select
            id="startHour"
            value={formData.startHour}
            onChange={(e) => setFormData({ ...formData, startHour: parseInt(e.target.value) })}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i}시
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="endHour">종료 시간</Label>
          <select
            id="endHour"
            value={formData.endHour}
            onChange={(e) => setFormData({ ...formData, endHour: parseInt(e.target.value) })}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i}시
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
        >
          취소
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "저장 중..." : initialData?.id ? "수정하기" : "등록하기"}
        </Button>
      </div>
    </form>
  );
}
