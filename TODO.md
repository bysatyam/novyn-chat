# Novyn Chat → Polished Android App
Capacitor Hybrid App Migration (PWA → Native Android)

## [✅] 1. Install Dependencies ✓
Capacitor plugins installed (core@8.3.0, cli@7.6.1).


## [✅] 2. Migrate Config ✓
capacitor.config.ts created (local server, push/camera/keyboard config).

## [✅] 3. Update package.json ✓
Capacitor scripts added.


## [ ] 3. Update package.json
- Scripts: cap sync, cap open android, cap build android.

## [✅] 4. Add Platform ✓
Android platform added! (`android/` folder ready).

## [ ] 5. Update public/index.html
- Capacitor JS import.
- Permissions meta.
- Theme-color consistency.

## [ ] 6. Refactor public/app.js (Major)
- Platform detection.
- Native Camera (replace getUserMedia).
- Filesystem for uploads.
- Keyboard resize.
- Haptics (taps, long-press).
- Network status.
- **PushNotifications**: register, listeners, token to backend.

## [ ] 7. Android Configs (Post-sync)
- Icons: Adaptive launcher icons.
- Permissions in build.gradle/AndroidManifest.xml.
- FCM: google-services.json in android/app.

## [ ] 8. Test & Build
```bash
npx cap open android
# In Android Studio: Test plugins, Build APK
```
- Test: Live reload (`npx cap run android`).
- Release: Sign APK (`./gradlew assembleRelease`).

## [ ] 9. Polish (Post-Build)
- Offline handling.
- Native notifications via FCM.
- App signing / Play Store prep.

**Next: Dependencies → Config → Platform**

