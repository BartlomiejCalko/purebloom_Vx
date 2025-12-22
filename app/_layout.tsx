import { EmotionalStateProvider } from "@/context/EmotionalStateContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <EmotionalStateProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
          }}
        />
        <StatusBar style="light" />
      </EmotionalStateProvider>
    </GestureHandlerRootView>
  );
}


