import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  StyleSheet,
  TouchableOpacity, // Import StyleSheet
} from "react-native";
import { colors } from "../../utils/themes"; // Ensure colors is imported
import { useGlobalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  darkEditorTheme,
  RichText,
  Toolbar,
  useEditorBridge,
  TenTapStartKit,
  CoreBridge,
} from "@10play/tentap-editor";
import { Ionicons } from "@expo/vector-icons";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";
import { UseTRPCSuspenseQueryResult } from "@trpc/react-query/shared";

export default function Post() {
  const { id } = useGlobalSearchParams();
  const [todosFromApi] = api.todo.all.useSuspenseQuery();

  const [todo, setTodo] = useState<
    {
      id: string;
      title: string;
      content: string;
      created_at: Date;
      updated_at: Date | null;
    }[]
  >();

  useEffect(() => {
    setTodo(todosFromApi);
  }, []);

  const darkEditorCss = `
  * {
    background-color: ${colors.background};
    color: ${colors.mutedForeground};
    font-size: 20px;
  }
  blockquote {
    border-left: 3px solid #babaca;
    padding-left: 1rem;
  }
  .highlight-background {
    background-color: #474749;
  }
`;

  const datetoday = new Date().toDateString().split("").splice(3, 14).join("");

  const editor = useEditorBridge({
    bridgeExtensions: [
      ...TenTapStartKit,
      CoreBridge.configureCSS(darkEditorCss), // <--- Add our dark mode css
    ],
    theme: darkEditorTheme,
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent: `<h4>${datetoday}</h4>What's on you mind today?`,
  });

  return (
    <SafeAreaView style={styles.safeArea} className="bg-background">
      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.searchBarWrapper}
            className="bg-background"
          >
            <Ionicons name="search" size={20} color={colors.mutedForeground} />
            <Text
              style={styles.searchBarText}
              className="text-muted-foreground"
            >
              Search your note
            </Text>
          </TouchableOpacity>
          <Ionicons
            name="calendar-outline"
            color={colors.mutedForeground}
            size={20}
          />
          <Image
            style={styles.headerImage}
            source={require("../../../assets/icon.png")} //to be fetched from backend
          />
        </View>
        <View>
          <FlatList
            horizontal
            data={todo}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.flatListItemWrapper}
                className="bg-background"
              >
                <Text
                  style={styles.flatListItemText}
                  className="text-muted-foreground"
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            ListFooterComponent={
              <TouchableOpacity style={styles.footer}>
                <Text className="text-muted-foreground text-base">
                  <Ionicons
                    name="add"
                    color={colors.mutedForeground}
                    size={10}
                  />
                  create category
                </Text>
              </TouchableOpacity>
            }
          />
        </View>

        <RichText style={styles.richTextBackground} editor={editor} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <Toolbar editor={editor} />
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  headerRow: {
    // backgroundColor: ,
    flexDirection: "row",
    gap: 16, // Equivalent to gap-4 (16px)
    justifyContent: "center",
    height: 45,
    alignItems: "center",
    marginTop: 4, // Equivalent to mt-1 (4px)
    marginBottom: 8, // Equivalent to mb-2 (8px)
  },
  searchBarWrapper: {
    width: "67%",
    borderRadius: 9999, // Equivalent to rounded-full
    height: "85%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 16, // Equivalent to pl-4 (16px)
    flexDirection: "row",
    gap: 8, // Equivalent to gap-2 (8px)
    elevation: 1,
  },
  searchBarText: {
    fontSize: 18, // Equivalent to text-lg
    fontWeight: "600", // Equivalent to font-semibold
  },
  headerImage: {
    resizeMode: "contain",
    width: "10%",
    height: "70%",
    backgroundColor: "#fff",
    borderRadius: 40,
  },

  flatListBackground: {
    // This is not used directly on FlatList, but FlatList usually inherits parent background
    // If you need a specific background for the FlatList content area, you'd add it here.
    // However, the items themselves have background, so the FlatList background might not be visible.
  },
  flatListItemWrapper: {
    flex: 1, // Make sure it respects flex if parent has it
    justifyContent: "center",
    alignItems: "center",
  },
  flatListItemText: {
    marginLeft: 8, // Equivalent to ml-2 (8px)
    marginVertical: 12, // Equivalent to my-3 (12px)
    height: 35, // Equivalent to h-10 (40px)
    width: 70, // Equivalent to w-[70px]
    // padding:, // Equivalent to p-1 (4px)
    fontSize: 11, // Equivalent to text-sm
    fontWeight: "300", // Equivalent to font-medium
    borderWidth: 0.2, // Equivalent to border-[0.2px]
    borderColor: colors.mutedForeground,
    borderRadius: 24, // Equivalent to rounded-3xl (24px)
    textAlign: "center",
    justifyContent: "center", // Vertically center content inside Text
    textAlignVertical: "center",
  },
  richTextBackground: {
    backgroundColor: colors.foreground, // Equivalent to bg-foreground
    flex: 1, // Added flex:1 to ensure RichText takes available space
  },
  footer: {
    margin: 5,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 40,
  },
  keyboardAvoidingView: {
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
});
