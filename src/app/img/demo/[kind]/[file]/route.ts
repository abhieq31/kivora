// Illustrated placeholder photos for demo listings, generated deterministically from the seed.
import { rng } from "@/lib/seed/generate";

const WALLS = ["#f3ede4", "#e9eef3", "#efe9f4", "#e8f1ec", "#f6efe6", "#eaeaea", "#f2e8e1"];
const ACCENTS = ["#3f6f8f", "#7a5c99", "#b3674a", "#4f7d5b", "#c08a2d", "#556070", "#9a4d5e"];
const FLOORS = ["#c9a27a", "#b48a64", "#d8c3a5", "#a9988a", "#cdb79e"];
const SKIES = [["#9cc9f0", "#e8f4ff"], ["#f7c59f", "#fdeee0"], ["#a7d0e8", "#f1f8fc"], ["#c4b5e8", "#f3eefc"]];

type R = () => number;
const pick = <T,>(r: R, a: T[]) => a[Math.floor(r() * a.length)];
const between = (r: R, a: number, b: number) => a + r() * (b - a);

function sky(r: R) {
  const [a, b] = pick(r, SKIES);
  return `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="1200" height="800" fill="url(#s)"/><circle cx="${between(r, 150, 1050)}" cy="${between(r, 90, 180)}" r="46" fill="#fff6d5" opacity=".9"/>`;
}

function trees(r: R, y: number, n: number) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = between(r, 0, 1200);
    const h = between(r, 60, 120);
    s += `<rect x="${x - 5}" y="${y - h * 0.4}" width="10" height="${h * 0.4}" fill="#6b4f3a"/><ellipse cx="${x}" cy="${y - h * 0.55}" rx="${h * 0.35}" ry="${h * 0.42}" fill="${pick(r, ["#4f8a5b", "#5f9b63", "#3f7a52"])}"/>`;
  }
  return s;
}

function windows(x: number, y: number, w: number, h: number, cols: number, rows: number, r: R) {
  let s = "";
  const cw = w / cols;
  const rh = h / rows;
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++)
      s += `<rect x="${x + i * cw + cw * 0.18}" y="${y + j * rh + rh * 0.2}" width="${cw * 0.64}" height="${rh * 0.55}" rx="2" fill="${r() < 0.25 ? "#ffe9a8" : "#cfe3f2"}" opacity=".95"/>`;
  return s;
}

function tower(r: R) {
  let s = sky(r);
  s += `<rect y="640" width="1200" height="160" fill="#9bbf8a"/>`;
  const n = 3 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const w = between(r, 170, 260);
    const x = (i * 1200) / n + between(r, -20, 40);
    const h = between(r, 300, 560);
    const c = pick(r, ["#e7e1d7", "#d9dee6", "#efe6da", "#dfe7e1", "#ece3ee"]);
    s += `<rect x="${x}" y="${640 - h}" width="${w}" height="${h}" fill="${c}" stroke="#b9b2a8"/><rect x="${x - 6}" y="${640 - h - 14}" width="${w + 12}" height="16" fill="${pick(r, ACCENTS)}"/>`;
    s += windows(x + 10, 640 - h + 14, w - 20, h - 40, 4, Math.floor(h / 48), r);
  }
  return s + trees(r, 680, 9) + `<rect y="700" width="1200" height="100" fill="#8a8f96"/><rect y="745" width="1200" height="6" fill="#f4f4f4" opacity=".7"/>`;
}

