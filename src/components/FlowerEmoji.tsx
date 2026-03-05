interface FlowerTheme {
  name: string;
  petals: string[];
  center: string;
  outline: string;
  type: "rose" | "dahlia" | "anemone" | "daisy" | "sunflower" | "lily" | "tulip" | "lavender";
  sizeCategory: "large" | "medium" | "small";
}

const THEMES: Record<string, FlowerTheme> = {
  roses: {
    name: "Rose",
    petals: ["hsl(348 72% 62%)", "hsl(350 65% 55%)", "hsl(345 60% 48%)"],
    center: "hsl(345 55% 38%)",
    outline: "hsl(350 25% 38%)",
    type: "rose",
    sizeCategory: "large",
  },
  dahlia: {
    name: "Dahlia",
    petals: ["hsl(15 85% 68%)", "hsl(18 78% 60%)", "hsl(12 70% 52%)"],
    center: "hsl(12 55% 35%)",
    outline: "hsl(16 28% 34%)",
    type: "dahlia",
    sizeCategory: "large",
  },
  anemone: {
    name: "Anemone",
    petals: ["hsl(320 62% 78%)", "hsl(318 55% 70%)", "hsl(315 48% 64%)"],
    center: "hsl(240 30% 18%)",
    outline: "hsl(320 22% 38%)",
    type: "anemone",
    sizeCategory: "medium",
  },
  daisies: {
    name: "Daisy",
    petals: ["hsl(55 90% 96%)", "hsl(50 85% 92%)", "hsl(48 80% 88%)"],
    center: "hsl(45 88% 52%)",
    outline: "hsl(42 25% 50%)",
    type: "daisy",
    sizeCategory: "small",
  },
  sunflowers: {
    name: "Sunflower",
    petals: ["hsl(46 92% 60%)", "hsl(42 88% 52%)", "hsl(38 82% 46%)"],
    center: "hsl(28 65% 24%)",
    outline: "hsl(35 28% 32%)",
    type: "sunflower",
    sizeCategory: "large",
  },
  lily: {
    name: "Lily",
    petals: ["hsl(38 78% 92%)", "hsl(35 72% 86%)", "hsl(32 68% 80%)"],
    center: "hsl(32 85% 56%)",
    outline: "hsl(34 25% 40%)",
    type: "lily",
    sizeCategory: "medium",
  },
  tulips: {
    name: "Tulip",
    petals: ["hsl(335 78% 68%)", "hsl(332 72% 60%)", "hsl(330 65% 52%)"],
    center: "hsl(330 45% 38%)",
    outline: "hsl(335 28% 35%)",
    type: "tulip",
    sizeCategory: "medium",
  },
  lavender: {
    name: "Lavender",
    petals: ["hsl(268 62% 74%)", "hsl(265 55% 66%)", "hsl(262 48% 58%)"],
    center: "hsl(264 50% 45%)",
    outline: "hsl(264 22% 35%)",
    type: "lavender",
    sizeCategory: "small",
  },
};

export const getTheme = (key: string) => THEMES[key] || THEMES.roses;
export const getAllThemes = () => Object.entries(THEMES).map(([key, val]) => ({ key, ...val }));

/* ── Petal path generators for each flower type ── */

const roseInnerPetals = (cx: number, cy: number) => {
  // Spiral rose petals - overlapping curved petals creating a rose shape
  const paths: string[] = [];
  const layers = [
    { count: 3, r: 6, w: 5, h: 8 },
    { count: 5, r: 12, w: 7, h: 11 },
    { count: 7, r: 19, w: 9, h: 14 },
  ];
  layers.forEach((layer, li) => {
    const offset = li * 15;
    for (let i = 0; i < layer.count; i++) {
      const angle = ((360 / layer.count) * i + offset) * (Math.PI / 180);
      const px = cx + Math.cos(angle) * layer.r;
      const py = cy + Math.sin(angle) * layer.r;
      const a = (angle * 180) / Math.PI;
      paths.push(
        `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${layer.w}" ry="${layer.h}" transform="rotate(${a.toFixed(0)} ${px.toFixed(1)} ${py.toFixed(1)})" />`
      );
    }
  });
  return paths;
};

const makeRoundPetals = (cx: number, cy: number, count: number, radius: number, pw: number, ph: number) => {
  const paths: string[] = [];
  for (let i = 0; i < count; i++) {
    const angle = ((360 / count) * i - 90) * (Math.PI / 180);
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    const a = (angle * 180) / Math.PI + 90;
    paths.push(
      `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${pw}" ry="${ph}" transform="rotate(${a.toFixed(0)} ${px.toFixed(1)} ${py.toFixed(1)})" />`
    );
  }
  return paths;
};

