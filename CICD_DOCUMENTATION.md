# React Native CI/CD Documentation
## GitHub Actions & Firebase App Distribution (Android & iOS)

**Project:** GigPay  
**Organization:** Octal IT Solution LLP  
**Technology Stack:** React Native (v0.85.0), TypeScript, CocoaPods, Gradle, Firebase App Distribution  

---

## 1. Architecture & Workflow Overview

This repository uses automated Continuous Integration and Continuous Deployment (CI/CD) pipelines powered by **GitHub Actions** to build, sign, and distribute releases to **Firebase App Distribution** and **GitHub Artifacts**.

The pipelines are divided into two standalone, isolated workflows:
1. **Android CI/CD**: [`.github/workflows/firebase.yml`](.github/workflows/firebase.yml) — Builds Release APKs on `ubuntu-latest`.
2. **iOS CI/CD**: [`.github/workflows/ios.yml`](.github/workflows/ios.yml) — Builds Release/Debug IPAs on `macos-14` (Apple Silicon M1) with Xcode 16.

```
                              GitHub Repository
                       (main branch / workflow_dispatch)
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
        Android CI/CD Workflow                 iOS CI/CD Workflow
   (.github/workflows/firebase.yml)       (.github/workflows/ios.yml)
                   │                                     │
           [ubuntu-latest]                         [macos-14]
                   │                                     │
       - JDK 17 (Temurin)                     - Xcode 16.0+ (iOS 18 SDK)
       - Node 20 & Yarn                       - Node 20 & Yarn
       - Decodes Keystore                     - Ruby 3.3 & CocoaPods
       - Gradle assembleRelease               - Decodes .p12 & .mobileprovision
                   │                          - update_xcode.rb (Injects .env)
                   │                          - xcodebuild archive & exportArchive
                   ▼                                     ▼
            app-release.apk                          GigPay.ipa
                   │                                     │
                   └──────────────────┬──────────────────┘
                                      │
                                      ▼
                          Firebase App Distribution
                           (Testers Group: "test")
```

---

## 2. GitHub Repository Secrets Reference

Configure these keys in GitHub:  
**Repository Settings → Secrets and variables → Actions → Repository secrets**

Below is the verified list of secrets configured for this project:

| Secret Name | Platform | Description | Example / Format |
|---|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Shared | Google Cloud Service Account JSON for `gigpay-5dc4c` with *Firebase App Distribution Admin* role. | `{"type": "service_account", ...}` |
| `FIREBASE_TOKEN` | Shared | *(Alternative)* Firebase CLI login token. | `1//0g...` |
| `KEYSTORE_BASE64` | Android | Base64-encoded `gigpay-release-key.keystore` file. | String |
| `KEYSTORE_PASSWORD` | Android | Password for the release keystore. | `YourPassword` |
| `KEY_ALIAS` | Android | Alias name for the signing key. | `gigpay-key` |
| `KEY_PASSWORD` | Android | Password for the key alias. | `YourPassword` |
| `FIREBASE_APP_ID` | Android | Android Firebase Application ID. | `1:638019750272:android:6be399ec614b8a2bb1965` |
| `IOS_BUILD_CERTIFICATE_BASE64` | iOS | Base64-encoded Apple Certificate (`.p12`). | String |
| `IOS_KEYCHAIN_SECRET` | iOS | Password set when exporting the `.p12` certificate. | `YourPassword` |
| `IOS_PROVISION_PROFILE_BASE64` | iOS | Gzip-compressed Base64 string of `.mobileprovision`. | String (~22 KB) |
| `FIREBASE_IOS_APP_ID` | iOS | iOS Firebase App ID. *(Workflow also auto-extracts from `GoogleService-Info.plist`)* | `1:638019750272:ios:455b523796f0fd35fb1965` |
| `ENV_FILE` | Shared | *(Optional)* Full content of `.env`. Workflow includes default fallback. | `KEY=value\n...` |

---

## 3. How to Generate Keys & Base64 (macOS & Windows)

### 3.1 Android Keystore (`KEYSTORE_BASE64`)

#### On macOS (Terminal):
```bash
# Navigate to project root and copy Base64 directly to clipboard
base64 -i android/app/gigpay-release-key.keystore | pbcopy
```

#### On Windows (PowerShell):
```powershell
# Copy Base64 string directly to Windows clipboard
[Convert]::ToBase64String([IO.File]::ReadAllBytes("android\app\gigpay-release-key.keystore")) | Set-Clipboard
```

> **Action:** Paste clipboard into GitHub Secret **`KEYSTORE_BASE64`**.

---

### 3.2 iOS Certificate (`IOS_BUILD_CERTIFICATE_BASE64` & `IOS_KEYCHAIN_SECRET`)

