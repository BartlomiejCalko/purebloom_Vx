import { EmotionalParticles } from "@/components/EmotionalParticles";
import { EmotionalSlider } from "@/components/EmotionalSlider";
import { useEmotionalState } from "@/context/EmotionalStateContext";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInUp, useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EmotionalMirrorScreen() {
    const router = useRouter();
    const { state, updateState } = useEmotionalState();

    // Initial values start from current persisted state or default neutral
    const intensity = useSharedValue(state.intensity);
    const valence = useSharedValue(state.valence);
    const heaviness = useSharedValue(state.heaviness);
    const stability = useSharedValue(state.stability);
    const energy = useSharedValue(state.energy);

    const handleSaveAndExit = () => {
        updateState({
            intensity: intensity.value,
            valence: valence.value,
            heaviness: heaviness.value,
            stability: stability.value,
            energy: energy.value,
        });
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950">
            {/* Top Area: Interactive Blob */}
            <View className="h-[45%] w-full">
                {/* Reduced height slightly to give more room for controls */}
                <EmotionalParticles
                    intensity={intensity}
                    valence={valence}
                    heaviness={heaviness}
                    stability={stability}
                    energy={energy}
                    mode="interactive"
                />
            </View>

            {/* Bottom Interaction Area: ScrollView */}
            <View className="flex-1 bg-slate-950/50">
                <ScrollView
                    className="flex-1 px-8"
                    contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View entering={FadeInUp.delay(100)} className="space-y-6">

                        <Text className="text-white/60 text-center text-sm font-light mb-2">
                            Dostosuj obraz do swojego stanu
                        </Text>

                        <EmotionalSlider
                            label="Intensywność"
                            leftLabel="Słabe"
                            rightLabel="Silne"
                            value={intensity}
                        />

                        <EmotionalSlider
                            label="Przyjemność (Walencja)"
                            leftLabel="Nieprzyjemne"
                            rightLabel="Przyjemne"
                            value={valence}
                        />

                        <EmotionalSlider
                            label="Ciężar"
                            leftLabel="Ciężar"
                            rightLabel="Lekkość"
                            value={heaviness}
                        />

                        <EmotionalSlider
                            label="Stabilność"
                            leftLabel="Chaos"
                            rightLabel="Stabilność"
                            value={stability}
                        />

                        <EmotionalSlider
                            label="Energia"
                            leftLabel="Mało"
                            rightLabel="Dużo"
                            value={energy}
                        />

                        <View className="pt-8 space-y-4">
                            <Pressable
                                className="w-full bg-indigo-500/20 py-4 rounded-2xl items-center active:bg-indigo-500/30 border border-indigo-500/30"
                                onPress={handleSaveAndExit}
                            >
                                <Text className="text-white font-medium">Zatwierdź stan</Text>
                            </Pressable>
                        </View>

                    </Animated.View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
