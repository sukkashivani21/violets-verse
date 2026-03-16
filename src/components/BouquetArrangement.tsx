import { useMemo } from "react";
import FlowerEmoji, { getTheme } from "@/components/FlowerEmoji";

interface BouquetArrangementProps {
  flowers: string[];
  size?: "sm" | "md" | "lg";
  layoutSeed?: number;
  greeneryStyle?: "classic" | "wild" | "eucalyptus";
}

const sizeMap = {
  sm: { container: "w-64 h-72", flower: 78 },
  md: { container: "w-80 h-[22rem]", flower: 95 },
  lg: { container: "w-96 h-[26rem]", flower: 110 },
};

const seeded = (seed: number, n: number) => {
  const x = Math.sin(seed * 97.11 + n * 41.23) * 10000;
  return x - Math.floor(x);
};

/* ── Grid-like arrangement: flowers placed side-by-side, no overlap, no gaps ── */
const generateBouquetSlots = (seed: number, count: number) => {
  const slots: { x: number; y: number; z: number }[] = [];
  const cx = 50;
  const cy = 46;

  if (count === 1) {
    slots.push({ x: cx, y: cy, z: 30 });
    return slots;
  }

  // Use a honeycomb-style grid that fills from top to bottom
  // Determine rows and columns based on count
  const cols = count <= 2 ? 2 : count <= 4 ? 2 : count <= 6 ? 3 : count <= 9 ? 3 : 4;
  const rows = Math.ceil(count / cols);
  
  const spacingX = 24; // horizontal spacing between flowers
  const spacingY = 18; // vertical spacing between rows
  const totalW = (cols - 1) * spacingX;
  const totalH = (rows - 1) * spacingY;
  const startX = cx - totalW / 2;
  const startY = cy - totalH / 2;

  let placed = 0;
  for (let row = 0; row < rows && placed < count; row++) {
    const colsInRow = row === rows - 1 ? count - placed : cols;
    const rowOffset = (row % 2 === 1) ? spacingX * 0.35 : 0; // honeycomb offset
    const rowW = (colsInRow - 1) * spacingX;
    const rowStartX = cx - rowW / 2 + rowOffset * (seeded(seed + 50, row) - 0.5);

    for (let col = 0; col < colsInRow && placed < count; col++) {
      const jx = (seeded(seed + 200, placed * 3) - 0.5) * 3;
      const jy = (seeded(seed + 300, placed * 3 + 1) - 0.5) * 2;
      
      slots.push({
        x: Math.max(15, Math.min(85, rowStartX + col * spacingX + jx)),
        y: Math.max(18, Math.min(62, startY + row * spacingY + jy)),
        z: 25 + row * 2 + Math.round(seeded(seed + 400, placed) * 3),
      });
      placed++;
    }
  }

  // Gentle shuffle to add variety while keeping structure
  const indices = slots.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(seeded(seed + 999, i) * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.map((i) => slots[i]);
};

/* ── SVG Leaf Path Generators (sketchy / realistic) ── */

const f = (v: number) => v.toFixed(1);

const wobble = (v: number, amt: number, s: number, i: number) =>
  v + (seeded(s, i) - 0.5) * amt;

// Multi-segment wobbly leaf outline with serrated edges and asymmetry
const sketchyLeafPath = (
  bx: number, by: number, tipX: number, tipY: number, width: number, leafSeed: number
) => {
  const dx = tipX - bx, dy = tipY - by;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return "";
  const ux = dx / len, uy = dy / len;
  const nx = -uy, ny = ux;

  const wL = width * (0.9 + seeded(leafSeed, 0) * 0.25);
  const wR = width * (0.9 + seeded(leafSeed + 1, 0) * 0.25);
  const segments = 8;
  const leftPts: [number, number][] = [];
  const rightPts: [number, number][] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const profile = Math.sin(t * Math.PI) * (t < 0.35 ? t / 0.35 : 1) * Math.pow(1 - t * 0.15, 1.5);
    const serL = 1 + Math.sin(t * 14 + seeded(leafSeed + 10, i) * 6) * 0.08;
    const serR = 1 + Math.sin(t * 14 + seeded(leafSeed + 20, i) * 6) * 0.08;
    const px = bx + dx * t, py = by + dy * t;
    const wob = len * 0.012;
    leftPts.push([px + nx * wL * profile * serL + wobble(0, wob, leafSeed + 30, i), py + ny * wL * profile * serL + wobble(0, wob, leafSeed + 40, i)]);
    rightPts.push([px - nx * wR * profile * serR + wobble(0, wob, leafSeed + 50, i), py - ny * wR * profile * serR + wobble(0, wob, leafSeed + 60, i)]);
  }

  let path = `M${f(bx)} ${f(by)}`;
  for (let i = 1; i < leftPts.length; i++) {
    const [px, py] = leftPts[i];
    const [prevX, prevY] = leftPts[i - 1];
    path += ` Q${f((prevX + px) / 2 + wobble(0, 1.5, leafSeed + 100, i))} ${f((prevY + py) / 2 + wobble(0, 1.5, leafSeed + 110, i))},${f(px)} ${f(py)}`;
  }
  for (let i = rightPts.length - 1; i >= 0; i--) {
    const [px, py] = rightPts[i];
    const ni = Math.min(i + 1, rightPts.length - 1);
    const [nxP, nyP] = rightPts[ni];
    path += ` Q${f((nxP + px) / 2 + wobble(0, 1.5, leafSeed + 200, i))} ${f((nyP + py) / 2 + wobble(0, 1.5, leafSeed + 210, i))},${f(px)} ${f(py)}`;
  }
  return path + "Z";
};

