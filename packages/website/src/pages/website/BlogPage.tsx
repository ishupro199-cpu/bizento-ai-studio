import { useState, useEffect } from "react";
import { WebsiteNav } from "@/components/website/WebsiteNav";
import { WebsiteFooter } from "@/components/website/WebsiteFooter";
import { Clock, ArrowRight, Tag } from "lucide-react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const TAGS = ["All", "Product Update", "Guide", "Case Study", "News", "Tutorial", "AI Tips", "Ecommerce"];

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  published: boolean;
  author: string;
  imageUrl?: string;
  tags: string[];
  readTime?: string;
  createdAt: Date;
}

const FALLBACK_POSTS: BlogPost[] = [
  {
    id: "1", title: "10 prompt tips for perfect product catalog images",
    slug: "prompt-tips-catalog", excerpt: "Learn how to write prompts that consistently generate clean, studio-quality catalog images for any product category.",
    content: "", category: "AI Tips", published: true, author: "Team Pixalera",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    readTime: "5 min read", tags: [], createdAt: new Date("2026-03-12"),
  },
  {
    id: "2", title: "How D2C brands cut product photography costs by 80%",
    slug: "d2c-photography-costs", excerpt: "Three Shopify brands share how they replaced studio shoots with Pixalera — and what their ROI looks like.",
    content: "", category: "Ecommerce", published: true, author: "Team Pixalera",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    readTime: "7 min read", tags: [], createdAt: new Date("2026-03-08"),
  },
  {
    id: "3", title: "From 2-week shoots to 2-minute generations: A fashion brand story",
    slug: "fashion-brand-story", excerpt: "How a mid-sized apparel brand scaled their catalog from 50 to 500 SKUs per month without hiring.",
    content: "", category: "Case Study", published: true, author: "Team Pixalera",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
    readTime: "6 min read", tags: [], createdAt: new Date("2026-03-03"),
  },
  {
    id: "4", title: "Introducing Cinematic Ads — Pro-tier AI video visuals",
    slug: "cinematic-ads", excerpt: "Today we're launching our most requested feature: film-quality ad visuals generated in under 15 seconds.",
    content: "", category: "News", published: true, author: "Team Pixalera",
    imageUrl: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80",
    readTime: "3 min read", tags: [], createdAt: new Date("2026-02-28"),
  },
  {
    id: "5", title: "The complete guide to AI product photography in 2026",
    slug: "ai-product-photography-guide", excerpt: "Everything you need to know about using AI to replace traditional product photography for ecommerce.",
    content: "", category: "Guide", published: true, author: "Team Pixalera",
    imageUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80",
    readTime: "10 min read", tags: [], createdAt: new Date("2026-02-20"),
  },
  {
    id: "6", title: "Choosing the right model: Flash vs Pro explained",
    slug: "flash-vs-pro", excerpt: "When to use the fast Flash model and when to spend extra credits on the Pro model for maximum quality.",
    content: "", category: "AI Tips", published: true, author: "Team Pixalera",
    imageUrl: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80",
    readTime: "4 min read", tags: [], createdAt: new Date("2026-02-14"),
  },
];

const TAG_COLORS: Record<string, string> = {
  "Product Update": "#3b82f6",
  "Guide": "#10b981",
  "Case Study": "#f59e0b",
  "News": "#8b5cf6",
  "Tutorial": "#06b6d4",
  "AI Tips": "#89E900",
  "Ecommerce": "#a855f7",
  "Updates": "#3b82f6",
};

function getReadTime(content: string): string {
  if (!content) return "3 min read";
  const words = content.split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("All");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "blog_posts"),
      orderBy("publishedAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || "",
            slug: data.slug || d.id,
            excerpt: data.excerpt || "",
            content: data.content || "",
            category: data.tags?.[0] || "Guide",
            published: data.status === "published",
            author: data.author || "Team Pixalera",
            imageUrl: data.coverImageURL || "",
            readTime: getReadTime(data.content || ""),
            tags: data.tags || [],
            createdAt: data.publishedAt?.toDate?.() || data.createdAt?.toDate?.() || new Date(),
          };
        })
        .filter((p) => p.published);
      setPosts(all);
      setLoading(false);
    }, () => {
      setPosts([]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredPosts = activeTag === "All"
    ? posts
    : posts.filter((p) => p.category === activeTag || (p.tags || []).includes(activeTag));

  const featured = filteredPosts[0];
  const rest = filteredPosts.slice(1);

  const formatDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen" style={{ background: "#0D0F14", color: "#F0EBD8" }}>
      <WebsiteNav />

      <section className="max-w-7xl mx-auto px-6 pt-16 pb-6">
        <h1 className="text-5xl font-black mb-2">Blog</h1>
        <p className="text-[17px] mb-8" style={{ color: "#8A8F9E" }}>Tips, case studies, and product updates from the Pixalera team.</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-12">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTag(t)}
              className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
              style={{
                background: activeTag === t ? "rgba(137,233,0,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeTag === t ? "rgba(137,233,0,0.3)" : "rgba(255,255,255,0.08)"}`,
                color: activeTag === t ? "#89E900" : "#8A8F9E",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-5">
            <div className="rounded-3xl h-64 animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl h-48 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
              ))}
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
            <p style={{ color: "#8A8F9E" }}>Check back soon — we're working on something great.</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <div
                className="rounded-3xl overflow-hidden mb-10 cursor-pointer group"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="grid md:grid-cols-2">
                  <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
                    <img
                      src={featured.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-4"
                      style={{ color: TAG_COLORS[featured.category] || "#89E900" }}
                    >
                      <Tag className="h-3 w-3" />{featured.category}
                    </span>
                    <h2 className="text-2xl font-black mb-3 leading-snug">{featured.title}</h2>
                    <p className="text-[14px] mb-6 leading-relaxed" style={{ color: "#8A8F9E" }}>{featured.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[12px]" style={{ color: "#8A8F9E" }}>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{featured.readTime}</span>
                        <span>{formatDate(featured.createdAt)}</span>
                        <span>by {featured.author}</span>
                      </div>
                      <button className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "#89E900" }}>
                        Read more <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl overflow-hidden cursor-pointer group transition-all hover:scale-[1.01]"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={post.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: TAG_COLORS[post.category] || "#89E900" }}>
                        {post.category}
                      </span>
                      <h3 className="text-[15px] font-bold mt-2 mb-2 leading-snug">{post.title}</h3>
                      <p className="text-[13px] leading-relaxed mb-4" style={{ color: "#8A8F9E" }}>{post.excerpt}</p>
                      <div className="flex items-center gap-3 text-[11px]" style={{ color: "#8A8F9E" }}>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredPosts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[15px]" style={{ color: "#8A8F9E" }}>No posts in this category yet.</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Newsletter */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-black mb-2">Get new posts in your inbox</h2>
        <p className="text-[14px] mb-6" style={{ color: "#8A8F9E" }}>Tips, case studies, and AI ecommerce insights — weekly.</p>
        <div className="flex gap-2 max-w-sm mx-auto">
          <input
            placeholder="you@brand.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl text-[14px] text-white outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          />
          <button
            className="px-5 py-2.5 rounded-xl font-bold text-[14px] transition-opacity hover:opacity-90"
            style={{ background: "#89E900", color: "#0D0F14" }}
            onClick={() => { setEmail(""); }}
          >
            Subscribe
          </button>
        </div>
      </section>
      <WebsiteFooter />
    </div>
  );
}
