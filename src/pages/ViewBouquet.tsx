import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Copy, Check, MessageCircle } from "lucide-react";
import BouquetArrangement from "@/components/BouquetArrangement";
import PetalAnimation from "@/components/PetalAnimation";
import { decodeBouquetUrl } from "@/lib/bouquetUrlCodec";

const ViewBouquet = () => {
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);

  const bouquet = useMemo(() => {
    const data = searchParams.get("data");
    if (!data) return null;
    return decodeBouquetUrl(data);
  }, [searchParams]);

  const bouquetFlowers = useMemo(() => {
    if (!bouquet) return [] as string[];
    return Object.entries(bouquet.flowers).flatMap(([key, count]) =>
      Array(count).fill(key)
    );
  }, [bouquet]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = `💐 ${bouquet?.senderName} sent a digital bouquet to ${bouquet?.receiverName}! View it here: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (!bouquet) {
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
            <BouquetArrangement
              flowers={bouquetFlowers}
              size="md"
              layoutSeed={bouquet.layoutSeed ?? 7}
              greeneryStyle={bouquet.greeneryStyle ?? "classic"}
            />
          </div>

          <div className="text-center space-y-1 animate-text-reveal animation-delay-200 opacity-0">
            <p className="font-mono-upper text-xs text-muted-foreground tracking-widest">A bouquet for</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{bouquet.receiverName}</h1>
          </div>

          <div className="animate-text-reveal animation-delay-400 opacity-0">
            <div className="bg-muted/40 p-6">
              <p className="font-body text-foreground/90 text-center leading-relaxed whitespace-pre-wrap">"{bouquet.message}"</p>
            </div>
          </div>

          <div className="text-center animate-text-reveal animation-delay-500 opacity-0">
            <p className="text-muted-foreground font-body text-sm">With love,</p>
            <p className="font-display text-xl font-semibold text-foreground">{bouquet.senderName}</p>
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
