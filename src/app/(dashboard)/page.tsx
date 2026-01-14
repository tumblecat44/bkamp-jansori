import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PushPermissionButton } from "@/components/push/push-permission-button";
import { GoalList } from "./goal-list";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const goals = await db.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">🗣️ 잔소리 AI</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {session.user.name}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                로그아웃
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Push Notification */}
        <div className="mb-6 flex items-center justify-between">
          <PushPermissionButton />
          <Button asChild>
            <Link href="/goals/new">+ 목표 추가</Link>
          </Button>
        </div>

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-xl font-semibold mb-2">아직 등록된 목표가 없어요</h2>
            <p className="text-muted-foreground mb-6">
              목표를 등록하면 AI가 주기적으로 잔소리를 보내드려요!
            </p>
            <Button asChild size="lg">
              <Link href="/goals/new">첫 목표 등록하기</Link>
            </Button>
          </div>
        ) : (
          <GoalList initialGoals={goals} />
        )}
      </main>
    </div>
  );
}
