import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  // 今日の回答済み判定（BottomNavバッジ用）
  const today = process.env.DEBUG_DATE ?? new Date().toISOString().slice(0, 10);
  const todayQuestion = await prisma.question.findUnique({ where: { date: today } });
  const dailyAnswered = todayQuestion
    ? !!(await prisma.answer.findUnique({
        where: {
          userId_questionId: {
            userId: session.user.id,
            questionId: todayQuestion.id,
          },
        },
      }))
    : false;

  return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">{children}</main>
      <BottomNav dailyAnswered={dailyAnswered} />
    </>
  );
}
