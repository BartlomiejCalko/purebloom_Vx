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
    const chaos = useSharedValue(state.chaos);
    const energy = useSharedValue(state.energy);

    const handleSaveAndExit = () => {
        updateState({
            intensity: intensity.value,
            valence: valence.value,
            heaviness: heaviness.value,
            chaos: chaos.value,
            energy: energy.value,
        });
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950">
            {/* Top Area: Interactive Particles */}
            <View className="h-[45%] w-full">
                {/* Reduced height slightly to give more room for controls */}
                <EmotionalParticles
                    intensity={intensity}
                    valence={valence}
                    heaviness={heaviness}
                    chaos={chaos}
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
                            label="Jak mocno odczuwasz teraz to, co dzieje się w Twoim ciele i umyśle?"
                            leftLabel="Nieznacznie"
                            middleLabel="Umiarkowanie"
                            rightLabel="Intensywnie"
                            value={intensity}
                        />

                        <EmotionalSlider
                            label="Jakie są te odczucia w odbiorze?"
                            leftLabel="Nieprzyjemne"
                            middleLabel="Neutralne"
                            rightLabel="Przyjemne"
                            value={valence}
                        />

                        <EmotionalSlider
                            label="Jak to, co teraz czujesz, wpływa na Twoje ciało i energię?"
                            leftLabel="Lekko, unosi"
                            middleLabel="Zrównoważone"
                            rightLabel="Ciężko, ciągnie"
                            value={heaviness}
                        />

                        <EmotionalSlider
                            label="Na ile to, co teraz czujesz, przypomina że panujesz nad tym, co się w Tobie dzieje?"
                            leftLabel="Spokojnie"
                            middleLabel="Zmiennie"
                            rightLabel="Chaotycznie"
                            value={chaos}
                        />

                        <EmotionalSlider
                            label="Na ile Twoje ciało i umysł odczuwają teraz gotowość do działania?"
                            leftLabel="Wyczerpanie"
                            middleLabel="Umiarkowana"
                            rightLabel="Wysoka energia"
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
