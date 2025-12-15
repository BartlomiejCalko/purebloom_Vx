import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IntegrationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [insight, setInsight] = useState("");

    const handleSave = () => {
        // --- DATA SAVING LOGIC HERE ---
        // For now, we log the complete session data.
        console.log("Saving Session Data:", {
            ...params,
            insight: insight,
            savedAt: new Date().toISOString()
        });

        // Navigate back to success or root.
        // Popping back to the 'practice' tab.
        router.dismissAll(); // Or navigate to specific route if router stack is complex
        router.replace("/(tabs)/practice");
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F9FAFB] px-8 justify-center">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 justify-center"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View className="mb-10">
                            <Text className="text-3xl font-bold text-gray-900 mb-4 text-center">
                                Zatrzymaj się na chwilę.
                            </Text>
                            <Text className="text-lg text-gray-600 text-center leading-relaxed mb-8">
                                Jakie jedno zdanie najbardziej do Ciebie przemawia?{"\n"}
                                Co zostaje z Tobą po tej sesji?
                            </Text>

                            <TextInput
                                className="w-full bg-white p-6 rounded-3xl text-lg text-gray-800 shadow-sm border border-gray-100 min-h-[120px]"
                                placeholder="Twój insight..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                textAlignVertical="top"
                                value={insight}
                                onChangeText={setInsight}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleSave}
                            activeOpacity={0.9}
                            className="w-full bg-gray-900 py-5 rounded-full items-center shadow-lg shadow-gray-400"
                        >
                            <Text className="text-white text-lg font-bold tracking-wide">Zapisz i zakończ</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
