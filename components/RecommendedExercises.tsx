import { useEmotionalState } from "@/context/EmotionalStateContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

// Exercise data structure matching practice.tsx
interface Exercise {
    id: string;
    title: string;
    duration?: string;
    categoryId: string;
    categoryColor: string;
    categoryLabel: string;
    image?: any;
}

// All available exercises with metadata
const ALL_EXERCISES: Exercise[] = [
    // Mindfulness
    { id: "m1", title: "Medytacja Prowadzona", duration: "5 min", categoryId: "mindfulness", categoryColor: "#8B5CF6", categoryLabel: "Uważność" },
    { id: "m2", title: "Oddychanie Uspokajające", duration: "2 min", categoryId: "mindfulness", categoryColor: "#8B5CF6", categoryLabel: "Uważność" },
    { id: "m3", title: "Ugruntowanie przez Zmysły", categoryId: "mindfulness", categoryColor: "#8B5CF6", categoryLabel: "Uważność" },
    { id: "m4", title: "Skan Ciała – Relaks", categoryId: "mindfulness", categoryColor: "#8B5CF6", categoryLabel: "Uważność" },

    // CBT
    { id: "c1", title: "Dziennik Myśli", categoryId: "cbt", categoryColor: "#F59E0B", categoryLabel: "CBT" },
    { id: "c2", title: "Restrukturyzacja Poznawcza", categoryId: "cbt", categoryColor: "#F59E0B", categoryLabel: "CBT" },
    { id: "c3", title: "Identyfikacja Przekonań Rdzeniowych", categoryId: "cbt", categoryColor: "#F59E0B", categoryLabel: "CBT" },
    { id: "c4", title: "Plan Aktywacji Behawioralnej", categoryId: "cbt", categoryColor: "#F59E0B", categoryLabel: "CBT" },

    // Somatic
    { id: "s1", title: "Mapa Świadomości Ciała", categoryId: "somatic", categoryColor: "#10B981", categoryLabel: "Somatyczne" },
    { id: "s2", title: "Rozluźnianie Poprzez Ruch", categoryId: "somatic", categoryColor: "#10B981", categoryLabel: "Somatyczne" },
    { id: "s3", title: "Reset Oddechu i Postawy", categoryId: "somatic", categoryColor: "#10B981", categoryLabel: "Somatyczne" },
    { id: "s4", title: "Identyfikacja Napięć", categoryId: "somatic", categoryColor: "#10B981", categoryLabel: "Somatyczne" },

    // Journaling
    { id: "j1", title: "Pisanie Swobodne", categoryId: "journaling", categoryColor: "#F43F5E", categoryLabel: "Journaling" },
    { id: "j2", title: "Dziennik Wdzięczności", categoryId: "journaling", categoryColor: "#F43F5E", categoryLabel: "Journaling" },
    { id: "j3", title: '"Czego Dziś Potrzebuję?"', categoryId: "journaling", categoryColor: "#F43F5E", categoryLabel: "Journaling" },
    { id: "j4", title: "Reframing Trudnej Sytuacji", categoryId: "journaling", categoryColor: "#F43F5E", categoryLabel: "Journaling" },

    // Tools
    { id: "t1", title: "Terapeutyczne Zapisywanie Myśli", categoryId: "tools", categoryColor: "#3B82F6", categoryLabel: "Narzędzia" },
    { id: "t2", title: "Etykietowanie Emocji", categoryId: "tools", categoryColor: "#3B82F6", categoryLabel: "Narzędzia" },
    { id: "t3", title: "Oddzielenie od Myśli (Defuzja)", categoryId: "tools", categoryColor: "#3B82F6", categoryLabel: "Narzędzia" },
    { id: "t4", title: "Rozjaśnianie Wartości", categoryId: "tools", categoryColor: "#3B82F6", categoryLabel: "Narzędzia" },
];

