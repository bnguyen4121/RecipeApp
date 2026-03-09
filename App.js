import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/contexts/AuthContext";
import { FavoritesProvider } from "./src/contexts/FavoritesContext";
import { ShoppingListProvider } from "./src/contexts/ShoppingListContext";
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";
import RootNavigator from "./src/navigation/RootNavigator";

SplashScreen.preventAutoHideAsync();

const AppContent = () => {
    const { isDark } = useTheme();

    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    return (
        <>
            <StatusBar style={isDark ? "light" : "dark"} />
            <NavigationContainer>
                <RootNavigator />
            </NavigationContainer>
        </>
    );
};

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AuthProvider>
                    <FavoritesProvider>
                        <ShoppingListProvider>
                            <AppContent />
                        </ShoppingListProvider>
                    </FavoritesProvider>
                </AuthProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
