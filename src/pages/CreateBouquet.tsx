import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Copy, Check, Shuffle, Leaf } from "lucide-react";
import FlowerEmoji, { getAllThemes } from "@/components/FlowerEmoji";
import BouquetArrangement from "@/components/BouquetArrangement";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { encodeBouquetThemePayload } from "@/lib/bouquetThemePayload";

type Step = 1 | 2 | 3 | 4;
type GreeneryStyle = "classic" | "wild" | "eucalyptus";

const MIN_FLOWERS = 6;
const MAX_FLOWERS = 10;
const GREENERY_STYLES: GreeneryStyle[] = ["classic", "wild", "eucalyptus"];

const generateId = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const countToFlowerKeys = (selection: Record<string, number>) =>
  Object.entries(selection).flatMap(([key, count]) => Array(count).fill(key));

const CreateBouquet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const themes = getAllThemes();

  const [step, setStep] = useState<Step>(1);
  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedFlowers, setSelectedFlowers] = useState<Record<string, number>>({});
  const [layoutSeed, setLayoutSeed] = useState<number>(() => Math.floor(Math.random() * 10_000));
  const [greeneryStyle, setGreeneryStyle] = useState<GreeneryStyle>("classic");
  const [frozenDesign, setFrozenDesign] = useState<{
    flowers: Record<string, number>;
    layoutSeed: number;
    greeneryStyle: GreeneryStyle;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const totalFlowers = Object.values(selectedFlowers).reduce((a, b) => a + b, 0);

  const summaryItems = useMemo(
    () =>
      Object.entries(selectedFlowers)
        .filter(([, count]) => count > 0)
        .map(([key, count]) => ({
          key,
          count,
          name: themes.find((t) => t.key === key)?.name ?? key,
        })),
    [selectedFlowers, themes]
  );

  const addFlower = (key: string) => {
    if (totalFlowers >= MAX_FLOWERS) return;
    setSelectedFlowers((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  const removeFlower = (key: string) => {
    setSelectedFlowers((prev) => {
      const next = { ...prev };
      if (!next[key]) return prev;
      if (next[key] <= 1) delete next[key];
      else next[key] -= 1;
      return next;
    });
  };

  const nextGreenery = () => {
    setGreeneryStyle((current) => {
      const i = GREENERY_STYLES.indexOf(current);
      return GREENERY_STYLES[(i + 1) % GREENERY_STYLES.length];
    });
  };

  const currentDesign = frozenDesign ?? { flowers: selectedFlowers, layoutSeed, greeneryStyle };
  const bouquetFlowerKeys = countToFlowerKeys(currentDesign.flowers);
  const shareUrl = createdId && typeof window !== "undefined" ? `${window.location.origin}/bouquet/${createdId}` : "";

  const proceedToCustomize = () => {
    if (totalFlowers < MIN_FLOWERS) {
      toast({ title: `Pick at least ${MIN_FLOWERS} flowers`, variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const proceedToCard = () => {
    setFrozenDesign({
      flowers: selectedFlowers,
      layoutSeed,
      greeneryStyle,
    });
    setStep(3);
  };

  const proceedToFinal = () => {
    if (!senderName.trim() || !receiverName.trim() || !message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setStep(4);
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!frozenDesign) return;
    setLoading(true);

    const id = generateId();
    const sorted = Object.entries(frozenDesign.flowers).sort((a, b) => b[1] - a[1]);
    const dominantTheme = sorted[0]?.[0] || "roses";

    const encodedTheme = encodeBouquetThemePayload({
      v: 2,
      flowers: frozenDesign.flowers,
      layoutSeed: frozenDesign.layoutSeed,
      greeneryStyle: frozenDesign.greeneryStyle,
      dominant: dominantTheme,
    });

    try {
      let attempt = 0;
      let error: { message?: string } | null = null;

      while (attempt < 2) {
        const { error: insertError } = await supabase.from("bouquets").insert({
          id,
          sender_name: senderName.trim(),
          receiver_name: receiverName.trim(),
          message: message.trim(),
          theme: encodedTheme,
        });

        if (!insertError) {
          setCreatedId(id);
          setLoading(false);
          return;
        }

        error = insertError;
        attempt += 1;
      }

      toast({ title: "Could not create bouquet", description: error?.message ?? "Please try again.", variant: "destructive" });
      setLoading(false);
    } catch {
      toast({
        title: "Network error",
        description: "Failed to reach the backend. Please try again in a few seconds.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link to="/" className="mb-7 inline-flex">
          <h1 className="font-display text-3xl md:text-4xl font-bold italic text-foreground">Digibouquet</h1>
        </Link>

        {step === 1 && (
          <section className="animate-text-reveal">
            <h2 className="font-mono-upper text-center text-xs tracking-widest text-muted-foreground mb-2">Flower selection</h2>
            <p className="text-center font-body text-foreground mb-7">Pick {MIN_FLOWERS} to {MAX_FLOWERS} flowers for your bouquet.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {themes.map((theme) => {
                const count = selectedFlowers[theme.key] || 0;
                return (
                  <button
                    key={theme.key}
                    type="button"
                    onClick={() => addFlower(theme.key)}
                    className="relative border border-border bg-card p-3 text-left hover:bg-muted/60 transition-colors"
                  >
                    {count > 0 && (
                      <span className="absolute top-2 right-2 rounded-full min-w-6 h-6 px-2 bg-foreground text-background text-[10px] font-mono-upper grid place-items-center">
                        {count}
                      </span>
                    )}
                    <div className="flex flex-col items-center gap-2">
                      <FlowerEmoji theme={theme.key} size={58} />
                      <span className="font-mono-upper text-[10px] tracking-widest text-muted-foreground">{theme.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {summaryItems.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2 justify-center">
                {summaryItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => removeFlower(item.key)}
                    className="px-3 py-1 border border-border text-[10px] font-mono-upper tracking-wider hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    {item.name} ×{item.count}
                  </button>
                ))}
              </div>
            )}

            <p className="text-center text-xs mt-4 text-muted-foreground font-body">
              {summaryItems.map((item) => `${item.name} ×${item.count}`).join(" | ") || "No flowers selected"}
            </p>

            <div className="mt-7 flex justify-center">
              <button
                type="button"
                onClick={proceedToCustomize}
                className="py-3 px-10 bg-foreground text-background font-mono-upper text-xs tracking-widest hover:opacity-90 transition-opacity"
              >
                Customize bouquet
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="animate-text-reveal">
            <h2 className="font-mono-upper text-center text-xs tracking-widest text-muted-foreground mb-2">Bouquet formation</h2>
            <p className="text-center font-body text-foreground mb-6">Balanced layout with layered overlap and natural depth.</p>

            <div className="border border-border bg-card p-5 md:p-7">
              <BouquetArrangement flowers={countToFlowerKeys(selectedFlowers)} size="lg" layoutSeed={layoutSeed} greeneryStyle={greeneryStyle} />
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setLayoutSeed(Math.floor(Math.random() * 10_000))}
                className="py-2.5 px-5 border border-border font-mono-upper text-[10px] tracking-widest text-foreground hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Shuffle className="h-3.5 w-3.5" /> Try a new arrangement
              </button>
              <button
                onClick={nextGreenery}
                className="py-2.5 px-5 border border-border font-mono-upper text-[10px] tracking-widest text-foreground hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Leaf className="h-3.5 w-3.5" /> Change greenery
              </button>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-8 border border-border font-mono-upper text-xs tracking-widest text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={proceedToCard}
                className="py-3 px-8 bg-foreground text-background font-mono-upper text-xs tracking-widest hover:opacity-90 transition-opacity"
              >
                Write card
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="animate-text-reveal">
            <h2 className="font-mono-upper text-center text-xs tracking-widest text-muted-foreground mb-7">Card writing</h2>

            <div className="grid md:grid-cols-[1fr_1.1fr] gap-4">
              <div className="border border-border bg-card p-5">
                <BouquetArrangement
                  flowers={bouquetFlowerKeys}
                  size="md"
                  layoutSeed={currentDesign.layoutSeed}
                  greeneryStyle={currentDesign.greeneryStyle}
                />
              </div>

              <div className="border border-border bg-card p-6">
                <div className="space-y-4">
                  <div>
                    <label className="font-body text-sm text-muted-foreground">Dear</label>
                    <input
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      maxLength={50}
                      className="w-full bg-transparent border-b border-border py-1 font-display text-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
                      placeholder="Beloved"
                    />
                  </div>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                    className="w-full bg-transparent border-none py-2 font-body text-foreground/90 placeholder:text-muted-foreground/40 focus:outline-none resize-none min-h-[140px] leading-relaxed"
                    placeholder="Write your message..."
                  />

                  <div className="text-right space-y-1">
                    <p className="font-body text-sm text-muted-foreground">Sincerely,</p>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      maxLength={50}
                      className="bg-transparent border-b border-border py-1 font-display text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors text-right"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <p className="text-xs text-right mt-2 text-muted-foreground">{message.length}/500</p>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-8 border border-border font-mono-upper text-xs tracking-widest text-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={proceedToFinal}
                className="py-3 px-8 bg-foreground text-background font-mono-upper text-xs tracking-widest hover:opacity-90 transition-opacity"
              >
                Final preview
              </button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="animate-text-reveal">
            <h2 className="font-mono-upper text-center text-xs tracking-widest text-muted-foreground mb-7">Final output</h2>

            <div className="border border-border bg-card p-6 md:p-8 space-y-6">
              <div className="flex justify-center">
                <BouquetArrangement
                  flowers={bouquetFlowerKeys}
                  size="lg"
                  layoutSeed={currentDesign.layoutSeed}
                  greeneryStyle={currentDesign.greeneryStyle}
                />
              </div>

              <div className="bg-muted/40 p-5 text-center space-y-2">
                <p className="font-mono-upper text-xs text-muted-foreground tracking-widest">A bouquet for</p>
                <p className="font-display text-2xl font-bold text-foreground">{receiverName}</p>
                <p className="font-body text-foreground/90 whitespace-pre-wrap">"{message}"</p>
                <p className="font-body text-muted-foreground">With love, <span className="font-display text-foreground">{senderName}</span></p>
              </div>
            </div>

            {!createdId ? (
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="py-3 px-8 border border-border font-mono-upper text-xs tracking-widest text-foreground hover:bg-muted transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="py-3 px-8 bg-foreground text-background font-mono-upper text-xs tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Sending..." : "Send bouquet"}
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                <p className="text-center font-mono-upper text-[10px] tracking-widest text-muted-foreground">Permanent shareable URL</p>
                <div className="flex items-center gap-2 bg-muted/50 p-3 border border-border">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-transparent text-xs text-muted-foreground font-body truncate focus:outline-none"
                  />
                  <button onClick={handleCopy} className="p-2 hover:bg-muted transition-colors" title="Copy link">
                    {copied ? <Check className="h-4 w-4 text-foreground" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => navigate(`/bouquet/${createdId}`)}
                    className="py-3 px-8 border border-border font-mono-upper text-xs tracking-widest text-foreground hover:bg-muted transition-colors"
                  >
                    Open bouquet page
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="py-3 px-8 bg-foreground text-background font-mono-upper text-xs tracking-widest hover:opacity-90 transition-opacity"
                  >
                    Build another
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default CreateBouquet;
