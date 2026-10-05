# React Native CI/CD Documentation
## GitHub Actions & Firebase App Distribution (Android & iOS)

**Project:** GigPay  
**Organization:** Octal IT Solution LLP  
**Technology:** React Native (v0.85.0), TypeScript, CocoaPods, Gradle, Firebase App Distribution  

---

## 1. Overview & Architecture

This repository uses automated Continuous Integration and Continuous Deployment (CI/CD) pipelines powered by **GitHub Actions** to compile, package, sign, and distribute builds to **Firebase App Distribution** and **GitHub Artifacts**.

The pipelines are split into two independent workflows:
1. **Android Workflow**: [`.github/workflows/firebase.yml`](.github/workflows/firebase.yml) — Builds Release APKs on Ubuntu runners.
2. **iOS Workflow**: [`.github/workflows/ios.yml`](.github/workflows/ios.yml) — Builds Release/Debug IPAs on macOS runners with Xcode 16.

```
                    GitHub Repository (main branch)
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       Android CI/CD Pipeline           iOS CI/CD Pipeline
      (.github/workflows/firebase.yml) (.github/workflows/ios.yml)
                 │                               │
        [ubuntu-latest runner]            [macos-14 runner]
                 │                               │
       - JDK 17 (Temurin)              - Xcode 16 (iOS 18 SDK)
       - Node 20 & Yarn                - Node 20 & Yarn
       - Base64 Keystore Decode        - Ruby 3.3 & CocoaPods
       - Gradle assembleRelease        - Base64 .p12 & Profile Decode
                 │                     - xcodebuild archive & export
                 │                               │
                 ▼                               ▼
          app-release.apk                   GigPay.ipa
                 │                               │
                 └───────────────┬───────────────┘
                                 │
                                 ▼
                     Firebase App Distribution
                           (Group: "test")
```

---

## 2. GitHub Secrets Reference (All Keys)

Configure these secrets in GitHub:  
**Repository Settings → Secrets and variables → Actions → Repository secrets**

### Shared & Firebase Secrets

| Secret Name | Description | Example / Format |
|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Google Cloud Service Account JSON with Firebase App Distribution Admin role. Can be raw JSON or Base64. | `{"type": "service_account", ...}` |
| `FIREBASE_TOKEN` | *(Optional Alternative)* Firebase CLI login CI token obtained via `firebase login:ci`. | `1//0g...` |
| `ENV_FILE` | *(Optional)* Full content of the production `.env` file. If omitted, default CI `.env` is created. | `KEY=value\n...` |

### Android Secrets

| Secret Name | Description | How It Is Used |
|---|---|---|
| `KEYSTORE_BASE64` | Base64-encoded `gigpay-release-key.keystore` file. | Decoded into `android/app/gigpay-release-key.keystore` |
| `KEYSTORE_PASSWORD` | Password for the Android release keystore. | Injected into `android/key.properties` and Gradle env |
| `KEY_ALIAS` | Alias name of the signing key inside the keystore. | Injected into `android/key.properties` and Gradle env |
| `KEY_PASSWORD` | Password for the specific key alias. | Injected into `android/key.properties` and Gradle env |
| `FIREBASE_APP_ID` | Android Firebase Application ID. | `1:638019750272:android:6be399ec614b8a2bb1965` |

### iOS Secrets

| Secret Name | Description | How It Is Used |
|---|---|---|
| `IOS_BUILD_CERTIFICATE_BASE64` | Base64-encoded Apple Certificate (`.p12` file). Supports both plain and gzipped Base64. | Decoded and imported into a temporary runner keychain |
| `IOS_KEYCHAIN_SECRET` / `IOS_P12_PASSWORD` | Password set when exporting the `.p12` certificate from Mac Keychain Access. | Used to decrypt and import the `.p12` certificate |
| `IOS_PROVISION_PROFILE_BASE64` | Base64-encoded Apple Provisioning Profile (`.mobileprovision`). Gzip-compressed to bypass GitHub 48KB limit. | Decoded to `~/Library/MobileDevice/Provisioning Profiles/` |
| `FIREBASE_IOS_APP_ID` | Firebase iOS App ID. *(Workflow also auto-extracts directly from `GoogleService-Info.plist`)* | `1:638019750272:ios:455b523796f0fd35fb1965` |
| `IOS_KEYCHAIN_PASSWORD` | *(Optional)* Temporary password for runner keychain. | Script defaults to `gigpay_temporary_keychain_pass_123` |

