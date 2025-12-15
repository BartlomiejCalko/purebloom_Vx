import { AnimatedScreen } from "@/components/AnimatedScreen";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// --- Data Structure ---

type CategoryId = "mindfulness" | "tools" | "cbt" | "somatic" | "journaling";

interface Exercise {
    id: string;
    title: string;
    duration?: string;
    progress?: number; // 0 to 1
}

interface Category {
    id: CategoryId;
    label: string;
    headerTitle: string;
    description: string;
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
    exercises: Exercise[];
}

const CATEGORIES: Category[] = [
    
    {
        id: "tools",
        label: "Narzędz",
        headerTitle: "Narzędzia Terapeutycz",
        description: "Strukturalne ćwiczenia regulujące emocje i wspierające wgląd.",
        color: "#3B82F6", // Blue
        icon: "construct-outline",
        exercises: [
            { id: "t1", title: "Terapeutyczne Zapisywanie Myśli", progress: 0.3 },
            { id: "t2", title: "Etykietowanie Emocji" },
            { id: "t3", title: "Oddzielenie od Myśli (Defuzja)" },
            { id: "t4", title: "Rozjaśnianie Wartości" },
        ],
    },
    {
        id: "mindfulness",
        label: "Uważność",
        headerTitle: "Uważność",
        description: "Krótkie prowadzone medytacje, które pomagają się wyciszyć.",
        color: "#8B5CF6", // Violet
        icon: "flower-outline",
        exercises: [
            { id: "m1", title: "Medytacja Prowadzona", duration: "5 min" },
            { id: "m2", title: "Oddychanie Uspokajające", duration: "2 min" },
            { id: "m3", title: "Ugruntowanie przez Zmysły" },
            { id: "m4", title: "Skan Ciała – Relaks" },
        ],
    },
    
    {
        id: "cbt",
        label: "CBT",
        headerTitle: "CBT",
        description: "Sprawdzone metody rozpoznawania i zmiany schematów myślowych.",
        color: "#F59E0B", // Amber
        icon: "analytics-outline",
        exercises: [
            { id: "c1", title: "Dziennik Myśli" },
            { id: "c2", title: "Restrukturyzacja Poznawcza" },
            { id: "c3", title: "Identyfikacja Przekonań Rdzeniowych" },
            { id: "c4", title: "Plan Aktywacji Behawioralnej" },
        ],
    },
    {
        id: "somatic",
        label: "Somatyczne",
        headerTitle: "Somatyczne",
        description: "Ćwiczenia oparte na ciele, pomagające uwolnić napięcie.",
        color: "#10B981", // Emerald
        icon: "body-outline",
        exercises: [
            { id: "s1", title: "Mapa Świadomości Ciała" },
            { id: "s2", title: "Rozluźnianie Poprzez Ruch" },
            { id: "s3", title: "Reset Oddechu i Postawy" },
            { id: "s4", title: "Identyfikacja Napięć" },
        ],
    },
    {
        id: "journaling",
        label: "Journaling",
        headerTitle: "Journaling",
        description: "Przestrzeń do swobodnego pisania i refleksji.",
        color: "#F43F5E", // Rose
        icon: "book-outline",
        exercises: [
            { id: "j1", title: "Pisanie Swobodne" },
            { id: "j2", title: "Dziennik Wdzięczności" },
            { id: "j3", title: "„Czego Dziś Potrzebuję?”" },
            { id: "j4", title: "Reframing Trudnej Sytuacji" },
        ],
    },
];

