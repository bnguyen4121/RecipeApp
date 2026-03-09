import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Keyboard,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Vibration,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryChip from "../../components/CategoryChip";
import RecipeCard from "../../components/RecipeCard";
import SkeletonCard from "../../components/SkeletonCard";
import { useAuth } from "../../contexts/AuthContext";
import { useShoppingList } from "../../contexts/ShoppingListContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
    CATEGORIES,
    deleteRecipe,
    getRecipeById,
    getRecipes,
    searchByIngredients,
    searchRecipes,
} from "../../services/recipeService";
import { createStyles } from "./homeStyles";

const HomeScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const { userProfile } = useAuth();
    const { addIngredientsFromRecipe } = useShoppingList();
    const [recipes, setRecipes] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Multi-select state
    const [selectMode, setSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Search state
    const [searchActive, setSearchActive] = useState(false);
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchMode, setSearchMode] = useState("keyword");
    const [ingredientInput, setIngredientInput] = useState("");
    const [ingredientsList, setIngredientsList] = useState([]);
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const searchInputRef = useRef(null);

    const fetchRecipes = useCallback(async () => {
        setLoading(true);
        const data = await getRecipes({ category: selectedCategory });
        setRecipes(data);
        setLoading(false);
    }, [selectedCategory]);

    useFocusEffect(
        useCallback(() => {
            fetchRecipes();
        }, [fetchRecipes]),
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchRecipes();
        setRefreshing(false);
    };

    const handleCategoryPress = (categoryId) => {
        setSelectedCategory((prev) => (prev === categoryId ? null : categoryId));
    };

    // Multi-select handlers
    const startSelect = (recipeId) => {
        Vibration.vibrate(50);
        setSelectMode(true);
        setSelectedIds(new Set([recipeId]));
    };

    const toggleSelect = (recipeId) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(recipeId)) next.delete(recipeId);
            else next.add(recipeId);
            if (next.size === 0) setSelectMode(false);
            return next;
        });
    };

    const cancelSelect = () => {
        setSelectMode(false);
        setSelectedIds(new Set());
    };

    const handleDeleteSelected = () => {
        Alert.alert(
            "Delete Recipes",
            `Delete ${selectedIds.size} selected recipe${selectedIds.size > 1 ? "s" : ""}? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const ids = [...selectedIds];
                        cancelSelect();
                        await Promise.all(ids.map((id) => deleteRecipe(id)));
                        fetchRecipes();
                    },
                },
            ],
        );
    };

    const handleAddToShoppingList = async () => {
        const ids = [...selectedIds];
        cancelSelect();
        let addedCount = 0;
        for (const id of ids) {
            const recipe = recipes.find((r) => r.id === id) || (await getRecipeById(id));
            if (recipe && recipe.ingredients && recipe.ingredients.length > 0) {
                await addIngredientsFromRecipe(recipe.ingredients, recipe.title);
                addedCount++;
            }
        }
        Alert.alert(
            "Added to Shopping List",
            `Ingredients from ${addedCount} recipe${addedCount > 1 ? "s" : ""} added.`,
        );
    };

    // Search handlers
    const openSearch = () => {
        setSearchActive(true);
        Animated.timing(overlayOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            searchInputRef.current?.focus();
        });
    };

    const closeSearch = () => {
        Keyboard.dismiss();
        Animated.timing(overlayOpacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => {
            setSearchActive(false);
            setQuery("");
            setSearchResults([]);
            setHasSearched(false);
            setSearchMode("keyword");
            setIngredientInput("");
            setIngredientsList([]);
        });
    };

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;
        setSearchLoading(true);
        setHasSearched(true);
        const data = await searchRecipes(query.trim());
        setSearchResults(data);
        setSearchLoading(false);
    }, [query]);

    const addIngredient = () => {
        const trimmed = ingredientInput.trim().toLowerCase();
        if (!trimmed || ingredientsList.includes(trimmed)) return;
        setIngredientsList((prev) => [...prev, trimmed]);
        setIngredientInput("");
    };

    const removeIngredient = (ingredient) => {
        setIngredientsList((prev) => prev.filter((i) => i !== ingredient));
    };

    const handleIngredientSearch = useCallback(async () => {
        if (ingredientsList.length === 0) return;
        setSearchLoading(true);
        setHasSearched(true);
        const data = await searchByIngredients(ingredientsList);
        setSearchResults(data);
        setSearchLoading(false);
    }, [ingredientsList]);

    const handleResultPress = (recipeId) => {
        closeSearch();
        navigation.navigate("RecipeDetail", { recipeId });
    };

    const handleCategorySearch = (label) => {
        setQuery(label);
        setSearchMode("keyword");
        (async () => {
            setSearchLoading(true);
            setHasSearched(true);
            const data = await searchRecipes(label);
            setSearchResults(data);
            setSearchLoading(false);
        })();
    };

    const handleCardPress = (recipeId) => {
        if (selectMode) {
            toggleSelect(recipeId);
        } else {
            navigation.navigate("RecipeDetail", { recipeId });
        }
    };

    const handleCardLongPress = (recipeId) => {
        if (!selectMode) {
            startSelect(recipeId);
        }
    };

    const greeting = userProfile?.displayName ? `Hello, ${userProfile.displayName.split(" ")[0]}!` : "Hello!";

    const s = createStyles(colors);

    return (
        <SafeAreaView style={s.container} edges={["top"]}>
            {/* Multi-select action bar */}
            {selectMode ? (
                <View style={s.selectBar}>
                    <TouchableOpacity onPress={cancelSelect} style={s.selectBarButton}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={s.selectBarText}>{selectedIds.size} selected</Text>
                    <View style={s.selectBarActions}>
                        <TouchableOpacity onPress={handleAddToShoppingList} style={s.selectBarAction}>
                            <Ionicons name="cart-outline" size={22} color={colors.primary} />
                            <Text style={s.selectBarActionText}>Shopping</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDeleteSelected} style={s.selectBarAction}>
                            <Ionicons name="trash-outline" size={22} color={colors.error} />
                            <Text style={[s.selectBarActionText, { color: colors.error }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <>
                    <View style={s.header}>
                        <Text style={s.greeting}>{greeting}</Text>
                        <Text style={s.headerTitle}>What would you like to cook?</Text>
                    </View>

                    {/* Tappable search bar (inactive state) */}
                    {!searchActive && (
                        <TouchableOpacity style={s.searchBar} activeOpacity={0.7} onPress={openSearch}>
                            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                            <Text style={s.searchBarPlaceholder}>Search recipes...</Text>
                        </TouchableOpacity>
                    )}
                </>
            )}

            {/* Search dropdown overlay */}
            {searchActive && (
                <Animated.View style={[s.searchOverlay, { opacity: overlayOpacity }]}>
                    {/* Active search input */}
                    <View style={s.activeSearchRow}>
                        <View style={s.activeSearchBar}>
                            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                            {searchMode === "keyword" ? (
                                <TextInput
                                    ref={searchInputRef}
                                    style={s.searchInput}
                                    placeholder="Search recipes..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={query}
                                    onChangeText={setQuery}
                                    onSubmitEditing={handleSearch}
                                    returnKeyType="search"
                                    autoFocus
                                />
                            ) : (
                                <TextInput
                                    ref={searchInputRef}
                                    style={s.searchInput}
                                    placeholder="e.g. chicken, rice, garlic..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={ingredientInput}
                                    onChangeText={setIngredientInput}
                                    onSubmitEditing={addIngredient}
                                    returnKeyType="done"
                                    autoFocus
                                />
                            )}
                            {(query.length > 0 || ingredientsList.length > 0) && (
                                <TouchableOpacity
                                    onPress={() => {
                                        setQuery("");
                                        setSearchResults([]);
                                        setHasSearched(false);
                                        setIngredientsList([]);
                                        setIngredientInput("");
                                    }}>
                                    <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <TouchableOpacity onPress={closeSearch} style={s.cancelButton}>
                            <Text style={s.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search mode toggle */}
                    <View style={s.modeToggle}>
                        <TouchableOpacity
                            style={[s.modeButton, searchMode === "keyword" && s.modeButtonActive]}
                            onPress={() => {
                                setSearchMode("keyword");
                                setHasSearched(false);
                                setSearchResults([]);
                            }}>
                            <Ionicons
                                name="search-outline"
                                size={14}
                                color={searchMode === "keyword" ? colors.textInverse : colors.text}
                            />
                            <Text style={[s.modeButtonText, searchMode === "keyword" && s.modeButtonTextActive]}>
                                By Name
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[s.modeButton, searchMode === "ingredient" && s.modeButtonActive]}
                            onPress={() => {
                                setSearchMode("ingredient");
                                setHasSearched(false);
                                setSearchResults([]);
                            }}>
                            <Ionicons
                                name="nutrition-outline"
                                size={14}
                                color={searchMode === "ingredient" ? colors.textInverse : colors.text}
                            />
                            <Text style={[s.modeButtonText, searchMode === "ingredient" && s.modeButtonTextActive]}>
                                By Ingredients
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Ingredient chips + search button */}
                    {searchMode === "ingredient" && ingredientsList.length > 0 && (
                        <View style={s.ingredientChipsSection}>
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
                            <TouchableOpacity style={s.ingredientSearchButton} onPress={handleIngredientSearch}>
                                <Ionicons name="search" size={16} color={colors.textInverse} />
                                <Text style={s.ingredientSearchButtonText}>
                                    Find with {ingredientsList.length} ingredient{ingredientsList.length > 1 ? "s" : ""}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Dropdown content */}
                    <View style={s.dropdownContent}>
                        {searchLoading ? (
                            <View style={s.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.primary} />
                            </View>
                        ) : hasSearched ? (
                            <FlatList
                                key="search-results"
                                data={searchResults}
                                keyExtractor={(item) => item.id}
                                numColumns={2}
                                columnWrapperStyle={s.row}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={s.resultsGrid}
                                renderItem={({ item }) => (
                                    <RecipeCard recipe={item} onPress={() => handleResultPress(item.id)} />
                                )}
                                ListEmptyComponent={
                                    <View style={s.emptySearch}>
                                        <Ionicons name="search-outline" size={40} color={colors.textSecondary} />
                                        <Text style={s.emptySearchText}>No recipes found</Text>
                                    </View>
                                }
                            />
                        ) : (
                            <ScrollView
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={s.suggestionsContent}>
                                <Text style={s.suggestionsLabel}>Browse by Category</Text>
                                <View style={s.categoryGrid}>
                                    {CATEGORIES.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={s.categoryCard}
                                            onPress={() => handleCategorySearch(cat.label)}>
                                            <Ionicons name={cat.icon} size={24} color={colors.primary} />
                                            <Text style={s.categoryLabel}>{cat.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        )}
                    </View>

                    {/* Backdrop to close */}
                    <TouchableWithoutFeedback onPress={closeSearch}>
                        <View style={s.backdrop} />
                    </TouchableWithoutFeedback>
                </Animated.View>
            )}

            {/* Main content (hidden behind overlay when search is active) */}
            {!searchActive && (
                <>
                    {!selectMode && (
                        <View style={s.categoriesContainer}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={s.categoriesList}>
                                {CATEGORIES.map((cat) => (
                                    <CategoryChip
                                        key={cat.id}
                                        label={cat.label}
                                        icon={cat.icon}
                                        selected={selectedCategory === cat.id}
                                        onPress={() => handleCategoryPress(cat.id)}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {loading ? (
                        <View style={s.skeletonContainer}>
                            {[1, 2, 3, 4].map((i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </View>
                    ) : (
                        <FlatList
                            key="home-feed"
                            data={recipes}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            columnWrapperStyle={s.row}
                            contentContainerStyle={s.listContent}
                            renderItem={({ item }) => (
                                <RecipeCard
                                    recipe={item}
                                    onPress={() => handleCardPress(item.id)}
                                    onLongPress={() => handleCardLongPress(item.id)}
                                    selected={selectedIds.has(item.id)}
                                />
                            )}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    tintColor={colors.primary}
                                />
                            }
                            ListEmptyComponent={
                                <View style={s.emptyContainer}>
                                    <Text style={s.emptyText}>No recipes found</Text>
                                    <Text style={s.emptySubtext}>Try a different category</Text>
                                </View>
                            }
                        />
                    )}
                </>
            )}
        </SafeAreaView>
    );
};

export default HomeScreen;
