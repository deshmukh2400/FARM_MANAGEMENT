# 📱 Farm Management Mobile App - Publishing Guide

This guide will walk you through publishing your Farm Management mobile app to both iOS App Store and Google Play Store using Expo Application Services (EAS).

## 🚀 **Publishing Overview**

Your app uses **Expo SDK 49** with modern React Native components. We'll use **EAS Build** and **EAS Submit** for a streamlined publishing process.

## 📋 **Prerequisites**

### **1. Required Accounts**
- ✅ **Expo Account** (free) - [Sign up here](https://expo.dev)
- 📱 **Apple Developer Account** ($99/year) - For iOS App Store
- 🤖 **Google Play Console** ($25 one-time) - For Android Play Store

### **2. Required Tools**
```bash
# Install EAS CLI globally
npm install -g @expo/cli
npm install -g eas-cli

# Login to your Expo account
npx expo login
eas login
```

### **3. Development Environment**
- ✅ Node.js (already installed)
- ✅ Expo CLI (will install)
- ✅ EAS CLI (will install)

## 🔧 **Step 1: Configure App for Production**

### **Update App Configuration**
Your current `app.json` needs some production-ready updates:

```json
{
  "expo": {
    "name": "Farm Manager",
    "slug": "farm-manager",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4CAF50"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.farmmanager",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.farmmanager",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#4CAF50"
      }
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

## 🏗️ **Step 2: Initialize EAS**

### **1. Initialize EAS in your project**
```bash
cd mobile
eas init
```

### **2. Configure EAS Build**
```bash
eas build:configure
```

This creates an `eas.json` file with build configurations.

## 📱 **Step 3: Create App Store Assets**

### **Required Assets for iOS:**
- **App Icon**: 1024×1024px PNG (no alpha channel)
- **Screenshots**: Various iPhone/iPad sizes
- **App Store Icon**: 1024×1024px PNG

### **Required Assets for Android:**
- **App Icon**: 512×512px PNG
- **Feature Graphic**: 1024×500px PNG
- **Screenshots**: Phone and tablet sizes

### **Asset Generation Script**
```bash
# Generate all required app icons
npx expo install expo-app-icon-utils
npx expo-app-icon-utils generate
```

## 🔨 **Step 4: Build Your App**

### **Build for Android (APK/AAB)**
```bash
# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

### **Build for iOS**
```bash
# Build for App Store
eas build --platform ios --profile production

# Build for TestFlight
eas build --platform ios --profile preview
```

### **Build for Both Platforms**
```bash
eas build --platform all --profile production
```

## 📤 **Step 5: Submit to App Stores**

### **Submit to Google Play Store**
```bash
# Upload to Google Play Console
eas submit --platform android
```

### **Submit to iOS App Store**
```bash
# Upload to App Store Connect
eas submit --platform ios
```

## 🛠️ **Step 6: EAS Configuration File**

Create `mobile/eas.json`:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-team-id"
      }
    }
  }
}
```

## 📝 **Step 7: App Store Metadata**

### **App Store Connect (iOS)**
1. **App Information**:
   - Name: "Farm Manager"
   - Subtitle: "Smart Livestock Management"
   - Category: "Productivity" or "Business"

2. **App Description**:
   ```
   Farm Manager is a comprehensive livestock management solution designed for modern farmers. Manage your cattle, goats, and farm operations with ease.

   KEY FEATURES:
   • Animal Registration & Tracking
   • Vaccination & Deworming Schedules
   • Growth Monitoring
   • Inventory Management
   • Marketplace for Trading
   • Weather Integration
   • Financial Tracking
   • Multi-language Support

   Perfect for farmers of all education levels with intuitive design and voice guidance.
   ```

3. **Keywords**: "farm, livestock, cattle, goats, agriculture, farming, animals, veterinary"

### **Google Play Console (Android)**
1. **Store Listing**:
   - Title: "Farm Manager - Livestock Tracker"
   - Short Description: "Complete farm management solution for cattle, goats & livestock"
   - Full Description: (same as iOS with Google Play formatting)

2. **Content Rating**: Everyone
3. **Target Age**: 13+
4. **Category**: "Business" or "Tools"

## 🔐 **Step 8: App Signing & Security**

### **Android App Signing**
```bash
# Generate upload keystore
eas credentials:configure --platform android

# Or use existing keystore
eas credentials:configure --platform android --keystore-path ./your-keystore.jks
```

### **iOS Code Signing**
```bash
# Configure iOS certificates
eas credentials:configure --platform ios
```

## 🧪 **Step 9: Testing Before Release**

### **Internal Testing**
```bash
# Build preview version
eas build --platform all --profile preview

# Share with testers via Expo Go or standalone builds
```

### **TestFlight (iOS)**
- Automatically available after EAS submit
- Add beta testers via App Store Connect

### **Google Play Internal Testing**
- Upload AAB to Play Console
- Create internal testing track
- Add tester email addresses

## 📊 **Step 10: Release Management**

### **Version Management**
```bash
# Update version in app.json
{
  "version": "1.0.1",
  "ios": { "buildNumber": "2" },
  "android": { "versionCode": 2 }
}

# Build and submit update
eas build --platform all --profile production
eas submit --platform all
```

### **Release Tracks**
- **Android**: Internal → Closed → Open → Production
- **iOS**: TestFlight → App Store Review → Release

## 🚨 **Common Issues & Solutions**

### **Build Failures**
```bash
# Clear cache and retry
eas build --platform android --clear-cache

# Check build logs
eas build:list
eas build:view [build-id]
```

### **Asset Issues**
- Ensure all icons are PNG format (no SVG for app stores)
- App icons must not have transparency
- Follow platform-specific size requirements

### **Permission Issues**
- Review all permissions in app.json
- Provide clear usage descriptions
- Remove unused permissions

## 📈 **Step 11: Post-Launch**

### **Analytics Setup**
```bash
# Add analytics
npx expo install expo-analytics-amplitude
# or
npx expo install @react-native-firebase/analytics
```

### **Crash Reporting**
```bash
# Add Sentry for error tracking
npx expo install @sentry/react-native
```

### **App Updates**
```bash
# Over-the-air updates with EAS Update
npx expo install expo-updates
eas update --branch production
```

## 💰 **Cost Breakdown**

| Service | Cost | Purpose |
|---------|------|---------|
| Apple Developer Program | $99/year | iOS App Store |
| Google Play Console | $25 one-time | Android Play Store |
| Expo EAS Build | Free tier available | Building apps |
| EAS Submit | Free | App store submission |

## 📞 **Support & Resources**

- **Expo Documentation**: https://docs.expo.dev/
- **EAS Build Guide**: https://docs.expo.dev/build/introduction/
- **App Store Guidelines**: https://developer.apple.com/app-store/guidelines/
- **Google Play Policies**: https://play.google.com/about/developer-content-policy/

## ✅ **Quick Checklist**

- [ ] App tested thoroughly on both platforms
- [ ] All required assets created (icons, screenshots)
- [ ] App store accounts set up
- [ ] EAS CLI installed and configured
- [ ] App metadata prepared
- [ ] Privacy policy and terms of service ready
- [ ] App signing certificates configured
- [ ] Build and submit commands ready

---

**Ready to publish?** Follow the steps above, and your Farm Management app will be live on both app stores! 🚀

For any issues during the publishing process, refer to the official Expo documentation or reach out to the Expo community forums. 