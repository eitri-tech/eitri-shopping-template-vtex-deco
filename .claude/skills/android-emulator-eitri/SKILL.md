---
name: android-emulator-eitri
description: Provision an Android emulator (AVD) on macOS and get Eitri Play installed on it, so an Eitri app / shared Deco section can be tested. Use when asked "como abrir o emulador", "criar emulador", "com Play Store", "instalar o Eitri Play", "adb devices vazio", or when `adb devices` lists nothing and you need an Android device before previewing. This is the STEP BEFORE `preview-eitri-section` (which assumes a device already exists and Eitri Play is logged in).
---

# Provision an Android emulator + Eitri Play (macOS / Apple Silicon)

Goal: go from "no Android device" to `adb devices` listing an emulator with **Eitri
Play installed**, ready for `preview-eitri-section`. This repo's E2E docs assume a
device is already there — this skill fills that gap.

## Env (every terminal that runs sdkmanager/avdmanager/emulator/adb)

```sh
export JAVA_HOME=/opt/homebrew/opt/openjdk
export ANDROID_SDK_ROOT=/opt/homebrew/share/android-commandlinetools
export ANDROID_HOME=$ANDROID_SDK_ROOT
export PATH="$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/platform-tools:$PATH"
```

Prereqs (install once): `brew install --cask android-commandlinetools` (sdkmanager/
avdmanager), `brew install openjdk` (emulator/Maestro need Java). `adb` comes with
`platform-tools` below.

## Decide the image: Play Store or not

- **`google_apis`** — no Play Store. Install Eitri Play from an **APK** (`adb install`).
  Fewer moving parts; preferred when you have the APK.
- **`google_apis_playstore`** — has Play Store, so you can install Eitri Play from the
  store (needs a Google login inside the emulator). Use only when you don't have an APK.

**On Apple Silicon always pick the `arm64-v8a` variant.** An x86 image runs under full
emulation and is unusably slow.

## Step 1 — create the AVD

With Play Store:

```sh
sdkmanager "platform-tools" "emulator" "platforms;android-34" \
           "system-images;android-34;google_apis_playstore;arm64-v8a"
yes | sdkmanager --licenses
echo "no" | avdmanager create avd -n mc_play \
  -k "system-images;android-34;google_apis_playstore;arm64-v8a" -d pixel_7 --force
```

Without Play Store: swap `google_apis_playstore` → `google_apis` and name it `mc_test`.
The system image is a ~1.5 GB download — let it finish. If step-create says
`Package path is not valid`, the image didn't finish downloading; rerun `sdkmanager`.

## Step 2 — boot it (detached, so it survives the terminal closing)

```sh
nohup emulator -avd mc_play -no-snapshot-load >/tmp/emu.log 2>&1 &
```

Wait ~30–90 s, then confirm:

```sh
adb devices     # must list  emulator-5554  device
```

Gotchas:
- `FATAL | Running multiple emulators with the same AVD` → one is already running; use
  the existing one, or add `-read-only` to run a second.
- `adb devices` empty after boot → the emulator process died (often the terminal that
  held a foreground `emulator ...` was closed). Reboot with the `nohup` form above.

## Step 3 — install Eitri Play (`tech.eitri.play`)

Ask the user for the APK path — **never download an APK from a random source.**

- Plain `.apk` (universal): `adb install /path/EitriPlay.apk`
- `.xapk`/`.apkm` (a zip of split APKs): unzip, then
  `adb install-multiple base.apk split_config.arm64_v8a.apk ...`

**ABI trap (hit this in practice):** a bundle whose only ABI split is `armeabi_v7a`
(32-bit) will NOT install on an arm64 emulator — `adb` fails with `NO_MATCHING_ABIS`,
and installing just the base gives `MISSING_SPLIT`. You need a build containing
`arm64-v8a` (or a universal APK). A universal APK is usually ~40–80 MB; a single-ABI
split is much smaller. If you only have a v7a build, get an arm64/universal one — do
not try to fabricate the arm64 libs or spin up a slow 32-bit image.

Verify:

```sh
adb shell pm list packages | grep eitri.play   # must return tech.eitri.play
```

For Play Store images instead: open Play Store in the emulator, sign in, search
"Eitri Play", install. (Manual — don't automate the Google login.)

## Done → hand off

Device listed + `tech.eitri.play` installed. Now follow **`preview-eitri-section`**:
`eitri app start -p` → open Eitri Play → log in (manual) → pair the QR → the app/section
renders. Drive it with the Maestro MCP tools (`list_devices` → `inspect_screen` → `run`).
