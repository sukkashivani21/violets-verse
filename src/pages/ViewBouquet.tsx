import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Copy, Check, MessageCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FlowerEmoji, { getTheme } from "@/components/FlowerEmoji";
import PetalAnimation from "@/components/PetalAnimation";
import { supabase } from "@/integrations/supabase/client";

interface BouquetData {
  id: string;
  sender_name: string;
  receiver_name: string;
  message: string;
  theme: string;
  created_at: string;
}

const ViewBouquet = () => {
  const { id } = useParams<{ id: string }>();
  const [bouquet, setBouquet] = useState<BouquetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchBouquet = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("bouquets")
        .select("*")
        .eq("id", id)
        .single();

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

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !bouquet) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <span className="text-5xl">🥀</span>
          <h1 className="font-display text-2xl font-bold text-foreground">Bouquet Not Found</h1>
          <p className="text-muted-foreground font-body">This bouquet may have wilted away...</p>
          <Link to="/">
            <Button variant="outline" className="rounded-full font-body">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const theme = getTheme(bouquet.theme);

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      <PetalAnimation count={25} />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 flex flex-col items-center min-h-screen justify-center">
        {/* Bouquet card */}
        <div className="w-full gradient-card rounded-3xl shadow-xl p-8 space-y-6 border border-border/30">
          {/* Flower */}
          <div className="text-center">
            <FlowerEmoji theme={bouquet.theme} size="text-7xl md:text-8xl" />
          </div>

          {/* To/From */}
          <div className="text-center space-y-1 animate-text-reveal animation-delay-200 opacity-0">
            <p className="text-muted-foreground font-body text-sm">A bouquet for</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {bouquet.receiver_name}
            </h1>
          </div>

          {/* Message */}
          <div className="animate-text-reveal animation-delay-400 opacity-0">
            <div className="bg-muted/40 rounded-2xl p-6">
              <p className="font-body text-foreground/90 text-center leading-relaxed whitespace-pre-wrap">
                "{bouquet.message}"
              </p>
            </div>
          </div>

          {/* Sender */}
          <div className="text-center animate-text-reveal animation-delay-500 opacity-0">
            <p className="text-muted-foreground font-body text-sm">With love,</p>
            <p className="font-display text-xl font-semibold text-foreground">
              {bouquet.sender_name}
            </p>
          </div>

          {/* Share buttons */}
          <div className="flex gap-3 pt-2 animate-text-reveal animation-delay-600 opacity-0">
            <Button
              onClick={handleCopy}
              variant="outline"
              className="flex-1 rounded-full font-body border-border/50"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" /> Copy Link
                </>
              )}
            </Button>
            <Button
              onClick={handleWhatsApp}
              className="flex-1 rounded-full font-body bg-[hsl(142,70%,40%)] hover:bg-[hsl(142,70%,35%)] text-primary-foreground"
            >
              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
            </Button>
          </div>
        </div>

        {/* Create your own CTA */}
        <div className="mt-8 text-center animate-text-reveal animation-delay-700 opacity-0">
          <Link to="/create">
            <Button variant="ghost" className="rounded-full font-body text-muted-foreground hover:text-foreground">
              💐 Create your own bouquet
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewBouquet;
