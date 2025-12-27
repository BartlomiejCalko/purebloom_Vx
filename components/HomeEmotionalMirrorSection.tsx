import { useEmotionalState } from "@/context/EmotionalStateContext";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { EmotionalParticles } from "./EmotionalParticles";

export const HomeEmotionalMirrorSection = () => {
    const router = useRouter();
    // Read persisted global state
    const { state } = useEmotionalState();

    // Local shared values that mirror the global state for the Blob
    const intensity = useSharedValue(state.intensity);
    const valence = useSharedValue(state.valence);
    const heaviness = useSharedValue(state.heaviness);
    const stability = useSharedValue(state.stability);
    const energy = useSharedValue(state.energy);

    // Sync shared values when global state updates (e.g. returning from Mirror)
    useEffect(() => {
        intensity.value = withTiming(state.intensity, { duration: 1500 });
        valence.value = withTiming(state.valence, { duration: 1500 });
        heaviness.value = withTiming(state.heaviness, { duration: 1500 });
        stability.value = withTiming(state.stability, { duration: 1500 });
        energy.value = withTiming(state.energy, { duration: 1500 });
    }, [state]);

    const handlePress = () => {
        router.push("/emotional-mirror");
    };

    return (
        <View
            className="w-full relative items-center justify-center"
            style={{ height: "45%" }}
        >
            <Pressable
                onPress={handlePress}
                className="flex-1 w-full bg-slate-900"
                style={{ overflow: 'visible' }}
            >
                <EmotionalParticles
                    intensity={intensity}
                    valence={valence}
                    heaviness={heaviness}
                    stability={stability}
                    energy={energy}
                    mode="passive"
                />
            </Pressable>

            {/* Micro-invitation text */}
            <View className="opacity-60 absolute" style={{ marginBottom: -280 }}>
                <Text className="text-white/70 text-md font-light tracking-tighter text-center">
                    Twoje emocje są widoczne
                </Text>
            </View>
        </View>
    );
};
