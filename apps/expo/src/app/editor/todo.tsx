import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../utils/themes";
import {
  darkEditorTheme,
  RichText,
  Toolbar,
  useEditorBridge,
  TenTapStartKit,
  CoreBridge,
} from "@10play/tentap-editor";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useContext } from "react";
import { api } from "~/utils/api";
import { PowerSyncContext } from "@powersync/react-native";
import { useQuery } from "@powersync/react-native";

import type { TodoRecord } from "~/utils/powersync/AppSchema";
import { nanoid } from "nanoid/non-secure";

const getFormattedDate = (date: Date): string => {
  return new Date(date).toDateString().split("").splice(3, 14).join("");
};

export default function Post() {
  const { data: session, isLoading: isSessionLoading } =
    api.auth.getSession.useQuery();
  const powersync = useContext(PowerSyncContext);

  const { data: todosPowerSyncData } = useQuery<TodoRecord>(
    `SELECT id, description, created_at, list_id, completed, created_by, completed_by, completed_at FROM todo ORDER BY created_at DESC`,
  );

  const [todos, setTodos] = useState<TodoRecord[]>([]);
  const [todo, setTodo] = useState<TodoRecord | undefined>(undefined);
  const [displayDate, setDisplayDate] = useState<string>("");

  const editor = useEditorBridge({
    bridgeExtensions: [
      ...TenTapStartKit,
      CoreBridge.configureCSS(
        `* {
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
        }`,
      ),
    ],
    theme: darkEditorTheme,
    // autofocus: true,
    avoidIosKeyboard: true,
  });

  useEffect(() => {
    setTodos(
      todosPowerSyncData.map((row) => ({
        ...row,
        created_at: new Date(row.created_at),
        completed: !!row.completed,
      })),
    );

    if (todo && !todosPowerSyncData.some((t) => t.id === todo.id)) {
      setTodo(undefined);
    }
  }, [todosPowerSyncData, todo]);

  // Show placeholder only if editor is empty, and clear it on first input
  useEffect(() => {
    if (todo?.description) {
      editor.setContent(todo.description);
      setDisplayDate(getFormattedDate(new Date(todo.created_at)));
    } else {
      if (!isSessionLoading && powersync.connected) {
        void editor.getHTML().then((html) => {
          const plain = html.replace(/<[^>]+>/g, "").trim();
          if (!plain) {
            editor.setContent(`What's on your mind today?`);
          }
        });
        setDisplayDate(getFormattedDate(new Date()));
      }
    }
  }, [todo, editor, isSessionLoading, powersync.connected]);

  // Remove placeholder as soon as user types
  useEffect(() => {
    const handler = async () => {
      const text = await editor.getText();
      if (text.trim() === "What's on your mind today?") {
        editor.setContent("");
      }
    };
    // Use the editor's native event system if available, otherwise fallback to polling
    const interval = setInterval(handler, 200);
    return () => clearInterval(interval);
  }, [editor]);

  const saveTodo = async (description: string) => {
    if (isSessionLoading || !session) {
      console.warn("Session not ready. Cannot save todo.");
      return;
    }

    const nowIso = new Date().toISOString();
    const userId = session.user.id;

    if (todo?.id && todos.some((t) => t.id === todo.id)) {
      await powersync.execute(
        `UPDATE todo SET description = ?, created_at = ? WHERE id = ?`,
        [description, nowIso, todo.id],
      );
      console.log(`Todo updated: ${todo.id}`);
      // Set todo to the latest from todos (after update)
      const updated = todos.find((t) => t.id === todo.id);
      if (updated) setTodo({ ...updated, description });
    } else {
      const newId = nanoid();
      await powersync.execute(
        `INSERT INTO todo (id, description, created_at, created_by, completed, list_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [newId, description, nowIso, userId, 0, "default-list-id"],
      );
      console.log(`New todo created: ${newId}`);
      // Set todo to the new object
      setTodo({
        id: newId,
        description: description,
        created_at: new Date(nowIso),
        completed: 0,
        list_id: "default-list-id",
        created_by: userId,
        completed_at: null,
        completed_by: null,
      } as TodoRecord);
    }
  };

  const handleTitlePress = (id: string) => {
    const foundTodo = todos.find((item) => item.id === id);
    setTodo(foundTodo);
  };

  const handleCreateNewNote = () => {
    setTodo(undefined);
    editor.setContent(`What's on your mind today?`);
    setDisplayDate(getFormattedDate(new Date()));
  };

  const handleDeleteTodo = async (id: string) => {
    await powersync.execute(`DELETE FROM todo WHERE id = ?`, [id]);
    if (todo?.id === id) {
      setTodo(undefined);
    }
  };

  // Remove the Save button and save on keyboard hide
  React.useEffect(() => {
    const onKeyboardHide = () => {
      void editor.getHTML().then((htmlContent) => {
        void saveTodo(htmlContent);
      });
    };
    const sub = Keyboard.addListener("keyboardDidHide", onKeyboardHide);
    return () => sub.remove();
  }, [editor, saveTodo]);

  if (isSessionLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.mutedForeground} />
        <Text style={styles.loadingText}>Authenticating...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} className="bg-background">
      {!powersync.connected && (
        <View style={{ backgroundColor: "#ffecb3" }}>
          <Text style={{ color: "#b26a00", textAlign: "center", fontSize: 10 }}>
            Could not connect to PowerSync. You are working offline.
          </Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.searchBarWrapper} className="bg-card">
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
            source={{
              uri: session?.user.image ?? "https://via.placeholder.com/150",
            }}
          />
        </View>
        <View>
          <FlatList
            horizontal
            data={todos}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleTitlePress(item.id)}
                style={styles.flatListItemWrapper}
                className="bg-background"
              >
                <Text
                  style={styles.flatListItemText}
                  className="text-primary-foreground"
                  numberOfLines={1}
                >
                  {(() => {
                    const firstLine =
                      item.description.split(" ")[0] ?? "Untitled";
                    return (
                      firstLine.replace(/<[^>]+>/g, "").trim() || "Untitled"
                    );
                  })()}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeleteTodo(item.id)}
                  style={{ marginLeft: 8 }}
                >
                  <Ionicons
                    name="trash"
                    size={16}
                    color={colors.mutedForeground}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            ListFooterComponent={
              <TouchableOpacity
                style={styles.footer}
                onPress={handleCreateNewNote}
              >
                <Text className="text-muted-foreground text-base">
                  <Ionicons
                    name="add"
                    color={colors.mutedForeground}
                    size={10}
                  />
                  create new note
                </Text>
              </TouchableOpacity>
            }
            contentContainerStyle={{ paddingVertical: 10 }} // Add padding to top and bottom
          />
        </View>

        <Text style={styles.displayDateText} className="text-muted-foreground">
          {displayDate || ""}
        </Text>

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  searchBarText: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerImage: {
    width: "10%",
    height: "70%",
    backgroundColor: colors.mutedForeground,
    borderRadius: 40,
  },
  flatListItemWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 140,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    backgroundColor: colors.background,
    borderRadius: 24,
    height: 40,
    borderWidth: 1,
    borderColor: colors.mutedForeground,
  },
  flatListItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 100,
    textAlign: "center",
  },
  richTextBackground: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  footer: {
    minWidth: 120,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: colors.background,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.mutedForeground,
  },
  keyboardAvoidingView: {
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
  displayDateText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "left",
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: colors.mutedForeground,
  },
});
