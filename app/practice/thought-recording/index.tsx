import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TimeSelectionScreen() {
    const router = useRouter();

    const handleSelectTime = (minutes: number) => {
        router.push({
            pathname: "/practice/thought-recording/preparation",
            params: { duration: minutes }
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F9FAFB] px-6 relative">
            {/* Back Button */}
            <TouchableOpacity
                onPress={() => router.back()}
                className="absolute top-14 left-6 z-10 w-10 h-10 items-center justify-center rounded-full bg-white shadow-sm"
            >
                <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>

            <View className="flex-1 justify-center items-center">
                <Text className="text-3xl font-bold text-gray-800 mb-12 text-center tracking-tight">
                    Wybierz czas sesji
                </Text>

                <View className="w-full gap-5">
                    <TimeOption
                        label="15 minut"
                        subLabel="(Symboliczne 1 min)"
                        onPress={() => handleSelectTime(1)}
                    />
                    <TimeOption
                        label="30 minut"
                        subLabel="(Symboliczne 2 min)"
                        onPress={() => handleSelectTime(2)}
                    />
                    <TimeOption
                        label="45 minut"
                        subLabel="(Symboliczne 3 min)"
                        onPress={() => handleSelectTime(3)}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

function TimeOption({ label, subLabel, onPress }: { label: string, subLabel: string, onPress: () => void }) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            className="w-full bg-white p-6 rounded-[24px] items-center shadow-lg shadow-gray-100 border border-gray-100"
        >
            <Text className="text-xl font-semibold text-gray-800 mb-1">{label}</Text>
            <Text className="text-sm text-gray-400 font-medium">{subLabel}</Text>
        </TouchableOpacity>
    );
}
