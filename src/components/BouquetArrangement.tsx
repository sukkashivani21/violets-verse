import { useMemo } from "react";

interface BouquetArrangementProps {
  emojis: string[];
  size?: "sm" | "md" | "lg";
}

const BouquetArrangement = ({ emojis, size = "md" }: BouquetArrangementProps) => {
  const sizeMap = { sm: "text-3xl", md: "text-4xl md:text-5xl", lg: "text-5xl md:text-6xl" };
  const containerMap = { sm: "w-48 h-48", md: "w-64 h-64 md:w-72 md:h-72", lg: "w-72 h-72 md:w-80 md:h-80" };

  // Arrange flowers in a bouquet shape (clustered at top, stems converge at bottom)
  const positions = useMemo(() => {
    const total = emojis.length;
    if (total === 0) return [];

    // Create a dome/fan arrangement
    const arranged: { x: number; y: number; rotate: number; scale: number; delay: number }[] = [];

    if (total <= 3) {
      // Small bouquet: tight cluster
      const offsets = [
        { x: 50, y: 25, rotate: 0 },
        { x: 30, y: 20, rotate: -15 },
        { x: 70, y: 20, rotate: 15 },
      ];
      for (let i = 0; i < total; i++) {
        arranged.push({ ...offsets[i], scale: 1, delay: i * 0.1 });
      }
    } else {
      // Larger bouquet: layered dome
      // Back row (top, wider spread)
      const backCount = Math.ceil(total * 0.4);
      for (let i = 0; i < backCount; i++) {
        const t = backCount === 1 ? 0.5 : i / (backCount - 1);
        arranged.push({
          x: 15 + t * 70,
          y: 8 + Math.sin(t * Math.PI) * 8,
          rotate: (t - 0.5) * 30,
          scale: 0.85,
          delay: i * 0.08,
        });
      }

      // Middle row
      const midCount = Math.ceil(total * 0.35);
      for (let i = 0; i < midCount; i++) {
        const t = midCount === 1 ? 0.5 : i / (midCount - 1);
        arranged.push({
          x: 20 + t * 60,
          y: 28 + Math.sin(t * Math.PI) * 5,
          rotate: (t - 0.5) * 20,
          scale: 1,
          delay: (backCount + i) * 0.08,
        });
      }

      // Front row (bottom, smallest spread)
      const frontCount = total - backCount - midCount;
      for (let i = 0; i < frontCount; i++) {
        const t = frontCount === 1 ? 0.5 : i / (frontCount - 1);
        arranged.push({
          x: 25 + t * 50,
          y: 45 + Math.sin(t * Math.PI) * 3,
          rotate: (t - 0.5) * 12,
          scale: 1.05,
          delay: (backCount + midCount + i) * 0.08,
        });
      }
    }

    return arranged;
  }, [emojis.length]);

  if (emojis.length === 0) return null;

  return (
    <div className="flex flex-col items-center">
      {/* Flower cluster */}
      <div className={`${containerMap[size]} relative`}>
        {emojis.map((emoji, i) => {
          const pos = positions[i];
          if (!pos) return null;
          return (
            <span
              key={i}
              className={`${sizeMap[size]} absolute animate-bloom inline-block`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `translate(-50%, -50%) rotate(${pos.rotate}deg) scale(${pos.scale})`,
                animationDelay: `${pos.delay}s`,
                zIndex: Math.round(pos.y),
                filter: pos.scale < 1 ? "brightness(0.95)" : undefined,
              }}
            >
              {emoji}
            </span>
          );
        })}

        {/* Stems / greenery at bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-3xl md:text-4xl" style={{ transform: "scaleX(1.5)" }}>🌿</span>
          <div className="flex gap-0 -mt-2">
            <span className="text-2xl" style={{ transform: "rotate(-20deg)" }}>🍃</span>
            <span className="text-2xl" style={{ transform: "rotate(20deg) scaleX(-1)" }}>🍃</span>
          </div>
        </div>
      </div>

      {/* Wrapping / ribbon */}
      <div className="-mt-4 flex flex-col items-center">
        <div
          className="w-16 h-8 rounded-b-full border-x-2 border-b-2 border-muted-foreground/20"
          style={{ background: "linear-gradient(180deg, transparent, hsl(var(--muted)))" }}
        />
        <span className="text-xl -mt-1">🎀</span>
      </div>
    </div>
  );
};

export default BouquetArrangement;
