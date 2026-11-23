import type { MetadataRoute } from "next";

const baseUrl = "https://lumedgelogistics.netlify.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/track`, changeFrequency: "weekly", priority: 0.7 },
  ];
}
