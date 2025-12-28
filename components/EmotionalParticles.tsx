import { Canvas, Image, Points, useImage } from "@shopify/react-native-skia";
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
    // For a small count of 20 particles, standard arrays are very stable on iOS
    // and correctly trigger Reanimated redraws when replaced with new references.
    const positions = useSharedValue<any[]>([]);
    const colors = useSharedValue<string[]>([]);
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

        // VALENCE COLOR INTERPOLATION (Cool Blue to Warm Yellow)
        // Pleasant (v=0) -> Cool Light Blue: rgb(0, 191, 255)
        // Neutral (v=0.5) -> Soft White: rgb(240, 248, 255)
        // Unpleasant (v=1) -> Warm Sunny Yellow: rgb(255, 215, 0)

        const cCool = { r: 0, g: 191, b: 255 };
        const cNeut = { r: 240, g: 248, b: 255 };
        const cWarm = { r: 255, g: 215, b: 0 };

        let r, g, b;
        if (v < 0.5) {
            const t = v * 2;
            r = cCool.r + (cNeut.r - cCool.r) * t;
            g = cCool.g + (cNeut.g - cCool.g) * t;
            b = cCool.b + (cNeut.b - cCool.b) * t;
        } else {
            const t = (v - 0.5) * 2;
            r = cNeut.r + (cWarm.r - cNeut.r) * t;
            g = cNeut.g + (cWarm.g - cNeut.g) * t;
            b = cNeut.b + (cWarm.b - cNeut.b) * t;
        }

        const nextPositions: any[] = [];
        const nextColors: string[] = [];

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

            nextPositions.push({ x: px, y: py });

            // Alpha and Blink
            let alpha = 1.0;
            if (p.z > 2.5) alpha = (3.0 - p.z) * 2;
            if (p.z < 0.5) alpha = p.z * 2;
            alpha = Math.max(0, Math.min(1, alpha));

            const blink = 0.7 + 0.3 * Math.sin(time.value * 3 + p.phase);
            const finalAlpha = alpha * blink;

            // Construct explicit rgba string for maximum iOS visibility
            nextColors.push(`rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${finalAlpha})`);
        }

        // Force redraw by providing new array references
        positions.value = nextPositions;
        colors.value = nextColors;
    });

    const currentStrokeWidth = useDerivedValue(() => 6 + (intensity.value * 54));

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

                {/* Particle Points */}
                <Points
                    points={positions}
                    mode="points"
                    // @ts-ignore
                    colors={colors}
                    // @ts-ignore
                    strokeWidth={currentStrokeWidth}
                    style="stroke"
                    strokeCap="round"
                />
            </Canvas>
        </View>
    );
};