const makeTulipPath = (cx: number, cy: number) => {
  // Cup-shaped tulip
  return `M${cx - 14} ${cy + 8} Q${cx - 16} ${cy - 12}, ${cx} ${cy - 22} Q${cx + 16} ${cy - 12}, ${cx + 14} ${cy + 8} Q${cx + 6} ${cy + 12}, ${cx} ${cy + 10} Q${cx - 6} ${cy + 12}, ${cx - 14} ${cy + 8} Z`;
};

const makeLavenderSpike = (cx: number, cy: number) => {
  const buds: string[] = [];
  for (let i = 0; i < 7; i++) {
    const y = cy - 6 - i * 4.5;
    const w = 4.5 - Math.abs(i - 3) * 0.5;
    const ox = (i % 2 === 0 ? -1 : 1) * 1.2;
    buds.push(`<ellipse cx="${(cx + ox).toFixed(1)}" cy="${y.toFixed(1)}" rx="${w.toFixed(1)}" ry="3" />`);
  }
  return buds;
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
  const cx = 60;
  const cy = 58;

  const renderFlower = () => {
    switch (t.type) {
      case "rose": {
        const layers = roseInnerPetals(cx, cy);
        return (
          <g>
            {/* Outer petals */}
            <g fill={t.petals[2]} stroke={t.outline} strokeWidth="0.8" opacity="0.7">
              {layers.slice(10).map((html, i) => (
                <g key={`o${i}`} dangerouslySetInnerHTML={{ __html: html }} />
              ))}
            </g>
            {/* Mid petals */}
            <g fill={t.petals[1]} stroke={t.outline} strokeWidth="0.6" opacity="0.8">
              {layers.slice(3, 10).map((html, i) => (
                <g key={`m${i}`} dangerouslySetInnerHTML={{ __html: html }} />
              ))}
            </g>
            {/* Inner petals */}
            <g fill={t.petals[0]} stroke={t.outline} strokeWidth="0.5" opacity="0.9">
              {layers.slice(0, 3).map((html, i) => (
                <g key={`in${i}`} dangerouslySetInnerHTML={{ __html: html }} />
              ))}
            </g>
            {/* Center spiral hint */}
            <circle cx={cx} cy={cy} r={5} fill={t.center} opacity="0.8" />
            <path d={`M${cx - 3} ${cy} Q${cx} ${cy - 4}, ${cx + 3} ${cy} Q${cx} ${cy + 3}, ${cx - 2} ${cy + 1}`} fill="none" stroke={t.outline} strokeWidth="0.6" opacity="0.5" />
          </g>
        );
      }
      case "dahlia": {
        const petals1 = makeRoundPetals(cx, cy, 12, 20, 5, 13);
        const petals2 = makeRoundPetals(cx, cy, 8, 12, 4, 9);
        return (
          <g>
            <g fill={t.petals[2]} stroke={t.outline} strokeWidth="0.7" opacity="0.65">
              {petals1.map((html, i) => <g key={i} dangerouslySetInnerHTML={{ __html: html }} />)}
            </g>
            <g fill={t.petals[1]} stroke={t.outline} strokeWidth="0.6" opacity="0.8">
              {petals2.map((html, i) => <g key={i} dangerouslySetInnerHTML={{ __html: html }} />)}
            </g>
            <circle cx={cx} cy={cy} r={7} fill={t.center} stroke={t.outline} strokeWidth="0.6" />
            <circle cx={cx - 2} cy={cy - 2} r={2.5} fill="hsl(0 0% 100% / 0.25)" />
          </g>
        );
      }
      case "daisy": {
        const petals = makeRoundPetals(cx, cy, 10, 16, 4.5, 12);
        return (
          <g>
            <g fill={t.petals[0]} stroke={t.outline} strokeWidth="0.6" opacity="0.9">
              {petals.map((html, i) => <g key={i} dangerouslySetInnerHTML={{ __html: html }} />)}
            </g>
            <circle cx={cx} cy={cy} r={8} fill={t.center} stroke={t.outline} strokeWidth="0.8" />
            <circle cx={cx - 2} cy={cy - 2} r={3} fill="hsl(48 90% 65% / 0.5)" />
          </g>
        );
      }
      case "sunflower": {
        const outer = makeRoundPetals(cx, cy, 14, 22, 5, 14);
        const inner = makeRoundPetals(cx, cy, 10, 14, 3.5, 9);
        return (
          <g>
            <g fill={t.petals[2]} stroke={t.outline} strokeWidth="0.6" opacity="0.7">
              {outer.map((html, i) => <g key={i} dangerouslySetInnerHTML={{ __html: html }} />)}
            </g>
            <g fill={t.petals[0]} stroke={t.outline} strokeWidth="0.5" opacity="0.85">
              {inner.map((html, i) => <g key={i} dangerouslySetInnerHTML={{ __html: html }} />)}
            </g>
            <circle cx={cx} cy={cy} r={10} fill={t.center} stroke={t.outline} strokeWidth="0.8" />
            {/* Seed texture dots */}
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i * 45) * Math.PI / 180;
              return <circle key={i} cx={cx + Math.cos(a) * 5} cy={cy + Math.sin(a) * 5} r={1} fill="hsl(28 40% 35%)" opacity="0.5" />;
            })}
          </g>
        );
      }
      case "anemone": {
        const petals = makeRoundPetals(cx, cy, 6, 16, 8, 14);
        return (
          <g>
            <g fill={t.petals[0]} stroke={t.outline} strokeWidth="0.7" opacity="0.85">
              {petals.map((html, i) => <g key={i} dangerouslySetInnerHTML={{ __html: html }} />)}
            </g>
            <circle cx={cx} cy={cy} r={9} fill={t.center} stroke={t.outline} strokeWidth="0.6" />
            {/* Stamen dots */}
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i * 60 + 30) * Math.PI / 180;
              return <circle key={i} cx={cx + Math.cos(a) * 6} cy={cy + Math.sin(a) * 6} r={1.2} fill="hsl(50 60% 70%)" />;
            })}
          </g>
        );
      }
      case "lily": {
        const petals = makeRoundPetals(cx, cy, 6, 18, 7, 16);
        return (
          <g>
            <g fill={t.petals[0]} stroke={t.outline} strokeWidth="0.7" opacity="0.85">
              {petals.map((html, i) => <g key={i} dangerouslySetInnerHTML={{ __html: html }} />)}
            </g>
            {/* Petal veins */}
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = ((360 / 6) * i - 90) * (Math.PI / 180);
              const px = cx + Math.cos(angle) * 8;
              const py = cy + Math.sin(angle) * 8;
              const ex = cx + Math.cos(angle) * 22;
              const ey = cy + Math.sin(angle) * 22;
              return <line key={i} x1={px} y1={py} x2={ex} y2={ey} stroke={t.outline} strokeWidth="0.4" opacity="0.3" />;
            })}
            <circle cx={cx} cy={cy} r={5} fill={t.center} stroke={t.outline} strokeWidth="0.5" />
            {/* Stamens */}
            {Array.from({ length: 5 }).map((_, i) => {
              const a = (i * 72 + 15) * Math.PI / 180;
              return <circle key={i} cx={cx + Math.cos(a) * 8} cy={cy + Math.sin(a) * 8} r={1.5} fill={t.center} opacity="0.7" />;
            })}
          </g>
        );
      }
      case "tulip": {
        return (
          <g>
            <path d={makeTulipPath(cx, cy)} fill={t.petals[0]} stroke={t.outline} strokeWidth="0.8" opacity="0.9" />
            {/* Inner petal lines */}
            <path d={`M${cx - 5} ${cy + 6} Q${cx - 6} ${cy - 8}, ${cx} ${cy - 18}`} fill="none" stroke={t.petals[2]} strokeWidth="1.2" opacity="0.4" />
            <path d={`M${cx + 5} ${cy + 6} Q${cx + 6} ${cy - 8}, ${cx} ${cy - 18}`} fill="none" stroke={t.petals[2]} strokeWidth="1.2" opacity="0.4" />
            {/* Highlight */}
            <path d={`M${cx - 8} ${cy + 2} Q${cx - 10} ${cy - 8}, ${cx - 2} ${cy - 16}`} fill="none" stroke="hsl(0 0% 100% / 0.25)" strokeWidth="1.5" />
          </g>
        );
      }
      case "lavender": {
        const buds = makeLavenderSpike(cx, cy);
        return (
          <g>
            {/* Stem */}
            <line x1={cx} y1={cy + 20} x2={cx} y2={cy - 34} stroke="hsl(120 25% 42%)" strokeWidth="1.5" strokeLinecap="round" />
            {/* Small leaves on stem */}
            <path d={`M${cx} ${cy + 10} Q${cx - 8} ${cy + 4}, ${cx - 12} ${cy + 8}`} fill="none" stroke="hsl(120 25% 42%)" strokeWidth="0.8" />
            <path d={`M${cx} ${cy + 2} Q${cx + 8} ${cy - 4}, ${cx + 11} ${cy}`} fill="none" stroke="hsl(120 25% 42%)" strokeWidth="0.8" />
            <g fill={t.petals[0]} stroke={t.outline} strokeWidth="0.5" opacity="0.85">
              {buds.map((html, i) => <g key={i} dangerouslySetInnerHTML={{ __html: html }} />)}
            </g>
            <g fill={t.petals[1]} stroke={t.outline} strokeWidth="0.4" opacity="0.6">
              {buds.slice(0, 3).map((html, i) => <g key={`d${i}`} dangerouslySetInnerHTML={{ __html: html }} />)}
            </g>
          </g>
        );
      }
      default:
        return null;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={t.name}
      className={`animate-bloom inline-block ${className}`}
    >
      {renderFlower()}
    </svg>
  );
};

export default FlowerEmoji;