// Simple leaf for small elements, sketchy for larger ones
const pointedLeaf = (bx: number, by: number, tipX: number, tipY: number, width: number, leafSeed = 0) => {
  const dx = tipX - bx, dy = tipY - by;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return "";
  if (len > 18) return sketchyLeafPath(bx, by, tipX, tipY, width, leafSeed);

  const ux = dx / len, uy = dy / len;
  const nxW = -uy * width, nyW = ux * width;
  const bL = 0.92 + (seeded(leafSeed + 50, 0) - 0.5) * 0.3;
  const bR = 0.92 + (seeded(leafSeed + 51, 1) - 0.5) * 0.3;
  const pL = 0.26 + seeded(leafSeed + 52, 2) * 0.14;
  const pR = 0.26 + seeded(leafSeed + 53, 3) * 0.14;

  const l1x = bx + dx * pL + nxW * bL * 1.2, l1y = by + dy * pL + nyW * bL * 1.2;
  const l2x = bx + dx * 0.7 + nxW * 0.45 * bL, l2y = by + dy * 0.7 + nyW * 0.45 * bL;
  const r1x = bx + dx * 0.7 - nxW * 0.45 * bR, r1y = by + dy * 0.7 - nyW * 0.45 * bR;
  const r2x = bx + dx * pR - nxW * bR * 1.2, r2y = by + dy * pR - nyW * bR * 1.2;
  const wtx = wobble(tipX, 1.5, leafSeed + 60, 0);
  const wty = wobble(tipY, 1.5, leafSeed + 61, 1);

  return `M${f(bx)} ${f(by)} C${f(l1x)} ${f(l1y)},${f(l2x)} ${f(l2y)},${f(wtx)} ${f(wty)} C${f(r1x)} ${f(r1y)},${f(r2x)} ${f(r2y)},${f(bx)} ${f(by)}Z`;
};

