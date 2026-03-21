import { Router } from "express";
import { getAdminDb } from "../config/firebase.js";

const router = Router();

router.get("/sitemap.xml", async (req, res) => {
  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/pricing", priority: "0.9", changefreq: "monthly" },
    { url: "/features", priority: "0.8", changefreq: "monthly" },
    { url: "/how-it-works", priority: "0.7", changefreq: "monthly" },
    { url: "/blog", priority: "0.8", changefreq: "daily" },
    { url: "/help", priority: "0.6", changefreq: "monthly" },
    { url: "/demo", priority: "0.7", changefreq: "monthly" },
    { url: "/privacy", priority: "0.3", changefreq: "yearly" },
    { url: "/terms", priority: "0.3", changefreq: "yearly" },
    { url: "/refund-policy", priority: "0.2", changefreq: "yearly" },
  ];

  let blogUrls = [];
  try {
    const db = getAdminDb();
    if (db) {
      const posts = await db.collection("blog_posts").where("status", "==", "published").get();
      blogUrls = posts.docs.map((doc) => {
        const data = doc.data();
        return {
          url: `/blog/${data.slug}`,
          priority: "0.7",
          changefreq: "monthly",
          lastmod: data.publishedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      });
    }
  } catch (err) {
    console.error("Sitemap blog fetch failed:", err.message);
  }

  const allUrls = [...staticPages, ...blogUrls];
  const baseUrl = process.env.SITE_URL || "https://pixalera.com";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.header("Content-Type", "application/xml");
  res.header("Cache-Control", "public, max-age=3600");
  res.send(xml);
});

router.get("/robots.txt", (req, res) => {
  const baseUrl = process.env.SITE_URL || "https://pixalera.com";
  res.header("Content-Type", "text/plain");
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /app
Disallow: /api/
Disallow: /maintenance

Sitemap: ${baseUrl}/sitemap.xml
`);
});

export { router as sitemapRouter };
