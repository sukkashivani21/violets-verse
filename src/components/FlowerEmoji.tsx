const THEMES: Record<string, { emoji: string; name: string; colors: string }> = {
  roses: { emoji: "🌹", name: "Red Roses", colors: "from-rose to-rose-light" },
  sunflowers: { emoji: "🌻", name: "Sunflowers", colors: "from-gold to-peach" },
  lavender: { emoji: "💜", name: "Lavender", colors: "from-lavender to-lavender-light" },
  tulips: { emoji: "🌷", name: "Tulips", colors: "from-primary to-rose-light" },
  daisies: { emoji: "🌼", name: "Daisies", colors: "from-cream to-peach" },
  mixed: { emoji: "💐", name: "Mixed Bouquet", colors: "from-rose-light to-lavender-light" },
};

export const getTheme = (key: string) => THEMES[key] || THEMES.roses;
export const getAllThemes = () => Object.entries(THEMES).map(([key, val]) => ({ key, ...val }));

const FlowerEmoji = ({ theme, size = "text-6xl" }: { theme: string; size?: string }) => {
  const t = getTheme(theme);
  return (
    <span className={`${size} animate-bloom inline-block`} role="img" aria-label={t.name}>
      {t.emoji}
    </span>
  );
};

export default FlowerEmoji;
