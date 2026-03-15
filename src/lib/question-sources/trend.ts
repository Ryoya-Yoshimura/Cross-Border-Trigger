import type { QuestionSet } from "./evergreen";

// 月別トレンド質問プール（季節・時期感のある話題）
const TREND_BY_MONTH: Record<number, QuestionSet[]> = {
  1: [
    {
      text: "お正月気分で食べたいものは？",
      choices: [
        { label: "おせち料理", imageUrl: "https://picsum.photos/seed/osechi01/400/300" },
        { label: "お雑煮", imageUrl: "https://picsum.photos/seed/ozoni001/400/300" },
        { label: "年越しそばの残り", imageUrl: "https://picsum.photos/seed/soba0101/400/300" },
        { label: "初詣の屋台フード", imageUrl: "https://picsum.photos/seed/hatsumode/400/300" },
      ],
    },
    {
      text: "新年の目標、どれに近い？",
      choices: [
        { label: "体を動かしたい", imageUrl: "https://picsum.photos/seed/exercise1/400/300" },
        { label: "新しいことを始めたい", imageUrl: "https://picsum.photos/seed/newstart1/400/300" },
        { label: "ゆっくりていねいに過ごす", imageUrl: "https://picsum.photos/seed/slowlife/400/300" },
        { label: "つながりを大切にしたい", imageUrl: "https://picsum.photos/seed/connect1/400/300" },
      ],
    },
  ],
  2: [
    {
      text: "バレンタインといえば、どれが好き？",
      choices: [
        { label: "手作りチョコ", imageUrl: "https://picsum.photos/seed/handmade1/400/300" },
        { label: "ブランドショコラ", imageUrl: "https://picsum.photos/seed/choclux1/400/300" },
        { label: "友チョコ", imageUrl: "https://picsum.photos/seed/friend01/400/300" },
        { label: "自分用チョコ", imageUrl: "https://picsum.photos/seed/selfchoc/400/300" },
      ],
    },
    {
      text: "最近、心が温まったことは？",
      choices: [
        { label: "誰かの親切", imageUrl: "https://picsum.photos/seed/kindact1/400/300" },
        { label: "ほっこりする動画", imageUrl: "https://picsum.photos/seed/cutevidz/400/300" },
        { label: "美味しいものを食べた", imageUrl: "https://picsum.photos/seed/warmfd01/400/300" },
        { label: "誰かと話した時間", imageUrl: "https://picsum.photos/seed/talktime/400/300" },
      ],
    },
  ],
  3: [
    {
      text: "春のお花見、どんなスタイルが好き？",
      choices: [
        { label: "賑やかに大人数で", imageUrl: "https://picsum.photos/seed/hanami01/400/300" },
        { label: "少人数でゆっくり", imageUrl: "https://picsum.photos/seed/hanami02/400/300" },
        { label: "ひとりでふらっと", imageUrl: "https://picsum.photos/seed/hanami03/400/300" },
        { label: "写真を撮りながら", imageUrl: "https://picsum.photos/seed/sakura01/400/300" },
      ],
    },
    {
      text: "春になって、やりたくなることは？",
      choices: [
        { label: "新しいことを始める", imageUrl: "https://picsum.photos/seed/spring01/400/300" },
        { label: "お出かけを増やす", imageUrl: "https://picsum.photos/seed/spring02/400/300" },
        { label: "部屋の模様替え", imageUrl: "https://picsum.photos/seed/spring03/400/300" },
        { label: "久しぶりの人に連絡", imageUrl: "https://picsum.photos/seed/spring04/400/300" },
      ],
    },
  ],
  4: [
    {
      text: "新年度のスタート、どんな気分？",
      choices: [
        { label: "ワクワクしている", imageUrl: "https://picsum.photos/seed/excited1/400/300" },
        { label: "ちょっと緊張気味", imageUrl: "https://picsum.photos/seed/nervous1/400/300" },
        { label: "落ち着いてのんびり", imageUrl: "https://picsum.photos/seed/calm0001/400/300" },
        { label: "まだ実感がない", imageUrl: "https://picsum.photos/seed/neutral1/400/300" },
      ],
    },
  ],
  5: [
    {
      text: "ゴールデンウィーク、どう過ごすのが好き？",
      choices: [
        { label: "旅行に行く", imageUrl: "https://picsum.photos/seed/travel01/400/300" },
        { label: "家でのんびり", imageUrl: "https://picsum.photos/seed/homegw01/400/300" },
        { label: "近場を楽しむ", imageUrl: "https://picsum.photos/seed/nearby01/400/300" },
        { label: "趣味に集中する", imageUrl: "https://picsum.photos/seed/hobbygw/400/300" },
      ],
    },
  ],
  6: [
    {
      text: "梅雨の時期、家でどう過ごす？",
      choices: [
        { label: "読書やゲーム", imageUrl: "https://picsum.photos/seed/rainbook/400/300" },
        { label: "料理を楽しむ", imageUrl: "https://picsum.photos/seed/cooking1/400/300" },
        { label: "映画・ドラマ一気見", imageUrl: "https://picsum.photos/seed/binge001/400/300" },
        { label: "雨音を聞いてまったり", imageUrl: "https://picsum.photos/seed/rainsnd1/400/300" },
      ],
    },
  ],
  7: [
    {
      text: "夏といえば、どれが好き？",
      choices: [
        { label: "花火大会", imageUrl: "https://picsum.photos/seed/firework/400/300" },
        { label: "海水浴", imageUrl: "https://picsum.photos/seed/beachsun/400/300" },
        { label: "かき氷", imageUrl: "https://picsum.photos/seed/kakigori/400/300" },
        { label: "夏祭り・縁日", imageUrl: "https://picsum.photos/seed/natsumsur/400/300" },
      ],
    },
  ],
  8: [
    {
      text: "夏の暑さ、どう乗り越える？",
      choices: [
        { label: "冷たいものを食べる", imageUrl: "https://picsum.photos/seed/coldfd01/400/300" },
        { label: "冷房の効いた場所へ", imageUrl: "https://picsum.photos/seed/coolroom/400/300" },
        { label: "早朝・夜に活動する", imageUrl: "https://picsum.photos/seed/nightact/400/300" },
        { label: "とにかく水分補給", imageUrl: "https://picsum.photos/seed/hydrate1/400/300" },
      ],
    },
  ],
  9: [
    {
      text: "秋といえば、どの「秋」が好き？",
      choices: [
        { label: "食欲の秋", imageUrl: "https://picsum.photos/seed/autumfd1/400/300" },
        { label: "読書の秋", imageUrl: "https://picsum.photos/seed/autumrd1/400/300" },
        { label: "スポーツの秋", imageUrl: "https://picsum.photos/seed/autumsp1/400/300" },
        { label: "紅葉の秋", imageUrl: "https://picsum.photos/seed/autumkl1/400/300" },
      ],
    },
  ],
  10: [
    {
      text: "ハロウィンっぽく楽しむなら、どれ？",
      choices: [
        { label: "仮装を楽しむ", imageUrl: "https://picsum.photos/seed/costume1/400/300" },
        { label: "お菓子を楽しむ", imageUrl: "https://picsum.photos/seed/sweets01/400/300" },
        { label: "雰囲気を楽しむ", imageUrl: "https://picsum.photos/seed/hallowen/400/300" },
        { label: "特になにもしない", imageUrl: "https://picsum.photos/seed/everyday/400/300" },
      ],
    },
  ],
  11: [
    {
      text: "この季節、どんなものが食べたい？",
      choices: [
        { label: "鍋料理", imageUrl: "https://picsum.photos/seed/hotnabe1/400/300" },
        { label: "焼き芋", imageUrl: "https://picsum.photos/seed/yakiimo1/400/300" },
        { label: "シチュー", imageUrl: "https://picsum.photos/seed/stew0001/400/300" },
        { label: "おでん", imageUrl: "https://picsum.photos/seed/oden0001/400/300" },
      ],
    },
  ],
  12: [
    {
      text: "クリスマス・年末、どう過ごす？",
      choices: [
        { label: "家族や友人と過ごす", imageUrl: "https://picsum.photos/seed/xmas0001/400/300" },
        { label: "ひとりでゆっくり", imageUrl: "https://picsum.photos/seed/xmas0002/400/300" },
        { label: "イベントや外食に行く", imageUrl: "https://picsum.photos/seed/xmas0003/400/300" },
        { label: "大掃除・年末準備", imageUrl: "https://picsum.photos/seed/osoji001/400/300" },
      ],
    },
  ],
};

export function generateTrend(date: string): QuestionSet {
  const month = parseInt(date.slice(5, 7), 10);
  const sets = TREND_BY_MONTH[month] ?? TREND_BY_MONTH[1];
  const hash = date.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return sets[hash % sets.length];
}