// Detailed vein paths: curved midrib + curved side veins
const leafVeins = (bx: number, by: number, tipX: number, tipY: number, width: number, veinSeed = 0): string[] => {
  const dx = tipX - bx, dy = tipY - by;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 10) return [];
  const ux = dx / len, uy = dy / len;
  const nx = -uy, ny = ux;
  const veins: string[] = [];

  const midBow = width * (seeded(veinSeed, 0) - 0.5) * 0.25;
  const mc1x = bx + dx * 0.33 + nx * midBow, mc1y = by + dy * 0.33 + ny * midBow;
  const mc2x = bx + dx * 0.66 - nx * midBow * 0.5, mc2y = by + dy * 0.66 - ny * midBow * 0.5;
  const endX = bx + dx * 0.93, endY = by + dy * 0.93;
  veins.push(`M${f(bx)} ${f(by)} C${f(mc1x)} ${f(mc1y)},${f(mc2x)} ${f(mc2y)},${f(endX)} ${f(endY)}`);

  const veinCount = Math.max(3, Math.floor(len / 14));
  for (let i = 1; i <= veinCount; i++) {
    const t = 0.12 + (i / (veinCount + 1)) * 0.7;
    const u2 = 1 - t;
    const mx = u2*u2*u2*bx + 3*u2*u2*t*mc1x + 3*u2*t*t*mc2x + t*t*t*endX;
    const my = u2*u2*u2*by + 3*u2*u2*t*mc1y + 3*u2*t*t*mc2y + t*t*t*endY;
    const side = i % 2 === 0 ? 1 : -1;
    const vLen = width * (0.55 + seeded(veinSeed + 10, i) * 0.45) * (1 - t * 0.35);
    const sa = (30 + seeded(veinSeed + 20, i) * 30) * (Math.PI / 180);
    const vTipX = mx + (nx * side * Math.cos(sa) + ux * Math.sin(sa) * 0.4) * vLen;
    const vTipY = my + (ny * side * Math.cos(sa) + uy * Math.sin(sa) * 0.4) * vLen;
    veins.push(`M${f(mx)} ${f(my)} Q${f((mx + vTipX) / 2 + ux * vLen * 0.15)} ${f((my + vTipY) / 2 + uy * vLen * 0.15)},${f(vTipX)} ${f(vTipY)}`);
  }
  return veins;
};

// Round filler leaf
const roundLeaf = (cx: number, cy: number, r: number, angle: number) => {
  const rad = (angle * Math.PI) / 180;
  return sketchyLeafPath(cx, cy, cx + Math.sin(rad) * r * 1.3, cy - Math.cos(rad) * r * 1.3, r * 0.75, Math.round(cx * 7 + cy * 13));
};

// Fern frond: S-curved stem with alternating sketchy leaflets
const fernFrond = (startX: number, startY: number, tipX: number, tipY: number, seed: number, idx: number) => {
  const paths: { d: string; isStem: boolean }[] = [];
  const dx = tipX - startX, dy = tipY - startY;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return paths;
  const ux = dx / len, uy = dy / len;
  const nx = -uy, ny = ux;

  const bow1 = (seeded(seed + 800, idx) - 0.5) * 18;
  const bow2 = (seeded(seed + 801, idx) - 0.5) * 8;
  const sc1x = startX + dx * 0.35 + nx * bow1, sc1y = startY + dy * 0.35 + ny * bow1;
  const sc2x = startX + dx * 0.65 + nx * bow2, sc2y = startY + dy * 0.65 + ny * bow2;
  paths.push({ d: `M${f(startX)} ${f(startY)} C${f(sc1x)} ${f(sc1y)},${f(sc2x)} ${f(sc2y)},${f(tipX)} ${f(tipY)}`, isStem: true });

  const count = 8 + Math.floor(seeded(seed + 810, idx) * 5);
  for (let i = 1; i < count; i++) {
    const t = i / count;
    const u2 = 1 - t;
    const px = u2*u2*u2*startX + 3*u2*u2*t*sc1x + 3*u2*t*t*sc2x + t*t*t*tipX;
    const py = u2*u2*u2*startY + 3*u2*u2*t*sc1y + 3*u2*t*t*sc2y + t*t*t*tipY;
    const side = i % 2 === 0 ? 1 : -1;
    const leafLen = (1 - t * 0.7) * len * 0.2 + seeded(seed + 820, idx * 20 + i) * 5;
    const splay = 0.3 + seeded(seed + 830, idx * 20 + i) * 0.2;
    const lx = px + (nx * side * (1 - splay) + ux * splay) * leafLen;
    const ly = py + (ny * side * (1 - splay) + uy * splay) * leafLen;
    const ld = pointedLeaf(px, py, lx, ly, leafLen * 0.28, seed + 840 + i);
    if (ld) paths.push({ d: ld, isStem: false });
  }
  return paths;
};

