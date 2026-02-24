export interface BouquetThemePayload {
  v: 2;
  flowers: Record<string, number>;
  layoutSeed: number;
  greeneryStyle: "classic" | "wild" | "eucalyptus";
  dominant: string;
}

const encodeBase64 = (value: string) => {
  try {
    return btoa(unescape(encodeURIComponent(value)));
  } catch {
    return "";
  }
};

const decodeBase64 = (value: string) => {
  try {
    return decodeURIComponent(escape(atob(value)));
  } catch {
    return "";
  }
};

export const encodeBouquetThemePayload = (payload: BouquetThemePayload) => {
  const encoded = encodeBase64(JSON.stringify(payload));
  return encoded ? `v2:${encoded}` : payload.dominant;
};

export const decodeBouquetThemePayload = (theme: string): BouquetThemePayload | null => {
  if (!theme.startsWith("v2:")) return null;

  const raw = decodeBase64(theme.slice(3));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as BouquetThemePayload;
    if (parsed?.v !== 2 || typeof parsed.layoutSeed !== "number" || !parsed.flowers) return null;
    return parsed;
  } catch {
    return null;
  }
};
