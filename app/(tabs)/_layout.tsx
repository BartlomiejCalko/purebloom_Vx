import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, useColorScheme } from "react-native";

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: "absolute", // Makes it overlay on top of content
                    backgroundColor: "rgba(0, 0, 0, 0.95)",
                    borderTopWidth: 0,
                    elevation: 0,
                    height: Platform.OS === "ios" ? 90 : 60,
                    paddingBottom: Platform.OS === "ios" ? 30 : 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: "rgba(229, 181, 253, 0.9)", // Adjusted for darker backgrounds
                tabBarInactiveTintColor: "rgba(140, 85, 222, 0.75)",
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Dom",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="practice"
                options={{
                    title: "Praktyka",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="leaf-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="relax"
                options={{
                    title: "Relaks",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="moon-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profil",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
