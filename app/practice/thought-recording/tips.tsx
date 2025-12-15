import { AnimatedScreen } from "@/components/AnimatedScreen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TipsScreen() {
    const router = useRouter();

    return (
        <AnimatedScreen className="flex-1 bg-white">
            <SafeAreaView className="flex-1 relative">
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, paddingTop: 60 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Text className="text-3xl font-bold text-gray-900 mb-8">
                        Wskazówki do ćwiczenia
                    </Text>

                    {/* General Tips */}
                    <View className="mb-10 space-y-4">
                        <TipItem text="Pisz bez przerwy — nawet jeśli pojawia się chaos." />
                        <TipItem text="Nie oceniaj i nie poprawiaj tekstu." />
                        <TipItem text="Jeśli nie wiesz, co napisać — napisz to." />
                        <TipItem text="Pozwól, by słowa pojawiały się swobodnie." />
                    </View>

                    {/* Section: Sessions */}
                    <View className="mb-10">
                        <SectionTitle title="Kiedy wybrać krótką sesję:" />
                        <SectionBody text="Gdy potrzebujesz szybkiego wyciszenia lub przerwania spirali myśli." />

                        <SectionTitle title="Kiedy wybrać średnią:" />
                        <SectionBody text="Gdy temat wraca i chcesz go lepiej zrozumieć." />

                        <SectionTitle title="Kiedy wybrać dłuższą:" />
                        <SectionBody text="Gdy chcesz dotrzeć głębiej i poczuć większą zmianę w emocjach." />
                    </View>

                    {/* Section: Effects */}
                    <View className="mb-10">
                        <Text className="text-xl font-bold text-gray-900 mb-4">
                            Spodziewane efekty:
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            <EffectTag text="ulga" />
                            <EffectTag text="większa klarowność" />
                            <EffectTag text="zauważenie emocji" />
                            <EffectTag text="poczucie „coś się we mnie ułożyło”" />
                        </View>
                    </View>
                    {/* Close Button Floating */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-4 right-6 w-10 h-10 items-center justify-center rounded-full bg-gray-100 shadow-sm z-20"
                    >
                        <Ionicons name="close" size={24} color="#374151" />
                    </TouchableOpacity>
                </ScrollView>

                

                {/* Bottom Close Button (as requested per standard UI) */}
                {/* Keeping it simple with just top close for cleaner look, or adding specific bottom button if needed. 
                    Requirement said "przycisk zamykający", top X is standard for full screen modals, but let's add a bottom one too for clarity if desired.
                    Actually, let's stick to the top X as it's cleaner for "Wskazówki".
                */}

            </SafeAreaView>
        </AnimatedScreen>
    );
}

function TipItem({ text }: { text: string }) {
    return (
        <View className="flex-row items-start mb-3">
            <View className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3" />
            <Text className="text-lg text-gray-700 leading-relaxed flex-1">
                {text}
            </Text>
        </View>
    );
}

function SectionTitle({ title }: { title: string }) {
    return (
        <Text className="text-lg font-bold text-gray-800 mt-6 mb-2">
            {title}
        </Text>
    );
}

function SectionBody({ text }: { text: string }) {
    return (
        <Text className="text-base text-gray-600 leading-relaxed">
            {text}
        </Text>
    );
}

function EffectTag({ text }: { text: string }) {
    return (
        <View className="bg-blue-50 px-4 py-2 rounded-full mb-2">
            <Text className="text-blue-700 font-medium text-sm">
                {text}
            </Text>
        </View>
    );
}
