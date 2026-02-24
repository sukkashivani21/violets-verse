const THEMES: Record<string, { emoji: string; name: string }> = {
  roses: { emoji: "🌹", name: "Rose" },
  sunflowers: { emoji: "🌻", name: "Sunflower" },
  lavender: { emoji: "💜", name: "Lavender" },
  tulips: { emoji: "🌷", name: "Tulip" },
  daisies: { emoji: "🌼", name: "Daisy" },
  mixed: { emoji: "💐", name: "Mixed" },
  cherry: { emoji: "🌸", name: "Cherry Blossom" },
  hibiscus: { emoji: "🌺", name: "Hibiscus" },
  orchid: { emoji: "🪻", name: "Orchid" },
  lotus: { emoji: "🪷", name: "Lotus" },
  carnation: { emoji: "🏵️", name: "Carnation" },
  lily: { emoji: "💮", name: "Lily" },
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