---

## 3. How to Generate & Export Each Key

### 3.1 Android Keystore (Base64)
Run in Terminal on your computer where the `.keystore` file is located:
```bash
# Encode keystore to Base64 and copy directly to clipboard
base64 -i android/app/gigpay-release-key.keystore | pbcopy
```
Paste this into the GitHub Secret **`KEYSTORE_BASE64`**.

---

### 3.2 iOS Certificate (`.p12` Base64)
1. Open **Keychain Access** on your Mac.
2. Select **login** keychain → **My Certificates**.
3. Locate your **Apple Development** or **Apple Distribution** certificate.
4. Right-click → **Export "..."** → Select file format **Personal Information Exchange (.p12)**.
5. Save as `Certificate.p12` and provide a password.
6. The password you entered becomes **`IOS_KEYCHAIN_SECRET`** (or `IOS_P12_PASSWORD`).
7. Convert to Base64 and copy to clipboard:
   ```bash
   base64 -i Certificate.p12 | pbcopy
   ```
8. Paste into GitHub Secret **`IOS_BUILD_CERTIFICATE_BASE64`**.

---

### 3.3 iOS Provisioning Profile (Gzip Base64)
> [!NOTE]  
> GitHub Actions enforces a strict **48 KB limit** on repository secrets. Provisioning profiles containing many test devices exceed 50 KB uncompressed. We compress with `gzip` before encoding (reducing size from 51 KB to 22 KB).

