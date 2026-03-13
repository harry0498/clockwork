import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXTAUTH_URL ?? "https://clockwork.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/login", "/signup", "/terms", "/privacy"],
        disallow: [
          "/api/",
          "/accept-terms",
          "/forgot-password",
          "/reset-password",
          "/verify-2fa",
          "/clients",
          "/entries",
          "/invoices",
          "/settings",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
