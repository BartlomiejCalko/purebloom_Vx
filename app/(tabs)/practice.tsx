import { AnimatedScreen } from "@/components/AnimatedScreen";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PracticeScreen() {
    return (
        <AnimatedScreen>
            <SafeAreaView className="flex-1 bg-emerald-950 items-center justify-center">
                <Text className="text-2xl font-bold text-white">Praktyka</Text>
            </SafeAreaView>
        </AnimatedScreen>
    );
}
