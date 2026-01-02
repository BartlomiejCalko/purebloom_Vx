import { useEmotionalState } from "@/context/EmotionalStateContext";
import { getEmotionalInterpretation } from "@/utils/interpretationUtils";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeIn, useSharedValue, withTiming } from "react-native-reanimated";
import { EmotionalParticles } from "./EmotionalParticles";

export const HomeEmotionalMirrorSection = () => {
    const router = useRouter();
    // Read persisted global state
    const { state } = useEmotionalState();

    // Local shared values that mirror the global state for the Particles
    const intensity = useSharedValue(state.intensity);
    const valence = useSharedValue(state.valence);
    const heaviness = useSharedValue(state.heaviness);
    const chaos = useSharedValue(state.chaos);
    const energy = useSharedValue(state.energy);

    // Sync shared values when global state updates (e.g. returning from Mirror)
    useEffect(() => {
        intensity.value = withTiming(state.intensity, { duration: 1500 });
        valence.value = withTiming(state.valence, { duration: 1500 });
        heaviness.value = withTiming(state.heaviness, { duration: 1500 });
        chaos.value = withTiming(state.chaos, { duration: 1500 });
        energy.value = withTiming(state.energy, { duration: 1500 });
    }, [state]);

    const handlePress = () => {
        router.push("/emotional-mirror");
    };

    // Generate accurate interpretation based on current state
    const interpretationText = getEmotionalInterpretation(state);

    return (
        <View className="w-full flex-1 items-center justify-start space-y-6">
            <View className="w-full h-[320px] relative items-center justify-center rounded-3xl overflow-hidden bg-slate-900 border border-slate-800/50 shadow-lg shadow-black/40">
                <Pressable
                    onPress={handlePress}
                    className="flex-1 w-full bg-slate-900"
                    style={{ overflow: 'visible' }}
                >
                    <EmotionalParticles
                        intensity={intensity}
                        valence={valence}
                        heaviness={heaviness}
                        chaos={chaos}
                        energy={energy}
                        mode="passive"
                    />
                </Pressable>

                {/* Micro-interaction hint overlay - subtle */}
                <View className="absolute bottom-4 opacity-40 pointer-events-none">
                    <Text className="text-white/50 text-xs font-light tracking-widest uppercase">
                        Dotknij, aby zmienić
                    </Text>
                </View>
            </View>

            {/* Emotional Interpretation Text */}
            <View className="px-4 w-full items-center">
                <Animated.View
                    entering={FadeIn.duration(1000)}
                    key={interpretationText} // Re-animate when text changes
                >
                    <Text className="text-white/80 text-lg font-light text-center leading-relaxed font-[System]">
                        {interpretationText}
                    </Text>
                </Animated.View>
            </View>
        </View>
    );
};
