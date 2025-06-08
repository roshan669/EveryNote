import Constants from "expo-constants";
import { Platform } from "react-native"; // Import Platform

export const getBaseUrl = () => {
  console.log("Using EXPO_PUBLIC_API_URL:", "http://192.168.244.132:3000"); // <-- ADD THIS LINE
  return "http://192.168.244.132:3000";

  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];

  if (!localhost) {
    throw new Error(
      "Failed to get localhost. Please set EXPO_PUBLIC_API_URL environment variable " +
        "or point to your production server.",
    );
  }

  if (Platform.OS === "android" && localhost === "127.0.0.1") {
    console.log("Using Android emulator fallback:", `http://10.0.2.2:3000`); // <-- ADD THIS LINE
    return `http://10.0.2.2:3000`;
  }

  console.log(
    "Using Constants.expoConfig fallback:",
    `http://${localhost}:3000`,
  ); // <-- ADD THIS LINE
  return `http://${localhost}:3000`;
};
