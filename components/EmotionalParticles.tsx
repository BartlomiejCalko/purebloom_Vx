import { Canvas, Circle, Image, useImage } from "@shopify/react-native-skia";
import React, { useMemo } from "react";
import { Dimensions, View } from "react-native";
import { SharedValue, useDerivedValue, useFrameCallback, useSharedValue } from "react-native-reanimated";

interface EmotionalParticlesProps {
    intensity: SharedValue<number>;
    valence: SharedValue<number>;
    heaviness: SharedValue<number>;
    stability: SharedValue<number>;
    energy: SharedValue<number>;
    mode?: "passive" | "interactive";
}

const MAX_PARTICLES = 20;
// Default dimensions (will be updated by onLayout)
let SCREEN_WIDTH = Dimensions.get("window").width;
let SCREEN_HEIGHT = Dimensions.get("window").height;

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
    const r = useDerivedValue(() => particlesData.value[index]?.radius ?? 10);
    const color = useDerivedValue(() => particlesData.value[index]?.color ?? "rgba(255, 200, 180, 0.8)");

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
    stability,
    energy,
    mode = "interactive",
}) => {
    const [dims, setDims] = React.useState({ width: SCREEN_WIDTH, height: 400 });
    const initialParticles = useMemo(() => createInitialParticles(), []);

    // Load background images
    const warmWaves = useImage(require("../assets/images/cieple_fale.jpg"));
    const neutralWaves = useImage(require("../assets/images/neutralne_fale.jpg"));
    const unpleasantWaves = useImage(require("../assets/images/nieprzyjemne_fale.jpg"));

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
        const s = stability.value;
        const e = energy.value;

        // Intensity mapping
        // With MAX_PARTICLES=20, we can use most of them or vary size
        const activeCount = MAX_PARTICLES;

        const gravity = (0.65 - h) * 800;
        const zSpeed = 0.1 + e * 1.5;
        const chaos = (1 - s) * 25;

        // VALENCE COLOR INTERPOLATION (Pastel Warm to Pastel Cool)
        // Pleasant (v=0) -> Pastel Warm (Soft Peach/Coral): rgb(255, 200, 180)
        // Neutral (v=0.5) -> Pastel Neutral (Soft Lavender): rgb(230, 210, 240)
        // Unpleasant (v=1) -> Pastel Cool (Soft Sky Blue): rgb(180, 210, 235)

        const cWarm = { r: 255, g: 200, b: 180 };   // Soft Peach/Coral (Pleasant)
        const cNeut = { r: 230, g: 210, b: 240 };   // Soft Lavender (Neutral)
        const cCool = { r: 180, g: 210, b: 235 };   // Soft Sky Blue (Unpleasant)

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
        const baseRadius = 3 + (i * 27);

        const nextParticlesData: typeof particlesData.value = [];

        for (let idx = 0; idx < MAX_PARTICLES; idx++) {
            const p = initialParticles[idx];

            // 1. Z Movement
            p.z -= zSpeed * dt * p.baseSpeed;
            if (p.z <= 0.1) {
                p.z = 3.0;
                p.x = (Math.random() - 0.5) * W * 2;
                p.y = (Math.random() - 0.5) * H * 2;
            }

            // 2. Y Movement
            const energyMultiplier = 0.3 + e * 1.7;
            p.y += gravity * dt * energyMultiplier;

            if (p.y > H) p.y = -H;
            if (p.y < -H) p.y = H;

            // 3. Noise
            const noiseX = Math.sin(time.value * 2 + p.phase + p.noiseOffsetX) * chaos * energyMultiplier;
            const noiseY = Math.cos(time.value * 2 + p.phase + p.noiseOffsetY) * chaos * energyMultiplier;

            // Project
            const scale = 1.0 / p.z;
            const px = ((p.x + noiseX) * scale) + CX;
            const py = ((p.y + noiseY) * scale) + CY;

            // Radius scales with depth
            const radius = baseRadius * scale;

            // Alpha and Blink
            let alpha = 1.0;
            if (p.z > 2.5) alpha = (3.0 - p.z) * 2;
            if (p.z < 0.5) alpha = p.z * 2;
            alpha = Math.max(0, Math.min(1, alpha));

            const blink = 0.7 + 0.3 * Math.sin(time.value * 3 + p.phase);
            const finalAlpha = alpha * blink;

            // Construct rgba color string
            const color = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${finalAlpha})`;

            nextParticlesData.push({ x: px, y: py, color, radius });
        }

        // Force redraw by providing new array reference
        particlesData.value = nextParticlesData;
    });

    // Opacities for the three background states
    const warmOpacity = useDerivedValue(() => Math.max(0, Math.min(1, 1 - valence.value * 2)));
    const neutralOpacity = useDerivedValue(() => Math.max(0, Math.min(1, 1 - Math.abs(valence.value - 0.5) * 2)));
    const unpleasantOpacity = useDerivedValue(() => Math.max(0, Math.min(1, (valence.value - 0.5) * 2)));

    return (
        <View
            style={{ flex: 1, backgroundColor: 'black' }}
            onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                setDims({ width, height });
            }}
        >
            <Canvas style={{ flex: 1 }} pointerEvents="none">
                {/* Background images crossfade */}
                {warmWaves && (
                    <Image
                        image={warmWaves}
                        x={0} y={0} width={dims.width} height={dims.height}
                        fit="cover" opacity={warmOpacity}
                    />
                )}
                {neutralWaves && (
                    <Image
                        image={neutralWaves}
                        x={0} y={0} width={dims.width} height={dims.height}
                        fit="cover" opacity={neutralOpacity}
                    />
                )}
                {unpleasantWaves && (
                    <Image
                        image={unpleasantWaves}
                        x={0} y={0} width={dims.width} height={dims.height}
                        fit="cover" opacity={unpleasantOpacity}
                    />
                )}

                {/* Particle Circles */}
                {Array.from({ length: MAX_PARTICLES }).map((_, idx) => (
                    <ParticleCircle key={idx} index={idx} particlesData={particlesData} />
                ))}
            </Canvas>
        </View>
    );
};
