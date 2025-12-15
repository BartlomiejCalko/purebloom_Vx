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
                    backgroundColor: "#f5f5f5", // Light gray background
                    borderTopWidth: 0,
                    elevation: 0,
                    height: Platform.OS === "ios" ? 90 : 60,
                    paddingBottom: Platform.OS === "ios" ? 30 : 10,
                    paddingTop: 10,
                    
                },
                tabBarActiveTintColor: "#000000", // Black active color
                tabBarInactiveTintColor: "#888888", // Gray inactive color
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
