export type Choice = {
  label: string;
  imageUrl?: string;
  subtext?: string;
  emoji?: string;
  gradient?: string;
};
export type QuestionSet = { text: string; choices: Choice[] };

const SETS: QuestionSet[] = [
  {
    text: "今朝の気分、飲み物で表すと？",
    choices: [
      { label: "珈琲", imageUrl: "https://picsum.photos/seed/coffeecup/400/300" },
      { label: "紅茶", imageUrl: "https://picsum.photos/seed/greentea/400/300" },
      { label: "スムージー", imageUrl: "https://picsum.photos/seed/smoothiedrink/400/300" },
      { label: "お水だけ", imageUrl: "https://picsum.photos/seed/mineralwater/400/300" },
    ],
  },
  {
    text: "週末に行くなら、どの景色？",
    choices: [
      { label: "山", imageUrl: "https://picsum.photos/seed/mountainview/400/300" },
      { label: "海", imageUrl: "https://picsum.photos/seed/oceanbeach/400/300" },
      { label: "街の夜景", imageUrl: "https://picsum.photos/seed/citynightview/400/300" },
      { label: "森の小道", imageUrl: "https://picsum.photos/seed/forestpath/400/300" },
    ],
  },
  {
    text: "理想の休日の過ごし方は？",
    choices: [
      { label: "ひとりでゆっくり", imageUrl: "https://picsum.photos/seed/solorelax/400/300" },
      { label: "友達とわいわい", imageUrl: "https://picsum.photos/seed/friendsfun/400/300" },
      { label: "家族でのんびり", imageUrl: "https://picsum.photos/seed/familytime/400/300" },
      { label: "新しい場所を探索", imageUrl: "https://picsum.photos/seed/adventuretrip/400/300" },
    ],
  },
  {
    text: "リラックスするなら、どれ？",
    choices: [
      { label: "読書", imageUrl: "https://picsum.photos/seed/readingbook/400/300" },
      { label: "映画・ドラマ", imageUrl: "https://picsum.photos/seed/movienight/400/300" },
      { label: "音楽を聴く", imageUrl: "https://picsum.photos/seed/musicvibes/400/300" },
      { label: "アウトドア", imageUrl: "https://picsum.photos/seed/outdoorhike/400/300" },
    ],
  },
  {
    text: "今の気分、食べ物で表すと？",
    choices: [
      { label: "ラーメン", imageUrl: "https://picsum.photos/seed/ramenjapaness/400/300" },
      { label: "スイーツ", imageUrl: "https://picsum.photos/seed/dessertcake/400/300" },
      { label: "サラダ", imageUrl: "https://picsum.photos/seed/freshsalad/400/300" },
      { label: "焼肉", imageUrl: "https://picsum.photos/seed/grillbbq/400/300" },
    ],
  },
  {
    text: "今夜、したいことは？",
    choices: [
      { label: "ゆっくり入浴", imageUrl: "https://picsum.photos/seed/bathrelax/400/300" },
      { label: "夜ランニング", imageUrl: "https://picsum.photos/seed/runningnight/400/300" },
      { label: "ゲーム", imageUrl: "https://picsum.photos/seed/gamingsetup/400/300" },
      { label: "早めに就寝", imageUrl: "https://picsum.photos/seed/sleepcozy/400/300" },
    ],
  },
  {
    text: "旅行先に選ぶなら？",
    choices: [
      { label: "京都", imageUrl: "https://picsum.photos/seed/kyototemple/400/300" },
      { label: "沖縄", imageUrl: "https://picsum.photos/seed/okinawaocean/400/300" },
      { label: "北海道", imageUrl: "https://picsum.photos/seed/hokkaidosnow/400/300" },
      { label: "海外旅行", imageUrl: "https://picsum.photos/seed/worldtravel/400/300" },
    ],
  },
  {
    text: "今日ちょっと話してみたい話題はどれ？",
    choices: [
      { label: "最近のハマりもの", imageUrl: "https://picsum.photos/seed/hobby2025/400/300" },
      { label: "おすすめの場所", imageUrl: "https://picsum.photos/seed/recommend01/400/300" },
      { label: "最近見たもの", imageUrl: "https://picsum.photos/seed/watchedshow/400/300" },
      { label: "ちょっとした悩み", imageUrl: "https://picsum.photos/seed/thoughtful2/400/300" },
    ],
  },
  {
    text: "朝の過ごし方、どれが一番好き？",
    choices: [
      { label: "ゆっくり起きる", imageUrl: "https://picsum.photos/seed/lazymorning/400/300" },
      { label: "早起きして活動", imageUrl: "https://picsum.photos/seed/earlybird01/400/300" },
      { label: "朝ごはんを楽しむ", imageUrl: "https://picsum.photos/seed/breakfasts1/400/300" },
      { label: "散歩やストレッチ", imageUrl: "https://picsum.photos/seed/morningwalk/400/300" },
    ],
  },
  {
    text: "最近なんとなく気になっていることは？",
    choices: [
      { label: "新しいスポット", imageUrl: "https://picsum.photos/seed/newplace01/400/300" },
      { label: "流行りのもの", imageUrl: "https://picsum.photos/seed/trending01/400/300" },
      { label: "健康・体のこと", imageUrl: "https://picsum.photos/seed/healthlife/400/300" },
      { label: "将来のこと", imageUrl: "https://picsum.photos/seed/futurevisi/400/300" },
    ],
  },
  {
    text: "疲れたとき、一番ほっとするのは？",
    choices: [
      { label: "温かい飲み物", imageUrl: "https://picsum.photos/seed/warmdrink1/400/300" },
      { label: "誰かと話す", imageUrl: "https://picsum.photos/seed/talktofri1/400/300" },
      { label: "ひとりになる", imageUrl: "https://picsum.photos/seed/alone01mo/400/300" },
      { label: "好きなものを食べる", imageUrl: "https://picsum.photos/seed/comfortfd/400/300" },
    ],
  },
  {
    text: "今の気分を天気で例えると？",
    choices: [
      { label: "晴れ", imageUrl: "https://picsum.photos/seed/sunnyday1/400/300" },
      { label: "くもり", imageUrl: "https://picsum.photos/seed/cloudyday/400/300" },
      { label: "小雨", imageUrl: "https://picsum.photos/seed/lightrain/400/300" },
      { label: "風が強め", imageUrl: "https://picsum.photos/seed/windysky1/400/300" },
    ],
  },
  {
    text: "友達と話すなら、どんな話題がいい？",
    choices: [
      { label: "面白かったこと", imageUrl: "https://picsum.photos/seed/funstory1/400/300" },
      { label: "最近の近況", imageUrl: "https://picsum.photos/seed/recentnws/400/300" },
      { label: "将来の話", imageUrl: "https://picsum.photos/seed/futuretlk/400/300" },
      { label: "懐かしい話", imageUrl: "https://picsum.photos/seed/nostalgia/400/300" },
    ],
  },
  {
    text: "最近ちょっとハマっていることは？",
    choices: [
      { label: "新しい食べもの", imageUrl: "https://picsum.photos/seed/newfoods1/400/300" },
      { label: "動画・配信コンテンツ", imageUrl: "https://picsum.photos/seed/streaming/400/300" },
      { label: "趣味や手を動かすこと", imageUrl: "https://picsum.photos/seed/craftwork/400/300" },
      { label: "外を散策すること", imageUrl: "https://picsum.photos/seed/outdoorex/400/300" },
    ],
  },
  {
    text: "今の自分のペースに近いのはどれ？",
    choices: [
      { label: "全力疾走中", imageUrl: "https://picsum.photos/seed/running01/400/300" },
      { label: "マイペースにゆったり", imageUrl: "https://picsum.photos/seed/slowpace1/400/300" },
      { label: "ちょっとお疲れ気味", imageUrl: "https://picsum.photos/seed/resttime1/400/300" },
      { label: "ぼちぼちやってる", imageUrl: "https://picsum.photos/seed/moderate1/400/300" },
    ],
  },
  {
    text: "理想の「ちょっとお出かけ」は？",
    choices: [
      { label: "カフェでまったり", imageUrl: "https://picsum.photos/seed/cafevibes/400/300" },
      { label: "公園や自然の中", imageUrl: "https://picsum.photos/seed/parkgreen/400/300" },
      { label: "気になるお店を巡る", imageUrl: "https://picsum.photos/seed/shopwalk1/400/300" },
      { label: "ふらっと知らない街へ", imageUrl: "https://picsum.photos/seed/cityexpl1/400/300" },
    ],
  },
  {
    text: "今週末にしてみたいことは？",
    choices: [
      { label: "家でゆっくり過ごす", imageUrl: "https://picsum.photos/seed/homerest1/400/300" },
      { label: "どこかへ出かける", imageUrl: "https://picsum.photos/seed/goingout1/400/300" },
      { label: "やりたかったことをやる", imageUrl: "https://picsum.photos/seed/doit2025/400/300" },
      { label: "誰かと会う", imageUrl: "https://picsum.photos/seed/meetup01/400/300" },
    ],
  },
  {
    text: "今日の午後に一番したいことは？",
    choices: [
      { label: "昼寝", imageUrl: "https://picsum.photos/seed/naptime1/400/300" },
      { label: "好きなことに集中", imageUrl: "https://picsum.photos/seed/focusmode/400/300" },
      { label: "外に出る", imageUrl: "https://picsum.photos/seed/gooutside/400/300" },
      { label: "のんびり過ごす", imageUrl: "https://picsum.photos/seed/easyaftr/400/300" },
    ],
  },
  {
    text: "今の気分をアイテムで例えると？",
    choices: [
      { label: "充電満タンのスマホ", imageUrl: "https://picsum.photos/seed/phonechgd/400/300" },
      { label: "蒸らし中のコーヒー", imageUrl: "https://picsum.photos/seed/brewing1/400/300" },
      { label: "少し風が入った窓", imageUrl: "https://picsum.photos/seed/openwind/400/300" },
      { label: "読みかけの本", imageUrl: "https://picsum.photos/seed/bookopen1/400/300" },
    ],
  },
  {
    text: "最近「良かったな」と思ったことは？",
    choices: [
      { label: "美味しいものを食べた", imageUrl: "https://picsum.photos/seed/goodfood1/400/300" },
      { label: "誰かと話した", imageUrl: "https://picsum.photos/seed/goodtalk/400/300" },
      { label: "自然や景色を見た", imageUrl: "https://picsum.photos/seed/scenery01/400/300" },
      { label: "自分の時間が取れた", imageUrl: "https://picsum.photos/seed/metime01/400/300" },
    ],
  },
];

export function generateEvergreen(date: string): QuestionSet {
  const hash = date.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return SETS[hash % SETS.length];
}
