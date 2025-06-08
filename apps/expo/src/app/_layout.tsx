// apps/expo/app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useState, useEffect } from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";

import { api, TRPCProvider } from "~/utils/api"; // Your tRPC client

import "../styles.css"; // Your Tailwind CSS
import { colors } from "~/utils/themes"; // Your color palette

import { PowerSyncContext } from "@powersync/react-native"; // PowerSync Context
import { powersync, setupPowerSync } from "~/utils/powersync/System"; // PowerSync instance and setup function

/**
 * PowerSyncAuthWrapper:
 * Manages the PowerSync client connection based on user authentication status.
 * It ensures PowerSync is initialized and connected only when a user session exists.
 */
function PowerSyncAuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, isLoading: isSessionLoading } =
    api.auth.getSession.useQuery();
  const [isPowerSyncReady, setIsPowerSyncReady] = useState(false);
  const [powerSyncError, setPowerSyncError] = useState<string | null>(null);

  useEffect(() => {
    let cleanupPromise: Promise<void> | null = null;

    const initializePowerSync = () => {
      try {
        if (!isPowerSyncReady) {
          setupPowerSync();
          setIsPowerSyncReady(true);
          setPowerSyncError(null);
          console.log("PowerSync client setup and connected.");
        }
      } catch (err) {
        const errorObj = err as { message?: string };
        console.error("Failed to setup PowerSync:", err);
        setPowerSyncError(
          `Failed to initialize PowerSync: ${errorObj.message ?? String(err)}`,
        );
        setIsPowerSyncReady(false);
      }
    };

    if (!isSessionLoading) {
      if (session) {
        // Mark as void to satisfy lint rule
        void initializePowerSync();
      } else {
        if (isPowerSyncReady) {
          cleanupPromise = powersync.disconnect();
          setIsPowerSyncReady(false);
          console.log("PowerSync client disconnected due to no session.");
        }
      }
    }

    return () => {
      if (cleanupPromise) {
        void cleanupPromise
          .then(() => console.log("PowerSync cleanup complete"))
          .catch((err) =>
            console.error("PowerSync cleanup error during unmount:", err),
          );
      }
    };
  }, [session, isSessionLoading, isPowerSyncReady]);

  if (powerSyncError) {
    return (
      <View style={layoutStyles.centeredContainer}>
        <Text style={layoutStyles.errorText}>Error: {powerSyncError}</Text>
        <Text style={layoutStyles.errorHint}>
          Please check your network and PowerSync configuration.
        </Text>
      </View>
    );
  }

  if (isSessionLoading || !isPowerSyncReady) {
    return (
      <View style={layoutStyles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.mutedForeground} />
        <Text style={layoutStyles.loadingText}>
          {isSessionLoading
            ? "Authenticating via tRPC..."
            : "Initializing offline sync..."}
        </Text>
      </View>
    );
  }

  return (
    <PowerSyncContext.Provider value={powersync}>
      {children}
    </PowerSyncContext.Provider>
  );
}

/**
 * RootLayout:
 * This is the main layout of the app, wrapping your pages with necessary providers.
 */
export default function RootLayout() {
  // <--- THIS LINE IS CRUCIAL
  const { colorScheme } = useColorScheme();

  return (
    <TRPCProvider>
      <PowerSyncAuthWrapper>
        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor: colorScheme == "dark" ? "#09090B" : "#FFFFFF",
            },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="editor/todo" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/sign-in"
            options={{ headerShown: false, presentation: "modal" }}
          />
        </Stack>
      </PowerSyncAuthWrapper>
      <StatusBar />
    </TRPCProvider>
  );
}

const layoutStyles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.mutedForeground,
    marginTop: 10,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  errorHint: {
    color: colors.mutedForeground,
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
