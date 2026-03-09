import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFavorites } from "../contexts/FavoritesContext";
import { useTheme } from "../contexts/ThemeContext";
import { BorderRadius, Spacing, Typography } from "../styles/theme";

const CARD_WIDTH = (Dimensions.get("window").width - Spacing.lg * 2 - Spacing.md) / 2;

const RecipeCard = ({ recipe, onPress, onLongPress, selected }) => {
    const { colors } = useTheme();
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const saved = isFavorite(recipe.id);

    const handleFavorite = () => {
        if (saved) removeFavorite(recipe.id);
        else addFavorite(recipe);
    };

    const s = createStyles(colors);

    return (
        <TouchableOpacity
            style={[s.card, selected && { borderColor: colors.primary, borderWidth: 2 }]}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.8}>
            {selected && (
                <View style={s.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                </View>
            )}
            <View style={s.imageContainer}>
                <Image source={{ uri: recipe.image }} style={s.image} />
                {!selected && (
                    <TouchableOpacity style={s.heartButton} onPress={handleFavorite}>
                        <Ionicons
                            name={saved ? "heart" : "heart-outline"}
                            size={18}
                            color={saved ? colors.primary : "#fff"}
                        />
                    </TouchableOpacity>
                )}
            </View>
            <View style={s.info}>
                <Text style={s.title} numberOfLines={2}>
                    {recipe.title}
                </Text>
                <View style={s.meta}>
                    {recipe.cookingTime && (
                        <View style={s.metaItem}>
                            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                            <Text style={s.metaText}>{recipe.cookingTime} min</Text>
                        </View>
                    )}
                    {recipe.category && <Text style={s.categoryBadge}>{recipe.category}</Text>}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const createStyles = (colors) =>
    StyleSheet.create({
        card: {
            width: CARD_WIDTH,
            backgroundColor: colors.surface,
            borderRadius: BorderRadius.md,
            marginBottom: Spacing.md,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colors.border,
        },
        selectedBadge: {
            position: "absolute",
            top: Spacing.sm,
            left: Spacing.sm,
            zIndex: 10,
            backgroundColor: colors.surface,
            borderRadius: BorderRadius.full,
        },
        imageContainer: { position: "relative" },
        image: { width: "100%", height: CARD_WIDTH * 0.75, backgroundColor: colors.skeleton },
        heartButton: {
            position: "absolute",
            top: Spacing.sm,
            right: Spacing.sm,
            backgroundColor: "rgba(0,0,0,0.35)",
            borderRadius: BorderRadius.full,
            padding: 6,
        },
        info: { padding: Spacing.sm },
        title: { ...Typography.bodySmall, fontWeight: "600", color: colors.text, marginBottom: Spacing.xs },
        meta: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
        metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
        metaText: { ...Typography.caption, color: colors.textSecondary },
        categoryBadge: { ...Typography.caption, color: colors.primary, fontWeight: "600", textTransform: "capitalize" },
    });

export default React.memo(RecipeCard);
