import { Region, Prefecture } from "@/types";

export const regions: Region[] = [
  {
    name: "北海道",
    prefectures: [
      { slug: "hokkaido", name: "北海道", region: "北海道" },
    ],
  },
  {
    name: "東北",
    prefectures: [
      { slug: "aomori", name: "青森県", region: "東北" },
      { slug: "iwate", name: "岩手県", region: "東北" },
      { slug: "miyagi", name: "宮城県", region: "東北" },
      { slug: "akita", name: "秋田県", region: "東北" },
      { slug: "yamagata", name: "山形県", region: "東北" },
      { slug: "fukushima", name: "福島県", region: "東北" },
    ],
  },
  {
    name: "関東",
    prefectures: [
      { slug: "ibaraki", name: "茨城県", region: "関東" },
      { slug: "tochigi", name: "栃木県", region: "関東" },
      { slug: "gunma", name: "群馬県", region: "関東" },
      { slug: "saitama", name: "埼玉県", region: "関東" },
      { slug: "chiba", name: "千葉県", region: "関東" },
      { slug: "tokyo", name: "東京都", region: "関東" },
      { slug: "kanagawa", name: "神奈川県", region: "関東" },
    ],
  },
  {
    name: "中部",
    prefectures: [
      { slug: "niigata", name: "新潟県", region: "中部" },
      { slug: "toyama", name: "富山県", region: "中部" },
      { slug: "ishikawa", name: "石川県", region: "中部" },
      { slug: "fukui", name: "福井県", region: "中部" },
      { slug: "yamanashi", name: "山梨県", region: "中部" },
      { slug: "nagano", name: "長野県", region: "中部" },
      { slug: "gifu", name: "岐阜県", region: "中部" },
      { slug: "shizuoka", name: "静岡県", region: "中部" },
      { slug: "aichi", name: "愛知県", region: "中部" },
    ],
  },
  {
    name: "近畿",
    prefectures: [
      { slug: "mie", name: "三重県", region: "近畿" },
      { slug: "shiga", name: "滋賀県", region: "近畿" },
      { slug: "kyoto", name: "京都府", region: "近畿" },
      { slug: "osaka", name: "大阪府", region: "近畿" },
      { slug: "hyogo", name: "兵庫県", region: "近畿" },
      { slug: "nara", name: "奈良県", region: "近畿" },
      { slug: "wakayama", name: "和歌山県", region: "近畿" },
    ],
  },
  {
    name: "中国",
    prefectures: [
      { slug: "tottori", name: "鳥取県", region: "中国" },
      { slug: "shimane", name: "島根県", region: "中国" },
      { slug: "okayama", name: "岡山県", region: "中国" },
      { slug: "hiroshima", name: "広島県", region: "中国" },
      { slug: "yamaguchi", name: "山口県", region: "中国" },
    ],
  },
  {
    name: "四国",
    prefectures: [
      { slug: "tokushima", name: "徳島県", region: "四国" },
      { slug: "kagawa", name: "香川県", region: "四国" },
      { slug: "ehime", name: "愛媛県", region: "四国" },
      { slug: "kochi", name: "高知県", region: "四国" },
    ],
  },
  {
    name: "九州・沖縄",
    prefectures: [
      { slug: "fukuoka", name: "福岡県", region: "九州・沖縄" },
      { slug: "saga", name: "佐賀県", region: "九州・沖縄" },
      { slug: "nagasaki", name: "長崎県", region: "九州・沖縄" },
      { slug: "kumamoto", name: "熊本県", region: "九州・沖縄" },
      { slug: "oita", name: "大分県", region: "九州・沖縄" },
      { slug: "miyazaki", name: "宮崎県", region: "九州・沖縄" },
      { slug: "kagoshima", name: "鹿児島県", region: "九州・沖縄" },
      { slug: "okinawa", name: "沖縄県", region: "九州・沖縄" },
    ],
  },
];

export const allPrefectures: Prefecture[] = regions.flatMap((r) => r.prefectures);

export function getPrefectureBySlug(slug: string): Prefecture | undefined {
  return allPrefectures.find((p) => p.slug === slug);
}
