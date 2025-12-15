import { Tabs } from "expo-router";
import { Text, useColorScheme } from "react-native";

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Dom",
                    tabBarIcon: ({ color }) => <Text style={{ color }}>🏠</Text>, // Placeholder icon
                }}
            />
            <Tabs.Screen
                name="practice"
                options={{
                    title: "Praktyka",
                    tabBarIcon: ({ color }) => <Text style={{ color }}>🧘</Text>, // Placeholder icon
                }}
            />
            <Tabs.Screen
                name="relax"
                options={{
                    title: "Relaks",
                    tabBarIcon: ({ color }) => <Text style={{ color }}>🍃</Text>, // Placeholder icon
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profil",
                    tabBarIcon: ({ color }) => <Text style={{ color }}>👤</Text>, // Placeholder icon
                }}
            />
        </Tabs>
    );
}
