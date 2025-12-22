import { HomeEmotionalMirrorSection } from "@/components/HomeEmotionalMirrorSection";
import { StatusBar } from "expo-status-bar";
import { ImageBackground, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
    return (
        <ImageBackground
            source={require("../../assets/images/13.jpg")}
            style={{ flex: 1 }}
            // You can adjust the image position here using transforms
            // e.g. translateX: -50 shifts it left, scale: 1.2 zooms in, etc.
            imageStyle={{
                resizeMode: "cover", // Keeps it covering the screen
                // We scale it up so when we move it, we don't see empty space
                transform: [
                    { scale: 1.0 },
                    { translateX: 0 } // Shift right to see more of the left side
                ]
            }}
        >
            <SafeAreaView className="flex-1 bg-black/40">
                <StatusBar style="light" />

                {/* 1. Top Greeting Area (approx 15-20%) */}
                <View className="h-[20%] justify-center px-8 pt-4">
                    <Text className="text-slate-300 text-3xl font-light mb-2">
                        Cześć, Bartek
                    </Text>
                    <Text className="text-white/60 text-lg font-light tracking-wide">
                        Jak jest dziś w środku?
                    </Text>
                </View>

                {/* 2. Central Blob Section (approx 60%) */}
                {/* The component itself handles the sizing and blob rendering */}
                <HomeEmotionalMirrorSection />

                {/* 3. Bottom Spacer / Navigation padding */}
                <View className="flex-1 bg-transparent" />
            </SafeAreaView>
        </ImageBackground>
    );
}
