import { Ionicons } from "@expo/vector-icons";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RecipeCard from "../../components/RecipeCard";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Spacing, Typography } from "../../styles/theme";

const FavoritesScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const { favorites, loading } = useFavorites();
    const s = createStyles(colors);

    return (
        <SafeAreaView style={s.container} edges={["top"]}>
            <Text style={s.title}>Favorites</Text>
            <Text style={s.subtitle}>{favorites.length} saved recipes</Text>

            <FlatList
                data={favorites}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={s.row}
                contentContainerStyle={s.listContent}
                renderItem={({ item }) => (
                    <RecipeCard
                        recipe={{
                            id: item.recipeId,
                            title: item.title,
                            image: item.image,
                            cookingTime: item.cookingTime,
                            category: item.category,
                        }}
                        onPress={() => navigation.navigate("RecipeDetail", { recipeId: item.recipeId })}
                    />
                )}
                ListEmptyComponent={
                    !loading && (
                        <View style={s.emptyContainer}>
                            <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
                            <Text style={s.emptyText}>No favorites yet</Text>
                            <Text style={s.emptySubtext}>Tap the heart icon on any recipe to save it here</Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
};

const createStyles = (colors) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        title: { ...Typography.h2, color: colors.text, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
        subtitle: {
            ...Typography.bodySmall,
            color: colors.textSecondary,
            paddingHorizontal: Spacing.lg,
            marginBottom: Spacing.md,
        },
        row: { justifyContent: "space-between", paddingHorizontal: Spacing.lg },
        listContent: { paddingBottom: Spacing.lg },
        emptyContainer: {
            alignItems: "center",
            paddingTop: Spacing.xxl * 2,
            paddingHorizontal: Spacing.xl,
            gap: Spacing.sm,
        },
        emptyText: { ...Typography.h3, color: colors.textSecondary },
        emptySubtext: { ...Typography.bodySmall, color: colors.textSecondary, textAlign: "center" },
    });

export default FavoritesScreen;
