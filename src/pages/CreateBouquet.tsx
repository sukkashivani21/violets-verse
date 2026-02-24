import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getAllThemes } from "@/components/FlowerEmoji";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const generateId = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const CreateBouquet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const themes = getAllThemes();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedFlowers, setSelectedFlowers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const totalFlowers = Object.values(selectedFlowers).reduce((a, b) => a + b, 0);

  const toggleFlower = (key: string) => {
    setSelectedFlowers((prev) => {
      const current = prev[key] || 0;
      if (current > 0) {
        const next = { ...prev };
        if (current === 1) delete next[key];
        else next[key] = current - 1;
        return next;
      }
      if (totalFlowers >= 10) return prev;
      return { ...prev, [key]: 1 };
    });
  };

  const addFlower = (key: string) => {
    if (totalFlowers >= 10) return;
    setSelectedFlowers((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  // Derive the dominant theme for storage
  const dominantTheme = Object.entries(selectedFlowers).sort((a, b) => b[1] - a[1])[0]?.[0] || "mixed";

  const handleSubmit = async () => {
    if (!senderName.trim() || !receiverName.trim() || !message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    const id = generateId();

    try {
      const { error } = await supabase.from("bouquets").insert({
        id,
        sender_name: senderName.trim(),
        receiver_name: receiverName.trim(),
        message: message.trim(),
        theme: dominantTheme,
      });

      if (error) {
        toast({ title: "Something went wrong", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      navigate(`/bouquet/${id}`);
    } catch (err) {
      console.error("Failed to create bouquet:", err);
      toast({ title: "Network error", description: "Please check your connection and try again.", variant: "destructive" });
      setLoading(false);
    }
  };

  // Build bouquet display from selected flowers
  const bouquetEmojis = Object.entries(selectedFlowers).flatMap(([key, count]) => {
    const theme = themes.find((t) => t.key === key);
    return theme ? Array(count).fill(theme.emoji) : [];
  });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-8">
      {/* Header */}
      <Link to="/" className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold italic text-foreground">Digibouquet</h1>
      </Link>

      {/* Step 1: Pick blooms */}
      {step === 1 && (
        <div className="w-full max-w-2xl animate-text-reveal">
          <h2 className="font-mono-upper text-sm text-center mb-2 text-foreground tracking-widest">
            Pick 3 to 10 blooms
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-8 font-body">
            Click a flower to add it. Click its name below to remove.
          </p>

          <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-6">
            {themes.map((theme) => {
              const count = selectedFlowers[theme.key] || 0;
              return (
                <button
                  key={theme.key}
                  type="button"
                  onClick={() => addFlower(theme.key)}
                  className={`relative flex flex-col items-center gap-1 p-3 border transition-all ${
                    count > 0
                      ? "border-foreground bg-muted"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  {count > 0 && (
                    <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-mono-upper">
                      {count}
                    </span>
                  )}
                  <span className="text-3xl md:text-4xl">{theme.emoji}</span>
                  <span className="font-mono-upper text-[9px] text-muted-foreground leading-tight">{theme.name}</span>
                </button>
              );
            })}
          </div>

          {/* Selected flowers tags */}
          {totalFlowers > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {Object.entries(selectedFlowers).map(([key, count]) => {
                const theme = themes.find((t) => t.key === key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleFlower(key)}
                    className="px-3 py-1 border border-border font-mono-upper text-[10px] tracking-wider text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    {theme?.name} ×{count}
                  </button>
                );
              })}
            </div>
          )}

          <p className="text-center text-muted-foreground text-xs mb-6 font-body">
            {totalFlowers}/10 blooms selected
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => {
                if (totalFlowers < 3) {
                  toast({ title: "Pick at least 3 blooms", variant: "destructive" });
                  return;
                }
                setStep(2);
              }}
              className="py-3 px-10 bg-foreground text-background font-mono-upper text-sm tracking-widest hover:opacity-90 transition-opacity"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Write the card */}
      {step === 2 && (
        <div className="w-full max-w-lg animate-text-reveal">
          <h2 className="font-mono-upper text-sm text-center mb-8 text-foreground tracking-widest">Write the card</h2>

          {/* Flowers flanking the card */}
          <div className="flex items-start gap-4">
            <div className="hidden md:flex flex-col gap-1 pt-8">
              {bouquetEmojis.slice(0, Math.ceil(bouquetEmojis.length / 2)).map((e, i) => (
                <span key={i} className="text-3xl animate-bloom" style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
              ))}
            </div>

            <div className="flex-1 border border-border p-6 md:p-8 bg-card">
              <div className="space-y-4">
                <div>
                  <label className="font-body text-sm text-muted-foreground">Dear</label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Beloved"
                    maxLength={50}
                    className="w-full bg-transparent border-b border-border py-1 font-display text-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="I have so much to tell you, but only this much space on this card! Still, you must know..."
                  maxLength={500}
                  className="w-full bg-transparent border-none py-2 font-body text-foreground/90 placeholder:text-muted-foreground/40 focus:outline-none resize-none min-h-[140px] leading-relaxed"
                />

                <div className="text-right space-y-1">
                  <p className="font-body text-sm text-muted-foreground">Sincerely,</p>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Secret Admirer"
                    maxLength={50}
                    className="bg-transparent border-b border-border py-1 font-display text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors text-right"
                  />
                </div>
              </div>
            </div>

            <div className="hidden md:flex flex-col gap-1 pt-8">
              {bouquetEmojis.slice(Math.ceil(bouquetEmojis.length / 2)).map((e, i) => (
                <span key={i} className="text-3xl animate-bloom" style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-right mt-2 mb-6">{message.length}/500</p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setStep(1)}
              className="py-3 px-8 border border-border font-mono-upper text-sm tracking-widest text-foreground hover:bg-muted transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!receiverName.trim() || !message.trim() || !senderName.trim()) {
                  toast({ title: "Please fill in all fields", variant: "destructive" });
                  return;
                }
                setStep(3);
              }}
              className="py-3 px-8 bg-foreground text-background font-mono-upper text-sm tracking-widest hover:opacity-90 transition-opacity"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Send */}
      {step === 3 && (
        <div className="w-full max-w-lg animate-text-reveal">
          <h2 className="font-mono-upper text-sm text-center mb-8 text-foreground tracking-widest">Your bouquet</h2>

          <div className="border border-border p-6 md:p-8 bg-card mb-6 text-center space-y-5">
            {/* Bouquet arrangement */}
            <div className="flex flex-wrap justify-center gap-1">
              {bouquetEmojis.map((e, i) => (
                <span
                  key={i}
                  className="text-4xl md:text-5xl animate-bloom inline-block"
                  style={{
                    animationDelay: `${i * 0.08}s`,
                    transform: `rotate(${(i - bouquetEmojis.length / 2) * 8}deg)`,
                  }}
                >
                  {e}
                </span>
              ))}
            </div>
            <div className="text-2xl">🌿</div>

            <p className="font-mono-upper text-xs text-muted-foreground tracking-widest">A bouquet for</p>
            <p className="font-display text-2xl font-bold text-foreground">{receiverName}</p>
            <div className="bg-muted/40 p-4 text-left">
              <p className="font-body text-foreground/90 leading-relaxed whitespace-pre-wrap">"{message}"</p>
            </div>
            <p className="text-muted-foreground text-sm font-body">
              With love, <span className="font-display font-semibold text-foreground">{senderName}</span>
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setStep(2)}
              className="py-3 px-8 border border-border font-mono-upper text-sm tracking-widest text-foreground hover:bg-muted transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="py-3 px-8 bg-foreground text-background font-mono-upper text-sm tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Sending..." : "Send Bouquet"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBouquet;
