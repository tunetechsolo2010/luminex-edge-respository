import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const baseUrl = "https://lumgelogistics.netlify.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/order/"] }],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
