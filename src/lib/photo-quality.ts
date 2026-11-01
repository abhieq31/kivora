// Runs in the browser before upload: fixes rotation, resizes phone photos (often 12–48 MP) to a
// sharp 2560 px JPEG under the 4 MB limit, and scores each shot so owners retake bad ones.

export type PhotoCheck = { blob: Blob; width: number; height: number; score: number; issues: string[] };

const MAX_EDGE = 2560;

export async function preparePhoto(file: File): Promise<PhotoCheck> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`${file.name}: this format can't be read here — use JPG or PNG (on iPhone, Settings → Camera → Formats → Most Compatible).`);
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, 0, 0, w, h);

  const { brightness, sharpness } = measure(bmp);
  bmp.close();
  const issues: string[] = [];
  let score = 100;
  if (Math.max(w, h) < 1200) { issues.push("Low resolution — use the phone's main camera, not a screenshot or WhatsApp copy"); score -= 35; }
  if (h > w * 1.1) { issues.push("Portrait — turn the phone sideways to show more of the room"); score -= 15; }
  if (brightness < 70) { issues.push("Too dark — open curtains and switch on all lights"); score -= 25; }
  else if (brightness > 225) { issues.push("Overexposed — avoid shooting straight into a window"); score -= 15; }
  if (sharpness < 55) { issues.push("Looks blurry — hold still and tap to focus"); score -= 30; }

  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Could not process photo"))), "image/jpeg", 0.86));
  return { blob, width: w, height: h, score: Math.max(0, score), issues };
}

/** Mean luminance and variance of the Laplacian on a 400 px greyscale copy (a standard blur measure). */
function measure(bmp: ImageBitmap) {
  const s = Math.min(1, 400 / Math.max(bmp.width, bmp.height));
  const w = Math.max(3, Math.round(bmp.width * s));
  const h = Math.max(3, Math.round(bmp.height * s));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bmp, 0, 0, w, h);
  const px = ctx.getImageData(0, 0, w, h).data;
  const g = new Float32Array(w * h);
  let sum = 0;
  for (let i = 0; i < w * h; i++) {
    g[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
    sum += g[i];
  }
  let lapSum = 0, lapSq = 0, n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const l = g[i - 1] + g[i + 1] + g[i - w] + g[i + w] - 4 * g[i];
      lapSum += l; lapSq += l * l; n++;
    }
  }
  const mean = lapSum / n;
  return { brightness: sum / (w * h), sharpness: lapSq / n - mean * mean };
}

export const SHOT_LIST = [
  ["Front of the building", "Stand across the road, include the gate and entrance"],
  ["Living room", "From a corner, phone at chest height, landscape"],
  ["Every bedroom", "Doorway or corner shot showing the window"],
  ["Kitchen", "Counter, storage and any appliances that stay"],
  ["Bathrooms", "Clean and dry, lid down, lights on"],
  ["Balcony & view", "What you see from the main window"],
  ["Society amenities", "Lift, parking, garden, gym — whatever is there"],
] as const;
