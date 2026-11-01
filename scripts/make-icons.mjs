// Renders the app icons (PWA, Android, Play Store) from the logo mark. Run: node scripts/make-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const pin = (s) => `
  <path transform="translate(${s.x} ${s.y}) scale(${s.k})" d="M16 5.5c-4.7 0-8.5 3.6-8.5 8.2 0 6 8.5 12.8 8.5 12.8s8.5-6.8 8.5-12.8c0-4.6-3.8-8.2-8.5-8.2Z" fill="#fff"/>
  <path transform="translate(${s.x} ${s.y}) scale(${s.k})" d="M11.8 15.2 16 11.6l4.2 3.6v4.3h-8.4Z" fill="#3b3fd8"/>
  <path transform="translate(${s.x} ${s.y}) scale(${s.k})" d="M4 27.5h24" stroke="#ff7a45" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 2.5"/>`;
// "any": rounded square like the favicon. "maskable": full bleed, mark inside the 80% safe zone.
const any = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#3b3fd8"/>${pin({ x: 0, y: 0, k: 1 })}</svg>`;
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#3b3fd8"/>${pin({ x: 4.8, y: 4.8, k: 0.7 })}</svg>`;

mkdirSync("public/icons", { recursive: true });
for (const n of [192, 512]) {
  await sharp(Buffer.from(any)).resize(n, n).png().toFile(`public/icons/icon-${n}.png`);
  await sharp(Buffer.from(maskable)).resize(n, n).png().toFile(`public/icons/maskable-${n}.png`);
}
await sharp(Buffer.from(any)).resize(180, 180).png().toFile("public/icons/apple-touch-icon.png");
console.log("icons written");