1. Open **Keychain Access** on your Mac.
2. Select **login** keychain → **My Certificates**.
3. Right-click your **Apple Distribution** (or Apple Development) certificate → select **Export "..."**.
4. Choose format: **Personal Information Exchange (.p12)** and save as `Certificate.p12`.
5. Enter a password. This password is your **`IOS_KEYCHAIN_SECRET`**.

#### Convert `.p12` to Base64:

* **On macOS (Terminal):**
  ```bash
  base64 -i Certificate.p12 | pbcopy
  ```
* **On Windows (PowerShell):**
  ```powershell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("Certificate.p12")) | Set-Clipboard
  ```

> **Action:** Paste clipboard into GitHub Secret **`IOS_BUILD_CERTIFICATE_BASE64`**.

---

### 3.3 iOS Provisioning Profile (`IOS_PROVISION_PROFILE_BASE64`)

> [!IMPORTANT]  
> **GitHub Secrets has a strict 48 KB size limit!**  
> Provisioning profiles with registered test devices often exceed 50 KB uncompressed. We compress with **`gzip`** before Base64 encoding. This shrinks the profile from 51 KB to 22 KB. The workflow automatically decompresses it in CI.

1. Download your Provisioning Profile (`.mobileprovision`) from [Apple Developer Portal - Profiles](https://developer.apple.com/account/resources/profiles/list).

#### On macOS (Terminal):
```bash
gzip -c "YourProfile.mobileprovision" | base64 | tr -d '\n' | pbcopy
```

#### On Windows (PowerShell):
```powershell
$bytes = [IO.File]::ReadAllBytes("YourProfile.mobileprovision")
$ms = New-Object IO.MemoryStream
$gz = New-Object IO.Compression.GZipStream($ms, [IO.Compression.CompressionMode]::Compress)
$gz.Write($bytes, 0, $bytes.Length)
$gz.Close()
[Convert]::ToBase64String($ms.ToArray()) | Set-Clipboard
```

> **Action:** Paste clipboard into GitHub Secret **`IOS_PROVISION_PROFILE_BASE64`**.

---

### 3.4 Firebase Service Account (`FIREBASE_SERVICE_ACCOUNT`)

1. Open [Google Cloud Console](https://console.cloud.google.com/) for project `gigpay-5dc4c`.
2. Navigate to **IAM & Admin → Service Accounts**.
3. Create a Service Account (or select existing) and assign the role:  
   **Firebase App Distribution Admin**
4. Click **Keys → Add Key → Create new key → JSON**.
5. Download the `.json` key file.

#### Copy JSON / Base64:
* **On macOS (Terminal):**
  ```bash
  cat service-account.json | pbcopy
  ```
* **On Windows (PowerShell):**
  ```powershell
  Get-Content "service-account.json" -Raw | Set-Clipboard
  ```

> **Action:** Paste clipboard into GitHub Secret **`FIREBASE_SERVICE_ACCOUNT`**.

---

## 4. Android CI/CD Step-by-Step Flow

Workflow File: [`.github/workflows/firebase.yml`](.github/workflows/firebase.yml)

### Execution Flow:
1. **Runner Initialization**: Spawns an `ubuntu-latest` VM.
2. **Checkout**: Clones the repository using `actions/checkout@v4`.
3. **Setup JDK 17**: Configures Eclipse Temurin JDK 17 with Gradle build cache.
4. **Setup Node 20 & Dependencies**:
   - Sets up Node.js 20 with Yarn cache.
   - Runs `yarn install --ignore-engines`.
   - Triggers `postinstall` which applies `patch-package` patches.
5. **Setup Environment**: Injects `.env` with production keys.
6. **Setup Firebase CLI & Credentials**:
   - Installs `firebase-tools` globally.
   - Decodes `FIREBASE_SERVICE_ACCOUNT` to `$HOME/firebase-service-account.json`.
7. **Keystore Decoding & Configuration**:
   - Node.js script decodes `KEYSTORE_BASE64` into `android/app/gigpay-release-key.keystore`.
   - Writes `android/key.properties` with keystore password and alias.
   - Validates keystore integrity via `keytool -list`.
8. **Build APK**:
   - Runs `./gradlew clean` and `./gradlew assembleRelease --stacktrace` inside `android/`.
9. **Upload APK Artifact**:
   - Uploads `app-release.apk` to GitHub Actions Run Artifacts (available for download 7 days).
10. **Upload to Firebase App Distribution**:
    - Dispatches APK to Firebase App Distribution with group `"test"`.

---

## 5. iOS CI/CD Step-by-Step Flow

Workflow File: [`.github/workflows/ios.yml`](.github/workflows/ios.yml)

### Execution Flow:
1. **Runner Initialization**: Spawns a `macos-14` (Apple Silicon M1) runner.
2. **Checkout**: Clones the repository using `actions/checkout@v4`.
3. **Select Xcode**: Automatically selects Xcode 16.0+ (iOS 18 SDK).
4. **Setup Node 20 & Ruby 3.3**:
   - Configures Node 20 with Yarn cache and runs `yarn install --ignore-engines`.
   - Sets up Ruby 3.3 with Bundler gem cache (`bundler-cache: true`).
5. **Environment Configuration & Objective-C Headers**:
   - Injects `.env` containing all API URLs (`QA_API_URL`, `STAGING_API_URL`, `DEV_API_URL`, etc.) and RSA keys.
   - Runs `update_xcode.rb` which:
     - Adds `.env` to Xcode `Copy Bundle Resources`.
     - Copies `.env` to `ios/.env`.
     - Pre-generates `node_modules/react-native-config/ios/ReactNativeConfig/GeneratedDotEnv.m` so all environment variables are compiled directly into the binary.
6. **CocoaPods Installation**:
   - Caches `ios/Pods`.
   - Executes `pod install` with SumSubstance spec repository.
7. **Apple Certificates & Provisioning Profile Installation**:
   - Decodes `IOS_BUILD_CERTIFICATE_BASE64` and imports into a temporary keychain (`security import`).
   - Sets keychain partition list (`security set-key-partition-list`) for non-interactive signing.
   - Decompresses `IOS_PROVISION_PROFILE_BASE64` and installs to `~/Library/MobileDevice/Provisioning Profiles/`.
   - Uses `PlistBuddy` to extract UUID, Team ID (`W8NLTEFLJ2`), and Bundle ID (`com.octal.james.gigPay`).
   - Automatically detects whether the profile is:
     - **Development** (`debugging`)
     - **Ad Hoc** (`release-testing`)
     - **App Store** (`app-store-connect`)
   - Checks if profile is Xcode-managed (`IsXcodeManaged`).
8. **CocoaPods Target Safeguard**:
   - Disables code signing on `Pods.xcodeproj` targets (`CODE_SIGNING_ALLOWED=NO`) to prevent framework conflicts.
9. **Build Archive (`xcodebuild archive`)**:
   - Compiles and bundles React Native JavaScript bundle and native code into `GigPay.xcarchive`.
   - Uses Automatic signing for Xcode-managed profiles and Manual signing for developer portal profiles.
10. **Export IPA (`xcodebuild -exportArchive`)**:
    - Generates `ExportOptions.plist` using Node.js with the resolved method and team ID.
    - Exports signed `GigPay.ipa`.
11. **Upload IPA Artifact**:
    - Stores `GigPay.ipa` in GitHub Actions Artifacts (downloadable for 7 days).
12. **Upload to Firebase App Distribution**:
    - Automatically resolves `GOOGLE_APP_ID` from `ios/GoogleService-Info.plist` (`1:638019750272:ios:455b523796f0fd35fb1965`).
    - Distributes IPA to Firebase testers group `"test"`.
13. **Cleanup**:
    - Post-build `always()` hook deletes the temporary keychain and provisioning profiles.

---

## 6. How to Trigger Builds

### Trigger Automatically:
* When `push` triggers are active, pushing commits to branch `main` automatically runs the pipeline.

### Trigger Manually (via GitHub UI):
1. Go to **`https://github.com/prakhargupta-eng/Gipay`**
2. Click **Actions** at the top.
3. Select **Build & Distribute iOS** or **Build & Upload to Firebase** in the left sidebar.
4. Click **Run workflow** → Select branch `main` → Click **Run workflow**.

---

## 7. Troubleshooting Guide

| Issue | Cause | Solution |
|---|---|---|
| `Value is too large` on GitHub Secrets | Secret exceeds 48 KB limit | Use gzip compression before Base64 encoding (see Section 3.3). |
| `Provisioning profile is Xcode managed, but signing settings require manual` | Profile was created by Xcode GUI | Workflow automatically detects `IsXcodeManaged` and switches to project signing. |
| `expected one (app-store-connect, release-testing...) but found undefined` | Missing shell environment variable export | Handled in workflow; all variables are exported to `process.env`. |
| `Invalid Firebase app ID` | Typo, extra spaces, or passing bundle ID instead of numeric app ID | Workflow auto-extracts `GOOGLE_APP_ID` from `GoogleService-Info.plist`. |
| API calls return `undefined` on iOS | Missing variables in CI `.env` | Workflow generates complete `.env` and pre-generates `GeneratedDotEnv.m`. |
| CocoaPods framework signing error | Third-party Pods cannot use provisioning profiles | Handled automatically by disabling signing on `Pods.xcodeproj`. |

---

*Document maintained for Octal IT Solution LLP — GigPay Project.*
