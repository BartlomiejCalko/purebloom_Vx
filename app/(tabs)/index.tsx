import { AnimatedScreen } from "@/components/AnimatedScreen";
import { ImageBackground, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
    return (
        <AnimatedScreen>
            <ImageBackground
                source={require("@/assets/images/Mystical Night Scene.jpg")}
                style={{ flex: 1 }}
                resizeMode="cover"
            >
                <SafeAreaView className="flex-1 items-center px-5 bg-blue-500/30">
                    <View className="flex flex-row justify-between items-center bg-transparent w-[100%] h-[10vh] rounded-3xl py-2">
                        <View className="flex bg-gray-200/50 w-[13vh] h-[6vh] rounded-full justify-center p-3">
                            <Text className="text-sm font-bold text-black">Chat AI</Text>
                        </View>
                        <Text className="text-xl font-semibold text-white">Witaj Bartek</Text>
                    </View>
                    <View className="flex flex-row justify-between items-center bg-transparent w-[100%] h-[40vh] rounded-3xl py-2 bg-blue-500/50 border border-white/50 mt-20">
                        <Text className="text-xl font-semibold text-white">Witaj Bartek</Text>
                        <Text className="text-xl font-semibold text-white">Witaj Bartek</Text>
                        <Text className="text-xl font-semibold text-white">Witaj Bartek</Text>
                    </View>                
                </SafeAreaView>
            </ImageBackground>
        </AnimatedScreen>
    );
}
