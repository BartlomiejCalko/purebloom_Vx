import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PreparationScreen() {
    const router = useRouter();
    const { duration } = useLocalSearchParams();

    const handleStart = () => {
        router.push({
            pathname: "/practice/thought-recording/session",
            params: { duration }
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F3F4F6] px-6 justify-between pb-10">
            <View>
                {/* Close Button (optional here, but good for UX) */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full bg-white shadow-sm mt-4"
                >
                    <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>

                <View className="mt-12">
                    <Text className="text-3xl font-bold text-gray-900 mb-6">
                        Zanim zaczniesz…
                    </Text>

                    <View className="bg-white p-8 rounded-[32px] shadow-sm">
                        <Text className="text-lg text-gray-600 leading-relaxed mb-6">
                            Usiądź wygodnie.
                        </Text>
                        <Text className="text-lg text-gray-600 leading-relaxed mb-6">
                            Weź kilka spokojnych oddechów.
                        </Text>
                        <Text className="text-lg text-gray-600 leading-relaxed mb-6">
                            To nie jest czas na analizę ani ocenę — tylko na zauważanie tego, co się w Tobie pojawia.
                        </Text>
                        <Text className="text-lg text-gray-800 font-medium leading-relaxed">
                            Gdy poczujesz gotowość, rozpocznij sesję.
                        </Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                onPress={handleStart}
                activeOpacity={0.9}
                className="w-full bg-[#3B82F6] py-5 rounded-full items-center shadow-md shadow-blue-200"
            >
                <Text className="text-white text-lg font-bold tracking-wide">START</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