export default function PracticeScreen() {
    const [selectedCategory, setSelectedCategory] = useState<CategoryId>("mindfulness");
    const [isChanging, setIsChanging] = useState(false);

    const currentCategory = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
    const opacity = useSharedValue(1);
    const translateY = useSharedValue(0);

    const handleCategoryPress = (id: CategoryId) => {
        if (id === selectedCategory || isChanging) return;

        setIsChanging(true);

        // Animate out
        opacity.value = withTiming(0, { duration: 150 });
        translateY.value = withTiming(20, { duration: 150 }, () => {
            // Trigger state update after fade out
            // In Reanimated usually we'd use runOnJS but for simple layout switching simple timeout/effect combo works or runOnJS
        });

        // Use a small timeout to allow animation to complete visually before state swap
        // This is a simplified approach for smooth React updates
        setTimeout(() => {
            setSelectedCategory(id);
            translateY.value = 20; // Reset position for entry
            opacity.value = withTiming(1, { duration: 500 });
            translateY.value = withTiming(0, { duration: 600 });
            setIsChanging(false);
        }, 150);
    };


    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }]
    }));

    return (
        <AnimatedScreen className="bg-white flex-1">
            <SafeAreaView edges={['top']} className="flex-1 bg-white">

                {/* Horizontal Category Tabs */}
                <View className="pt-2 pb-4">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                    >
                        {CATEGORIES.map((cat) => {
                            const isActive = selectedCategory === cat.id;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    onPress={() => handleCategoryPress(cat.id)}
                                    activeOpacity={0.7}
                                    className={`items-center justify-center px-4 py-3 rounded-2xl border-2 min-w-[90px] ${isActive ? "bg-white" : "bg-white border-gray-100"
                                        }`}
                                    style={{
                                        borderColor: isActive ? cat.color : "#F3F4F6", // border-gray-100 equivalent
                                        borderBottomWidth: isActive ? 4 : 2,
                                    }}
                                >
                                    {/* Simplified Icon */}
                                    <Ionicons
                                        name={cat.icon}
                                        size={24}
                                        color={isActive ? cat.color : "#9CA3AF"} // gray-400
                                        style={{ marginBottom: 4 }}
                                    />
                                    <Text className={`text-xs font-semibold ${isActive ? "text-black" : "text-gray-400"}`}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Separator Line */}
                <View className="h-[1px] bg-gray-100 mx-5 mb-4" />

                {/* Scrollable Content */}
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                    <Animated.View style={[animatedStyle, { paddingHorizontal: 20 }]}>

                        {/* Dynamic Header */}
                        <View className="flex-row items-center justify-between mb-8">
                            <View className="flex-1 pr-4">
                                <Text className="text-2xl font-bold text-black mb-2 leading-tight">
                                    {currentCategory.headerTitle}
                                </Text>
                                <Text className="text-base text-gray-500 leading-relaxed">
                                    {currentCategory.description}
                                </Text>
                            </View>

                            {/* Large Icon Placeholder */}
                            <View className="w-20 h-20 rounded-full items-center justify-center bg-gray-50">
                                <Ionicons name={currentCategory.icon} size={48} color={currentCategory.color} />
                            </View>
                        </View>

                        {/* Exercises List */}
                        <View className="gap-5">
                            {currentCategory.exercises.map((exercise, index) => (
                                <TouchableOpacity
                                    key={exercise.id}
                                    activeOpacity={0.9}
                                    className="bg-white border border-gray-200 rounded-[24px] p-5 flex-row items-center shadow-sm shadow-gray-100"
                                >
                                    {/* Icon Box */}
                                    <View
                                        className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                                        style={{ backgroundColor: `${currentCategory.color}15` }} // 10% opacity hex
                                    >
                                        <Ionicons name="play-circle" size={28} color={currentCategory.color} />
                                    </View>

                                    {/* Text Info */}
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-black mb-1">
                                            {exercise.title}
                                        </Text>
                                        <View className="flex-row items-center">
                                            {exercise.duration && (
                                                <Text className="text-xs text-gray-400 font-medium">
                                                    {exercise.duration}
                                                </Text>
                                            )}
                                            {exercise.progress !== undefined && (
                                                <View className="flex-1 ml-2 h-1.5 bg-gray-100 rounded-full max-w-[100px]">
                                                    <View
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${exercise.progress * 100}%`,
                                                            backgroundColor: currentCategory.color
                                                        }}
                                                    />
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Chevron */}
                                    <Ionicons name="chevron-forward" size={20} color="#E5E7EB" />
                                </TouchableOpacity>
                            ))}
                        </View>

                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </AnimatedScreen>
    );
}
