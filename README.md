# GigPay

## Description
GigPay is a comprehensive React Native mobile application designed to seamlessly connect clients with contractors for on-demand jobs. 

**Background:** 
The modern gig economy requires a reliable, fast, and secure platform to handle on-demand work. GigPay steps in to manage the entire lifecycle of a gig—from job posting and contractor matching, to location tracking and secure payments. 

**Features:**
- **Client Portal:** Post jobs, review contractor profiles, manage active contracts, and handle dispute resolutions.
- **Contractor Portal:** Browse and apply for jobs, manage availability schedules, clock-in/clock-out securely, and track earnings.
- **Secure KYC & Payments:** Integrated with Sumsub Mobile SDK for identity verification and DCBank/Stripe for seamless wallet transactions.
- **Real-Time Location & Maps:** Integrated with `react-native-maps` and Google Maps API for real-time tracking and location-based job matching.
- **Push Notifications:** Powered by Firebase Cloud Messaging (FCM) to keep users instantly updated on job status changes.

## Badges
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![iOS](https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=ios&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)



## Installation

### Requirements
Ensure your development environment meets the following requirements before proceeding:
- **Node.js**: >= 22.11.0
- **Package Manager**: Yarn (preferred) or npm
- **React Native CLI**: 0.85.0
- **iOS Development**: Xcode and CocoaPods (Mac only)
- **Android Development**: Android Studio, Android SDK, and appropriate emulators

### Setup Steps
1. **Clone the repository**
   Download the project from GitLab:
   ```sh
   git clone https://git.octaldevs.com/gigpay/gigpay-app.git
   cd GigPay
   ```

2. **Install dependencies**
   Install all the required JavaScript packages:
   ```sh
   yarn install
   ```

3. **Environment Setup**
   You must set up your local environment variables. Create a `.env` file in the root directory and ensure it contains the following keys:
   - `GOOGLE_MAPS_API_KEY`
   - `ZENDESK_URL`, `ZENDESK_APP_ID`, `ZENDESK_CLIENT_ID`
   - `DEV_API_URL`, `STAGING_API_URL`, `QA_API_URL`, `UAT_API_URL`, `PROD_API_URL`
   - `APPLE_APP_ID`, `GOOGLE_PACKAGE_NAME`

4. **Install iOS Dependencies (Mac Only)**
   Navigate to the iOS folder and install the native CocoaPods:
   ```sh
   cd ios
   bundle install
   bundle exec pod install
   cd ..
   ```

## Usage

To start developing and see the application running, follow these commands:

**1. Start the Metro Bundler**
Always keep the bundler running in a separate terminal:
```sh
yarn start
```

**2. Run the App on Android**
```sh
yarn android
```

**3. Run the App on iOS**
```sh
yarn ios
```

If everything is configured correctly, the app will launch in your emulator/simulator and automatically connect to your defined API endpoints.

## Support
If you encounter any issues while setting up the project or need clarification on business logic:
- Check the integrated **Zendesk** support module (`@shiftsmartinc/react-native-zendesk-support`) used within the app.
- Contact the primary development team at **Octal IT Solution**.

## Roadmap
Future enhancements planned for the GigPay ecosystem:
- [ ] Integration of in-app WebSockets for real-time messaging between clients and contractors.
- [ ] Advanced graphical analytics dashboard for contractor earnings and client spending.
- [ ] Multi-language support and internationalization (i18n).
- [ ] Automated CI/CD pipelines via GitLab CI for automated Test Flight and Play Store deployments.

## Contributing

We are open to internal contributions from the Octal IT Solution team! 

For developers who want to make changes to this project, it's crucial to have your environment correctly configured. Make sure your `.env` file is fully populated (as mentioned in the Installation section) so that API calls and third-party services function properly.

To ensure high code quality and reduce the likelihood that changes inadvertently break something, all contributors must run the linting scripts before pushing. 

**Follow these exact steps to contribute:**
1. **Pull the latest code:** Make sure you are up to date with `git pull origin Development`.
2. **Checkout the Development branch:** `git checkout Development`.
3. **Run Linting:** Validate your code formatting by running:
   ```sh
   yarn lint
   ```
4. **Commit Changes:** Use descriptive, meaningful commit messages.
5. **Push:** Push your code back to the remote server:
   ```sh
   git push origin Development
   ```
6. **Merge Request:** Open a Merge Request on GitLab if requested by the project lead.

## Authors and acknowledgment
This project is developed and maintained by the mobile development team at **Octal IT Solution**. Special thanks to the UI/UX designers, backend API developers, and QA engineers who help bring GigPay to life.

## License
Proprietary & Confidential.
Copyright © Octal IT Solution. All rights reserved. Do not distribute, copy, or modify without explicit permission.

## Project status
**Active** - The GigPay mobile application is currently under active development and continuous maintenance.
# Gipay
