import { AnimatedScreen } from "@/components/AnimatedScreen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Image, ImageSourcePropType, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// --- Data Structure ---

type CategoryId = "mindfulness" | "tools" | "cbt" | "somatic" | "journaling";

interface Exercise {
    id: string;
    title: string;
    duration?: string;
    progress?: number; // 0 to 1
    image?: ImageSourcePropType;
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
        label: "Narzędzia",
        headerTitle: "Narzędzia Terapeutyczne",
        description: "Strukturalne ćwiczenia regulujące emocje i wspierające wgląd.",
        color: "#3B82F6", // Blue
        icon: "construct-outline",
        exercises: [
            {
                id: "t1",
                title: "Terapeutyczne Zapisywanie Myśli",
                progress: 0.3,
                image: require("@/assets/images/Mystical Night Scene.jpg")
            },
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

// --- Components ---

const CategoryTab = ({
    category,
    isActive,
    onPress
}: {
    category: Category;
    isActive: boolean;
    onPress: () => void
}) => {
    // Derived value for animation progress (0 -> 1)
    const progress = useDerivedValue(() => {
        return withTiming(isActive ? 1 : 0, { duration: 300 });
    }, [isActive]);

    const animatedCardStyle = useAnimatedStyle(() => {
        return {
            borderColor: interpolateColor(
                progress.value,
                [0, 1],
                ["#F3F4F6", category.color]
            ),
            backgroundColor: interpolateColor(
                progress.value,
                [0, 1],
                ["transparent", `${category.color}10`]
            ),
        };
    });

    const animatedIndicatorStyle = useAnimatedStyle(() => {
        return {
            width: `${progress.value * 80}%`,
            backgroundColor: category.color,
            opacity: progress.value
        };
    });

    return (
        <Pressable
            onPress={onPress}
            className="items-center mr-1"
        >
            {/* Icon Card */}
            <Animated.View
                className="w-[85px] h-[65px] items-center justify-center rounded-2xl border-2 mb-2"
                style={animatedCardStyle}
            >
                <Ionicons
                    name={category.icon}
                    size={28}
                    color={isActive ? category.color : "#9CA3AF"}
                />
            </Animated.View>

            {/* Label */}
            <Text className={`text-xs font-bold mb-1 ${isActive ? "text-black" : "text-gray-500"}`}>
                {category.label}
            </Text>

            {/* Active Indicator Line */}
            <Animated.View
                className="h-[3px] rounded-full"
                style={animatedIndicatorStyle}
            />
        </Pressable>
    );
};

export default function PracticeScreen() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<CategoryId>("mindfulness");
    const [isChanging, setIsChanging] = useState(false);

    // Initial load: ensure selectedCategory exists or fallback
    const currentCategory = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
    const opacity = useSharedValue(1);
    const translateY = useSharedValue(0);

    const handleCategoryPress = (id: CategoryId) => {
        if (id === selectedCategory || isChanging) return;

        setIsChanging(true);

        // Animate content out
        opacity.value = withTiming(0, { duration: 150 });
        translateY.value = withTiming(20, { duration: 150 });

        // Update state after content fades out
        setTimeout(() => {
            setSelectedCategory(id);
            translateY.value = 20; // Ensure mapped to start pos
            opacity.value = withTiming(1, { duration: 500 });
            translateY.value = withTiming(0, { duration: 600 });
            setIsChanging(false);
        }, 150);
    };

    const animatedContentStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }]
    }));

    return (
        <AnimatedScreen className="bg-white flex-1">
            <SafeAreaView edges={['top']} className="flex-1 bg-white pt-4">

                {/* Horizontal Category Tabs */}
                <View className="pt-2 pb-4">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                    >
                        {CATEGORIES.map((cat) => (
                            <CategoryTab
                                key={cat.id}
                                category={cat}
                                isActive={selectedCategory === cat.id}
                                onPress={() => handleCategoryPress(cat.id)}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Separator Line */}
                <View className="h-[1px] bg-gray-100 mx-5 mb-4" />

                {/* Scrollable Content */}
                <ScrollView contentContainerStyle={{
                    paddingBottom: 100,
                    paddingTop: 20
                }}>
                    <Animated.View style={[animatedContentStyle, { paddingHorizontal: 20 }]}>

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
                                <Ionicons name={currentCategory.icon} size={60} color={currentCategory.color} />
                            </View>
                        </View>

                        {/* Exercises List */}
                        <View className="gap-5">
                            {currentCategory.exercises.map((exercise, index) => (
                                <TouchableOpacity
                                    key={exercise.id}
                                    activeOpacity={0.9}
                                    onPress={() => {
                                        if (exercise.id === 't1') {
                                            router.push('/practice/thought-recording');
                                        }
                                    }}
                                    className="bg-white border border-gray-200 rounded-[24px] p-5 flex-row items-center shadow-sm shadow-gray-100"
                                >
                                    {/* Icon Box */}
                                    <View
                                        className="w-14 h-14 rounded-2xl items-center justify-center mr-4 overflow-hidden"
                                        style={{ backgroundColor: `${currentCategory.color}15` }}
                                    >
                                        {exercise.image ? (
                                            <Image
                                                source={exercise.image}
                                                className="w-full h-full"
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <Ionicons name="play-circle" size={28} color={currentCategory.color} />
                                        )}
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