1. Download your profile (`.mobileprovision`) from [Apple Developer Portal - Profiles](https://developer.apple.com/account/resources/profiles/list) or grab your Xcode profile.
2. Compress and Base64 encode in one command:
   ```bash
   gzip -c "YourProfile.mobileprovision" | base64 | tr -d '\n' | pbcopy
   ```
3. Paste into GitHub Secret **`IOS_PROVISION_PROFILE_BASE64`**.

---

### 3.4 Firebase Service Account
1. Open the [Google Cloud Console](https://console.cloud.google.com/) for project `gigpay-5dc4c`.
2. Go to **IAM & Admin → Service Accounts**.
3. Create or select a service account and assign the role: **Firebase App Distribution Admin**.
4. Go to the **Keys** tab → **Add Key → Create new key → JSON**.
5. Download the file, copy the raw JSON text (or `base64 -i file.json | pbcopy`), and paste into GitHub Secret **`FIREBASE_SERVICE_ACCOUNT`**.

---

## 4. Android Pipeline Details (`firebase.yml`)

### Steps Executed:
1. **Checkout Code**: Checks out the branch using `actions/checkout@v4`.
2. **Setup JDK 17**: Installs Eclipse Temurin JDK 17 with Gradle dependency cache.
3. **Setup Node 20 & Yarn**: Configures Node.js 20 and runs `yarn install --ignore-engines` (executes `patch-package`).
4. **Setup Environment**: Injects production `.env` with fallback API keys for CI builds.
5. **Firebase CLI & Auth**: Installs `firebase-tools` and decodes the service account to `$HOME/firebase-service-account.json`.
6. **Keystore Decoding**: Node.js script safely parses `KEYSTORE_BASE64` into `android/app/gigpay-release-key.keystore` and creates `android/key.properties`.
7. **Build APK**: Runs `./gradlew assembleRelease --stacktrace` in `android/`.
8. **Save Artifact**: Stores the APK in GitHub Actions artifacts for 7 days.
9. **Firebase App Distribution**: Uploads the APK to Firebase group `"test"`.

### Trigger:
- Triggered manually via `workflow_dispatch` or on push to `main` (when uncommented).

---

## 5. iOS Pipeline Details (`ios.yml`)

### Steps Executed:
1. **Checkout Code**: Checks out the branch using `actions/checkout@v4`.
2. **Select Xcode**: Selects Xcode 16.0+ on `macos-14` runner (Apple Silicon M1).
3. **Setup Node 20 & Ruby 3.3**: Installs dependencies via `yarn install --ignore-engines` and caches Bundler gems.
4. **Setup Environment Variables**: Creates `.env` and executes `update_xcode.rb` to link `.env` into `GigPay.xcodeproj` bundle resources.
5. **Install CocoaPods**: Runs `pod install` with SumSubstance spec repos and CocoaPods directory caching.
6. **Certificate & Profile Installation**:
   - Decodes certificate and imports into an isolated runner keychain (`security import`).
   - Sets key partition list to allow non-interactive codesigning (`security set-key-partition-list`).
   - Decompresses and installs the provisioning profile to `~/Library/MobileDevice/Provisioning Profiles/`.
   - Uses PlistBuddy to extract UUID, Team ID (`W8NLTEFLJ2`), and Bundle ID (`com.octal.james.gigPay`).
   - Automatically detects whether the profile is **Development** (`debugging`), **Ad Hoc** (`release-testing`), or **App Store** (`app-store-connect`).
7. **CocoaPods Target Safeguard**:
   - Uses a Ruby script to set `CODE_SIGNING_ALLOWED=NO` on `Pods.xcodeproj` targets so third-party frameworks don't fail with *"Target does not support provisioning profiles"*.
8. **Build Archive**:
   - Executes `xcodebuild archive` to build `GigPay.xcarchive`.
   - Handles Xcode-managed profiles (`Automatic` signing) and manual profiles seamlessly.
9. **Export IPA**:
   - Generates `ExportOptions.plist` using Node.js with the resolved signing style and method.
   - Executes `xcodebuild -exportArchive` to produce `GigPay.ipa`.
10. **Save Artifact**: Stores `GigPay.ipa` in GitHub Actions artifacts for 7 days.
11. **Firebase App Distribution**:
    - Automatically resolves `GOOGLE_APP_ID` from `GoogleService-Info.plist` (`1:638019750272:ios:455b523796f0fd35fb1965`).
    - Distributes to group `"test"` using the service account credentials.
12. **Cleanup**: Deletes temporary keychain and profiles in an `always()` post-step.

---

## 6. How to Run the Workflows Manually

1. Go to your repository on GitHub: `https://github.com/prakhargupta-eng/Gipay`
2. Click the **Actions** tab at the top.
3. In the left sidebar, choose:
   - **Build & Distribute iOS** to run the iOS workflow.
   - **Build & Upload to Firebase** to run the Android workflow.
4. Click **Run workflow** → Select branch `main` → Click the green **Run workflow** button.
5. Once complete:
   - Download the generated `.apk` or `.ipa` under **Artifacts** at the bottom of the run summary.
   - Testers in group `"test"` will receive the new build in Firebase App Distribution immediately.

---

## 7. Troubleshooting & Best Practices

| Issue | Cause | Fix |
|---|---|---|
| `Value is too large` in GitHub Secrets | Secret exceeds GitHub's 48 KB limit | Use `gzip -c file.mobileprovision \| base64` as documented in Section 3.3. |
| `Provisioning profile is Xcode managed, but signing settings require manual` | Manual signing was forced on an automatic profile | The workflow auto-detects `IsXcodeManaged` and switches to Automatic signing. |
| `expected one (app-store-connect, release-testing...) but found undefined` | Missing environment variable export | Fixed in workflow; all variables are exported to `process.env`. |
| `Invalid Firebase app ID` | Wrong ID or spaces in secret | Workflow automatically reads the valid ID directly from `GoogleService-Info.plist`. |
| CocoaPods framework signing error | Pods frameworks cannot have provisioning profiles | Workflow disables code signing on Pods framework targets automatically. |

---

*Document prepared for Octal IT Solution LLP — GigPay Project.*
