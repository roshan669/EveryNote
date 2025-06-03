import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Every Note",
  slug: "every-note",
  scheme: "expo",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/icon.png",
    resizeMode: "contain",
    backgroundColor: "#1F104A"
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "your.bundle.identifier",
    supportsTablet: true,
  },
  android: {
    package: "your.bundle.identifier",
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#1F104A",
    },
  },
  "extra": {
    "eas": {
      "projectId": "d93302e5-84ce-41ea-923d-8bc2ecfc4578"
    }
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: [
    [
      "@react-native-google-signin/google-signin",
      {
        "android": {
          "webClientId": "209825836871-ackkhc4b720fn1nn1m52fchjjnbbl72s.apps.googleusercontent.com"
        }
      }
    ],
    "expo-router", "expo-secure-store"],
});
