import { MetadataRoute } from "next";
import { allPrefectures } from "@/data/prefectures";
import { studios } from "@/data/studios";

const BASE_URL = "https://odoroom.jp";

export default function sitemap(): MetadataRoute.Sitemap {
  const prefectureUrls = allPrefectures.map((pref) => ({
    url: `${BASE_URL}/prefecture/${pref.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const studioUrls = studios.map((studio) => ({
    url: `${BASE_URL}/studio/${studio.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...prefectureUrls,
    ...studioUrls,
  ];
}
