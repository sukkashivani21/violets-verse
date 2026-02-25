import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Flower icon */}
      <div className="animate-bloom mb-6">
        <span className="text-6xl md:text-7xl" role="img" aria-label="flower">🌸</span>
      </div>

      {/* Title */}
      <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-foreground italic tracking-tight animate-text-reveal">
        Loved ones
      </h1>

      {/* Subtitle */}
      <p className="font-mono-upper text-sm md:text-base text-muted-foreground mt-6 text-center animate-text-reveal animation-delay-200 opacity-0">
        Beautiful flowers<br />delivered digitally
      </p>

      {/* CTA Buttons */}
      <div className="mt-10 flex flex-col items-center gap-4 w-full max-w-sm animate-text-reveal animation-delay-400 opacity-0">
        <Link to="/create" className="w-full">
          <button className="w-full py-4 px-8 bg-foreground text-background font-mono-upper text-sm tracking-widest hover:opacity-90 transition-opacity">
            Build a Bouquet
          </button>
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-16 pb-6 text-muted-foreground text-xs font-mono-upper">
        Made with 💕
      </footer>
    </div>
  );
};

export default Index;
