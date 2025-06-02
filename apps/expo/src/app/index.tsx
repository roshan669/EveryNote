import type { ImageSourcePropType } from "react-native";
import { Image, Text, View, StyleSheet } from "react-native";
import homepageImage from "../../assets/homepage.png";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

// Import your theme constants
import { colors, screenWidth } from "../utils/themes";
import MobileAuth from "../components/MobileAuth";

export default function Index() {
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
            style={{ backgroundColor: colors.googleAuth }} // Using the specific color constant
          />
          <MobileAuth
            iconName="logo-apple"
            name="Apple"
            style={{ backgroundColor: colors.appleAuth }} // Using the specific color constant
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
  mainContainer: {
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  everyNoteTitle: {
    fontWeight: "700", // font-bold
    fontSize: 25,
    textAlign: "left",
    paddingBottom: 10,
  },
  taglineText: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: "left", // text-left
    fontWeight: "400", // font-normal
  },
  imageContainer: {
    height: 385,
    width: "100%",
    alignItems: "center", // items-center
    justifyContent: "center", // justify-center
    marginBottom: 20,
  },
  homepageImage: {
    width: screenWidth,
    resizeMode: "contain",
  },
  authButtonsContainer: {
    marginTop: 5,
    justifyContent: "center", // justify-center
    alignItems: "center", // items-center
  },
  termsText: {
    color: colors.mutedForeground,
    textAlign: "center",
    fontSize: 10,
    maxWidth: 300,
  },
});
