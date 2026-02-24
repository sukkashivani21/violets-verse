import { useEffect, useState } from "react";

const PETAL_COLORS = [
  "hsl(340, 60%, 75%)",
  "hsl(340, 50%, 82%)",
  "hsl(280, 40%, 80%)",
  "hsl(20, 60%, 82%)",
  "hsl(340, 70%, 70%)",
  "hsl(0, 50%, 85%)",
];

interface Petal {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  rotation: number;
}

const PetalAnimation = ({ count = 20 }: { count?: number }) => {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const generated: Petal[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 8 + Math.random() * 14,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 5,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      rotation: Math.random() * 360,
    }));
    setPetals(generated);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute animate-petal-fall"
          style={{
            left: `${petal.left}%`,
            width: `${petal.size}px`,
            height: `${petal.size * 1.3}px`,
            backgroundColor: petal.color,
            borderRadius: "50% 0 50% 50%",
            animationDuration: `${petal.duration}s`,
            animationDelay: `${petal.delay}s`,
            opacity: 0,
            transform: `rotate(${petal.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
};

export default PetalAnimation;
