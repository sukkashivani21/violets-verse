import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Copy, Check, MessageCircle, Loader2 } from "lucide-react";
import { getTheme, getAllThemes } from "@/components/FlowerEmoji";
import BouquetArrangement from "@/components/BouquetArrangement";
import PetalAnimation from "@/components/PetalAnimation";
import { supabase } from "@/integrations/supabase/client";
import { decodeBouquetThemePayload } from "@/lib/bouquetThemePayload";

interface BouquetData {
  id: string;
  sender_name: string;
  receiver_name: string;
  message: string;
  theme: string;
  created_at: string;
}

const fallbackFlowers = (themeKey: string) => {
  const allThemes = getAllThemes();
  const accent = allThemes.find((t) => t.key !== themeKey);
  const accentKey = accent?.key ?? "daisies";
  return [themeKey, themeKey, accentKey, themeKey, accentKey, themeKey];
};

const ViewBouquet = () => {
  const { id } = useParams<{ id: string }>();
  const [bouquet, setBouquet] = useState<BouquetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchBouquet = async () => {
      if (!id) return;

      const { data, error } = await supabase.from("bouquets").select("*").eq("id", id).single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setBouquet(data as BouquetData);
      }
      setLoading(false);
    };

    fetchBouquet();
  }, [id]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = `💐 ${bouquet?.sender_name} sent a digital bouquet to ${bouquet?.receiver_name}! View it here: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const decodedTheme = useMemo(() => (bouquet ? decodeBouquetThemePayload(bouquet.theme) : null), [bouquet]);

  const bouquetFlowers = useMemo(() => {
    if (!bouquet) return [] as string[];

    if (decodedTheme?.flowers) {
      return Object.entries(decodedTheme.flowers).flatMap(([key, count]) => Array(count).fill(key));
    }

    return fallbackFlowers(bouquet.theme);
  }, [bouquet, decodedTheme]);

  const layoutSeed = decodedTheme?.layoutSeed ?? 7;
  const greeneryStyle = decodedTheme?.greeneryStyle ?? "classic";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (notFound || !bouquet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <span className="text-5xl">🥀</span>
          <h1 className="font-display text-2xl font-bold text-foreground">Bouquet Not Found</h1>
          <p className="text-muted-foreground font-body">This bouquet may have wilted away...</p>
          <Link to="/">
            <button className="mt-4 py-2 px-6 border border-border font-mono-upper text-xs tracking-widest text-foreground hover:bg-muted transition-colors">
              Go Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <PetalAnimation count={20} />

      <div className="relative z-10 max-w-xl mx-auto px-4 py-8 flex flex-col items-center min-h-screen justify-center">
        <div className="w-full border border-border bg-card p-8 md:p-10 space-y-6">
          <div className="flex justify-center">
            <BouquetArrangement flowers={bouquetFlowers} size="md" layoutSeed={layoutSeed} greeneryStyle={greeneryStyle} />
          </div>

          <div className="text-center space-y-1 animate-text-reveal animation-delay-200 opacity-0">
            <p className="font-mono-upper text-xs text-muted-foreground tracking-widest">A bouquet for</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{bouquet.receiver_name}</h1>
          </div>

          <div className="animate-text-reveal animation-delay-400 opacity-0">
            <div className="bg-muted/40 p-6">
              <p className="font-body text-foreground/90 text-center leading-relaxed whitespace-pre-wrap">"{bouquet.message}"</p>
            </div>
          </div>

          <div className="text-center animate-text-reveal animation-delay-500 opacity-0">
            <p className="text-muted-foreground font-body text-sm">With love,</p>
            <p className="font-display text-xl font-semibold text-foreground">{bouquet.sender_name}</p>
          </div>

          <div className="pt-4 border-t border-border space-y-3 animate-text-reveal animation-delay-600 opacity-0">
            <p className="font-mono-upper text-xs text-center text-muted-foreground tracking-widest">Share this bouquet</p>

            <div className="flex items-center gap-2 bg-muted/50 p-3 border border-border">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-xs text-muted-foreground font-body truncate focus:outline-none"
              />
              <button onClick={handleCopy} className="shrink-0 p-2 hover:bg-muted transition-colors" title="Copy link">
                {copied ? <Check className="h-4 w-4 text-foreground" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 py-3 border border-border font-mono-upper text-xs tracking-widest text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex-1 py-3 bg-foreground text-background font-mono-upper text-xs tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-3 w-3" />
                WhatsApp
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center animate-text-reveal animation-delay-700 opacity-0">
          <Link to="/create">
            <button className="font-mono-upper text-xs tracking-widest text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
              💐 Create your own bouquet
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewBouquet;
