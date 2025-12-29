import { HomeEmotionalMirrorSection } from "@/components/HomeEmotionalMirrorSection";
import { MeshGradientView } from "expo-mesh-gradient";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Dzień dobry';
        if (hour < 18) return 'Witaj';
        return 'Dobry wieczór';
    };

    // Soft pastel gradient colors - deep navy to soft lavender/rose tones
    // Creates a calming, therapeutic atmosphere
    const gradientColors = useMemo(() => [
        "#1a1a2e", "#252547", "#2a2a4a",  // Top row: deep navy tones
        "#2d2a4a", "#3a3560", "#352a4a",  // Middle row: purple-navy transition
        "#3a2a45", "#402a50", "#352a48",  // Bottom row: subtle plum undertones
    ], []);

    // Mesh grid points (3x3)
    const meshPoints = useMemo(() => [
        [0.0, 0.0], [0.5, 0.0], [1.0, 0.0],
        [0.0, 0.5], [0.5, 0.5], [1.0, 0.5],
        [0.0, 1.0], [0.5, 1.0], [1.0, 1.0],
    ], []);

    return (
        <View style={styles.container}>
            {/* MeshGradient Background - iOS only */}
            {Platform.OS === "ios" && (
                <MeshGradientView
                    style={StyleSheet.absoluteFill}
                    columns={3}
                    rows={3}
                    colors={gradientColors}
                    points={meshPoints}
                    smoothsColors={true}
                    ignoresSafeArea={true}
                />
            )}

            {/* Fallback for Android - simple gradient-like background */}
            {Platform.OS === "android" && (
                <View style={[StyleSheet.absoluteFill, styles.androidBackground]} />
            )}

            <SafeAreaView className="flex-1">
                <StatusBar style="light" />

                {/* 1. Top Greeting Area - Fixed at top */}
                <View className="px-8 pt-2 pb-4">
                    <Text className="text-slate-300 text-xl font-light mb-1">
                        {getGreeting()}, Bartek
                    </Text>
                    <Text className="text-white/60 text-md font-light tracking-wide">
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

                    {/* Recommended Exercises - DISABLED as per user request */}
                    {/* <RecommendedExercises /> */}

                    {/* Bottom Spacer - ensures last card is visible above tab bar */}
                    <View className="h-32" />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a2e", // Fallback color
    },
    androidBackground: {
        backgroundColor: "#252547", // Simple solid for Android
    },
});
