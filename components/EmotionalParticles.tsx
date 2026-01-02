import { Canvas, Circle } from "@shopify/react-native-skia";
import { MeshGradientView } from "expo-mesh-gradient";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { SharedValue, useDerivedValue, useFrameCallback, useSharedValue } from "react-native-reanimated";

interface EmotionalParticlesProps {
    intensity: SharedValue<number>;
    valence: SharedValue<number>;
    heaviness: SharedValue<number>;
    chaos: SharedValue<number>;
    energy: SharedValue<number>;
    mode?: "passive" | "interactive";
}

// Maximum particles at full intensity
const MAX_PARTICLES = 40;
// Minimum particles at lowest intensity
const MIN_PARTICLES = 8;
// Default dimensions (will be updated by onLayout)
let SCREEN_WIDTH = Dimensions.get("window").width;
let SCREEN_HEIGHT = Dimensions.get("window").height;

// Helper function to interpolate between two hex colors
const interpolateColor = (color1: string, color2: string, t: number): string => {
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        } : { r: 0, g: 0, b: 0 };
    };

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);

    return `rgb(${r}, ${g}, ${b})`;
};

// Particle render data interface
interface ParticleRenderData {
    x: number;
    y: number;
    color: string;
    radius: number;
}

// Individual particle circle component with derived values
interface ParticleCircleProps {
    index: number;
    particlesData: SharedValue<ParticleRenderData[]>;
}

const ParticleCircle: React.FC<ParticleCircleProps> = ({ index, particlesData }) => {
    const cx = useDerivedValue(() => particlesData.value[index]?.x ?? 0);
    const cy = useDerivedValue(() => particlesData.value[index]?.y ?? 0);
    // If particle data doesn't exist (inactive), radius = 0 (invisible)
    const r = useDerivedValue(() => particlesData.value[index]?.radius ?? 0);
    const color = useDerivedValue(() => particlesData.value[index]?.color ?? "transparent");

    return <Circle cx={cx} cy={cy} r={r} color={color} />;
};

// Generate initial random state for particles in 3D space
const createInitialParticles = () => {
    return Array.from({ length: MAX_PARTICLES }).map(() => ({
        // World coordinates centered at 0,0
        x: (Math.random() - 0.5) * SCREEN_WIDTH * 2,
        y: (Math.random() - 0.5) * SCREEN_HEIGHT * 2,
        z: Math.random() * 2 + 1, // Depth: 1 to 3

        baseSpeed: Math.random() * 0.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
        noiseOffsetX: Math.random() * 100,
        noiseOffsetY: Math.random() * 100,
    }));
};

