import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RecipeCard from "../../components/RecipeCard";
import { useTheme } from "../../contexts/ThemeContext";
import { CATEGORIES, searchByIngredients, searchRecipes } from "../../services/recipeService";
import { BorderRadius, Spacing, Typography } from "../../styles/theme";

const SearchScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // Ingredient-based search state
    const [searchMode, setSearchMode] = useState("keyword"); // 'keyword' or 'ingredient'
    const [ingredientInput, setIngredientInput] = useState("");
    const [ingredientsList, setIngredientsList] = useState([]);

    // Keyword search
    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;
        setLoading(true);
        setSearched(true);
        const data = await searchRecipes(query.trim());
        setResults(data);
        setLoading(false);
    }, [query]);

    // Add ingredient to list
    const addIngredient = () => {
        const trimmed = ingredientInput.trim().toLowerCase();
        if (!trimmed || ingredientsList.includes(trimmed)) return;
        setIngredientsList((prev) => [...prev, trimmed]);
        setIngredientInput("");
    };

    // Remove ingredient from list
    const removeIngredient = (ingredient) => {
        setIngredientsList((prev) => prev.filter((i) => i !== ingredient));
    };

    // Search by ingredients
    const handleIngredientSearch = useCallback(async () => {
        if (ingredientsList.length === 0) return;
        setLoading(true);
        setSearched(true);
        const data = await searchByIngredients(ingredientsList);
        setResults(data);
        setLoading(false);
    }, [ingredientsList]);

    const clearSearch = () => {
        setQuery("");
        setResults([]);
        setSearched(false);
        setIngredientsList([]);
        setIngredientInput("");
    };

    const s = createStyles(colors);

    return (
        <SafeAreaView style={s.container} edges={["top"]}>
            <Text style={s.title}>Search</Text>

            {/* Search Mode Toggle */}
            <View style={s.modeToggle}>
                <TouchableOpacity
                    style={[s.modeButton, searchMode === "keyword" && s.modeButtonActive]}
                    onPress={() => {
                        setSearchMode("keyword");
                        clearSearch();
                    }}>
                    <Ionicons
                        name="search-outline"
                        size={16}
                        color={searchMode === "keyword" ? colors.textInverse : colors.text}
                    />
                    <Text style={[s.modeButtonText, searchMode === "keyword" && s.modeButtonTextActive]}>By Name</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[s.modeButton, searchMode === "ingredient" && s.modeButtonActive]}
                    onPress={() => {
                        setSearchMode("ingredient");
                        clearSearch();
                    }}>
                    <Ionicons
                        name="nutrition-outline"
                        size={16}
                        color={searchMode === "ingredient" ? colors.textInverse : colors.text}
                    />
                    <Text style={[s.modeButtonText, searchMode === "ingredient" && s.modeButtonTextActive]}>
                        By Ingredients
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Keyword Search Bar */}
            {searchMode === "keyword" && (
                <View style={s.searchBar}>
                    <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={s.searchInput}
                        placeholder="Search recipes..."
                        placeholderTextColor={colors.textSecondary}
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={clearSearch}>
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Ingredient Search */}
            {searchMode === "ingredient" && (
                <View style={s.ingredientSection}>
                    <Text style={s.ingredientHint}>Add ingredients you have on hand</Text>

                    <View style={s.ingredientInputRow}>
                        <View style={s.ingredientInputBar}>
                            <Ionicons name="add-outline" size={20} color={colors.textSecondary} />
                            <TextInput
                                style={s.searchInput}
                                placeholder="e.g. chicken, rice, garlic..."
                                placeholderTextColor={colors.textSecondary}
                                value={ingredientInput}
                                onChangeText={setIngredientInput}
                                onSubmitEditing={addIngredient}
                                returnKeyType="done"
                            />
                        </View>
                        <TouchableOpacity style={s.addButton} onPress={addIngredient}>
                            <Text style={s.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Ingredient Chips */}
                    {ingredientsList.length > 0 && (
                        <View style={s.chipsContainer}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={s.chipsList}>
                                {ingredientsList.map((ing) => (
                                    <View key={ing} style={s.chip}>
                                        <Text style={s.chipText}>{ing}</Text>
                                        <TouchableOpacity
                                            onPress={() => removeIngredient(ing)}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                            <Ionicons name="close-circle" size={16} color={colors.textInverse} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>

                            <TouchableOpacity style={s.searchButton} onPress={handleIngredientSearch}>
                                <Ionicons name="search" size={18} color={colors.textInverse} />
                                <Text style={s.searchButtonText}>
                                    Find Recipes with {ingredientsList.length} ingredient
                                    {ingredientsList.length > 1 ? "s" : ""}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* Quick Categories (only when not searched) */}
            {!searched && searchMode === "keyword" && (
                <View style={s.quickFilters}>
                    <Text style={s.sectionLabel}>Browse by Category</Text>
                    <View style={s.categoryGrid}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={s.categoryCard}
                                onPress={() => {
                                    setQuery(cat.label);
                                }}>
                                <Ionicons name={cat.icon} size={28} color={colors.primary} />
                                <Text style={s.categoryLabel}>{cat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Results */}
            {searched && (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={s.row}
                    contentContainerStyle={s.listContent}
                    renderItem={({ item }) => (
                        <RecipeCard
                            recipe={item}
                            onPress={() => navigation.navigate("RecipeDetail", { recipeId: item.id })}
                        />
                    )}
                    ListEmptyComponent={
                        !loading && (
                            <View style={s.emptyContainer}>
                                <Ionicons
                                    name={searchMode === "ingredient" ? "nutrition-outline" : "search-outline"}
                                    size={48}
                                    color={colors.textSecondary}
                                />
                                <Text style={s.emptyText}>
                                    {searchMode === "ingredient"
                                        ? `No recipes found with ${ingredientsList.join(", ")}`
                                        : `No recipes found for "${query}"`}
                                </Text>
                                {searchMode === "ingredient" && (
                                    <Text style={s.emptySubtext}>Try fewer ingredients or different ones</Text>
                                )}
                            </View>
                        )
                    }
                />
            )}
        </SafeAreaView>
    );
};

const createStyles = (colors) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        title: {
            ...Typography.h2,
            color: colors.text,
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.md,
            marginBottom: Spacing.md,
        },

        // Mode toggle
        modeToggle: {
            flexDirection: "row",
            marginHorizontal: Spacing.lg,
            marginBottom: Spacing.md,
            backgroundColor: colors.surfaceVariant,
            borderRadius: BorderRadius.sm,
            padding: 4,
        },
        modeButton: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            paddingVertical: 10,
            borderRadius: BorderRadius.sm - 2,
        },
        modeButtonActive: { backgroundColor: colors.primary },
        modeButtonText: { ...Typography.bodySmall, fontWeight: "600", color: colors.text },
        modeButtonTextActive: { color: colors.textInverse },

        // Keyword search
        searchBar: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surfaceVariant,
            borderRadius: BorderRadius.sm,
            marginHorizontal: Spacing.lg,
            paddingHorizontal: Spacing.md,
            paddingVertical: 10,
            gap: Spacing.sm,
            marginBottom: Spacing.lg,
        },
        searchInput: { flex: 1, ...Typography.body, color: colors.text, padding: 0 },

        // Ingredient search
        ingredientSection: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
        ingredientHint: { ...Typography.bodySmall, color: colors.textSecondary, marginBottom: Spacing.sm },
        ingredientInputRow: { flexDirection: "row", gap: Spacing.sm },
        ingredientInputBar: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surfaceVariant,
            borderRadius: BorderRadius.sm,
            paddingHorizontal: Spacing.md,
            paddingVertical: 10,
            gap: Spacing.sm,
        },
        addButton: {
            backgroundColor: colors.primary,
            borderRadius: BorderRadius.sm,
            paddingHorizontal: Spacing.md,
            justifyContent: "center",
        },
        addButtonText: { ...Typography.button, color: colors.textInverse },
        chipsContainer: { marginTop: Spacing.md },
        chipsList: { gap: Spacing.sm, paddingBottom: Spacing.sm },
        chip: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: colors.primary,
            borderRadius: BorderRadius.full,
            paddingHorizontal: Spacing.md,
            paddingVertical: 6,
        },
        chipText: { ...Typography.bodySmall, color: colors.textInverse, fontWeight: "600" },
        searchButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: Spacing.sm,
            backgroundColor: colors.primary,
            borderRadius: BorderRadius.sm,
            paddingVertical: 14,
            marginTop: Spacing.sm,
        },
        searchButtonText: { ...Typography.button, color: colors.textInverse },

        // Categories
        quickFilters: { paddingHorizontal: Spacing.lg },
        sectionLabel: { ...Typography.h3, color: colors.text, marginBottom: Spacing.md },
        categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
        categoryCard: {
            width: "30%",
            backgroundColor: colors.surface,
            borderRadius: BorderRadius.md,
            padding: Spacing.md,
            alignItems: "center",
            gap: Spacing.sm,
            borderWidth: 1,
            borderColor: colors.border,
        },
        categoryLabel: { ...Typography.caption, color: colors.text, fontWeight: "600" },

        // Results
        row: { justifyContent: "space-between", paddingHorizontal: Spacing.lg },
        listContent: { paddingBottom: Spacing.lg },
        emptyContainer: {
            alignItems: "center",
            paddingTop: Spacing.xxl,
            gap: Spacing.md,
            paddingHorizontal: Spacing.lg,
        },
        emptyText: { ...Typography.body, color: colors.textSecondary, textAlign: "center" },
        emptySubtext: { ...Typography.bodySmall, color: colors.textSecondary, textAlign: "center" },
    });

export default SearchScreen;
