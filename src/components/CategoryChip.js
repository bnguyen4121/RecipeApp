import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { BorderRadius, Spacing, Typography } from "../styles/theme";

const CategoryChip = ({ label, icon, selected, onPress }) => {
    const { colors } = useTheme();
    const s = createStyles(colors, selected);

    return (
        <TouchableOpacity style={s.chip} onPress={onPress} activeOpacity={0.7}>
            <Ionicons name={icon} size={16} color={selected ? colors.textInverse : colors.primary} />
            <Text style={s.label}>{label}</Text>
        </TouchableOpacity>
    );
};

const createStyles = (colors, selected) =>
    StyleSheet.create({
        chip: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
            borderRadius: BorderRadius.full,
            backgroundColor: selected ? colors.primary : colors.surface,
            borderWidth: 1,
            borderColor: selected ? colors.primary : colors.border,
        },
        label: { ...Typography.bodySmall, fontWeight: "600", color: selected ? colors.textInverse : colors.text },
    });

export default React.memo(CategoryChip);