// Recommendation algorithm based on emotional state
function getRecommendedExercises(state: {
    intensity: number;
    valence: number;
    heaviness: number;
    chaos: number;  // 0 = Stable, 1 = Chaotic
    energy: number;
}): Exercise[] {
    const { intensity, valence, heaviness, chaos, energy } = state;

    // Emotional profile flags
    const isHighIntensity = intensity > 0.6;
    const isLowEnergy = energy < 0.4;
    const isUnpleasant = valence < 0.4;
    const isChaotic = chaos > 0.6;  // high chaos = chaotic
    const isHeavy = heaviness > 0.6; // high heaviness = heavy
    const isPleasant = valence > 0.6;
    const isCalm = intensity < 0.4 && chaos < 0.4; // low chaos = stable/calm

    const recommendations: string[] = [];

    // Profile 1: High intensity + Unpleasant + Chaos → Acute distress
    if (isHighIntensity && isUnpleasant && isChaotic) {
        recommendations.push("m2", "c1", "s4", "m3"); // Breathing, Thought journal, Tension ID, Grounding
    }
    // Profile 2: Low energy + Heavy + Unpleasant → Depression
    else if (isLowEnergy && isHeavy && isUnpleasant) {
        recommendations.push("c4", "j2", "s2", "m1"); // Behavioral activation, Gratitude, Movement, Meditation
    }
    // Profile 3: High energy + Chaos + Heavy → Anxiety
    else if (energy > 0.6 && isChaotic && isHeavy) {
        recommendations.push("m3", "m4", "s3", "m2"); // Grounding, Body scan, Breath reset, Calming breath
    }
    // Profile 4: High intensity + Pleasant → Euphoria/Excitement
    else if (isHighIntensity && isPleasant) {
        recommendations.push("t2", "t1", "j3", "m1"); // Emotion labeling, Thought recording, Needs, Meditation
    }
    // Profile 5: Calm + Stable → Reflective
    else if (isCalm) {
        recommendations.push("m1", "j1", "t4", "c3"); // Meditation, Free writing, Values, Core beliefs
    }
    // Default: Balanced state
    else {
        recommendations.push("m1", "j1", "t2", "s1"); // Meditation, Free writing, Emotion labeling, Body map
    }

    // Return 3-4 exercises
    return recommendations
        .slice(0, 4)
        .map(id => ALL_EXERCISES.find(ex => ex.id === id))
        .filter((ex): ex is Exercise => ex !== undefined);
}

export const RecommendedExercises: React.FC = () => {
    const { state } = useEmotionalState();
    const router = useRouter();

    const recommended = getRecommendedExercises(state);

    const handleExercisePress = (exerciseId: string) => {
        if (exerciseId === "t1") {
            router.push("/practice/thought-recording");
        } else {
            // Navigate to practice tab (will need to implement category selection)
            router.push("/(tabs)/practice");
        }
    };

    return (
        <View className="px-6 py-6">
            {/* Header */}
            <View className="mb-4">
                <Text className="text-white text-xl font-bold mb-1">
                    Dla Ciebie dziś
                </Text>
                <Text className="text-white/60 text-sm">
                    Na podstawie Twojego stanu emocjonalnego
                </Text>
            </View>

            {/* Exercise Cards */}
            <View className="gap-3">
                {recommended.map((exercise) => (
                    <Pressable
                        key={exercise.id}
                        onPress={() => handleExercisePress(exercise.id)}
                        className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 flex-row items-center active:bg-slate-900/70"
                    >
                        {/* Icon */}
                        <View
                            className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                            style={{ backgroundColor: `${exercise.categoryColor}20` }}
                        >
                            <Ionicons
                                name="play-circle"
                                size={24}
                                color={exercise.categoryColor}
                            />
                        </View>

                        {/* Text */}
                        <View className="flex-1">
                            <Text className="text-white font-semibold text-base mb-0.5">
                                {exercise.title}
                            </Text>
                            <View className="flex-row items-center gap-2">
                                <Text
                                    className="text-xs font-medium"
                                    style={{ color: exercise.categoryColor }}
                                >
                                    {exercise.categoryLabel}
                                </Text>
                                {exercise.duration && (
                                    <>
                                        <Text className="text-white/40 text-xs">•</Text>
                                        <Text className="text-white/60 text-xs">
                                            {exercise.duration}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </View>

                        {/* Chevron */}
                        <Ionicons name="chevron-forward" size={18} color="#ffffff40" />
                    </Pressable>
                ))}
            </View>
        </View>
    );
};
