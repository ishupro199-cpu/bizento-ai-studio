import { Link } from "react-router-dom";
import { PixaleraIcon } from "@/components/PixaleraIcon";
import { Clock, ArrowRight, Tag } from "lucide-react";

function WebsiteNav() {
  return (
    <nav className="border-b" style={{ borderColor: "#1E2028", background: "rgba(13,15,20,0.95)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <PixaleraIcon size={30} />
          <span className="text-[16px] font-black" style={{ color: "#F0EBD8" }}>
            Pixalera<span style={{ color: "#89E900" }}>.</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/pricing" className="text-[13px] font-medium hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Pricing</Link>
          <Link to="/login" className="text-[13px] font-medium hover:text-white transition-colors" style={{ color: "#8A8F9E" }}>Log in</Link>
          <Link to="/signup" className="text-[13px] font-semibold px-4 py-2 rounded-xl" style={{ background: "#89E900", color: "#0D0F14" }}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

const TAGS = ["All", "Product Photography", "AI Tips", "Ecommerce", "Case Studies", "Updates"];

const POSTS = [
  {
    tag: "AI Tips",
    tagColor: "#89E900",
    title: "10 prompt tips for perfect product catalog images",
    excerpt: "Learn how to write prompts that consistently generate clean, studio-quality catalog images for any product category.",
    readTime: "5 min read",
    date: "Mar 12, 2026",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    featured: true,
  },
  {
    tag: "Ecommerce",
    tagColor: "#a855f7",
    title: "How D2C brands cut product photography costs by 80%",
    excerpt: "Three Shopify brands share how they replaced studio shoots with Pixalera — and what their ROI looks like.",
    readTime: "7 min read",
    date: "Mar 8, 2026",
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
  },
  {
    tag: "Case Studies",
    tagColor: "#f59e0b",
    title: "From 2-week shoots to 2-minute generations: A fashion brand story",
    excerpt: "How a mid-sized apparel brand scaled their catalog from 50 to 500 SKUs per month without hiring.",
    readTime: "6 min read",
    date: "Mar 3, 2026",
    img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
  },
  {
    tag: "Updates",
    tagColor: "#3b82f6",
    title: "Introducing Cinematic Ads — Pro-tier AI video visuals",
    excerpt: "Today we're launching our most requested feature: film-quality ad visuals generated in under 15 seconds.",
    readTime: "3 min read",
    date: "Feb 28, 2026",
    img: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80",
  },
  {
    tag: "Product Photography",
    tagColor: "#10b981",
    title: "The complete guide to AI product photography in 2026",
    excerpt: "Everything you need to know about using AI to replace traditional product photography for ecommerce.",
    readTime: "10 min read",
    date: "Feb 20, 2026",
    img: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80",
  },
  {
    tag: "AI Tips",
    tagColor: "#89E900",
    title: "Choosing the right model: Flash vs Pro explained",
    excerpt: "When to use the fast Flash model and when to spend extra credits on the Pro model for maximum quality.",
    readTime: "4 min read",
    date: "Feb 14, 2026",
    img: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80",
  },
];

export default function BlogPage() {
  const featured = POSTS.find(p => p.featured);
  const rest = POSTS.filter(p => !p.featured);

  return (
    <div className="min-h-screen" style={{ background: "#0D0F14", color: "#F0EBD8" }}>
      <WebsiteNav />

      <section className="max-w-7xl mx-auto px-6 pt-16 pb-6">
        <h1 className="text-5xl font-black mb-2">Blog</h1>
        <p className="text-[17px] mb-8" style={{ color: "#8A8F9E" }}>Tips, case studies, and product updates from the Pixalera team.</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-12">
          {TAGS.map((t, i) => (
            <button key={t} className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
              style={{
                background: i === 0 ? "rgba(137,233,0,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${i === 0 ? "rgba(137,233,0,0.3)" : "rgba(255,255,255,0.08)"}`,
                color: i === 0 ? "#89E900" : "#8A8F9E",
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* Featured */}
        {featured && (
          <div className="rounded-3xl overflow-hidden mb-10 cursor-pointer group"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="grid md:grid-cols-2">
              <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
                <img src={featured.img} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-4"
                  style={{ color: featured.tagColor }}>
                  <Tag className="h-3 w-3" />{featured.tag}
                </span>
                <h2 className="text-2xl font-black mb-3 leading-snug">{featured.title}</h2>
                <p className="text-[14px] mb-6 leading-relaxed" style={{ color: "#8A8F9E" }}>{featured.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[12px]" style={{ color: "#8A8F9E" }}>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{featured.readTime}</span>
                    <span>{featured.date}</span>
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map(post => (
            <div key={post.title} className="rounded-2xl overflow-hidden cursor-pointer group transition-all hover:scale-[1.01]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="aspect-[16/9] overflow-hidden">
                <img src={post.img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: post.tagColor }}>{post.tag}</span>
                <h3 className="text-[15px] font-bold mt-2 mb-2 leading-snug">{post.title}</h3>
                <p className="text-[13px] leading-relaxed mb-4" style={{ color: "#8A8F9E" }}>{post.excerpt}</p>
                <div className="flex items-center gap-3 text-[11px]" style={{ color: "#8A8F9E" }}>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-black mb-2">Get new posts in your inbox</h2>
        <p className="text-[14px] mb-6" style={{ color: "#8A8F9E" }}>Tips, case studies, and AI ecommerce insights — weekly.</p>
        <div className="flex gap-2 max-w-sm mx-auto">
          <input placeholder="you@brand.com" className="flex-1 px-4 py-2.5 rounded-xl text-[14px] text-white outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
          <button className="px-5 py-2.5 rounded-xl font-bold text-[14px]" style={{ background: "#89E900", color: "#0D0F14" }}>
            Subscribe
          </button>
        </div>
      </section>
    </div>
  );
}
