import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, Tag, FileText, Hash, Star, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SEOData {
  seoTitle?: string;
  description?: string;
  bulletPoints?: string[];
  keywords?: string[];
  metaDescription?: string;
  category?: string;
  attributes?: Record<string, string | null>;
  headline?: string;
  subheadline?: string;
  cta?: string;
  offer?: string;
  bodyText?: string;
  hashtagSuggestions?: string[];
  platforms?: Record<string, string>;
}

interface SEOPanelProps {
  data: SEOData;
  tool: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
      onClick={handleCopy}
    >
      {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-primary/70" />
        <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">{title}</p>
      </div>
      {children}
    </div>
  );
}

function CopyableText({ text, multiline = false }: { text: string; multiline?: boolean }) {
  return (
    <div className="flex items-start gap-2 bg-white/3 border border-white/8 rounded-lg p-2.5 group">
      <p className={`text-xs text-foreground/90 flex-1 leading-relaxed ${!multiline ? "truncate" : ""}`}>{text}</p>
      <CopyButton text={text} />
    </div>
  );
}

export function SEOPanel({ data, tool }: SEOPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const isAd = tool === "Ad Creatives" || tool === "Cinematic Ads";

  const hasContent = isAd
    ? !!(data.headline || data.bodyText)
    : !!(data.seoTitle || data.description);

  if (!hasContent) return null;

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            {isAd ? <Megaphone className="h-3.5 w-3.5 text-primary" /> : <FileText className="h-3.5 w-3.5 text-primary" />}
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground text-left">
              {isAd ? "Ad Copy & Content" : "SEO Listing Content"}
            </p>
            <p className="text-[10px] text-muted-foreground/60 text-left">
              {isAd ? "Headlines, CTA & platform copy" : "Title, description & keywords"}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/6 pt-3">
          {isAd ? (
            <>
              {data.headline && (
                <Section title="Headline" icon={Star}>
                  <CopyableText text={data.headline} />
                </Section>
              )}
              {data.subheadline && (
                <Section title="Subheadline" icon={FileText}>
                  <CopyableText text={data.subheadline} />
                </Section>
              )}
              {data.offer && (
                <Section title="Offer Hook" icon={Tag}>
                  <CopyableText text={data.offer} />
                </Section>
              )}
              {data.cta && (
                <Section title="Call to Action" icon={Megaphone}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5">
                      {data.cta}
                    </span>
                    <CopyButton text={data.cta} />
                  </div>
                </Section>
              )}
              {data.bodyText && (
                <Section title="Body Copy" icon={FileText}>
                  <CopyableText text={data.bodyText} multiline />
                </Section>
              )}
              {data.platforms && Object.keys(data.platforms).length > 0 && (
                <Section title="Platform Copy" icon={Megaphone}>
                  <div className="space-y-2">
                    {Object.entries(data.platforms).map(([platform, copy]) => (
                      <div key={platform} className="space-y-1">
                        <p className="text-[10px] text-muted-foreground/60 capitalize font-medium">{platform}</p>
                        <CopyableText text={copy} multiline />
                      </div>
                    ))}
                  </div>
                </Section>
              )}
              {data.hashtagSuggestions && data.hashtagSuggestions.length > 0 && (
                <Section title="Hashtags" icon={Hash}>
                  <div className="flex items-center gap-2 flex-wrap">
                    {data.hashtagSuggestions.map(tag => (
                      <span key={tag} className="text-xs text-primary/70 bg-primary/8 border border-primary/15 rounded-full px-2 py-0.5">
                        {tag}
                      </span>
                    ))}
                    <CopyButton text={data.hashtagSuggestions.join(" ")} />
                  </div>
                </Section>
              )}
            </>
          ) : (
            <>
              {data.seoTitle && (
                <Section title="SEO Title" icon={Tag}>
                  <CopyableText text={data.seoTitle} />
                  <p className="text-[10px] text-muted-foreground/50">{data.seoTitle.length} characters</p>
                </Section>
              )}
              {data.description && (
                <Section title="Product Description" icon={FileText}>
                  <CopyableText text={data.description} multiline />
                </Section>
              )}
              {data.bulletPoints && data.bulletPoints.length > 0 && (
                <Section title="Key Features" icon={Star}>
                  <div className="space-y-1.5">
                    {data.bulletPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-2 group">
                        <span className="text-primary text-xs shrink-0 mt-0.5">•</span>
                        <p className="text-xs text-foreground/80 flex-1 leading-relaxed">{point}</p>
                        <CopyButton text={point} />
                      </div>
                    ))}
                    <div className="flex justify-end pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] gap-1 text-muted-foreground"
                        onClick={() => {
                          navigator.clipboard.writeText(data.bulletPoints!.map(p => `• ${p}`).join("\n"));
                          toast.success("All bullet points copied");
                        }}
                      >
                        <Copy className="h-3 w-3" /> Copy All
                      </Button>
                    </div>
                  </div>
                </Section>
              )}
              {data.keywords && data.keywords.length > 0 && (
                <Section title="SEO Keywords" icon={Hash}>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {data.keywords.map(kw => (
                      <span key={kw} className="text-[11px] bg-white/5 border border-white/8 rounded-full px-2.5 py-1 text-muted-foreground">
                        {kw}
                      </span>
                    ))}
                    <CopyButton text={data.keywords.join(", ")} />
                  </div>
                </Section>
              )}
              {data.metaDescription && (
                <Section title="Meta Description" icon={FileText}>
                  <CopyableText text={data.metaDescription} multiline />
                  <p className="text-[10px] text-muted-foreground/50">{data.metaDescription.length} / 155 characters</p>
                </Section>
              )}
              {data.attributes && Object.values(data.attributes).some(v => v) && (
                <Section title="Product Attributes" icon={Tag}>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(data.attributes).filter(([, v]) => v).map(([key, value]) => (
                      <div key={key} className="bg-white/3 border border-white/8 rounded-lg px-2.5 py-2">
                        <p className="text-[10px] text-muted-foreground/60 capitalize">{key}</p>
                        <p className="text-xs text-foreground/80 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
