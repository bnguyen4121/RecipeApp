import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

import FavoritesScreen from "../screens/main/FavoritesScreen";
import HomeScreen from "../screens/main/HomeScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import RecipeDetailScreen from "../screens/main/RecipeDetailScreen";

import ShoppingListScreen from "../screens/main/ShoppingListScreen";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const FavoritesStack = createNativeStackNavigator();

const HomeStackNavigator = () => (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
        <HomeStack.Screen name="HomeMain" component={HomeScreen} />
        <HomeStack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </HomeStack.Navigator>
);

const FavoritesStackNavigator = () => (
    <FavoritesStack.Navigator screenOptions={{ headerShown: false }}>
        <FavoritesStack.Screen name="FavoritesMain" component={FavoritesScreen} />
        <FavoritesStack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </FavoritesStack.Navigator>
);

const TAB_ICONS = {
    Home: { active: "home", inactive: "home-outline" },
    Upload: { active: "add", inactive: "add" },
    Favorites: { active: "heart", inactive: "heart-outline" },
    ShoppingList: { active: "cart", inactive: "cart-outline" },
    Profile: { active: "person", inactive: "person-outline" },
};

const DummyScreen = () => <View />;

const MainTabs = () => {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    if (route.name === "Upload") {
                        return (
                            <View style={[styles.uploadButton, { backgroundColor: colors.primary }]}>
                                <Ionicons name="add" size={28} color="#fff" />
                            </View>
                        );
                    }
                    const iconName = focused ? TAB_ICONS[route.name].active : TAB_ICONS[route.name].inactive;
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.tabBarActive,
                tabBarInactiveTintColor: colors.tabBarInactive,
                tabBarStyle: {
                    backgroundColor: colors.tabBarBackground,
                    borderTopColor: colors.border,
                    paddingBottom: 4,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                },
            })}>
            <Tab.Screen name="Home" component={HomeStackNavigator} options={{ tabBarLabel: "Home" }} />
            <Tab.Screen name="Favorites" component={FavoritesStackNavigator} options={{ tabBarLabel: "Favorites" }} />
            <Tab.Screen
                name="Upload"
                component={DummyScreen}
                options={{ tabBarLabel: "" }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate("UploadModal");
                    },
                })}
            />
            <Tab.Screen name="ShoppingList" component={ShoppingListScreen} options={{ tabBarLabel: "Shopping" }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "Profile" }} />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    uploadButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
});

export default MainTabs;