function house(r: R, villa: boolean) {
  let s = sky(r) + `<rect y="600" width="1200" height="200" fill="#93c47d"/>`;
  const w = villa ? 640 : 520;
  const x = 600 - w / 2;
  const body = pick(r, ["#f1e3cf", "#e6eef2", "#f3e6e2", "#ebe7d9"]);
  const roof = pick(r, ["#a2513c", "#5a5f6b", "#7c4b3a", "#3f5d73"]);
  if (villa) {
    s += `<rect x="${x}" y="320" width="${w}" height="280" fill="${body}" stroke="#b8a894"/><rect x="${x - 20}" y="300" width="${w + 40}" height="26" fill="${roof}"/><rect x="${x}" y="450" width="${w}" height="14" fill="#cbbba6"/>`;
    s += windows(x + 30, 340, w - 60, 100, 5, 1, r) + windows(x + 30, 480, w - 220, 100, 3, 1, r);
    s += `<rect x="${x + w - 170}" y="480" width="110" height="120" fill="${pick(r, ACCENTS)}"/><rect x="${x + 20}" y="440" width="${w - 40}" height="10" fill="#7d7468"/>`;
  } else {
    s += `<rect x="${x}" y="380" width="${w}" height="220" fill="${body}" stroke="#b8a894"/><polygon points="${x - 30},390 600,240 ${x + w + 30},390" fill="${roof}"/>`;
    s += `<rect x="${570}" y="480" width="70" height="120" fill="${pick(r, ACCENTS)}"/>` + windows(x + 30, 410, 180, 120, 2, 1, r) + windows(x + w - 210, 410, 180, 120, 2, 1, r);
  }
  s += `<rect x="${x - 60}" y="590" width="${w + 120}" height="14" fill="#cdbfa9"/>` + trees(r, 640, 5);
  return s;
}

function plot(r: R) {
  let s = sky(r) + `<rect y="430" width="1200" height="370" fill="#c8b48a"/><rect y="430" width="1200" height="40" fill="#a3c27d"/>`;
  for (let i = 0; i < 8; i++) s += `<rect x="${120 + i * 130}" y="${560 + (i % 2) * 6}" width="16" height="34" fill="#f2f2f2" stroke="#999"/>`;
  s += `<path d="M0 760 L1200 700 L1200 800 L0 800 Z" fill="#7f7f7f"/>` + trees(r, 470, 7);
  s += `<rect x="900" y="470" width="200" height="90" fill="#fff" stroke="#555"/><text x="1000" y="525" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#333">PLOT</text>`;
  return s;
}

