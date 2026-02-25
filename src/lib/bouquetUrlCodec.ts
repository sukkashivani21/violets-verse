/**
 * Encode / decode the entire bouquet into a URL-safe base64 string.
 * No backend required – everything lives in the URL.
 */

export interface BouquetUrlData {
  senderName: string;
  receiverName: string;
  message: string;
  flowers: Record<string, number>;
  layoutSeed: number;
  greeneryStyle: "classic" | "wild" | "eucalyptus";
}

const toBase64Url = (str: string) =>
  btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64Url = (str: string) => {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(padded)));
};

export const encodeBouquetUrl = (data: BouquetUrlData): string => {
  try {
    return toBase64Url(JSON.stringify(data));
  } catch {
    return "";
  }
};

export const decodeBouquetUrl = (encoded: string): BouquetUrlData | null => {
  try {
    const json = fromBase64Url(encoded);
    const parsed = JSON.parse(json) as BouquetUrlData;
    if (!parsed.flowers || !parsed.receiverName) return null;
    return parsed;
  } catch {
    return null;
  }
};
