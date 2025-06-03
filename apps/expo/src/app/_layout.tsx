import "@bacons/text-decoder/install";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";

import { TRPCProvider } from "~/utils/api";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import "../styles.css";
import { useEffect } from "react";

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    // Configure Google Sign-In when the RootLayout component mounts
    GoogleSignin.configure({
      webClientId:
        "209825836871-ackkhc4b720fn1nn1m52fchjjnbbl72s.apps.googleusercontent.com",

      // Optional: If you need a refresh token for long-lived backend sessions,
      // uncomment these lines. This would typically return a `serverAuthCode`.
      // offlineAccess: true,
      // forceCodeForRefreshToken: true,

      // Optional: You can specify scopes here, but 'profile' and 'email' are usually default.
      scopes: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
    });
  }, []);
  return (
    <TRPCProvider>
      {/*
          The Stack component displays the current page.
          It also allows you to configure your screens 
        */}
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: colorScheme == "dark" ? "#09090B" : "#FFFFFF",
          },
        }}
      >
        <Stack.Screen
          name="editor/[id]"
          getId={({ params }) => {
            return params.id;
          }}
          options={{
            headerShown: false, // Example: hide header for this screen
            // title: "Editor",
          }}
        />
      </Stack>

      <StatusBar />
    </TRPCProvider>
  );
}
