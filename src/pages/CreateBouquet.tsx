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
  const [selectedTheme, setSelectedTheme] = useState("roses");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!senderName.trim() || !receiverName.trim() || !message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    const id = generateId();

    const { error } = await supabase.from("bouquets").insert({
      id,
      sender_name: senderName.trim(),
      receiver_name: receiverName.trim(),
      message: message.trim(),
      theme: selectedTheme,
    });

    if (error) {
      toast({ title: "Something went wrong", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    navigate(`/bouquet/${id}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-8">
      {/* Header */}
      <Link to="/" className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold italic text-foreground">Digibouquet</h1>
      </Link>

      {/* Step 1: Pick blooms */}
      {step === 1 && (
        <div className="w-full max-w-2xl animate-text-reveal">
          <h2 className="font-mono-upper text-sm text-center mb-2 text-foreground tracking-widest">Pick your blooms</h2>
          <p className="text-center text-muted-foreground text-sm mb-8 font-body">
            Click on a flower to select it.
          </p>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
            {themes.map((theme) => (
              <button
                key={theme.key}
                type="button"
                onClick={() => setSelectedTheme(theme.key)}
                className={`flex flex-col items-center gap-2 p-4 border transition-all ${
                  selectedTheme === theme.key
                    ? "border-foreground bg-muted"
                    : "border-transparent hover:border-border"
                }`}
              >
                <span className="text-4xl md:text-5xl">{theme.emoji}</span>
                <span className="font-mono-upper text-[10px] text-muted-foreground">{theme.name}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setStep(2)}
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

          <div className="border border-border p-6 md:p-8 bg-card mb-8">
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

          <p className="text-xs text-muted-foreground text-right mb-6">{message.length}/500</p>

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
          <h2 className="font-mono-upper text-sm text-center mb-8 text-foreground tracking-widest">Preview your bouquet</h2>

          <div className="border border-border p-6 md:p-8 bg-card mb-6 text-center space-y-4">
            <span className="text-6xl inline-block animate-bloom">
              {themes.find(t => t.key === selectedTheme)?.emoji || "💐"}
            </span>
            <p className="text-muted-foreground text-sm font-body">A bouquet for</p>
            <p className="font-display text-2xl font-bold text-foreground">{receiverName}</p>
            <div className="bg-muted/40 p-4 text-left">
              <p className="font-body text-foreground/90 leading-relaxed whitespace-pre-wrap">"{message}"</p>
            </div>
            <p className="text-muted-foreground text-sm font-body">With love, <span className="font-display font-semibold text-foreground">{senderName}</span></p>
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
