import { AnimatedScreen } from "@/components/AnimatedScreen";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
    return (
        <AnimatedScreen>
            <SafeAreaView className="flex-1 bg-zinc-900 items-center justify-center">
                <Text className="text-2xl font-bold text-white">Profil</Text>
            </SafeAreaView>
        </AnimatedScreen>
    );
}
