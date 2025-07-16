module.exports = {
  name: "City Pulse",
  slug: "city-pulse-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#3B82F6",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.citypulse.app",
    infoPlist: {
      NSFaceIDUsageDescription: "Use Face ID to authenticate and access your account securely.",
      NSLocationWhenInUseUsageDescription: "This app uses location to find events near you.",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#3B82F6",
    },
    package: "com.citypulse.app",
    permissions: ["USE_FINGERPRINT", "USE_BIOMETRIC", "ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro",
  },
  plugins: [
    "expo-local-authentication",
    [
      "expo-localization",
      {
        supportsRTL: true,
      },
    ],
  ],
}