function room(r: R, kind: string) {
  const wall = pick(r, WALLS);
  const accent = pick(r, ACCENTS);
  const floor = pick(r, FLOORS);
  let s = `<rect width="1200" height="800" fill="${wall}"/><rect y="560" width="1200" height="240" fill="${floor}"/><rect y="556" width="1200" height="8" fill="#00000014"/>`;
  const win = (x: number, y: number, w: number, h: number) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#cfe7f7" stroke="#fff" stroke-width="10"/><line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="#fff" stroke-width="8"/><rect x="${x - 30}" y="${y - 20}" width="40" height="${h + 60}" fill="${accent}" opacity=".55"/><rect x="${x + w - 10}" y="${y - 20}" width="40" height="${h + 60}" fill="${accent}" opacity=".55"/>`;
  const plant = (x: number) => `<rect x="${x}" y="500" width="50" height="60" fill="#d9c7b0"/><ellipse cx="${x + 25}" cy="470" rx="45" ry="60" fill="#5d9564"/>`;
  if (kind === "living") {
    s += win(760, 150, 300, 260) + `<rect x="160" y="200" width="200" height="140" fill="${pick(r, ACCENTS)}" opacity=".35" stroke="#fff" stroke-width="8"/>`;
    s += `<rect x="120" y="440" width="520" height="130" rx="26" fill="${accent}"/><rect x="100" y="400" width="80" height="170" rx="24" fill="${accent}"/><rect x="580" y="400" width="80" height="170" rx="24" fill="${accent}"/><rect x="150" y="390" width="460" height="80" rx="20" fill="${accent}" opacity=".85"/>`;
    s += `<ellipse cx="420" cy="690" rx="320" ry="55" fill="#ffffff55"/><rect x="300" y="610" width="240" height="20" rx="6" fill="#6d5844"/>` + plant(1060);
  } else if (kind === "bedroom") {
    s += win(820, 160, 260, 240) + `<rect x="200" y="300" width="460" height="160" rx="12" fill="#8a6e57"/><rect x="180" y="440" width="500" height="160" rx="16" fill="#f7f7f7"/><rect x="180" y="500" width="500" height="100" rx="16" fill="${accent}"/>`;
    s += `<rect x="230" y="410" width="150" height="60" rx="18" fill="#fff"/><rect x="480" y="410" width="150" height="60" rx="18" fill="#fff"/><rect x="60" y="470" width="100" height="100" fill="#a58c74"/><rect x="700" y="470" width="100" height="100" fill="#a58c74"/><circle cx="110" cy="440" r="26" fill="#ffe9a8"/>`;
  } else if (kind === "kitchen") {
    s += win(470, 150, 260, 200) + `<rect x="60" y="120" width="360" height="190" fill="${accent}" opacity=".85"/><rect x="780" y="120" width="360" height="190" fill="${accent}" opacity=".85"/>`;
    s += `<rect x="40" y="420" width="1120" height="30" fill="#3d3d3d"/><rect x="40" y="450" width="1120" height="200" fill="${accent}"/>`;
    for (let i = 0; i < 6; i++) s += `<line x1="${40 + i * 187}" y1="450" x2="${40 + i * 187}" y2="650" stroke="#00000033" stroke-width="4"/>`;
    s += `<rect x="830" y="400" width="180" height="22" fill="#222"/><polygon points="860,170 980,170 1010,260 830,260" fill="#9aa0a6"/>`;
  } else if (kind === "bathroom") {
    for (let i = 0; i < 12; i++) for (let j = 0; j < 8; j++) s += `<rect x="${i * 100}" y="${j * 70}" width="98" height="68" fill="${pick(r, ["#e4eef2", "#dde8ec", "#eaf1f3"])}"/>`;
    s += `<rect x="760" y="120" width="300" height="440" fill="#d6ecf5" opacity=".7" stroke="#b9c9cf" stroke-width="6"/><circle cx="910" cy="160" r="30" fill="#9aa0a6"/>`;
    s += `<rect x="160" y="160" width="300" height="220" rx="10" fill="#cfe3ea" stroke="#9aa0a6" stroke-width="8"/><rect x="140" y="440" width="340" height="40" rx="10" fill="#fff"/><rect x="200" y="480" width="220" height="90" fill="${accent}"/>`;
  } else {
    // balcony with city view
    s = sky(r) + `<rect y="380" width="1200" height="420" fill="#c5d3df"/>`;
    for (let i = 0; i < 14; i++) {
      const h = between(r, 120, 300);
      s += `<rect x="${i * 90}" y="${520 - h}" width="80" height="${h}" fill="${pick(r, ["#b6c3d0", "#a9b8c7", "#c2ccd6"])}"/>`;
    }
    s += `<rect y="520" width="1200" height="280" fill="${floor}"/><rect y="440" width="1200" height="12" fill="#5b6470"/>`;
    for (let i = 0; i < 25; i++) s += `<rect x="${i * 50}" y="440" width="6" height="160" fill="#5b6470"/>`;
    s += plant(120) + plant(1000) + `<rect x="480" y="560" width="120" height="90" fill="#8a6e57"/><rect x="620" y="560" width="120" height="90" fill="#8a6e57"/>`;
  }
  return s;
}

export async function GET(_req: Request, { params }: { params: Promise<{ kind: string; file: string }> }) {
  const { kind, file } = await params;
  const seed = parseInt(file, 10) || 1;
  const r = rng(seed * 7919 + kind.length);
  const body =
    kind === "tower" ? tower(r) :
    kind === "house" ? house(r, false) :
    kind === "villa" ? house(r, true) :
    kind === "plot" ? plot(r) :
    room(r, kind);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">${body}</svg>`;
  return new Response(svg, {
    headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=31536000, immutable" },
  });
}
