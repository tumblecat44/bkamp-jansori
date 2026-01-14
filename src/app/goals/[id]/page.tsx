import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { GoalForm } from "@/components/goals/goal-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGoalPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect("/login");
  }

  const goal = await db.goal.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!goal) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>목표 수정</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalForm initialData={goal} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
