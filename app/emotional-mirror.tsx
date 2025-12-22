import { EmotionalBlob } from "@/components/EmotionalBlob";
import { EmotionalSlider } from "@/components/EmotionalSlider";
import { useEmotionalState } from "@/context/EmotionalStateContext";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutDown, useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EmotionalMirrorScreen() {
    const router = useRouter();
    const { updateState } = useEmotionalState(); // Access context

    // Steps: 0=Intro, 1=Intensity, 2=Energy, 3=Tension, 4=Result
    const [step, setStep] = useState(0);
    const [showNextButton, setShowNextButton] = useState(false);

    // Initial values start at 0.5 (neutral) for the session
    const intensity = useSharedValue(0.5);
    const energy = useSharedValue(0.5);
    const tension = useSharedValue(0.0);
    const isTouched = useSharedValue(0);

    useEffect(() => {
        if (step === 0) {
            const timer = setTimeout(() => {
                setStep(1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    const handleSliderChange = () => {
        if (!showNextButton) setShowNextButton(true);
    };

    const nextStep = () => {
        setShowNextButton(false);
        setStep((s) => s + 1);
    };

    const handleSaveAndExit = () => {
        // SAVE STATE TO CONTEXT
        updateState({
            intensity: intensity.value,
            energy: energy.value,
            tension: tension.value,
        });

        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-950">
            {/* Top Area: Interactive Blob */}
            <View className="h-[55%] w-full items-center justify-center">
                <EmotionalBlob
                    intensity={intensity}
                    energy={energy}
                    tension={tension}
                    isTouched={isTouched}
                    mode="interactive" // Active mode!
                />
            </View>

            {/* Bottom Interaction Area */}
            <View className="flex-1 px-8 pt-4">

                {step === 0 && (
                    <Animated.View exiting={FadeOutDown.duration(400)} className="items-center">
                        <Text className="text-white text-2xl font-light text-center">
                            Zatrzymajmy się na chwilę.
                        </Text>
                    </Animated.View>
                )}

                {step === 1 && (
                    <Animated.View entering={FadeInUp.delay(300)} exiting={FadeOutDown}>
                        <EmotionalSlider
                            label="Jak intensywnie to teraz czujesz?"
                            value={intensity}
                            onChange={handleSliderChange}
                        />
                    </Animated.View>
                )}

                {step === 2 && (
                    <Animated.View entering={FadeInUp.delay(300)} exiting={FadeOutDown}>
                        <EmotionalSlider
                            label="Ile jest w Tobie energii?"
                            value={energy}
                            onChange={handleSliderChange}
                        />
                    </Animated.View>
                )}

                {step === 3 && (
                    <Animated.View entering={FadeInUp.delay(300)} exiting={FadeOutDown}>
                        <EmotionalSlider
                            label="Jak bardzo jesteś napięta / napięty?"
                            value={tension}
                            onChange={handleSliderChange}
                        />
                    </Animated.View>
                )}

                {step === 4 && (
                    <Animated.View entering={FadeInUp.delay(300)} className="items-center space-y-4">
                        <Text className="text-white/80 text-lg font-light text-center mb-6">
                            Twój obraz jest gotowy.
                        </Text>

                        <Pressable
                            className="w-full bg-indigo-500/20 py-4 rounded-2xl items-center active:bg-indigo-500/30 border border-indigo-500/30"
                            onPress={handleSaveAndExit}
                        >
                            <Text className="text-white font-medium">Zostań z tym</Text>
                        </Pressable>

                        <Pressable
                            className="w-full py-4 rounded-2xl items-center"
                            onPress={handleSaveAndExit}
                        >
                            <Text className="text-white/50">Wróć na Home</Text>
                        </Pressable>
                    </Animated.View>
                )}

                {step > 0 && step < 4 && showNextButton && (
                    <Animated.View entering={FadeInUp} className="mt-8 items-center">
                        <Pressable
                            className="bg-white/10 px-12 py-3 rounded-full active:bg-white/20"
                            onPress={nextStep}
                        >
                            <Text className="text-white font-medium">Dalej</Text>
                        </Pressable>
                    </Animated.View>
                )}

            </View>
        </SafeAreaView>
    );
}
