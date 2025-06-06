import type { ImageSourcePropType } from "react-native";
import { Image, Text, View, StyleSheet, ActivityIndicator } from "react-native"; // Import ActivityIndicator
import homepageImage from "../../assets/homepage.png";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useSession } from "~/utils/auth";
import { colors, screenWidth } from "../utils/themes";
import MobileAuth from "../components/MobileAuth";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { setToken } from "~/utils/session-store";

export default function Index() {
  // Use more descriptive names directly from the hook for clarity
  const { data, isPending } = useSession();
  const session = data?.session; // session data, if authenticated
  const router = useRouter();

  // useEffect for handling redirection after session state is determined
  useEffect(() => {
    // Only proceed once the session loading is complete
    if (!isPending) {
      if (session) {
        // User is authenticated
        setToken(session.token);
        console.log("User is authenticated! Session data:", session);
        router.replace("/editor/todo"); // Redirect to the authenticated part of the app
      } else {
        // User is not authenticated, remain on the login screen
        console.log("User is not authenticated. Displaying login screen.");
        // If your actual login screen was a *separate* route, you'd do:
        // router.replace('/login');
      }
    }
  }, [session, isPending, router]); // Dependencies: re-run when session or loading state changes

  if (isPending) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={colors.mutedForeground} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.mainContainer} className="bg-background">
        <Text style={styles.everyNoteTitle} className="text-foreground">
          EveryNote
        </Text>

        <Text style={styles.taglineText}>
          Capture your thoughts, your way.{"\n"}Text, voice, or media—EveryNote
          makes it effortless to record your day and reflect with AI-powered
          clarity.
        </Text>

        <View style={styles.imageContainer}>
          <Image
            source={homepageImage as ImageSourcePropType}
            style={styles.homepageImage}
          />
        </View>

        <View style={styles.authButtonsContainer}>
          <MobileAuth
            iconName="logo-google"
            name="Google"
            style={{ backgroundColor: colors.googleAuth }}
          />

          <MobileAuth
            iconName="logo-apple"
            name="Apple"
            style={{ backgroundColor: colors.appleAuth }}
          />
        </View>

        <Text style={styles.termsText}>
          By continuing you agree to our Terms of service{"\n"}and Privacy
          Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    // New style for the loading screen
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background, // Or your app's main background color
  },
  mainContainer: {
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  everyNoteTitle: {
    fontWeight: "700",
    fontSize: 25,
    textAlign: "left",
    paddingBottom: 10,
  },
  taglineText: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: "left",
    fontWeight: "400",
  },
  imageContainer: {
    height: 385,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  homepageImage: {
    width: screenWidth,
    resizeMode: "contain",
  },
  authButtonsContainer: {
    marginTop: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  termsText: {
    color: colors.mutedForeground,
    textAlign: "center",
    fontSize: 10,
    maxWidth: 300,
  },
});
