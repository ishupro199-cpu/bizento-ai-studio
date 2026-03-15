import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Camera, Clapperboard, LayoutGrid, Megaphone, ArrowLeft } from "lucide-react";

const features = [
  { icon: LayoutGrid, title: "Generate Catalog", desc: "Create professional ecommerce product images. Clean backgrounds, perfect lighting, multiple angles — all from a single photo." },
  { icon: Camera, title: "Product Photography", desc: "Generate studio-quality product photography scenes. Lifestyle settings, themed backgrounds, seasonal campaigns." },
  { icon: Clapperboard, title: "Cinematic Ads", desc: "Produce CGI-style cinematic product advertisements. Dramatic lighting, 3D effects, and motion-ready compositions." },
  { icon: Megaphone, title: "Ad Creatives", desc: "Design scroll-stopping social media ad creatives. Optimized formats for Instagram, TikTok, Facebook, and more." },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">Bizento <span className="text-primary">AI</span></span>
        </Link>
        <Link to="/app"><Button size="sm" className="bg-primary text-primary-foreground rounded-lg">Get Started</Button></Link>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold">AI Creative <span className="text-gradient">Tools</span></h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">Four powerful tools to transform your product photos into professional marketing visuals.</p>
        </div>

        <div className="space-y-6">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-xl p-8 hover:bg-[hsl(var(--glass-hover))] transition-all duration-200 group">
              <div className="flex items-start gap-5">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{f.title}</h3>
                  <p className="text-muted-foreground mt-2">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
