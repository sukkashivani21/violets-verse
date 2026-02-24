import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Decorative floating elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {["🌸", "🌺", "🌷", "💮", "🌼"].map((flower, i) => (
          <span
            key={i}
            className="absolute text-2xl md:text-3xl opacity-20 animate-float"
            style={{
              left: `${15 + i * 18}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.6}s`,
            }}
          >
            {flower}
          </span>
        ))}
      </div>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-lg mx-auto space-y-8">
          <div className="space-y-2">
            <span className="text-6xl md:text-7xl animate-bloom inline-block">💐</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground animate-text-reveal">
              Digi<span className="text-gradient">Bouquet</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl font-body animate-text-reveal animation-delay-200 opacity-0">
              Send a beautiful digital bouquet to someone you love
            </p>
          </div>

          <div className="animate-text-reveal animation-delay-400 opacity-0">
            <Link to="/create">
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-lg font-body shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-primary text-primary-foreground"
              >
                <Heart className="mr-2 h-5 w-5" />
                Create Your Bouquet
              </Button>
            </Link>
          </div>

          <div className="animate-text-reveal animation-delay-600 opacity-0 space-y-3 pt-4">
            <p className="text-muted-foreground text-sm">
              ✨ No sign up needed • Free forever • Share with a link
            </p>
            <div className="flex items-center justify-center gap-6 text-muted-foreground/60 text-xs">
              <span>🌹 Pick a theme</span>
              <span>💌 Write a message</span>
              <span>🔗 Share the link</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-muted-foreground text-sm font-body">
        Made with 💕
      </footer>
    </div>
  );
};

export default Index;
