import {
    Blur,
    Canvas,
    Group,
    Path,
    RadialGradient,
    Skia,
    vec
} from "@shopify/react-native-skia";
import React, { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import {
    Easing,
    SharedValue,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

// Configuration
const N_POINTS = 12;
const RADIUS_BASE = 120;

const buildSmoothPath = (points: { x: number, y: number }[]) => {
    "worklet";
    const path = Skia.Path.Make();
    if (points.length === 0) return path;
    const getPt = (idx: number) => points[(idx + N_POINTS) % N_POINTS];
    const p0 = getPt(0);
    const pLast = getPt(N_POINTS - 1);
    const midX = (p0.x + pLast.x) / 2;
    const midY = (p0.y + pLast.y) / 2;
    path.moveTo(midX, midY);
    for (let i = 0; i < N_POINTS; i++) {
        const pCurrent = getPt(i);
        const pNext = getPt(i + 1);
        const midNextX = (pCurrent.x + pNext.x) / 2;
        const midNextY = (pCurrent.y + pNext.y) / 2;
        path.quadTo(pCurrent.x, pCurrent.y, midNextX, midNextY);
    }
    path.close();
    return path;
}

interface EmotionalBlobProps {
    intensity?: SharedValue<number>; // 0-1
    energy?: SharedValue<number>;    // 0-1
    tension?: SharedValue<number>;   // 0-1
    isTouched?: SharedValue<number>; // 0-1
    mode?: 'passive' | 'interactive';
}

export const EmotionalBlob: React.FC<EmotionalBlobProps> = ({
    intensity,
    energy,
    tension,
    isTouched,
    mode = 'passive',
}) => {
    const { width } = useWindowDimensions();
    const height = 400;
    const cx = width / 2;
    const cy = height / 2;

    // Defaults
    const defaultIntensity = useSharedValue(0.5);
    const defaultEnergy = useSharedValue(0.5);
    const defaultTension = useSharedValue(0.0);
    const defaultIsTouched = useSharedValue(0);

    const activeIntensity = intensity || defaultIntensity;
    const activeEnergy = energy || defaultEnergy;
    const activeTension = tension || defaultTension;
    const activeIsTouched = isTouched || defaultIsTouched;

    const time = useSharedValue(0);

    useEffect(() => {
        time.value = withRepeat(
            withTiming(10000, { duration: 10000000, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    // --- LAYER 1: CORE (The "Self", Intensity) ---
    // Solid, heavy, breathes slowly. Reacts to INTENSITY.
    const createCorePath = (t: number, inten: number, touch: number, modeStr: string) => {
        "worklet";
        // Core speed is slow, stable.
        const speed = t * 0.4;

        // Core amplitude maps to INTENSITY.
        // Passive: 10 + (inten * 20) -> subtler
        // Interactive: 10 + (inten * 50) -> perceptible pulsing
        let amp = 10 + (inten * 50);
        if (modeStr === 'passive') amp = 10 + (inten * 20);

        const rBase = RADIUS_BASE * 0.9; // Slightly smaller base for core
        const points: { x: number; y: number }[] = [];

        for (let i = 0; i < N_POINTS; i++) {
            const angle = (i / N_POINTS) * Math.PI * 2;
            // Simple organic breathing
            let r = rBase + Math.sin(speed + i * 1.5) * (amp * 0.6)
                + Math.cos(speed * 0.8 + i * 2.5) * (amp * 0.4);

            // Touch interaction: Swelling
            r += touch * 10;

            points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
        }
        return buildSmoothPath(points);
    };

    // --- LAYER 2: FLOW (The "Energy", Movement) ---
    // Ethereal, flowing around core. Reacts to ENERGY.
    const createFlowPath = (t: number, ener: number, touch: number, modeStr: string) => {
        "worklet";
        // Energy maps to SPEED and ROTATION.
        // Low energy: 0.2x speed, drifting.
        // High energy: 2.0x speed, swirling.
        let speedMult = 0.3 + (ener * 2.5);
        if (modeStr === 'passive') speedMult = 0.3 + (ener * 1.0); // Calmer on home

        const speed = t * speedMult * (1 - touch * 0.5); // Slow down on touch

        // Amplitude is constant-ish, just flowing visually
        const amp = 30;

        const rBase = RADIUS_BASE * 1.1; // Larger than core
        const points: { x: number; y: number }[] = [];

        // Phase shift based on time to simulate rotation
        const rotationOffset = speed * 0.5;

        for (let i = 0; i < N_POINTS; i++) {
            const angle = (i / N_POINTS) * Math.PI * 2 + rotationOffset;

            // More complex wave function for "liquid" feel
            let r = rBase + Math.sin(speed + i * 2.0) * (amp * 0.7)
                + Math.sin(speed * 1.5 - i * 3.0) * (amp * 0.5);

            r += touch * 20;

            points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
        }
        return buildSmoothPath(points);
    };

    // --- LAYER 3: TENSION (The "Shell", Jitter) ---
    // Outline, erratic. Reacts to TENSION.
    const createTensionPath = (t: number, tens: number, touch: number, modeStr: string) => {
        "worklet";
        // Only visible/active if there IS tension
        // If tension is 0, it wraps perfectly around core/flow or disappears.

        let jitterAmount = tens * 25; // 0 to 25px jitter
        if (modeStr === 'passive') jitterAmount = tens * 10;

        const speed = t * 1.5; // Fast jitter frequency
        const rBase = RADIUS_BASE * 1.05;

        const points: { x: number; y: number }[] = [];

        for (let i = 0; i < N_POINTS; i++) {
            const angle = (i / N_POINTS) * Math.PI * 2;

            let r = rBase;

            // Base movement matches Core slightly to stay attached
            r += Math.sin(t * 0.4 + i * 1.5) * 15;

            // JITTER COMPONENT
            // High frequency noise
            if (jitterAmount > 0.5) {
                const noise = Math.sin(speed * 8.0 + i * 43.0) * Math.cos(speed * 3.0 + i * 17.0);
                r += noise * jitterAmount;
            }

            r += touch * 15;
            points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
        }
        return buildSmoothPath(points);
    };


    // Derived Paths
    const corePath = useDerivedValue(() => createCorePath(time.value, activeIntensity.value, activeIsTouched.value, mode));
    const flowPath = useDerivedValue(() => createFlowPath(time.value, activeEnergy.value, activeIsTouched.value, mode));
    const tensionPath = useDerivedValue(() => createTensionPath(time.value, activeTension.value, activeIsTouched.value, mode));

    // Derived Opacities for Balance
    const tensionOpacity = useDerivedValue(() => activeTension.value * 0.8); // 0 -> 0.8
    const flowOpacity = useDerivedValue(() => 0.4 + activeEnergy.value * 0.3); // More energy = more visible flow

    return (
        <Canvas style={{ width, height }} pointerEvents="none">

            {/* 1. FLOW LAYER (Back) - The Energy Field */}
            <Group opacity={flowOpacity}>
                <Path path={flowPath}>
                    <RadialGradient
                        c={vec(cx, cy)}
                        r={RADIUS_BASE * 1.5}
                        colors={["#A78BFA", "#818CF8", "#6366F1"]}
                        positions={[0, 0.6, 1]}
                    />
                    <Blur blur={20} />
                </Path>
            </Group>

            {/* 2. CORE LAYER (Middle) - The Weight/Self */}
            <Path path={corePath}>
                <RadialGradient
                    c={vec(cx - 30, cy - 30)}
                    r={RADIUS_BASE * 1.2}
                    colors={["#E9D5FF", "#A78BFA", "#7C3AED"]} // Deep, solid core
                    positions={[0, 0.5, 1]}
                />
                <Blur blur={4} />
            </Path>

            {/* 3. TENSION LAYER (Overlay) - The Friction */}
            {/* Renders as a stroke/outline that gets jagged */}
            <Group opacity={tensionOpacity}>
                <Path
                    path={tensionPath}
                    color="#312E81" // Dark indigo stroke
                    style="stroke"
                    strokeWidth={3}
                    opacity={0.6}
                >
                    <Blur blur={2} />
                </Path>
                {/* Inner jagged shadow for anxiety feel */}
                <Path path={tensionPath} style="stroke" strokeWidth={1} color="#1E1B4B" opacity={0.4} />
            </Group>

            {/* 4. Touch/Interactive Highlights (Top) */}
            <Path
                path={corePath}
                opacity={useDerivedValue(() => 0.2 + activeIsTouched.value * 0.5)}
                style="stroke"
                strokeWidth={2}
                color="white"
            >
                <Blur blur={4} />
            </Path>

        </Canvas>
    );
};
