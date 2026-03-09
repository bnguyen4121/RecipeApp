import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShoppingList } from "../../contexts/ShoppingListContext";
import { useTheme } from "../../contexts/ThemeContext";
import { BorderRadius, Spacing, Typography } from "../../styles/theme";

const ShoppingListScreen = () => {
    const { colors } = useTheme();
    const { items, loading, toggleItem, removeItem, clearList, clearChecked } = useShoppingList();
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const q = searchQuery.toLowerCase().trim();
        return items.filter(
            (i) => i.name.toLowerCase().includes(q) || (i.recipeTitle && i.recipeTitle.toLowerCase().includes(q)),
        );
    }, [items, searchQuery]);

    const unchecked = filtered.filter((i) => !i.checked);
    const checked = filtered.filter((i) => i.checked);

    const handleClearAll = () => {
        Alert.alert("Clear List", "Remove all items from your shopping list?", [
            { text: "Cancel", style: "cancel" },
            { text: "Clear", style: "destructive", onPress: clearList },
        ]);
    };

    const handleClearChecked = () => {
        Alert.alert("Clear Checked", "Remove all checked items?", [
            { text: "Cancel", style: "cancel" },
            { text: "Clear", style: "destructive", onPress: clearChecked },
        ]);
    };

    const s = createStyles(colors);

    const renderItem = ({ item }) => (
        <View style={s.itemRow}>
            <TouchableOpacity
                style={[s.checkbox, item.checked && s.checkboxChecked]}
                onPress={() => toggleItem(item.id, item.checked)}>
                {item.checked && <Ionicons name="checkmark" size={16} color={colors.textInverse} />}
            </TouchableOpacity>
            <View style={s.itemInfo}>
                <Text style={[s.itemName, item.checked && s.itemChecked]}>
                    {item.amount} {item.unit} {item.name}
                </Text>
                {item.recipeTitle && <Text style={s.itemRecipe}>from {item.recipeTitle}</Text>}
            </View>
            <TouchableOpacity
                onPress={() => removeItem(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={s.container} edges={["top"]}>
            <View style={s.header}>
                <View>
                    <Text style={s.title}>Shopping List</Text>
                    <Text style={s.subtitle}>{items.length} items</Text>
                </View>
                {items.length > 0 && (
                    <View style={s.headerActions}>
                        {items.some((i) => i.checked) && (
                            <TouchableOpacity onPress={handleClearChecked} style={s.headerButton}>
                                <Text style={s.headerButtonText}>Clear checked</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={handleClearAll} style={s.headerButton}>
                            <Text style={[s.headerButtonText, { color: colors.error }]}>Clear all</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Search bar */}
            {items.length > 0 && (
                <View style={s.searchBar}>
                    <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
                    <TextInput
                        style={s.searchInput}
                        placeholder="Search items..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <FlatList
                data={[...unchecked, ...checked]}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={s.listContent}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                    !loading && (
                        <View style={s.emptyContainer}>
                            <Ionicons name="cart-outline" size={64} color={colors.textSecondary} />
                            <Text style={s.emptyText}>
                                {searchQuery.trim() ? "No matching items" : "Your shopping list is empty"}
                            </Text>
                            {!searchQuery.trim() && (
                                <Text style={s.emptySubtext}>
                                    Add ingredients from any recipe to start building your list
                                </Text>
                            )}
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
        header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
        title: { ...Typography.h2, color: colors.text },
        subtitle: { ...Typography.bodySmall, color: colors.textSecondary, marginBottom: Spacing.sm },
        headerActions: { flexDirection: "row", gap: Spacing.md },
        headerButton: { paddingVertical: Spacing.xs },
        headerButtonText: { ...Typography.bodySmall, color: colors.primary, fontWeight: "600" },

        // Search bar
        searchBar: {
            flexDirection: "row",
            alignItems: "center",
            gap: Spacing.sm,
            backgroundColor: colors.surfaceVariant,
            borderRadius: BorderRadius.sm,
            marginHorizontal: Spacing.lg,
            marginBottom: Spacing.sm,
            paddingHorizontal: Spacing.md,
            paddingVertical: 10,
        },
        searchInput: { flex: 1, ...Typography.body, color: colors.text, padding: 0 },

        listContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
        itemRow: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            gap: Spacing.md,
        },
        checkbox: {
            width: 24,
            height: 24,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
        },
        checkboxChecked: { backgroundColor: colors.secondary, borderColor: colors.secondary },
        itemInfo: { flex: 1 },
        itemName: { ...Typography.body, color: colors.text },
        itemChecked: { textDecorationLine: "line-through", color: colors.textSecondary },
        itemRecipe: { ...Typography.caption, color: colors.textSecondary, marginTop: 2 },
        emptyContainer: {
            alignItems: "center",
            paddingTop: Spacing.xxl * 2,
            paddingHorizontal: Spacing.xl,
            gap: Spacing.sm,
        },
        emptyText: { ...Typography.h3, color: colors.textSecondary },
        emptySubtext: { ...Typography.bodySmall, color: colors.textSecondary, textAlign: "center" },
    });

export default ShoppingListScreen;
