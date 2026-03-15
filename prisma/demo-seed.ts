/**
 * デモ動画用シードスクリプト
 *
 * 使い方:
 *   DEMO_DAY=1 npx tsx prisma/demo-seed.ts  ← 1日目の撮影前に実行
 *   DEMO_DAY=2 npx tsx prisma/demo-seed.ts  ← 2日目の撮影前に実行
 *   DEMO_DAY=3 npx tsx prisma/demo-seed.ts  ← 3日目の撮影前に実行
 *   DEMO_DAY=4 npx tsx prisma/demo-seed.ts  ← 4日目の撮影前に実行
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ============================================================
//  ここを自由に編集してください（16枠）
//  label   : 選択肢の名前（アプリ上に表示される）
//  imageUrl: 画像の URL（https://〜 で始まるもの）
//  subtext : 画像の下に出る小さな説明文（省略可）
// ============================================================

// --- 1日目 ---
const DAY1_CHOICE1 = { label: "野球の話",     imageUrl: "https://th.bing.com/th/id/OIP.rGO9mmdMXmSnrrQg1HCcqgHaE7?w=278&h=185&c=7&r=0&o=7&dpr=1.1&pid=1.7&rm=3", subtext: "MLB開幕戦で大活躍のニュースが話題" };
const DAY1_CHOICE2 = { label: "映画の話",     imageUrl: "https://thumb.photo-ac.com/44/44f2f78bbef69c13818717f86221ae61_t.jpeg",   subtext: "春の注目作が全国公開スタート" };
const DAY1_CHOICE3 = { label: "AI最前線",     imageUrl: "https://thumb.ac-illust.com/8b/8b50cc2684231744f45ba48d9ec573a4_t.jpeg",      subtext: "生成AIが新機能を続々リリース" };
const DAY1_CHOICE4 = { label: "カフェトレンド", imageUrl: "https://cafe-image.com/wp-content/uploads/2024/07/3fd529a6197d3286c63ebedefadbbea9-1536x1024.jpg",     subtext: "ブックカフェブームが全国に拡大中" };

// --- 2日目 ---
const DAY2_CHOICE1 = { label: "サッカーの話", imageUrl: "https://p-ground.com/common/gallery/shasinkan/a003.JPG",   subtext: "チャンピオンズリーグ準決勝で劇的な展開" };
const DAY2_CHOICE2 = { label: "音楽の話",     imageUrl: "https://azukichi.net/img/music/music-back037.jpg", subtext: "人気アーティストがサプライズ新曲を発表" };
const DAY2_CHOICE3 = { label: "スマートフォン", imageUrl: "https://imageslabo.com/wp-content/uploads/2020/11/2257_note-pc_smart-phone_7758-973x649.jpg", subtext: "次世代スマホのリーク情報が話題沸騰" };
const DAY2_CHOICE4 = { label: "春の旅行",     imageUrl: "https://www.pakutaso.com/shared/img/thumb/zubotty412DSC_0123-r_TP_V1.jpg", subtext: "桜×温泉の旅先ランキングが公開" };

// --- 3日目 ---
const DAY3_CHOICE1 = { label: "テニスの話",   imageUrl: "https://t4.ftcdn.net/jpg/03/21/17/83/360_F_321178379_1PR3NpHHujbUtEfNGOLihMyfW2YO8Sjz.jpg",  subtext: "グランドスラムで日本人選手が快進撃" };
const DAY3_CHOICE2 = { label: "アニメの話",   imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSm0PeGUlCJZRw_4MF-46x-Js1GAfG4Kvwo6Q&s",     subtext: "春アニメの注目作が初回放送で話題に" };
const DAY3_CHOICE3 = { label: "ゲームの話",   imageUrl: "https://publicdomainq.net/images/202011/30s/publicdomainq-0050874pie.jpg", subtext: "大型タイトルの最新情報が解禁" };
const DAY3_CHOICE4 = { label: "グルメの話",   imageUrl: "https://user0514.cdnw.net/shared/img/thumb/nichinanIMGL8928_TP_V.jpg",   subtext: "SNSで爆発的に広まる新感覚スイーツ" };

// --- 4日目（トリガー発火日）---
const DAY4_CHOICE1 = { label: "バスケの話",     imageUrl: "https://t3.ftcdn.net/jpg/03/82/63/98/360_F_382639830_8KyFnhIbPTOQYYzh7OqVJHBYq23HAPy9.jpg", subtext: "NBAプレーオフ、日本人選手も活躍" };
const DAY4_CHOICE2 = { label: "ドラマの話",     imageUrl: "https://thumb.photo-ac.com/30/30ad08f3187c0c28edd8af59825fe2ef_t.jpeg",        subtext: "話題の新ドラマが視聴率記録を更新" };
const DAY4_CHOICE3 = { label: "自動運転",       imageUrl: "https://t3.ftcdn.net/jpg/02/06/00/56/360_F_206005628_V2Bmh1iiAu5zNfyNOnCEi3vT7SjZnj59.jpg",    subtext: "自動運転タクシーが主要都市で商用運行開始" };
const DAY4_CHOICE4 = { label: "ファッションの話", imageUrl: "https://publicdomainq.net/images/201704/01s/publicdomainq-0007543zgo.jpg", subtext: "春の注目トレンドカラーが発表" };

// ============================================================
//  以下は変更不要
// ============================================================

const DEMO_DATES = ["2026-04-01", "2026-04-02", "2026-04-03", "2026-04-04"];

const DEMO_QUESTIONS = [
  {
    date: DEMO_DATES[0],
    choices: [DAY1_CHOICE1, DAY1_CHOICE2, DAY1_CHOICE3, DAY1_CHOICE4],
  },
  {
    date: DEMO_DATES[1],
    choices: [DAY2_CHOICE1, DAY2_CHOICE2, DAY2_CHOICE3, DAY2_CHOICE4],
  },
  {
    date: DEMO_DATES[2],
    choices: [DAY3_CHOICE1, DAY3_CHOICE2, DAY3_CHOICE3, DAY3_CHOICE4],
  },
  {
    date: DEMO_DATES[3],
    choices: [DAY4_CHOICE1, DAY4_CHOICE2, DAY4_CHOICE3, DAY4_CHOICE4],
  },
];

async function main() {
  const demoDay = parseInt(process.env.DEMO_DAY ?? "1", 10);
  if (demoDay < 1 || demoDay > 4) {
    console.error("DEMO_DAY は 1〜4 で指定してください");
    process.exit(1);
  }

  console.log(`🎬 デモ用データを投入中... (DEMO_DAY=${demoDay})`);

  await prisma.trigger.deleteMany();
  await prisma.matchRecord.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.question.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash("password123", 10);

  const hanako = await prisma.user.create({
    data: { name: "田中 花子", email: "hanako@example.com", passwordHash: hash, inviteCode: "HANA-K001", bio: "毎日の4択が楽しみ！" },
  });
  const taro = await prisma.user.create({
    data: { name: "佐藤 太郎", email: "taro@example.com", passwordHash: hash, inviteCode: "TARO-K001", bio: "気が合う人と話したい" },
  });

  const connection = await prisma.connection.create({
    data: { userId1: hanako.id, userId2: taro.id },
  });

  const questions = [];
  for (const q of DEMO_QUESTIONS) {
    const question = await prisma.question.create({
      data: {
        date: q.date,
        sourceType: "news",
        text: "今日、ちょっと気になるのはどれ？",
        choices: JSON.stringify(q.choices),
      },
    });
    questions.push(question);
  }

  // DEMO_DAY-1 日分の回答を事前投入（選択肢1を両者が選んで一致済み）
  const pastDays = demoDay - 1;
  for (let i = 0; i < pastDays; i++) {
    const question = questions[i];
    await prisma.answer.create({ data: { userId: hanako.id, questionId: question.id, choiceIndex: 0 } });
    await prisma.answer.create({ data: { userId: taro.id, questionId: question.id, choiceIndex: 0 } });
    await prisma.matchRecord.create({ data: { connectionId: connection.id, questionId: question.id, matched: true } });
  }

  const todayDate = DEMO_DATES[demoDay - 1];
  const todayChoice1 = DEMO_QUESTIONS[demoDay - 1].choices[0].label;

  console.log("✅ 完了！");
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  ログイン情報:");
  console.log("  📧 hanako@example.com / password123");
  console.log("  📧 taro@example.com   / password123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  📅 .env に設定: DEBUG_DATE=${todayDate}`);
  console.log(`  🔥 連続一致済み: ${pastDays}日`);
  if (demoDay === 4) console.log("  🎉 今日同じ選択肢を選ぶとトリガー発火！");
  console.log("");
  console.log("  撮影の流れ:");
  console.log(`  1. hanako でログイン → 「${todayChoice1}」を選ぶ`);
  console.log(`  2. taro でログイン   → 「${todayChoice1}」を選ぶ`);
  if (demoDay < 4) {
    console.log(`  3. ${demoDay}日連続一致 → 明日（DEMO_DAY=${demoDay + 1}）に続く`);
  } else {
    console.log("  3. 4日連続一致 → 再接続トリガー発火 🎉");
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
