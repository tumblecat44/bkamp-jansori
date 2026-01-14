import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GoalForm } from "@/components/goals/goal-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewGoalPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>새 목표 등록</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
