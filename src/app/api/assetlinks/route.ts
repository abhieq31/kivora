// Digital Asset Links: proves the Android app and this site have the same owner, so the
// Play Store app opens full screen without a browser bar. Fingerprints come from env so the
// Play App Signing key can be added without a code change.
export function GET() {
  const fingerprints = (process.env.ANDROID_CERT_SHA256 ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const body = fingerprints.length
    ? [{
        relation: ["delegate_permission/common.handle_all_urls"],
        target: { namespace: "android_app", package_name: process.env.ANDROID_PACKAGE ?? "in.nakshly.app", sha256_cert_fingerprints: fingerprints },
      }]
    : [];
  return Response.json(body, { headers: { "Cache-Control": "public, max-age=3600" } });
}
