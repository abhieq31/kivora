// Generates the Android (Trusted Web Activity) project from the live web manifest.
// Usage: node tools/generate.mjs [https://your-domain]  — re-run after changing domain or icons.
import { TwaGenerator, TwaManifest, ConsoleLog } from "@bubblewrap/core";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Paths below are relative to android/.
process.chdir(fileURLToPath(new URL("..", import.meta.url)));

const origin = process.argv[2] ?? "https://nakshly.vercel.app";
const manifest = await TwaManifest.fromWebManifest(`${origin}/manifest.webmanifest`);
Object.assign(manifest, {
  packageId: "in.nakshly.app",
  name: "Nakshly",
  launcherName: "Nakshly",
  appVersionCode: 1,
  appVersionName: "1.0.0",
  themeColor: manifest.themeColor,
  navigationColor: manifest.themeColor,
  backgroundColor: manifest.backgroundColor,
  fallbackType: "customtabs",
  enableNotifications: false,
  signingKey: { path: "signing/nakshly-upload.jks", alias: "upload" },
});
rmSync("project", { recursive: true, force: true });
await manifest.saveToFile("twa-manifest.json");
await new TwaGenerator().createTwaProject("project", manifest, new ConsoleLog("twa"));
console.log("generated", manifest.packageId, "for", manifest.host);
