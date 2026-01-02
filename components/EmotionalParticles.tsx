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

    // Warm pastel colors (Pleasant - valence = 0)
    // Rich but soft peach, coral, warm pink palette - saturated but not garish
    const warmColors = useMemo(() => [
        "#F0A880", "#E88090", "#F0C080",  // Top row: rich peach, soft coral, golden cream
        "#E08898", "#E078A8", "#E0A878",  // Middle row: rose pink, orchid, warm amber
        "#D89060", "#E07058", "#D06088",  // Bottom row: burnt sienna, terracotta, raspberry
    ], []);

    // Cool pastel colors (Unpleasant - valence = 1)
    // Rich but soft lavender, mint, sky blue palette - saturated but not garish
    const coolColors = useMemo(() => [
        "#78C8A0", "#68A8C8", "#A888C8",  // Top row: rich mint, ocean blue, rich lavender
        "#58A8C8", "#8088C8", "#68B8A8",  // Middle row: teal blue, periwinkle, seafoam
        "#9878B8", "#68B0E0", "#88C888",  // Bottom row: amethyst, sky blue, spring green
    ], []);

    // Mesh grid points (3x3)
    const meshPoints = useMemo(() => [
        [0.0, 0.0], [0.5, 0.0], [1.0, 0.0],
        [0.0, 0.5], [0.5, 0.5], [1.0, 0.5],
        [0.0, 1.0], [0.5, 1.0], [1.0, 1.0],
    ], []);

    // Update gradient colors when valence changes
    // valence = 0 (Pleasant) → Warm colors
    // valence = 1 (Unpleasant) → Cool colors
    useEffect(() => {
        const updateColors = () => {
            const v = valence.value;
            const interpolatedColors = warmColors.map((warmColor, idx) => {
                const coolColor = coolColors[idx];
                return interpolateColor(warmColor, coolColor, v);
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

        // Gravity: h=0 (Lightness) → float up, h=1 (Heaviness) → fall down
        const gravity = (h - 0.35) * 800;
        // Energy affects Z speed: reduced from 1.5 to 0.8 for subtler effect
        const zSpeed = 0.1 + e * 0.8;
        
        // Chaos: c=0 (Stable) → low chaos, c=1 (Chaotic) → high chaos
        // Only affects movement irregularity, not speed
        // Higher chaos = more irregular but SLOWER movement
        const chaosAmount = c * 50;
        const chaosDampening = 1 - (c * 0.6); // At c=1, speed reduced to 40%

        // VALENCE COLOR INTERPOLATION (Bright Warm to Bright Cool)
        // Brighter, more saturated colors for better visibility against muted gradient
        // Pleasant (v=0) -> Bright Warm (Peach/Coral): rgb(255, 220, 200)
        // Neutral (v=0.5) -> Bright Neutral (Light Lavender): rgb(245, 230, 255)
        // Unpleasant (v=1) -> Bright Cool (Light Sky Blue): rgb(200, 235, 255)

        const cWarm = { r: 255, g: 220, b: 200 };   // Bright Peach/Coral (Pleasant)
        const cNeut = { r: 245, g: 230, b: 255 };   // Light Lavender (Neutral)
        const cCool = { r: 200, g: 235, b: 255 };   // Light Sky Blue (Unpleasant)

        let r, g, b;
        if (v < 0.5) {
            // Interpolate from Warm (v=0) to Neutral (v=0.5)
            const t = v * 2;
            r = cWarm.r + (cNeut.r - cWarm.r) * t;
            g = cWarm.g + (cNeut.g - cWarm.g) * t;
            b = cWarm.b + (cNeut.b - cWarm.b) * t;
        } else {
            // Interpolate from Neutral (v=0.5) to Cool (v=1)
            const t = (v - 0.5) * 2;
            r = cNeut.r + (cCool.r - cNeut.r) * t;
            g = cNeut.g + (cCool.g - cNeut.g) * t;
            b = cNeut.b + (cCool.b - cNeut.b) * t;
        }

        // Base radius depends on intensity
        const baseRadius = 3 + (i * 20);

        // Active particle count depends on intensity
        // i=0 -> MIN_PARTICLES, i=1 -> MAX_PARTICLES
        const activeCount = Math.floor(MIN_PARTICLES + (MAX_PARTICLES - MIN_PARTICLES) * i);

        const nextParticlesData: typeof particlesData.value = [];

        for (let idx = 0; idx < activeCount; idx++) {
            const p = initialParticles[idx];

            // 1. Z Movement with chaos variation (irregular depth changes, not faster)
            // Apply dampening so chaotic particles move slower
            const zChaosVariation = 1 + (Math.sin(time.value * 3 + p.phase) * c * 0.3);
            p.z -= zSpeed * dt * p.baseSpeed * zChaosVariation * chaosDampening;
            if (p.z <= 0.1) {
                p.z = 3.0;
                p.x = (Math.random() - 0.5) * W * 2;
                p.y = (Math.random() - 0.5) * H * 2;
            }

            // 2. Y Movement with chaotic direction changes (irregular, not faster)
            // Energy multiplier controls speed, chaos dampens it
            const energyMultiplier = (0.4 + e * 1.0) * chaosDampening;
            // Add irregular direction changes when chaotic (slow oscillations)
            const chaosDirectionFlip = c > 0.4 ? Math.sin(time.value * 2 + p.noiseOffsetY) * c * 0.6 : 0;
            p.y += gravity * dt * energyMultiplier * (1 + chaosDirectionFlip);
            
            // Irregular X drift when chaotic (slow, wandering movement)
            const chaosDriftX = Math.sin(time.value * 1.5 + p.noiseOffsetX) * c * 60 * dt;
            p.x += chaosDriftX;

            if (p.y > H) p.y = -H;
            if (p.y < -H) p.y = H;

            // 3. Noise and Chaos - irregular but SLOW movement
            // Base oscillation (slow, flowing)
            const baseNoiseX = Math.sin(time.value * 1.2 + p.phase + p.noiseOffsetX);
            const baseNoiseY = Math.cos(time.value * 1.2 + p.phase + p.noiseOffsetY);
            
            // Additional chaotic layers - slow frequencies for dreamlike irregularity
            const chaosFactor = c; // 0 = stable, 1 = chaotic
            const irregularOscillation = Math.sin(time.value * 2.5 + p.phase * 3) * chaosFactor;
            const erraticJitter = Math.sin(time.value * 4 + p.noiseOffsetX * 2) * chaosFactor * 0.4;
            
            // Combined noise - irregular pattern, calm tempo
            const noiseX = (baseNoiseX + irregularOscillation + erraticJitter) * chaosAmount;
            const noiseY = (baseNoiseY + irregularOscillation * 0.7 - erraticJitter) * chaosAmount;

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
