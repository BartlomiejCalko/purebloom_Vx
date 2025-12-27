import {
    Canvas,
    Points,
    Skia,
    vec
} from "@shopify/react-native-skia";
import React, { useEffect, useMemo } from "react";
import { useWindowDimensions } from "react-native";
import {
    Easing,
    SharedValue,
    interpolate,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

interface EmotionalBlobProps {
    intensity: SharedValue<number>; // 0 (Low) -> 1 (High)
    valence: SharedValue<number>;   // 0 (Unpleasant) -> 1 (Pleasant)
    heaviness: SharedValue<number>; // 0 (Heavy) -> 1 (Light)
    stability: SharedValue<number>; // 0 (Chaos) -> 1 (Stable)
    energy: SharedValue<number>;    // 0 (Low) -> 1 (High)
    mode?: 'passive' | 'interactive';
}

export const EmotionalBlob: React.FC<EmotionalBlobProps> = ({
    intensity,
    valence,
    heaviness,
    stability,
    energy,
    mode = 'passive',
}) => {
    const { width, height } = useWindowDimensions();
    const time = useSharedValue(0);

    // CONSTANTS
    const NUM_SMALL_STARS = 100;
    const NUM_LARGE_STARS = 40;

    // Initialize random star properties efficiently using useMemo
    const initialParticles = useMemo(() => {
        const generate = (count: number) => new Array(count).fill(0).map(() => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5, // Natural drift X
            vy: (Math.random() - 0.5) * 0.5, // Natural drift Y
            phase: Math.random() * Math.PI * 2,
        }));
        return {
            small: generate(NUM_SMALL_STARS),
            large: generate(NUM_LARGE_STARS)
        };
    }, [width, height]);

    useEffect(() => {
        time.value = withRepeat(
            withTiming(100000, { duration: 100000 * 16, easing: Easing.linear }),
            -1
        );
    }, []);

    // Worklet to process particle physics
    const processParticles = (
        particles: typeof initialParticles.small,
        baseSize: number
    ) => {
        "worklet";
        const t = time.value;
        const ener = energy.value;
        const heavy = heaviness.value;
        const stab = stability.value;
        const inten = intensity.value;
        const val = valence.value;

        // MAPPINGS - DRASTICALLY BOOSTED FOR VISIBILITY

        // Speed: 0 -> Slow Drift, 1 -> Very Fast
        // Multiplier increased to 15x to ensure visible speed changes
        const speedMult = interpolate(ener, [0, 1], [0.5, 15]);

        // Gravity: 0 (Heavy) -> Fall Fast, 0.5 -> Float, 1 (Light) -> Rise Fast
        // Increased range from +/-2 to +/-8
        const gravity = interpolate(heavy, [0, 0.5, 1], [8, 0, -8]);

        // Chaos: 0 -> High Jitter, 1 -> Smooth
        // Increased max jitter to 20px
        const chaos = interpolate(stab, [0, 1], [20, 0]);

        // Max opacity based on intensity (0 -> 0.2, 1 -> 1.0)
        // Ensure at least 0.2 visibility so they don't disappear completely
        const maxOpacity = interpolate(inten, [0, 1], [0.2, 1.0]);

        // STRICTLY WHITE COLOR (255, 255, 255)
        // Ignoring valence for color tint as requested
        const r = 255;
        const g = 255;
        const b = 255;

        const vecPositions: ReturnType<typeof vec>[] = [];
        const colors: Float32Array[] = [];

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // 1. MOVEMENT
            // Chaos offset on X
            const offsetX = Math.sin(t * 0.1 + p.phase) * chaos;

            // Continuous movement driven by time 't'
            const distY = t * (gravity + p.vy * speedMult);
            const distX = t * (p.vx * speedMult);

            let x = (p.x + distX + offsetX) % width;
            let y = (p.y + distY) % height;

            // Handle wrap-around
            if (x < 0) x += width;
            if (y < 0) y += height;

            vecPositions.push(vec(x, y));

            // 2. BLINKING / OPACITY
            // Twinkle speed affected by energy
            const twinkleSpeed = 1 + (ener * 5);
            // Sine wave 0..1
            const twinkle = (Math.sin(t * twinkleSpeed + p.phase) + 1) / 2;

            // Stability smooths out twinkle (Stable = less flickering)
            const stableFactor = interpolate(stab, [0, 1], [0, 0.9]);

            // Final Alpha Calculation
            const alpha = (stableFactor + twinkle * (1 - stableFactor)) * maxOpacity;

            // Push white color with calculated alpha
            colors.push(Skia.Color(r, g, b, alpha));
        }

        return { positions: vecPositions, colors };
    };

    const smallStars = useDerivedValue(() => processParticles(initialParticles.small, 2));
    const largeStars = useDerivedValue(() => processParticles(initialParticles.large, 4));

    return (
        <Canvas style={{ width, height }} pointerEvents="none">
            {/* Small Stars */}
            <Points
                points={smallStars.value.positions}
                colors={smallStars.value.colors}
                mode="points"
                strokeWidth={3}
                style="stroke"
                strokeCap="round"
            />

            {/* Large Stars */}
            <Points
                points={largeStars.value.positions}
                colors={largeStars.value.colors}
                mode="points"
                strokeWidth={6}
                style="stroke"
                strokeCap="round"
            />
        </Canvas>
    );
};