// Thin branchy leaf with organic S-curves
const thinBranch = (startX: number, startY: number, tipX: number, tipY: number, seed: number, idx: number) => {
  const paths: { d: string; isStem: boolean }[] = [];
  const dx = tipX - startX, dy = tipY - startY;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return paths;
  const ux = dx / len, uy = dy / len;
  const nx = -uy, ny = ux;

  const bow1 = (seeded(seed + 900, idx) - 0.3) * 18;
  const bow2 = (seeded(seed + 901, idx) - 0.7) * 14;
  const c1x = startX + dx * 0.33 + nx * bow1, c1y = startY + dy * 0.33 + ny * bow1;
  const c2x = startX + dx * 0.66 + nx * bow2, c2y = startY + dy * 0.66 + ny * bow2;
  paths.push({ d: `M${f(startX)} ${f(startY)} C${f(c1x)} ${f(c1y)},${f(c2x)} ${f(c2y)},${f(tipX)} ${f(tipY)}`, isStem: true });

  const count = 5 + Math.floor(seeded(seed + 910, idx) * 4);
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    const u2 = 1 - t;
    const px = u2*u2*u2*startX + 3*u2*u2*t*c1x + 3*u2*t*t*c2x + t*t*t*tipX;
    const py = u2*u2*u2*startY + 3*u2*u2*t*c1y + 3*u2*t*t*c2y + t*t*t*tipY;
    const side = i % 2 === 0 ? 1 : -1;
    const leafSize = 6 + seeded(seed + 920, idx * 10 + i) * 7;
    const splay = 0.28 + seeded(seed + 930, idx * 10 + i) * 0.22;
    const lx = px + (nx * side * (1 - splay) + ux * splay) * leafSize;
    const ly = py + (ny * side * (1 - splay) + uy * splay) * leafSize;
    const ld = pointedLeaf(px, py, lx, ly, leafSize * 0.36, seed + 940 + i);
    if (ld) paths.push({ d: ld, isStem: false });
  }
  return paths;
};

// Tropical long leaf — wider, sketchy outline
const tropicalLeaf = (bx: number, by: number, tipX: number, tipY: number, width: number, leafSeed = 0) => {
  return sketchyLeafPath(bx, by, tipX, tipY, width * 1.1, leafSeed);
};

