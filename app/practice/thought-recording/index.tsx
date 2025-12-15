import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
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
            {/* Header Row */}
            <View className="flex-row items-center justify-between mt-4 mb-2">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full bg-white shadow-sm"
                >
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push("/practice/thought-recording/tips")}
                    className="w-10 h-10 items-center justify-center rounded-full bg-yellow-50 shadow-sm border border-yellow-100"
                >
                    <Ionicons name="bulb-outline" size={22} color="#F59E0B" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="mt-4 mb-8">
                    <Text className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                        Wybierz czas sesji
                    </Text>
                    <Text className="text-base text-gray-500 leading-relaxed">
                        Terapeutyczne zapisywanie myśli pomaga zauważyć to, co naprawdę dzieje się w Tobie — bez presji, oceniania i analizowania.
                        {"\n\n"}
                        Aby dowiedzieć się więcej, dotknij ikony Wskazówki.
                    </Text>
                </View>

                <View className="w-full gap-5">
                    <TimeOption
                        label="15 minut"
                        subLabel="(Symboliczne 1 min)"
                        title="Wejście w siebie"
                        description="Idealna, gdy chcesz szybko zatrzymać natłok myśli i poczuć ulgę."
                        onPress={() => handleSelectTime(1)}
                    />
                    <TimeOption
                        label="30 minut"
                        subLabel="(Symboliczne 2 min)"
                        title="Wgląd i porządkowanie"
                        description="Pomaga uporządkować emocje i dotrzeć do sedna trudnego tematu."
                        onPress={() => handleSelectTime(2)}
                    />
                    <TimeOption
                        label="45 minut"
                        subLabel="(Symboliczne 3 min)"
                        title="Praca głęboka"
                        description="Dobra, gdy masz przestrzeń na głębszy wgląd i przetworzenie emocji."
                        onPress={() => handleSelectTime(3)}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function TimeOption({ label, subLabel, title, description, onPress }: { label: string, subLabel: string, title: string, description: string, onPress: () => void }) {
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            className="w-full bg-white p-6 rounded-[24px] shadow-sm shadow-gray-200 border border-gray-100"
        >
            <View className="flex-row justify-between items-baseline mb-2">
                <Text className="text-xl font-bold text-gray-900">{label}</Text>
                <Text className="text-xs text-gray-400 font-medium">{subLabel}</Text>
            </View>

            <Text className="text-sm font-bold text-blue-600 mb-1 uppercase tracking-wide">
                {title}
            </Text>

            <Text className="text-sm text-gray-500 leading-relaxed">
                {description}
            </Text>
        </TouchableOpacity>
    );
}
