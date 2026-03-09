import { StyleSheet } from "react-native";
import { BorderRadius, Spacing, Typography } from "../../styles/theme";

export const createStyles = (colors) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
        greeting: { ...Typography.bodySmall, color: colors.textSecondary, marginBottom: 2 },
        headerTitle: { ...Typography.h2, color: colors.text },

        // Multi-select bar
        selectBar: {
            flexDirection: "row",
            alignItems: "center",
            gap: Spacing.sm,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        selectBarButton: { padding: Spacing.xs },
        selectBarText: { ...Typography.h3, color: colors.text, flex: 1 },
        selectBarActions: { flexDirection: "row", gap: Spacing.md },
        selectBarAction: { alignItems: "center", gap: 2 },
        selectBarActionText: { ...Typography.caption, color: colors.primary, fontWeight: "600" },

        // Inactive search bar
        searchBar: {
            flexDirection: "row",
            alignItems: "center",
            gap: Spacing.sm,
            backgroundColor: colors.surfaceVariant,
            borderRadius: BorderRadius.sm,
            marginHorizontal: Spacing.lg,
            marginTop: Spacing.sm,
            marginBottom: Spacing.xs,
            paddingHorizontal: Spacing.md,
            paddingVertical: 12,
        },
        searchBarPlaceholder: { ...Typography.body, color: colors.textSecondary },

        // Search overlay
        searchOverlay: {
            flex: 1,
            zIndex: 10,
        },
        activeSearchRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: Spacing.sm,
            paddingHorizontal: Spacing.lg,
            marginTop: Spacing.sm,
        },
        activeSearchBar: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: Spacing.sm,
            backgroundColor: colors.surfaceVariant,
            borderRadius: BorderRadius.sm,
            paddingHorizontal: Spacing.md,
            paddingVertical: 10,
        },
        searchInput: { flex: 1, ...Typography.body, color: colors.text, padding: 0 },
        cancelButton: { paddingVertical: Spacing.sm },
        cancelText: { ...Typography.body, color: colors.primary, fontWeight: "600" },

        // Mode toggle
        modeToggle: {
            flexDirection: "row",
            marginHorizontal: Spacing.lg,
            marginTop: Spacing.sm,
            backgroundColor: colors.surfaceVariant,
            borderRadius: BorderRadius.sm,
            padding: 3,
        },
        modeButton: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            paddingVertical: 8,
            borderRadius: BorderRadius.sm - 2,
        },
        modeButtonActive: { backgroundColor: colors.primary },
        modeButtonText: { ...Typography.caption, fontWeight: "600", color: colors.text },
        modeButtonTextActive: { color: colors.textInverse },

        // Ingredient chips
        ingredientChipsSection: { paddingHorizontal: Spacing.lg, marginTop: Spacing.sm },
        chipsList: { gap: Spacing.sm, paddingBottom: Spacing.xs },
        chip: {
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            backgroundColor: colors.primary,
            borderRadius: BorderRadius.full,
            paddingHorizontal: Spacing.md,
            paddingVertical: 5,
        },
        chipText: { ...Typography.caption, color: colors.textInverse, fontWeight: "600" },
        ingredientSearchButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: Spacing.sm,
            backgroundColor: colors.primary,
            borderRadius: BorderRadius.sm,
            paddingVertical: 12,
            marginTop: Spacing.sm,
        },
        ingredientSearchButtonText: { ...Typography.bodySmall, color: colors.textInverse, fontWeight: "600" },

        // Dropdown content
        dropdownContent: {
            flex: 1,
            backgroundColor: colors.background,
            marginTop: Spacing.sm,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        loadingContainer: { paddingTop: Spacing.xxl, alignItems: "center" },
        resultsGrid: { paddingVertical: Spacing.sm, paddingTop: Spacing.md },

        // Empty search
        emptySearch: { alignItems: "center", paddingTop: Spacing.xxl, gap: Spacing.sm },
        emptySearchText: { ...Typography.body, color: colors.textSecondary },

        // Category suggestions in dropdown
        suggestionsContent: { padding: Spacing.lg },
        suggestionsLabel: { ...Typography.h3, color: colors.text, marginBottom: Spacing.md },
        categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
        categoryCard: {
            width: "29%",
            backgroundColor: colors.surface,
            borderRadius: BorderRadius.md,
            padding: Spacing.md,
            alignItems: "center",
            gap: Spacing.sm,
            borderWidth: 1,
            borderColor: colors.border,
        },
        categoryLabel: { ...Typography.caption, color: colors.text, fontWeight: "600", textAlign: "center" },

        backdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 },

        // Home content
        categoriesContainer: { paddingVertical: Spacing.sm },
        categoriesList: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
        row: { justifyContent: "space-between", paddingHorizontal: Spacing.lg },
        listContent: { paddingBottom: Spacing.lg, paddingTop: Spacing.sm },
        skeletonContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            paddingHorizontal: Spacing.lg,
        },
        emptyContainer: { alignItems: "center", paddingTop: Spacing.xxl },
        emptyText: { ...Typography.h3, color: colors.textSecondary },
        emptySubtext: { ...Typography.bodySmall, color: colors.textSecondary, marginTop: Spacing.xs },
    });