const BouquetArrangement = ({
  flowers,
  size = "md",
  layoutSeed = 7,
  greeneryStyle = "classic",
}: BouquetArrangementProps) => {
  const positions = useMemo(() => {
    if (!flowers.length) return [];

    const grouped: Record<string, number> = {};
    flowers.forEach((f) => (grouped[f] = (grouped[f] || 0) + 1));

    const sizeWeight = { large: 3, medium: 2, small: 1 } as const;
    const sortedGroups = Object.entries(grouped).sort(([a], [b]) =>
      sizeWeight[getTheme(b).sizeCategory] - sizeWeight[getTheme(a).sizeCategory]
    );

    const ordered = sortedGroups.flatMap(([key, count]) => Array(count).fill(key));
    const total = ordered.length;
    const slots = generateBouquetSlots(layoutSeed, total);

    return ordered.map((flower, i) => {
      const slot = slots[i];
      const centerOffset = (slot.x - 50) / 50;
      const tiltBase = centerOffset * 8;
      const tiltJ = (seeded(layoutSeed + 77, i) - 0.5) * 6;
      const rotate = tiltBase + tiltJ;
      const scaleBase = 1.0;

      return {
        x: slot.x,
        y: slot.y,
        rotate,
        scale: scaleBase,
        z: slot.z + (total - i),
        flower,
      };
    });
  }, [flowers, layoutSeed]);

  if (!flowers.length) return null;

  return (
    <div className="flex flex-col items-center">
      <div className={`${sizeMap[size].container} relative`}>
        {/* Background greenery */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4 }}>
          <svg viewBox="0 0 240 280" className="w-full h-full" aria-hidden>
            <BackFoliage seed={layoutSeed} style={greeneryStyle} />
          </svg>
        </div>

        {/* Flowers */}
        {positions.map((pos, i) => (
          <div
            key={`${pos.flower}-${i}`}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(-50%, -50%) rotate(${pos.rotate}deg) scale(${pos.scale})`,
              zIndex: pos.z,
            }}
          >
            <FlowerEmoji theme={pos.flower} size={sizeMap[size].flower} />
          </div>
        ))}

        {/* Front accent leaves removed – all greenery stays behind flowers */}

        {/* Wrap / pot */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ zIndex: 40 }}>
          <WrapSVG />
        </div>
      </div>
    </div>
  );
};

/* ── Kraft paper wrap ── */
const WrapSVG = () => (
  <svg width="86" height="72" viewBox="0 0 86 72" aria-hidden>
    <path
      d="M6 2 L43 2 L80 2 L72 66 Q58 72 43 72 Q28 72 14 66 Z"
      fill="hsl(35 38% 82%)"
      stroke="hsl(30 24% 54%)"
      strokeWidth="1"
    />
    {/* Paper texture lines */}
    <path d="M12 14 Q43 20, 74 14" fill="none" stroke="hsl(30 18% 66% / 0.35)" strokeWidth="0.5" />
    <path d="M16 30 Q43 34, 70 30" fill="none" stroke="hsl(30 18% 66% / 0.3)" strokeWidth="0.4" />
    <path d="M18 44 Q43 48, 68 44" fill="none" stroke="hsl(30 18% 66% / 0.2)" strokeWidth="0.4" />
    {/* Twine bow */}
    <path d="M30 8 Q36 1, 43 6 Q50 1, 56 8" fill="none" stroke="hsl(28 35% 50%)" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M30 8 Q24 4, 26 11 Q28 16, 32 9" fill="none" stroke="hsl(28 35% 50%)" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M56 8 Q62 4, 60 11 Q58 16, 54 9" fill="none" stroke="hsl(28 35% 50%)" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="43" cy="7" r="2" fill="hsl(28 35% 50%)" />
  </svg>
);

/* ── Background foliage — long blade-like dark green leaves ── */
const BackFoliage = ({ seed, style }: { seed: number; style: string }) => {
  const elements = useMemo(() => {
    const gx = 120, gy = 240;
    const result: JSX.Element[] = [];

    // Long blade-like leaves fanning out behind flowers (like reference)
    const bladeCount = style === "wild" ? 16 : style === "eucalyptus" ? 12 : 14;
    for (let i = 0; i < bladeCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const spread = 8 + seeded(seed, i * 7) * 28 + i * 3;
      const angle = side * spread * (Math.PI / 180);
      const len = 130 + seeded(seed + 100, i) * 90;
      const tipX = gx + Math.sin(angle) * len;
      const tipY = gy - Math.cos(angle) * len;
      // Narrow blade width for that long grass/leaf look
      const width = 6 + seeded(seed + 150, i) * 6;

      // Dark to medium green palette
      const hue = style === "eucalyptus" ? 150 + seeded(seed + 160, i) * 10
        : style === "wild" ? 118 + seeded(seed + 160, i) * 20
        : 125 + seeded(seed + 160, i) * 18;
      const sat = 40 + seeded(seed + 200, i) * 30;
      const light = 18 + seeded(seed + 250, i) * 18;

      const leafSeed = seed + 3000 + i * 17;
      const d = sketchyLeafPath(gx, gy, tipX, tipY, width, leafSeed);
      if (!d) continue;

      const veins = leafVeins(gx, gy, tipX, tipY, width, seed + 4000 + i * 13);

      result.push(
        <g key={`bl${i}`}>
          <path d={d} fill={`hsl(${hue} ${sat}% ${light}% / 0.85)`} stroke={`hsl(${hue} ${sat - 5}% ${light - 8}% / 0.6)`} strokeWidth="0.8" />
          {veins.map((vd, vi) => (
            <path key={vi} d={vd} fill="none" stroke={`hsl(${hue} ${sat - 10}% ${light + 5}% / ${vi === 0 ? 0.35 : 0.2})`} strokeWidth={vi === 0 ? "0.5" : "0.3"} strokeLinecap="round" />
          ))}
        </g>
      );
    }

    // A few broader leaves for variety
    const broadCount = style === "wild" ? 5 : 3;
    for (let i = 0; i < broadCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const spread = 15 + seeded(seed + 500, i) * 35;
      const angle = side * spread * (Math.PI / 180);
      const len = 110 + seeded(seed + 510, i) * 70;
      const tipX = gx + Math.sin(angle) * len;
      const tipY = gy - Math.cos(angle) * len;
      const width = 14 + seeded(seed + 520, i) * 10;

      const hue = style === "eucalyptus" ? 148 : 128;
      const sat = 45 + seeded(seed + 530, i) * 20;
      const light = 20 + seeded(seed + 540, i) * 14;

      const d = sketchyLeafPath(gx, gy, tipX, tipY, width, seed + 5000 + i * 11);
      if (!d) continue;
      const veins = leafVeins(gx, gy, tipX, tipY, width, seed + 5500 + i * 13);

      result.push(
        <g key={`broad${i}`}>
          <path d={d} fill={`hsl(${hue} ${sat}% ${light}% / 0.8)`} stroke={`hsl(${hue} ${sat}% ${light - 8}% / 0.5)`} strokeWidth="0.7" />
          {veins.map((vd, vi) => (
            <path key={vi} d={vd} fill="none" stroke={`hsl(${hue} ${sat - 8}% ${light + 6}% / ${vi === 0 ? 0.3 : 0.18})`} strokeWidth={vi === 0 ? "0.5" : "0.3"} strokeLinecap="round" />
          ))}
        </g>
      );
    }

    // Thin wispy accent strands (like the purple/lavender wisps in reference)
    const wispCount = style === "wild" ? 8 : 5;
    for (let i = 0; i < wispCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const spread = 20 + seeded(seed + 700, i) * 40;
      const angle = side * spread * (Math.PI / 180);
      const len = 120 + seeded(seed + 710, i) * 80;
      const tipX = gx + Math.sin(angle) * len;
      const tipY = gy - Math.cos(angle) * len;
      const bow = (seeded(seed + 720, i) - 0.5) * 30;
      const mx = (gx + tipX) / 2 + Math.cos(angle) * bow;
      const my = (gy + tipY) / 2 + Math.sin(angle) * bow;

      const hue = style === "eucalyptus" ? 155 : 135;
      result.push(
        <path key={`wisp${i}`}
          d={`M${f(gx)} ${f(gy)} Q${f(mx)} ${f(my)},${f(tipX)} ${f(tipY)}`}
          fill="none"
          stroke={`hsl(${hue} 25% 30% / 0.4)`}
          strokeWidth="1"
          strokeLinecap="round"
        />
      );
    }

    // Style-specific accents
    if (style === "wild") {
      for (let i = 0; i < 15; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const cx = 120 + side * (25 + seeded(seed + 1000, i) * 70);
        const cy = 20 + seeded(seed + 1010, i) * 80;
        const r = 1.2 + seeded(seed + 1020, i) * 1.5;
        result.push(
          <g key={`bb${i}`}>
            <circle cx={cx} cy={cy} r={r} fill="hsl(0 0% 97% / 0.6)" />
            <circle cx={cx} cy={cy} r={r * 0.35} fill="hsl(48 60% 68% / 0.4)" />
          </g>
        );
      }
    }

    if (style === "eucalyptus") {
      for (let i = 0; i < 4; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const sx = gx + side * (8 + seeded(seed + 1100, i) * 20);
        const ex = sx + side * (40 + seeded(seed + 1110, i) * 50);
        const ey = 20 + seeded(seed + 1120, i) * 30;
        const ctrlX = (sx + ex) / 2 + side * seeded(seed + 1130, i) * 18;
        const ctrlY = 100 + seeded(seed + 1140, i) * 30;

        const branchD = `M${f(sx)} ${f(gy)} Q${f(ctrlX)} ${f(ctrlY)},${f(ex)} ${f(ey)}`;

        const coins: JSX.Element[] = [];
        const steps = 5 + Math.floor(seeded(seed + 1150, i) * 3);
        for (let j = 0; j < steps; j++) {
          const t = (j + 1) / (steps + 1);
          const u = 1 - t;
          const px = u * u * sx + 2 * u * t * ctrlX + t * t * ex;
          const py = u * u * gy + 2 * u * t * ctrlY + t * t * ey;
          const lside = j % 2 === 0 ? -1 : 1;
          const off = 5 + seeded(seed + 1160, i * 10 + j) * 5;
          const cr = 4 + seeded(seed + 1170, i * 10 + j) * 4;
          coins.push(
            <circle key={j} cx={px + lside * off} cy={py} r={cr}
              fill="hsl(158 30% 40% / 0.35)"
              stroke="hsl(158 20% 30% / 0.25)"
              strokeWidth="0.4"
            />
          );
        }

        result.push(
          <g key={`euc${i}`} opacity="0.6">
            <path d={branchD} fill="none" stroke="hsl(155 30% 28%)" strokeWidth="1" strokeLinecap="round" />
            {coins}
          </g>
        );
      }
    }

    return result;
  }, [seed, style]);

  return <g>{elements}</g>;
};

/* ── Front accent leaves peeking between flowers ── */
const FrontAccents = ({ seed, style }: { seed: number; style: string }) => {
  const elements = useMemo(() => {
    const result: JSX.Element[] = [];
    const count = style === "wild" ? 7 : 5;

    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const cx = 120 + side * (28 + seeded(seed + 2000, i) * 55);
      const cy = 55 + seeded(seed + 2010, i) * 65;
      const len = 14 + seeded(seed + 2020, i) * 12;
      const angle = side * (30 + seeded(seed + 2030, i) * 50);
      const rad = (angle * Math.PI) / 180;
      const tipX = cx + Math.sin(rad) * len;
      const tipY = cy - Math.cos(rad) * len;
      const width = 4 + seeded(seed + 2040, i) * 3;

      const hue = style === "eucalyptus" ? 150 : style === "wild" ? 120 : 130;
      const d = pointedLeaf(cx, cy, tipX, tipY, width);
      if (!d) continue;

      const f = (v: number) => v.toFixed(1);
      const midrib = `M${f(cx)} ${f(cy)} L${f(cx + (tipX - cx) * 0.85)} ${f(cy + (tipY - cy) * 0.85)}`;

      result.push(
        <g key={`fa${i}`}>
          <path d={d} fill={`hsl(${hue} 32% 30% / 0.55)`} stroke={`hsl(${hue} 26% 22% / 0.35)`} strokeWidth="0.5" />
          <path d={midrib} fill="none" stroke={`hsl(${hue} 24% 24% / 0.4)`} strokeWidth="0.4" />
        </g>
      );
    }

    return result;
  }, [seed, style]);

  return <g>{elements}</g>;
};

export default BouquetArrangement;
