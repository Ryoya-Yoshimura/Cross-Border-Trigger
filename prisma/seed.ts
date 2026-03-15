import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 デモデータを投入中...");

  // 既存データをクリア
  await prisma.trigger.deleteMany();
  await prisma.matchRecord.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.question.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash("password123", 10);

  const user1 = await prisma.user.create({
    data: { name: "田中 花子", email: "hanako@example.com", passwordHash: hash },
  });
  const user2 = await prisma.user.create({
    data: { name: "佐藤 太郎", email: "taro@example.com", passwordHash: hash },
  });

  const connection = await prisma.connection.create({
    data: { userId1: user1.id, userId2: user2.id },
  });

  // 過去3日分：両者が同じ選択肢を選んで連続一致
  // 今日は未回答 → 両アカウントで同じ選択をするとトリガー発火
  const today = new Date();
  for (let i = 3; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);

    const question = await prisma.question.upsert({
      where: { date },
      create: {
        date,
        choices: JSON.stringify([
          { label: "珈琲", imageUrl: "https://picsum.photos/seed/coffeecup/400/300" },
          { label: "紅茶", imageUrl: "https://picsum.photos/seed/greentea/400/300" },
          { label: "スムージー", imageUrl: "https://picsum.photos/seed/smoothiedrink/400/300" },
          { label: "お水だけ", imageUrl: "https://picsum.photos/seed/mineralwater/400/300" },
        ]),
      },
      update: {},
    });

    // 両方とも選択肢0（珈琲）を選んで一致
    await prisma.answer.upsert({
      where: { userId_questionId: { userId: user1.id, questionId: question.id } },
      create: { userId: user1.id, questionId: question.id, choiceIndex: 0 },
      update: {},
    });
    await prisma.answer.upsert({
      where: { userId_questionId: { userId: user2.id, questionId: question.id } },
      create: { userId: user2.id, questionId: question.id, choiceIndex: 0 },
      update: {},
    });
    await prisma.matchRecord.upsert({
      where: { connectionId_questionId: { connectionId: connection.id, questionId: question.id } },
      create: { connectionId: connection.id, questionId: question.id, matched: true },
      update: {},
    });
  }

  console.log("✅ 完了！");
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  ログイン情報:");
  console.log("  📧 hanako@example.com / password123");
  console.log("  📧 taro@example.com   / password123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("デモの流れ:");
  console.log("  1. hanako でログイン → 今日の4択に回答");
  console.log("  2. taro でログイン → 同じ選択肢で回答");
  console.log("  3. 4日連続一致 → 再接続トリガー発火 🎉");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
