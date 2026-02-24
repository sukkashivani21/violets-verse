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
    petal: "hsl(350 68% 66%)",
    center: "hsl(347 56% 45%)",
    outline: "hsl(350 24% 38%)",
    type: "rose",
    sizeCategory: "large",
  },
  dahlia: {
    name: "Dahlia",
    petal: "hsl(13 86% 73%)",
    center: "hsl(14 54% 42%)",
    outline: "hsl(16 28% 36%)",
    type: "dahlia",
    sizeCategory: "large",
  },
  anemone: {
    name: "Anemone",
    petal: "hsl(333 62% 79%)",
    center: "hsl(229 27% 22%)",
    outline: "hsl(334 24% 38%)",
    type: "anemone",
    sizeCategory: "medium",
  },
  daisies: {
    name: "Daisy",
    petal: "hsl(48 35% 97%)",
    center: "hsl(42 82% 58%)",
    outline: "hsl(42 24% 36%)",
    type: "daisy",
    sizeCategory: "small",
  },
  sunflowers: {
    name: "Sunflower",
    petal: "hsl(44 90% 63%)",
    center: "hsl(31 64% 30%)",
    outline: "hsl(37 28% 34%)",
    type: "sunflower",
    sizeCategory: "large",
  },
  lily: {
    name: "Lily",
    petal: "hsl(42 71% 95%)",
    center: "hsl(39 84% 63%)",
    outline: "hsl(37 25% 37%)",
    type: "lily",
    sizeCategory: "medium",
  },
  tulips: {
    name: "Tulip",
    petal: "hsl(339 76% 71%)",
    center: "hsl(334 41% 43%)",
    outline: "hsl(338 30% 36%)",
    type: "tulip",
    sizeCategory: "medium",
  },
  lavender: {
    name: "Lavender",
    petal: "hsl(266 63% 76%)",
    center: "hsl(261 45% 52%)",
    outline: "hsl(264 23% 35%)",
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
