import React from "react";
import { LayoutChangeEvent, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    SharedValue,
    useAnimatedStyle,
    useSharedValue
} from "react-native-reanimated";

interface EmotionalSliderProps {
    label: string;
    leftLabel?: string;
    rightLabel?: string;
    value: SharedValue<number>; // 0 to 1
    onChange?: (val: number) => void;
    onComplete?: () => void; // Called when user releases interaction
}

export const EmotionalSlider: React.FC<EmotionalSliderProps> = ({
    label,
    leftLabel,
    rightLabel,
    value,
    onChange,
    onComplete,
}) => {
    const width = useSharedValue(0);

    const pan = Gesture.Pan()
        .onUpdate((e) => {
            if (width.value === 0) return;
            // Calculate new value based on touch position relative to width
            // We assume the slider starts at x=0 in its local container
            let newValue = e.x / width.value;

            // Clamp
            if (newValue < 0) newValue = 0;
            if (newValue > 1) newValue = 1;

            value.value = newValue;

            if (onChange) {
                runOnJS(onChange)(newValue);
            }
        })
        .onEnd(() => {
            if (onComplete) {
                runOnJS(onComplete)();
            }
        });

    const animatedThumbStyle = useAnimatedStyle(() => {
        return {
            left: `${value.value * 100}%`,
            transform: [{ translateX: -12 }], // center thumb (w-6 = 24px, half is 12)
        };
    });

    const animatedFillStyle = useAnimatedStyle(() => {
        return {
            width: `${value.value * 100}%`,
        };
    });

    return (
        <View className="w-full my-4">
            <Text className="text-white/80 text-lg font-light mb-4 ml-1">{label}</Text>

            <GestureDetector gesture={pan}>
                <View
                    className="w-full h-12 justify-center" // Touch target taller than visual track
                    onLayout={(e: LayoutChangeEvent) => {
                        width.value = e.nativeEvent.layout.width;
                    }}
                >
                    {/* Track Background */}
                    <View className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        {/* Active Fill */}
                        <Animated.View className="h-full bg-indigo-400/80" style={animatedFillStyle} />
                    </View>

                    {/* Thumb */}
                    <Animated.View
                        className="absolute w-6 h-6 bg-white rounded-full shadow-lg shadow-indigo-500/50"
                        style={animatedThumbStyle}
                    />
                </View>
            </GestureDetector>

            <View className="flex-row justify-between mt-1 px-1">
                <Text className="text-white/40 text-xs">{leftLabel}</Text>
                <Text className="text-white/40 text-xs">{rightLabel}</Text>
            </View>
        </View>
    );
};
