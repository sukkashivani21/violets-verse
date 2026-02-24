import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("roses");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="min-h-screen gradient-hero">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Create Your Bouquet</h1>
            <p className="text-muted-foreground text-sm font-body">Fill in the details below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sender Name */}
          <div className="space-y-2">
            <Label htmlFor="sender" className="font-body text-foreground">Your Name</Label>
            <Input
              id="sender"
              placeholder="e.g. Alex"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="bg-card/80 backdrop-blur-sm border-border/50 font-body"
              maxLength={50}
            />
          </div>

          {/* Receiver Name */}
          <div className="space-y-2">
            <Label htmlFor="receiver" className="font-body text-foreground">Receiver's Name</Label>
            <Input
              id="receiver"
              placeholder="e.g. Jamie"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              className="bg-card/80 backdrop-blur-sm border-border/50 font-body"
              maxLength={50}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="font-body text-foreground">Your Message</Label>
            <Textarea
              id="message"
              placeholder="Write something heartfelt..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-card/80 backdrop-blur-sm border-border/50 font-body min-h-[120px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
          </div>

          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="font-body text-foreground">Choose a Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.key}
                  type="button"
                  onClick={() => setSelectedTheme(theme.key)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 bg-card/60 backdrop-blur-sm hover:scale-105 ${
                    selectedTheme === theme.key
                      ? "border-primary shadow-md scale-105"
                      : "border-border/30 hover:border-primary/40"
                  }`}
                >
                  <span className="text-3xl">{theme.emoji}</span>
                  <span className="text-xs font-body text-foreground/80">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-6 text-lg font-body shadow-lg hover:shadow-xl transition-all duration-300 bg-primary text-primary-foreground"
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Send className="mr-2 h-5 w-5" />
            )}
            {loading ? "Creating..." : "Send Bouquet"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateBouquet;
