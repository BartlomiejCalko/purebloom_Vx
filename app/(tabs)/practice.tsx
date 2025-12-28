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
    icon?: keyof typeof Ionicons.glyphMap;
    exercises: Exercise[];
    image?: ImageSourcePropType;
}

const CATEGORIES: Category[] = [
    {
        id: "tools",
        label: "Narzędzia",
        headerTitle: "Narzędzia Terapeutyczne",
        description: "Strukturalne ćwiczenia regulujące emocje i wspierające wgląd.",
        color: "#06B6D4", // Cyan - Northern Lights Teal
        icon: "grid-outline",
        image: require("@/assets/images/narzedzia.png"),
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
        color: "#A78BFA", // Purple - Aurora Purple
        image: require("@/assets/images/uwaznosc.png"),
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
        color: "#FBBF24", // Amber - Northern Star
        icon: "analytics-outline",
        image: require("@/assets/images/cbt2.png"),
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
        color: "#34D399", // Emerald - Aurora Green
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
        color: "#F472B6", // Pink - Aurora Rose
        icon: "book-outline",
        exercises: [
            { id: "j1", title: "Pisanie Swobodne" },
            { id: "j2", title: "Dziennik Wdzięczności" },
            { id: "j3", title: "Czego Dziś Potrzebuję?" },
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
                ["#334155", category.color]
            ),
            backgroundColor: interpolateColor(
                progress.value,
                [0, 1],
                ["#1e293b", `${category.color}20`]
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
                className="w-[85px] h-[75px] items-center justify-center rounded-2xl border-2 mb-2 overflow-hidden"
                style={animatedCardStyle}
            >
                <Image
                    source={category.image}
                    className="w-[45px] h-[40px] object-contain"
                />
                {/* <Ionicons
                    name={category.icon}
                    size={28}
                    color={isActive ? category.color : "#9CA3AF"}
                />  */}
            </Animated.View>

            {/* Label */}
            <Text className={`text-[11px] font-semibold mb-1.5 ${isActive ? "text-white" : "text-slate-500"}`}>
                {category.label}
            </Text>

            {/* Active Indicator Line */}
            <Animated.View
                className="h-[2px] rounded-full"
                style={[
                    animatedIndicatorStyle,
                    {
                        shadowColor: category.color,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.8,
                        shadowRadius: 4,
                    }
                ]}
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
        <AnimatedScreen className="bg-slate-950 flex-1">
            <SafeAreaView edges={['top']} className="flex-1 bg-slate-950 pt-4">

                {/* Horizontal Category Tabs */}
                <View className="pt-4 pb-6 bg-transparent">
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

                {/* Separator Line 
                <View className="h-[1px] bg-gray-100 mx-5 mb-4" />*/}

                {/* Scrollable Content */}
                <ScrollView contentContainerStyle={{
                    paddingBottom: 100,
                    paddingTop: 10
                }}>
                    <Animated.View style={[animatedContentStyle, { paddingHorizontal: 20 }]} className="pt-2 pb-4 bg-transparent">

                        {/* Dynamic Header */}
                        <View className="flex-row items-center justify-between mb-10">
                            <View className="flex-1 pr-4">
                                <Text className="text-3xl font-bold text-white mb-2 tracking-tight">
                                    {currentCategory.headerTitle}
                                </Text>
                                <Text className="text-sm text-slate-400 leading-relaxed font-light">
                                    {currentCategory.description}
                                </Text>
                            </View>

                            {/* Icon Box with Glow */}
                            <View className="relative">
                                <View
                                    className="absolute inset-0 blur-2xl rounded-full opacity-20"
                                    style={{ backgroundColor: currentCategory.color, transform: [{ scale: 1.5 }] }}
                                />
                                <View className="w-20 h-20 rounded-3xl items-center justify-center bg-slate-900/40 border border-slate-800 overflow-hidden">
                                    <Image
                                        source={currentCategory.image}
                                        className="w-14 h-14 object-contain"
                                    />
                                </View>
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
                                    className="bg-slate-900/60 border border-slate-700/50 rounded-[24px] p-5 flex-row items-center"
                                    style={{
                                        shadowColor: currentCategory.color,
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.15,
                                        shadowRadius: 12,
                                    }}
                                >
                                    {/* Icon Box */}
                                    <View
                                        className="w-14 h-14 rounded-2xl items-center justify-center mr-4 overflow-hidden"
                                        style={{ backgroundColor: `${currentCategory.color}25` }}
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
                                        <Text className="text-[17px] font-medium text-white/90 mb-1">
                                            {exercise.title}
                                        </Text>
                                        <View className="flex-row items-center">
                                            {exercise.duration && (
                                                <Text className="text-xs text-slate-500 font-normal">
                                                    {exercise.duration}
                                                </Text>
                                            )}
                                            {exercise.progress !== undefined && (
                                                <View className="flex-1 ml-3 h-[3px] bg-slate-800 rounded-full max-w-[80px]">
                                                    <View
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${exercise.progress * 100}%`,
                                                            backgroundColor: currentCategory.color,
                                                            shadowColor: currentCategory.color,
                                                            shadowOffset: { width: 0, height: 0 },
                                                            shadowOpacity: 0.5,
                                                            shadowRadius: 3,
                                                        }}
                                                    />
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Chevron */}
                                    <Ionicons name="chevron-forward" size={20} color="#64748B" />
                                </TouchableOpacity>
                            ))}
                        </View>

                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </AnimatedScreen>
    );
}
