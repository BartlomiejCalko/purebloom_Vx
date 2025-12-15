import { useIsFocused } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

export function AnimatedScreen({ style, children, ...rest }: ViewProps) {
    const isFocused = useIsFocused();
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.98);

    useEffect(() => {
        if (isFocused) {
            opacity.value = withTiming(1, {
                duration: 700,
                easing: Easing.out(Easing.cubic)
            });
            scale.value = withTiming(1, {
                duration: 700,
                easing: Easing.out(Easing.cubic)
            });
        } else {
            // Reset values instantly or quickly when screen loses focus
            // so they are ready to animate IN again next time
            opacity.value = 0;
            scale.value = 0.98;
        }
    }, [isFocused]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }]
    }));

    return (
        <Animated.View
            style={[{ flex: 1 }, style, animatedStyle]}
            {...rest}
        >
            {children}
        </Animated.View>
    );
}
