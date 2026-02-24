interface FlowerTheme {
  name: string;
  petal: string;
  center: string;
  outline: string;
  type: "rose" | "dahlia" | "anemone" | "daisy" | "sunflower" | "lily" | "tulip" | "lavender";
  sizeCategory: "large" | "medium" | "small";
}

const THEMES: Record<string, FlowerTheme> = {
  roses: {
    name: "Rose",
    petal: "hsl(348 82% 60%)",
    center: "hsl(345 68% 38%)",
    outline: "hsl(350 30% 32%)",
    type: "rose",
    sizeCategory: "large",
  },
  dahlia: {
    name: "Dahlia",
    petal: "hsl(15 92% 68%)",
    center: "hsl(12 62% 38%)",
    outline: "hsl(16 34% 30%)",
    type: "dahlia",
    sizeCategory: "large",
  },
  anemone: {
    name: "Anemone",
    petal: "hsl(320 72% 74%)",
    center: "hsl(240 35% 18%)",
    outline: "hsl(320 28% 34%)",
    type: "anemone",
    sizeCategory: "medium",
  },
  daisies: {
    name: "Daisy",
    petal: "hsl(55 95% 95%)",
    center: "hsl(45 92% 52%)",
    outline: "hsl(42 30% 40%)",
    type: "daisy",
    sizeCategory: "small",
  },
  sunflowers: {
    name: "Sunflower",
    petal: "hsl(46 96% 58%)",
    center: "hsl(28 72% 26%)",
    outline: "hsl(35 34% 28%)",
    type: "sunflower",
    sizeCategory: "large",
  },
  lily: {
    name: "Lily",
    petal: "hsl(38 82% 90%)",
    center: "hsl(32 90% 56%)",
    outline: "hsl(34 30% 34%)",
    type: "lily",
    sizeCategory: "medium",
  },
  tulips: {
    name: "Tulip",
    petal: "hsl(335 84% 65%)",
    center: "hsl(330 50% 38%)",
    outline: "hsl(335 35% 30%)",
    type: "tulip",
    sizeCategory: "medium",
  },
  lavender: {
    name: "Lavender",
    petal: "hsl(268 72% 72%)",
    center: "hsl(264 56% 48%)",
    outline: "hsl(264 28% 30%)",
    type: "lavender",
    sizeCategory: "small",
  },
};

export const getTheme = (key: string) => THEMES[key] || THEMES.roses;
export const getAllThemes = () => Object.entries(THEMES).map(([key, val]) => ({ key, ...val }));

const typeToPetals: Record<FlowerTheme["type"], number> = {
  rose: 9,
  dahlia: 14,
  anemone: 7,
  daisy: 10,
  sunflower: 12,
  lily: 6,
  tulip: 5,
  lavender: 8,
};

const FlowerEmoji = ({
  theme,
  size = 72,
  className = "",
}: {
  theme: string;
  size?: number;
  className?: string;
}) => {
  const t = getTheme(theme);
  const petals = typeToPetals[t.type];
  const centerRadius = t.type === "sunflower" ? 15 : t.type === "lavender" ? 8 : 11;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={t.name}
      className={`animate-bloom inline-block ${className}`}
    >
      <g transform="translate(60 58)">
        {Array.from({ length: petals }).map((_, i) => {
          const angle = (360 / petals) * i;
          const wobble = Math.sin(i * 1.7) * 2.4;
          const length = t.type === "lavender" ? 16 : t.type === "dahlia" ? 23 : 20;
          const width = t.type === "lily" ? 10 : t.type === "lavender" ? 7 : 12;

          return (
            <ellipse
              key={`${t.type}-${i}`}
              cx={0}
              cy={-(length + wobble)}
              rx={width + (i % 2 ? 1 : -1)}
              ry={length}
              fill={t.petal}
              stroke={t.outline}
              strokeWidth={1.2}
              transform={`rotate(${angle})`}
              opacity={0.93}
            />
          );
        })}

        {t.type === "rose" && (
          <path
            d="M-14 7c5-8 20-8 25 0c-2 11-17 16-25 0z"
            fill={t.center}
            stroke={t.outline}
            strokeWidth="1.2"
            opacity="0.95"
          />
        )}

        <circle cx={0} cy={0} r={centerRadius} fill={t.center} stroke={t.outline} strokeWidth={1.2} opacity={0.96} />
        <circle cx={-4} cy={-4} r={Math.max(3, centerRadius / 3)} fill="hsl(0 0% 100% / 0.35)" />
      </g>
    </svg>
  );
};

export default FlowerEmoji;
