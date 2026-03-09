import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import RecipeUploadScreen from "../screens/main/RecipeUploadScreen";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";

const RootStack = createNativeStackNavigator();

const RootNavigator = () => {
    const { user, loading } = useAuth();
    const { colors } = useTheme();

    if (loading) {
        return (
            <View
                style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!user) return <AuthStack />;

    return (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
            <RootStack.Screen name="MainTabs" component={MainTabs} />
            <RootStack.Screen name="UploadModal" component={RecipeUploadScreen} options={{ presentation: "modal" }} />
        </RootStack.Navigator>
    );
};

export default RootNavigator;
