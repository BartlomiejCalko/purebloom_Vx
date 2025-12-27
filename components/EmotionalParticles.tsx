import { Canvas, Image, Points, Skia, useImage, vec } from "@shopify/react-native-skia";
import React, { useMemo } from "react";
import { Dimensions } from "react-native";
import { SharedValue, useDerivedValue, useFrameCallback, useSharedValue } from "react-native-reanimated";

interface EmotionalParticlesProps {
    intensity: SharedValue<number>;
    valence: SharedValue<number>;
    heaviness: SharedValue<number>;
    stability: SharedValue<number>;
    energy: SharedValue<number>;
    mode?: "passive" | "interactive";
}

const MAX_PARTICLES = 300;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = SCREEN_HEIGHT / 2;

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
    const initialParticles = useMemo(() => createInitialParticles(), []);

    // Load background images
    const bwImage = useImage(require("../assets/images/northern-bw.jpg"));
    const colorImage = useImage(require("../assets/images/northern.jpg"));

    // Mutable values for Skia to render
    const positions = useSharedValue(initialParticles.map(() => vec(0, 0)));
    const colors = useSharedValue(initialParticles.map(() => Skia.Color("white")));
    const time = useSharedValue(0);

    useFrameCallback((frameInfo) => {
        if (!frameInfo.timeSincePreviousFrame) return;
        const dt = frameInfo.timeSincePreviousFrame / 1000;
        time.value += dt;

        // Current state values
        const i = intensity.value; // 0..1
        const v = valence.value;   // 0..1
        const h = heaviness.value; // 0..1
        const s = stability.value; // 0..1
        const e = energy.value;    // 0..1

        const activeCount = Math.floor(10 + i * (MAX_PARTICLES - 10));

        // Intensity also mapped to Base Size Multiplier
        // i=0 -> 0.5x size, i=1 -> 1.5x size
        const sizeMultiplier = 0.5 + i * 1.0;

        // Heaviness: Y-axis gravity (ODWRÓCONE)
        // h=0 (Lewo/Ciężar) -> Down (positive Y) = opadanie
        // h=1 (Prawo/Lekkość) -> Up (negative Y) = unoszenie się
        const gravity = (0.5 - h) * 600; // 👈 ZMIEŃ TĘ WARTOŚĆ (80-150) aby kontrolować siłę grawitacji

        // Energy: Z-axis speed
        // e=0 -> Very slow drift
        // e=1 -> Fast forward movement (Z decreases)
        const zSpeed = 0.1 + e * 1.5;

        // Stability: Noise amplitude
        const chaos = (1 - s) * 25;

        const newPositions = [];
        const newColors = [];

        // Particle Color Mapping: Blue → White → Magenta
        // v=0 (Unpleasant) -> Blue (#4A90E2)
        // v=0.5 (Neutral) -> White (#FFFFFF)
        // v=1 (Pleasant) -> Magenta (#E94B9E)
        let r: number, g: number, b: number;

        if (v < 0.5) {
            // Blue to White transition
            const t = v * 2; // 0..1
            r = Math.floor(74 + (255 - 74) * t);
            g = Math.floor(144 + (255 - 144) * t);
            b = Math.floor(226 + (255 - 226) * t);
        } else {
            // White to Magenta transition
            const t = (v - 0.5) * 2; // 0..1
            r = Math.floor(255 + (233 - 255) * t);
            g = Math.floor(255 + (75 - 255) * t);
            b = Math.floor(255 + (158 - 255) * t);
        }

        for (let idx = 0; idx < MAX_PARTICLES; idx++) {
            const p = initialParticles[idx];

            if (idx > activeCount) {
                newPositions.push(vec(-100, -100));
                newColors.push(Skia.Color("#00000000"));
                continue;
            }

            // Update 3D State

            // 1. Z Movement (Travel) - Energy controls Z speed for depth effect
            p.z -= zSpeed * dt * p.baseSpeed;
            if (p.z <= 0.1) {
                p.z = 3.0;
                // Reshuffle X/Y slightly when respawning
                p.x = (Math.random() - 0.5) * SCREEN_WIDTH * 2;
                p.y = (Math.random() - 0.5) * SCREEN_HEIGHT * 2;
            }

            // 2. Y Movement (Gravity/Heaviness) - Energy multiplies gravity speed
            // Energy affects how fast gravity acts, not the direction
            const energyMultiplier = 0.3 + e * 1.7; // 0.3x to 2x speed
            p.y += gravity * dt * energyMultiplier;

            // Wrap Y in world space to keep 'em coming
            if (p.y > SCREEN_HEIGHT) p.y = -SCREEN_HEIGHT;
            if (p.y < -SCREEN_HEIGHT) p.y = SCREEN_HEIGHT;


            // 3. Stability (Noise) - Energy also affects chaos speed
            // Add simple sine noise to X/Y based on time
            const noiseX = Math.sin(time.value * 2 + p.phase + p.noiseOffsetX) * chaos * energyMultiplier;
            const noiseY = Math.cos(time.value * 2 + p.phase + p.noiseOffsetY) * chaos * energyMultiplier;

            // Project to 2D
            // x_screen = (x / z) + center_x
            // y_screen = (y / z) + center_y
            // FOV factor usually ~ distance
            const scale = 1.0 / p.z;
            const projectedX = (p.x + noiseX) * scale + CENTER_X;
            const projectedY = (p.y + noiseY) * scale + CENTER_Y;

            newPositions.push(vec(projectedX, projectedY));

            // Alpha calculation
            // Fade in/out based on Z (fog)
            // Close (z small) -> Fade out? Or bright?
            // Far (z large) -> Fade out
            // Lets fade out at z=3 and z=0.1
            let alpha = 1.0;
            if (p.z > 2.5) alpha = (3.0 - p.z) * 2; // Fade in from far
            if (p.z < 0.5) alpha = p.z * 2; // Fade out when too close (passing camera)
            if (alpha > 1) alpha = 1;
            if (alpha < 0) alpha = 0;

            // Blink effect
            const blink = 0.7 + 0.3 * Math.sin(time.value * 3 + p.phase);

            // Final alpha
            const finalAlpha = Math.floor(alpha * blink * 255);

            // Add color
            // Using string interpolation for color is a bit slow, but simplest without packing logic
            // newColors.push(Skia.Color(`rgba(${r}, ${g}, ${b}, ${alpha * blink})`));

            // Manual bit packing for speed if needed, but Skia.Color works well with strings.
            // But let's optimize string creation?
            // Actually, we can just use `alpha` in color.
            // NOTE: @ts-ignore for colors prop
            newColors.push(Skia.Color(`rgba(${r}, ${g}, ${b}, ${alpha * blink})`));
        }

        positions.value = newPositions;
        colors.value = newColors;
    });

    // Opacity for color image based on valence
    const colorImageOpacity = useDerivedValue(() => {
        return valence.value; // 0 = fully BW, 1 = fully color
    });

    const strokeWidth = useDerivedValue(() => {
        return 4 * (0.5 + intensity.value);
    });

    return (
        <Canvas style={{ flex: 1 }} pointerEvents="none">
            {/* Base BW Image */}
            {bwImage && (
                <Image
                    image={bwImage}
                    x={0}
                    y={0}
                    width={SCREEN_WIDTH}
                    height={SCREEN_HEIGHT}
                    fit="fill"
                />
            )}

            {/* Color Image with opacity based on valence */}
            {colorImage && (
                <Image
                    image={colorImage}
                    x={0}
                    y={0}
                    width={SCREEN_WIDTH}
                    height={SCREEN_HEIGHT}
                    fit="fill"
                    opacity={colorImageOpacity}
                />
            )}

            {/* @ts-ignore */}
            <Points
                points={positions}
                mode="points"
                color={Skia.Color("white")}
                // @ts-ignore
                colors={colors}
                // @ts-ignore
                strokeWidth={strokeWidth}
                style="stroke"
                strokeCap="round"
            />
        </Canvas>
    );
};
