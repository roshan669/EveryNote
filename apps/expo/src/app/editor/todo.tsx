import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  StyleSheet,
  TouchableOpacity, // Import StyleSheet
  ActivityIndicator, // Import ActivityIndicator for loading state
} from "react-native";
import { colors } from "../../utils/themes";
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
// No need for UseTRPCQueryResult directly here
import { useSession } from "~/utils/auth"; // Ensure this provides 'isPending'

export default function Post() {
  // Get both the session data and the loading status of the session
  const { data: session, isPending: isSessionLoading } = useSession();
  const user_id = session?.user.id ?? ""; // Safely access user.id

  // Conditionally enable the todo.all query
  const { data: todosData, isLoading: areTodosLoading } = api.todo.all.useQuery(
    undefined, // No input for todo.all
    {
      // --- CRUCIAL CHANGE: Only run this query if session data exists and is not loading ---
      enabled: !!session && !isSessionLoading,
    },
  );

  // State to hold the fetched todos
  const [todos, setTodos] = useState<
    {
      id: string;
      title: string;
      content: string;
      created_at: Date;
      completed: boolean;
      updated_at: Date | null;
      owner: string;
    }[]
  >([]); // Initialize with an empty array

  useEffect(() => {
    // When todosData changes (and is not undefined), update the state
    // api.todo.all.useQuery returns an array of todos, so no need to wrap it
    setTodos(todosData || []);
  }, [todosData]);

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
      CoreBridge.configureCSS(darkEditorCss),
    ],
    theme: darkEditorTheme,
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent: `<h4>${datetoday}</h4>What's on you mind today?`,
  });

  // Show a loading indicator if either session or todos are loading
  if (isSessionLoading || areTodosLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.mutedForeground} />
        <Text style={{ color: colors.mutedForeground, marginTop: 10 }}>
          Loading your notes...
        </Text>
      </SafeAreaView>
    );
  }

  // If session is NOT loading AND no session exists, maybe redirect to login or show error
  if (!session) {
    // This case should ideally be handled by your root _layout.tsx or Index.tsx
    // If you're here, it means a non-authenticated user reached this protected route.
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{ color: "red", textAlign: "center" }}>
          You must be logged in to view notes.
        </Text>
        {/* You might add a button to go back to login */}
      </SafeAreaView>
    );
  }

  // --- Render the main content only when session is loaded and query is ready ---
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
            data={todos} // Use the correct state variable 'todos'
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
  loadingContainer: {
    // New style for loading state
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    height: 45,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  searchBarWrapper: {
    width: "67%",
    borderRadius: 9999,
    height: "85%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingLeft: 16,
    flexDirection: "row",
    gap: 8,
    elevation: 1,
  },
  searchBarText: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerImage: {
    resizeMode: "contain",
    width: "10%",
    height: "70%",
    backgroundColor: "#fff",
    borderRadius: 40,
  },
  flatListItemWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  flatListItemText: {
    marginLeft: 8,
    marginVertical: 12,
    height: 35,
    width: 70,
    fontSize: 11,
    fontWeight: "300",
    borderWidth: 0.2,
    borderColor: colors.mutedForeground,
    borderRadius: 24,
    textAlign: "center",
    justifyContent: "center",
    textAlignVertical: "center",
  },
  richTextBackground: {
    backgroundColor: colors.foreground,
    flex: 1,
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
