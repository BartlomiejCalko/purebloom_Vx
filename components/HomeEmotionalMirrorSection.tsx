import { useEmotionalState } from "@/context/EmotionalStateContext";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { EmotionalBlob } from "./EmotionalBlob";

export const HomeEmotionalMirrorSection = () => {
    const router = useRouter();
    // Read persisted global state
    const { state } = useEmotionalState();

    const isTouched = useSharedValue(0);
    // Local shared values that mirror the global state for the Blob
    const intensity = useSharedValue(state.intensity);
    const energy = useSharedValue(state.energy);
    const tension = useSharedValue(state.tension);

    // Sync shared values when global state updates (e.g. returning from Mirror)
    useEffect(() => {
        intensity.value = withTiming(state.intensity, { duration: 1500 }); // Smooth transition back to new state
        energy.value = withTiming(state.energy, { duration: 1500 });
        tension.value = withTiming(state.tension, { duration: 1500 });
    }, [state.intensity, state.energy, state.tension]);

    const handlePressIn = () => {
        isTouched.value = withTiming(1, { duration: 600 });
    };

    const handlePressOut = () => {
        isTouched.value = withTiming(0, { duration: 600 });
    };

    const handlePress = () => {
        router.push("/emotional-mirror");
    };

    return (
        <View
            className="w-full flex items-center justify-center pt-8"
            style={{ height: "60%" }}
        >
            <Pressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                className="flex-1 w-full items-center justify-center"
                style={{ overflow: 'visible' }}
            >
                <EmotionalBlob
                    intensity={intensity}
                    energy={energy}
                    tension={tension}
                    isTouched={isTouched}
                    mode="passive" // Explicitly passive mode for Home
                />
            </Pressable>

            {/* Micro-invitation text */}
            <View className="absolute bottom-4 opacity-60">
                <Text className="text-white/70 text-sm font-light tracking-widest text-center">
                    Dotknij, żeby sprawdzić swój stan
                </Text>
            </View>
        </View>
    );
};