export const EmotionalParticles: React.FC<EmotionalParticlesProps> = ({
    intensity,
    valence,
    heaviness,
    chaos,
    energy,
    mode = "interactive",
}) => {
    const [dims, setDims] = useState({ width: SCREEN_WIDTH, height: 400 });
    const initialParticles = useMemo(() => createInitialParticles(), []);

    // Gradient colors state - interpolated based on valence
    const [gradientColors, setGradientColors] = useState<string[]>([]);

    // Cool pastel colors (Unpleasant - valence = 0, LEFT side)
    // Rich but soft lavender, mint, sky blue palette
    const coolColors = useMemo(() => [
        "#78C8A0", "#68A8C8", "#A888C8",  // Top row: rich mint, ocean blue, rich lavender
        "#58A8C8", "#8088C8", "#68B8A8",  // Middle row: teal blue, periwinkle, seafoam
        "#9878B8", "#68B0E0", "#88C888",  // Bottom row: amethyst, sky blue, spring green
    ], []);

    // Warm pastel colors (Pleasant - valence = 1, RIGHT side)
    // Rich but soft peach, coral, warm pink palette
    const warmColors = useMemo(() => [
        "#F0A880", "#E88090", "#F0C080",  // Top row: rich peach, soft coral, golden cream
        "#E08898", "#E078A8", "#E0A878",  // Middle row: rose pink, orchid, warm amber
        "#D89060", "#E07058", "#D06088",  // Bottom row: burnt sienna, terracotta, raspberry
    ], []);

    // Mesh grid points (3x3)
    const meshPoints = useMemo(() => [
        [0.0, 0.0], [0.5, 0.0], [1.0, 0.0],
        [0.0, 0.5], [0.5, 0.5], [1.0, 0.5],
        [0.0, 1.0], [0.5, 1.0], [1.0, 1.0],
    ], []);

    // Update gradient colors when valence changes
    // valence = 0 (Unpleasant/LEFT) → Cool colors
    // valence = 1 (Pleasant/RIGHT) → Warm colors
    useEffect(() => {
        const updateColors = () => {
            const v = valence.value;
            const interpolatedColors = coolColors.map((coolColor, idx) => {
                const warmColor = warmColors[idx];
                return interpolateColor(coolColor, warmColor, v);
            });
            setGradientColors(interpolatedColors);
        };

        // Initial update
        updateColors();

        // Set up interval to sync with valence changes
        const interval = setInterval(updateColors, 50);
        return () => clearInterval(interval);
    }, [valence, warmColors, coolColors]);

    // SHARED VALUES FOR RENDERING
    // Store particle render data: position, color, and radius
    const particlesData = useSharedValue<ParticleRenderData[]>([]);
    const time = useSharedValue(0);

    useFrameCallback((frameInfo) => {
        if (!frameInfo.timeSincePreviousFrame) return;
        const dt = frameInfo.timeSincePreviousFrame / 1000;
        time.value += dt;

        const W = dims.width;
        const H = dims.height;
        const CX = W / 2;
        const CY = H / 2;

        const i = intensity.value;
        const v = valence.value; // 0 (Pleasant) to 1 (Unpleasant)
        const h = heaviness.value;
        const c = chaos.value;   // 0 (Stable) to 1 (Chaotic)
        const e = energy.value;

        // Gravity: centered at 0.5 (no vertical movement)
        // h=0 (left "Lekko, unosi") → strong UP
        // h=0.5 (middle) → NO vertical movement
        // h=1 (right "Ciężko, ciągnie") → strong DOWN
        const gravity = (h - 0.5) * 600;
        
        // === ENERGY: Controls ONLY speed ===
        // e=0 (left) → slow, e=1 (right) → fast
        const speedMultiplier = 0.2 + e * 1.2; // Range: 0.2 to 1.4
        const zSpeed = 0.1 + e * 0.9;          // Z depth speed: 0.1 to 1.0
        
        // === CHAOS: Controls ONLY irregularity (NOT speed) ===
        // c=0 (left) → smooth/stable, c=1 (right) → erratic/irregular
        const chaosAmount = c * 50; // Noise amplitude for position jitter

        // VALENCE COLOR INTERPOLATION (Cool to Warm for particles)
        // v=0 (Unpleasant/LEFT) → Cool (Light Sky Blue)
        // v=0.5 (Neutral) → Light Lavender
        // v=1 (Pleasant/RIGHT) → Warm (Peach/Coral)

        const cCool = { r: 200, g: 235, b: 255 };   // Light Sky Blue (Unpleasant)
        const cNeut = { r: 245, g: 230, b: 255 };   // Light Lavender (Neutral)
        const cWarm = { r: 255, g: 220, b: 200 };   // Bright Peach/Coral (Pleasant)

        let r, g, b;
        if (v < 0.5) {
            // Interpolate from Cool (v=0) to Neutral (v=0.5)
            const t = v * 2;
            r = cCool.r + (cNeut.r - cCool.r) * t;
            g = cCool.g + (cNeut.g - cCool.g) * t;
            b = cCool.b + (cNeut.b - cCool.b) * t;
        } else {
            // Interpolate from Neutral (v=0.5) to Warm (v=1)
            const t = (v - 0.5) * 2;
            r = cNeut.r + (cWarm.r - cNeut.r) * t;
            g = cNeut.g + (cWarm.g - cNeut.g) * t;
            b = cNeut.b + (cWarm.b - cNeut.b) * t;
        }

        // Base radius depends on intensity
        const baseRadius = 3 + (i * 20);

        // Active particle count depends on intensity
        // i=0 -> MIN_PARTICLES, i=1 -> MAX_PARTICLES
        const activeCount = Math.floor(MIN_PARTICLES + (MAX_PARTICLES - MIN_PARTICLES) * i);

        const nextParticlesData: typeof particlesData.value = [];

        for (let idx = 0; idx < activeCount; idx++) {
            const p = initialParticles[idx];

            // 1. Z Movement - speed controlled by ENERGY only
            // Chaos adds slight variation to timing (not speed)
            const zTimingVariation = 1 + (Math.sin(time.value * 2 + p.phase) * c * 0.2);
            p.z -= zSpeed * dt * p.baseSpeed * zTimingVariation;
            if (p.z <= 0.1) {
                p.z = 3.0;
                p.x = (Math.random() - 0.5) * W * 2;
                p.y = (Math.random() - 0.5) * H * 2;
            }

            // 2. Y Movement - speed controlled by ENERGY, direction by CHAOS
            // Energy controls how fast particles fall/rise
            p.y += gravity * dt * speedMultiplier;
            
            // Chaos adds irregular direction wobble (doesn't change speed)
            const chaosWobbleY = Math.sin(time.value * 2 + p.noiseOffsetY) * c * 0.5;
            p.y += chaosWobbleY;
            
            // Chaos adds irregular X drift (wandering, not speeding)
            const chaosWobbleX = Math.sin(time.value * 1.5 + p.noiseOffsetX) * c * 40 * dt;
            p.x += chaosWobbleX;

            if (p.y > H) p.y = -H;
            if (p.y < -H) p.y = H;

            // 3. Position noise - CHAOS controls irregularity only (not speed)
            // Base smooth oscillation
            const baseNoiseX = Math.sin(time.value * 1.0 + p.phase + p.noiseOffsetX);
            const baseNoiseY = Math.cos(time.value * 1.0 + p.phase + p.noiseOffsetY);
            
            // Chaos adds irregular patterns (erratic path, not faster)
            const irregularPattern = Math.sin(time.value * 2 + p.phase * 3) * c;
            const erraticJitter = Math.sin(time.value * 3 + p.noiseOffsetX * 2) * c * 0.3;
            
            // Combined noise - chaos increases amplitude of irregularity
            const noiseX = (baseNoiseX + irregularPattern + erraticJitter) * chaosAmount;
            const noiseY = (baseNoiseY + irregularPattern * 0.7 - erraticJitter) * chaosAmount;

            // Project
            const scale = 1.0 / p.z;
            const px = ((p.x + noiseX) * scale) + CX;
            const py = ((p.y + noiseY) * scale) + CY;

            // Radius scales with depth
            const radius = baseRadius * scale;

            // Alpha and Blink
            // Base alpha depends on depth (z) - fade in/out at extremes
            let alpha = 1.0;
            if (p.z > 2.5) alpha = (3.0 - p.z) * 2;
            if (p.z < 0.5) alpha = p.z * 2;
            alpha = Math.max(0, Math.min(1, alpha));

            // Blink effect: oscillates between 0.85 and 1.0 (subtle blink, more opaque)
            const blink = 0.9 + 0.15 * Math.sin(time.value * 3 + p.phase);
            
            // Final alpha - minimum 0.6 to ensure particles are always visible
            const finalAlpha = Math.max(0.9, alpha * blink);

            // Construct rgba color string
            const color = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${finalAlpha})`;

            nextParticlesData.push({ x: px, y: py, color, radius });
        }

        // Force redraw by providing new array reference
        particlesData.value = nextParticlesData;
    });

    return (
        <View
            style={styles.container}
            onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                setDims({ width, height });
            }}
        >
            {/* MeshGradient Background - iOS only */}
            {Platform.OS === "ios" && gradientColors.length === 9 && (
                <MeshGradientView
                    style={StyleSheet.absoluteFill}
                    columns={3}
                    rows={3}
                    colors={gradientColors}
                    points={meshPoints}
                    smoothsColors={true}
                    ignoresSafeArea={true}
                />
            )}

            {/* Fallback gradient for Android - simple linear gradient effect */}
            {Platform.OS === "android" && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: gradientColors[4] || "#D4C4E8" }]} />
            )}

            {/* Canvas for particles */}
            <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
                {/* Particle Circles */}
                {Array.from({ length: MAX_PARTICLES }).map((_, idx) => (
                    <ParticleCircle key={idx} index={idx} particlesData={particlesData} />
                ))}
            </Canvas>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a2e",
    },
});
