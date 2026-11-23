import type { MetadataRoute } from "next";

const baseUrl = "https://lumedgelogistics.netlify.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/order/"] }],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
