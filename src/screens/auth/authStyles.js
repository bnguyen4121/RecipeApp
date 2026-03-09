import { StyleSheet } from "react-native";
import { BorderRadius, Spacing, Typography } from "../../styles/theme";

// Shared styles for LoginScreen and SignUpScreen
export const createAuthStyles = (colors) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: { alignItems: "center", marginBottom: Spacing.xl },
        title: { ...Typography.h1, color: colors.text, marginBottom: Spacing.xs },
        subtitle: { ...Typography.body, color: colors.textSecondary },
        form: { marginBottom: Spacing.lg },
        input: {
            backgroundColor: colors.surfaceVariant,
            borderRadius: BorderRadius.sm,
            paddingHorizontal: Spacing.md,
            paddingVertical: 14,
            ...Typography.body,
            color: colors.text,
            marginBottom: Spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        button: {
            backgroundColor: colors.primary,
            borderRadius: BorderRadius.sm,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: Spacing.sm,
        },
        buttonDisabled: { opacity: 0.7 },
        buttonText: { ...Typography.button, color: colors.textInverse },
        footer: { flexDirection: "row", justifyContent: "center" },
        footerText: { ...Typography.body, color: colors.textSecondary },
        footerLink: { ...Typography.body, color: colors.primary, fontWeight: "600" },
    });
