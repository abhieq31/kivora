# Nakshly for Android

The Android app is a **Trusted Web Activity (TWA)**: a small native app (about 1.3 MB) that opens nakshly.vercel.app full screen. A web deploy updates the app too, so there's no separate codebase to maintain. Flipkart Lite and other PWAs on Play work the same way.

- Package: `in.nakshly.app`. **This is permanent on Google Play.**
- Target API 36, minimum API 21 (Android 5).

## Folders

| Path | What | In git? |
|---|---|---|
| `tools/generate.mjs` | Regenerates `project/` from the live web manifest | yes |
| `project/` | Android Gradle project (generated, with release signing added) | yes, except build output |
| `twa-manifest.json` | Settings the project was generated from | yes |
| `signing/` | **Upload key** `nakshly-upload.jks` and its passwords | **no — back this up** |
| `dist/` | Built `nakshly-1.0.0.aab` (Play upload) and `.apk` (sideload/test) | no |
| `store-listing/` | Play Store icon, feature graphic, screenshots and text | yes |

## Build

The build needs Java 17 and the Android SDK, both in `~/.bubblewrap/`:

```bash
cd android/project
export JAVA_HOME=~/.bubblewrap/jdk-17.0.21+9/Contents/Home ANDROID_HOME=~/.bubblewrap/android_sdk
./gradlew bundleRelease assembleRelease
```

For every Play upload, raise `versionCode` in `project/app/build.gradle`.

## Publish on Google Play

1. **Create a Play Console developer account** at play.google.com/console. It costs US$25 once and needs identity verification.
2. **Create the app.**
   - Name: Nakshly. Default language: English (India). Type: App. Price: Free.
3. **Store listing.** Copy the text from `store-listing/listing.md` and upload the assets:
   - `icon-512.png`
   - `feature-graphic-1024x500.png`
   - `screenshots/01–06.png`
4. **Required declarations.**
   - Privacy policy URL: `https://nakshly.vercel.app/privacy`.
   - Data safety answers are in `store-listing/listing.md`.
   - Content rating questionnaire: no objectionable content.
   - Ads: none.
5. **Upload the bundle.** Upload `dist/nakshly-1.0.0.aab` to **Testing → Closed testing**.
   - New personal developer accounts must run a closed test with at least 12 testers for 14 days before applying for production.
6. **Accept Play App Signing**, which is the default.
7. **Link the signing key to the site.** Copy the **SHA-256 of the app signing key** from Play Console → Setup → App signing. Add it to Vercel next to the upload key's fingerprint, then redeploy:

   ```bash
   vercel env rm ANDROID_CERT_SHA256 production
   vercel env add ANDROID_CERT_SHA256 production   # paste: <upload SHA-256>,<Play signing SHA-256>
   ```

   Without this step, the Play-installed app shows a browser bar at the top.
8. **Production.** After 14 days of closed testing, apply for production access, then promote the release.

## Moving to your own domain

When `nakshly.in` (or any domain) points at Vercel:

1. Update `NEXT_PUBLIC_SITE_URL` on Vercel and redeploy.
2. Run `node tools/generate.mjs https://nakshly.in` and re-apply the signing block and `targetSdkVersion 36` in `project/app/build.gradle` (the generator overwrites that file).
3. Bump `versionCode`, rebuild and upload.

## The upload key

`signing/nakshly-upload.jks` and `signing/keystore.properties` exist **only on this computer**. Copy both to a password manager or an encrypted drive.

If you lose them, Google can reset the upload key after you contact Play support, but that takes days.

Current upload key SHA-256: `71:8D:62:14:C9:49:E4:3D:18:B4:B7:49:60:AB:63:87:43:C3:31:61:D0:11:AC:8E:6D:83:27:9E:F1:00:D0:0E`
