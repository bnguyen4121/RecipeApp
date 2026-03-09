import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import StarRating from "react-native-star-rating-widget";
import { useAuth } from "../../contexts/AuthContext";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useShoppingList } from "../../contexts/ShoppingListContext";
import { useTheme } from "../../contexts/ThemeContext";
import { deleteRecipe, getRecipeById, getRecipeRatings, rateRecipe } from "../../services/recipeService";
import { createStyles } from "./recipeDetailStyles";

const RecipeDetailScreen = ({ route, navigation }) => {
    const { recipeId } = route.params;
    const { colors } = useTheme();
    const { user } = useAuth();
    const { addFavorite, removeFavorite, isFavorite } = useFavorites();
    const { addIngredientsFromRecipe } = useShoppingList();

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [ratings, setRatings] = useState([]);
    const [activeTab, setActiveTab] = useState("ingredients");

    // Portion scaling
    const [currentServings, setCurrentServings] = useState(null);
    const [originalServings, setOriginalServings] = useState(null);

    const saved = recipe ? isFavorite(recipe.id) : false;
    const scaleFactor = originalServings ? currentServings / originalServings : 1;

    // Check if current user is the author (can delete)
    const isAuthor = recipe?.authorId === user?.uid;

    useEffect(() => {
        loadRecipe();
    }, [recipeId]);

    const loadRecipe = async () => {
        setLoading(true);
        const data = await getRecipeById(recipeId);
        setRecipe(data);
        if (data) {
            setCurrentServings(data.servings || 1);
            setOriginalServings(data.servings || 1);
        }
        const recipeRatings = await getRecipeRatings(recipeId);
        setRatings(recipeRatings);
        const myRating = recipeRatings.find((r) => r.userId === user?.uid);
        if (myRating) setUserRating(myRating.score);
        setLoading(false);
    };

    const handleFavoriteToggle = () => {
        if (saved) removeFavorite(recipe.id);
        else addFavorite(recipe);
    };

    const handleAddToShoppingList = () => {
        if (!recipe?.ingredients?.length) return;
        const scaledIngredients = recipe.ingredients.map((ing) => ({
            ...ing,
            amount: ing.amount ? formatScaledAmount(parseFloat(ing.amount) * scaleFactor) : "",
        }));
        addIngredientsFromRecipe(scaledIngredients, recipe.title);
        Alert.alert("Added!", `Ingredients for ${currentServings} servings added to your shopping list.`);
    };

    const handleRate = async (rating) => {
        setUserRating(rating);
        await rateRecipe(recipeId, user.uid, rating);
        loadRecipe();
    };

    const handleDelete = () => {
        Alert.alert("Delete Recipe", `Are you sure you want to delete "${recipe.title}"? This cannot be undone.`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    setDeleting(true);
                    const result = await deleteRecipe(recipeId);
                    setDeleting(false);
                    if (result.success) {
                        // Also remove from favorites if saved
                        if (saved) removeFavorite(recipe.id);
                        Alert.alert("Deleted", "Recipe has been removed.", [
                            { text: "OK", onPress: () => navigation.goBack() },
                        ]);
                    } else {
                        Alert.alert("Error", "Failed to delete recipe. Please try again.");
                    }
                },
            },
        ]);
    };

    const increaseServings = () => setCurrentServings((prev) => prev + 1);
    const decreaseServings = () => setCurrentServings((prev) => (prev > 1 ? prev - 1 : 1));

    const formatScaledAmount = (value) => {
        if (!value || isNaN(value)) return "";
        const rounded = Math.round(value * 100) / 100;
        if (rounded === Math.floor(rounded)) return String(rounded);
        return rounded.toFixed(2).replace(/\.?0+$/, "");
    };

    const getScaledAmount = (originalAmount) => {
        if (!originalAmount) return "";
        const num = parseFloat(originalAmount);
        if (isNaN(num)) return originalAmount;
        return formatScaledAmount(num * scaleFactor);
    };

    const s = createStyles(colors);

    if (loading) {
        return (
            <View style={s.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!recipe) {
        return (
            <View style={s.loadingContainer}>
                <Text style={s.errorText}>Recipe not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
            <View style={s.imageContainer}>
                <Image source={{ uri: recipe.image }} style={s.heroImage} />
                <TouchableOpacity style={s.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={s.topRightButtons}>
                    <TouchableOpacity style={s.iconButton} onPress={handleFavoriteToggle}>
                        <Ionicons
                            name={saved ? "heart" : "heart-outline"}
                            size={24}
                            color={saved ? colors.primary : "#fff"}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={s.iconButton} onPress={handleDelete}>
                        <Ionicons name="trash-outline" size={22} color="#FF4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={s.content}>
                <Text style={s.title}>{recipe.title}</Text>

                {/* Author badge */}
                {recipe.authorName && (
                    <View style={s.authorRow}>
                        <Ionicons name="person-circle-outline" size={18} color={colors.textSecondary} />
                        <Text style={s.authorText}>
                            by {recipe.authorName}
                            {isAuthor ? " (you)" : ""}
                        </Text>
                    </View>
                )}

                <View style={s.metaRow}>
                    <View style={s.metaItem}>
                        <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
                        <Text style={s.metaText}>{recipe.cookingTime} min</Text>
                    </View>
                    <View style={s.metaItem}>
                        <Ionicons name="people-outline" size={18} color={colors.textSecondary} />
                        <Text style={s.metaText}>{originalServings} servings</Text>
                    </View>
                    <View style={s.metaItem}>
                        <Ionicons name="star" size={18} color={colors.star} />
                        <Text style={s.metaText}>
                            {recipe.averageRating?.toFixed(1) || "N/A"} ({recipe.totalRatings || 0})
                        </Text>
                    </View>
                </View>

                {/* Portion Scaling */}
                <View style={s.portionContainer}>
                    <Text style={s.portionLabel}>Adjust Servings</Text>
                    <View style={s.portionControls}>
                        <TouchableOpacity
                            style={[s.portionButton, currentServings <= 1 && s.portionButtonDisabled]}
                            onPress={decreaseServings}
                            disabled={currentServings <= 1}>
                            <Ionicons
                                name="remove"
                                size={20}
                                color={currentServings <= 1 ? colors.textSecondary : colors.primary}
                            />
                        </TouchableOpacity>
                        <View style={s.portionValueContainer}>
                            <Text style={s.portionValue}>{currentServings}</Text>
                            <Text style={s.portionUnit}>servings</Text>
                        </View>
                        <TouchableOpacity style={s.portionButton} onPress={increaseServings}>
                            <Ionicons name="add" size={20} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                    {currentServings !== originalServings && (
                        <TouchableOpacity onPress={() => setCurrentServings(originalServings)}>
                            <Text style={s.resetText}>Reset to original ({originalServings})</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {recipe.nutrition && (
                    <View style={s.nutritionRow}>
                        {["calories", "protein", "carbs", "fat"].map((key) => {
                            const scaledValue = Math.round(recipe.nutrition[key] * scaleFactor);
                            return (
                                <View key={key} style={s.nutritionItem}>
                                    <Text style={s.nutritionValue}>
                                        {scaledValue}
                                        {key === "calories" ? "" : "g"}
                                    </Text>
                                    <Text style={s.nutritionLabel}>{key}</Text>
                                </View>
                            );
                        })}
                    </View>
                )}

                <View style={s.tabRow}>
                    {["ingredients", "instructions"].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[s.tab, activeTab === tab && s.tabActive]}
                            onPress={() => setActiveTab(tab)}>
                            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {activeTab === "ingredients" ? (
                    <View style={s.section}>
                        {recipe.ingredients?.map((item, index) => {
                            const scaledAmount = getScaledAmount(item.amount);
                            return (
                                <View key={index} style={s.ingredientRow}>
                                    <View style={s.ingredientDot} />
                                    <Text style={s.ingredientText}>
                                        <Text style={s.ingredientAmount}>
                                            {scaledAmount} {item.unit}
                                        </Text>{" "}
                                        {item.name}
                                    </Text>
                                </View>
                            );
                        })}
                        <TouchableOpacity style={s.addToCartButton} onPress={handleAddToShoppingList}>
                            <Ionicons name="cart-outline" size={20} color={colors.textInverse} />
                            <Text style={s.addToCartText}>Add All to Shopping List ({currentServings} servings)</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={s.section}>
                        {recipe.instructions?.map((step, index) => (
                            <View key={index} style={s.stepRow}>
                                <View style={s.stepNumber}>
                                    <Text style={s.stepNumberText}>{index + 1}</Text>
                                </View>
                                <Text style={s.stepText}>{step.text}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={s.ratingSection}>
                    <Text style={s.sectionTitle}>Rate this Recipe</Text>
                    <StarRating rating={userRating} onChange={handleRate} starSize={32} color={colors.star} />
                </View>

                {ratings.length > 0 && (
                    <View style={s.commentsSection}>
                        <Text style={s.sectionTitle}>Reviews</Text>
                        {ratings.map((r, index) => (
                            <View key={index} style={s.commentCard}>
                                <StarRating rating={r.score} onChange={() => {}} starSize={16} color={colors.star} />
                                {r.comment ? <Text style={s.commentText}>{r.comment}</Text> : null}
                            </View>
                        ))}
                    </View>
                )}

                {/* Delete button at bottom */}
                <TouchableOpacity style={s.deleteButton} onPress={handleDelete} disabled={deleting}>
                    {deleting ? (
                        <ActivityIndicator color="#FF4444" />
                    ) : (
                        <>
                            <Ionicons name="trash-outline" size={18} color="#FF4444" />
                            <Text style={s.deleteButtonText}>Delete Recipe</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default RecipeDetailScreen;
