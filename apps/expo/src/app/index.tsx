import { useState } from "react";

import type { ViewStyle, StyleProp, ImageSourcePropType } from "react-native";
import { Image, Text, TouchableOpacity, View, Dimensions } from "react-native";
import homepageImage from "../../assets/homepage.png";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import type { RouterOutputs } from "~/utils/api";
import { api } from "~/utils/api";
import { authClient, signIn, signOut } from "~/utils/auth";
import { Ionicons } from "@expo/vector-icons";

// Get screen width for responsive image sizing
const { width: screenWidth } = Dimensions.get("window");

interface MobileAuthProps {
  iconName: "logo-google" | "logo-apple";
  name: string;
  style: StyleProp<ViewStyle>;
}

function MobileAuth({ iconName, name, style }: MobileAuthProps) {
  return (
    <TouchableOpacity
      // Potential Blunder 1: Fixed height and width on button
      // Consider using padding and flexible width (e.g., w-full or a percentage)
      // or adjust the fixed width to be smaller.
      className=" flex-row gap-5 rounded-[30px] h-12 justify-center items-center mb-5 w-full"
      style={style}
      onPress={async () => {
        await signIn.social({
          provider: "google",
          callbackURL: `http://localhost:3000/api/auth/callback/${name.toLowerCase()}`,
        });
      }}
    >
      <Ionicons
        name={iconName}
        size={23}
        color={name === "Google" ? "black" : "white"}
      />
      <Text
        className="font-semibold"
        style={name === "Google" ? { color: "black" } : { color: "#fff" }}
      >
        Log In with {name}
      </Text>
    </TouchableOpacity>
  );
}

export default function Index() {
  const utils = api.useUtils(); // This 'utils' variable isn't used. Remove if not needed.

  return (
    <SafeAreaView className="flex bg-background flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <View
        // Potential Blunder 2: justify-between on main container with potentially tall content.
        // This will push content apart. If the sum of content heights is greater than available space,
        // it will cause overflow. Consider using `justify-center` or `gap` with appropriate padding.
        className="flex-1 justify-center pt-5 p-4 items-center"
      >
        <View>
          <Text
            // Potential Blunder 3: Fixed width on "EveryNote" text.
            // On very small screens, this can cause overflow. Consider using a percentage width
            // or allowing it to take full width and rely on padding.
            className="text-foreground font-bold text-3xl text-left pb-4 w-[80%]"
          >
            EveryNote
          </Text>

          <Text
            style={{ fontSize: 13 }}
            className="text-muted-foreground text-xs text-left font-normal leading-[1.5] mb-4 px-4"
          >
            Capture your thoughts, your way.{"\n"}Text, voice, or
            media—EveryNote makes it effortless to record your day and reflect
            with AI-powered clarity.
          </Text>
        </View>

        <View
          // Potential Blunder 4: Fixed height on image container.
          // This fixes the space for the image, but if the image itself is too tall or short,
          // it might not look right.
          className="h-[40%] w-full items-center justify-center"
        >
          <Image
            source={homepageImage as ImageSourcePropType}
            style={{
              width: screenWidth,
              // Potential Blunder 5: Fixed height on image.
              // A fixed height of 350px might be too tall for smaller devices,
              // causing the content below it to be pushed off-screen.
              // Consider a percentage height relative to the screen height,
              // or calculate it based on the image's aspect ratio.
              height: 350,
              resizeMode: "contain",
            }}
          />
        </View>

        <View
          // Potential Blunder 6: Large fixed margin-top.
          // This adds a lot of space above the buttons, which might be fine on larger screens,
          // but could contribute to overflow on smaller ones.
          className="mt-[50px] justify-center items-center"
        >
          <MobileAuth
            iconName="logo-google"
            name="Google"
            style={{ backgroundColor: "#fff" }}
          />
          <MobileAuth
            iconName="logo-apple"
            name="Apple"
            style={{ backgroundColor: "#1e1e1e" }}
          />
        </View>

        <Text className="text-muted-foreground text-center text-xs leading-normal mb-4 max-w-[300px]">
          By continuing you agree to our Terms of service{"\n"}and Privacy
          Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}
