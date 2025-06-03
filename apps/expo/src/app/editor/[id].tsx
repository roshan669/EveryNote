import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewComponent,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "../../utils/themes";
import { Stack, useGlobalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { RichText, Toolbar, useEditorBridge } from "@10play/tentap-editor";
import { Ionicons } from "@expo/vector-icons";
import { api } from "~/utils/api";

export default function Post() {
  const { id } = useGlobalSearchParams();

  const DATA = [
    {
      title: "General",
    },
    {
      title: "Meeting",
    },
    {
      title: "Todo",
    },
  ];

  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent: "What's on your mind Today?",
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1">
        <View className="flex-row gap-4 justify-center h-[50px] items-center mt-1 mb-2">
          <View className="bg-primary-foreground w-[65%] rounded-full h-[85%] justify-start items-center pl-4 flex-row gap-2">
            <Ionicons name="search" size={20} color={colors.mutedForeground} />
            <Text className="text-lg text-muted-foreground font-semibold">
              Search your note
            </Text>
          </View>
          <Ionicons name="calendar-outline" color={"#fff"} size={23} />
          <Image
            style={{
              resizeMode: "contain",
              width: 10,
              backgroundColor: "#fff",
            }}
            src="../../../assets/icon.png"
          />
        </View>
        <View>
          <FlatList
            horizontal
            data={DATA}
            renderItem={({ item }) => (
              <View className="flex justify-center items-center bg-backround">
                <Text
                  className="
          
          ml-2
          my-3
          h-10
          w-[70px]
          p-1
          text-sm
          font-medium
          border-[0.2px]
          border-muted-foreground
          rounded-3xl
          text-muted-foreground            
          text-center  
          align-middle           
        "
                >
                  {item.title}
                </Text>
              </View>
            )}
            // keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()} // Good practice for FlatList
          />
        </View>

        <RichText className="bg-foreground " editor={editor} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{
            position: "absolute",
            width: "100%",
            bottom: 0,
          }}
        >
          <Toolbar editor={editor} />
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
