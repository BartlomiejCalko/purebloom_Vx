import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SessionScreen() {
    const router = useRouter();
    const { duration } = useLocalSearchParams();

    // Duration is passed as string "1", "2", or "3". Convert to number.
    // Default to 1 if missing.
    const targetMinutes = duration ? parseInt(duration as string, 10) : 1;
    const targetSeconds = targetMinutes * 60;

    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [text, setText] = useState("");
    const [isTargetReached, setIsTargetReached] = useState(false);

    // Timer Logic
    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsElapsed((prev) => {
                const nav = prev + 1;
                // Check if target reached (only trigger once)
                if (nav >= targetSeconds && !isTargetReached) {
                    setIsTargetReached(true); // This will update in the next render cycle effectively
                }
                return nav;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [targetSeconds, isTargetReached]);

    // Ensure state updates correctly for target reached
    useEffect(() => {
        if (secondsElapsed >= targetSeconds) {
            setIsTargetReached(true);
        }
    }, [secondsElapsed, targetSeconds]);


    // Format time MM:SS
    const formatTime = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
    };

    const handleFinish = () => {
        router.push({
            pathname: "/practice/thought-recording/integration",
            params: {
                sessionTime: secondsElapsed,
                sessionContent: text,
                timestamp: new Date().toISOString()
            }
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-[#FDFBF7]">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1 px-6 pt-4 pb-6 relative">

                        {/* Timer Display */}
                        <View className="absolute top-4 right-6 z-10 bg-white/80 px-3 py-1 rounded-full border border-stone-100">
                            <Text className="text-stone-400 text-xs font-medium font-mono">
                                {formatTime(secondsElapsed)}
                            </Text>
                        </View>

                        {/* Main Editor Area */}
                        <TextInput
                            className="flex-1 text-lg text-stone-700 leading-relaxed text-left"
                            placeholder="Zacznij pisać..."
                            placeholderTextColor="#D6D3D1"
                            multiline
                            textAlignVertical="top" // Android fix
                            value={text}
                            onChangeText={setText}
                            autoFocus
                            style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }} // Ensure nice font
                        />

                        {/* Bottom Actions - Appear only when time reached */}
                        {isTargetReached && (
                            <Animated.View
                                entering={FadeIn.duration(1000)}
                                className="mt-4"
                            >
                                <View className="items-center mb-6">
                                    <Text className="text-stone-400 text-sm italic">
                                        Minimalny czas sesji osiągnięty
                                    </Text>
                                    <Text className="text-stone-300 text-xs mt-1">
                                        Możesz kontynuować pisanie lub zakończyć, kiedy poczujesz gotowość.
                                    </Text>
                                </View>

                                <View className="gap-3">
                                    <TouchableOpacity
                                        onPress={handleFinish}
                                        className="w-full bg-[#E7E5E4] py-4 rounded-full items-center"
                                    >
                                        <Text className="text-stone-700 font-semibold">Zakończ sesję</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => { /* No-op, just dismiss UI focus if needed, or let user write */ }}
                                        activeOpacity={1}
                                        className="items-center py-2"
                                    >
                                        <Text className="text-stone-400 text-sm">Kontynuuję pisanie</Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        )}
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
