import type { ViewStyle, StyleProp } from "react-native";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../utils/themes";
import { signIn } from "~/utils/auth";

import React from "react";

interface MobileAuthProps {
  iconName: "logo-google" | "logo-apple";
  name: string;
  style: StyleProp<ViewStyle>;
}

function MobileAuth({ iconName, name, style }: MobileAuthProps) {
  const isGoogle = name === "Google";
  const textColor = isGoogle ? colors.black : colors.white;

  return (
    <TouchableOpacity
      style={[styles.authButton, style]}
      onPress={async () => {
        await signIn.social({
          provider: "discord",
          callbackURL: "exp+every-note://",
          // disableRedirect: true,
        });
      }}
    >
      <Ionicons name={iconName} size={23} color={textColor} />
      <Text style={[styles.authButtonText, { color: textColor }]}>
        Log In with {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  authButton: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 30,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    width: "88%",
    elevation: 1,
  },
  authButtonText: {
    fontWeight: "500",
  },
});

export default MobileAuth;
