import "@bacons/text-decoder/install";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";

import { TRPCProvider } from "~/utils/api";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import "../styles.css";

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const { colorScheme } = useColorScheme();

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
