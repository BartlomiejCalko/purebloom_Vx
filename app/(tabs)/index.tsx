import { HomeEmotionalMirrorSection } from "@/components/HomeEmotionalMirrorSection";
import { RecommendedExercises } from "@/components/RecommendedExercises";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
    return (
        // <ImageBackground
        //     source={require("../../assets/images/13.jpg")}
        //     style={{ flex: 1 }}
        //     // You can adjust the image position here using transforms
        //     // e.g. translateX: -50 shifts it left, scale: 1.2 zooms in, etc.
        //     imageStyle={{
        //         resizeMode: "cover", // Keeps it covering the screen
        //         // We scale it up so when we move it, we don't see empty space
        //         transform: [
        //             { scale: 1.0 },
        //             { translateX: 0 } // Shift right to see more of the left side
        //         ]
        //     }}
        // >
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar style="light" />

            {/* 1. Top Greeting Area - Fixed at top */}
            <View className="px-8 pt-2 pb-4">
                <Text className="text-slate-300 text-3xl font-light mb-2">
                    Cześć, Bartek
                </Text>
                <Text className="text-white/60 text-lg font-light tracking-wide">
                    Jak jest dziś w środku?
                </Text>
            </View>

            {/* 2. Scrollable Content */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {/* Emotional Mirror Section - Fixed height 45% of screen */}
                <View style={{ height: '45%', minHeight: 300 }}>
                    <HomeEmotionalMirrorSection />
                </View>

                {/* Recommended Exercises - Scrollable */}
                <RecommendedExercises />

                {/* Bottom Spacer - ensures last card is visible above tab bar */}
                <View className="h-32" />
            </ScrollView>
        </SafeAreaView>
        // </ImageBackground>
    );
}
