import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { BorderRadius, Spacing, Typography } from "../../styles/theme";

const DIETARY_OPTIONS = [
    "Vegetarian",
    "Vegan",
    "Keto",
    "Paleo",
    "Gluten-Free",
    "Dairy-Free",
    "Low-Carb",
    "Pescatarian",
];

const ProfileScreen = () => {
    const { user, userProfile, signOut, updateProfile } = useAuth();
    const { isDark, toggleTheme, colors } = useTheme();
    const [selectedDiets, setSelectedDiets] = useState(userProfile?.dietaryPreferences || []);

    const handleDietToggle = async (diet) => {
        const updated = selectedDiets.includes(diet)
            ? selectedDiets.filter((d) => d !== diet)
            : [...selectedDiets, diet];
        setSelectedDiets(updated);
        await updateProfile({ dietaryPreferences: updated });
    };

    const handleSignOut = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", style: "destructive", onPress: signOut },
        ]);
    };

    const s = createStyles(colors);

    return (
        <SafeAreaView style={s.container} edges={["top"]}>
            <ScrollView contentContainerStyle={s.content}>
                <View style={s.profileHeader}>
                    <View style={s.avatar}>
                        <Text style={s.avatarText}>
                            {(userProfile?.displayName || user?.email || "?")[0].toUpperCase()}
                        </Text>
                    </View>
                    <Text style={s.name}>{userProfile?.displayName || "User"}</Text>
                    <Text style={s.email}>{user?.email}</Text>
                </View>

                <View style={s.section}>
                    <Text style={s.sectionTitle}>Settings</Text>
                    <View style={s.settingRow}>
                        <View style={s.settingInfo}>
                            <Ionicons name="moon-outline" size={22} color={colors.text} />
                            <Text style={s.settingLabel}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: colors.primaryLight }}
                            thumbColor={isDark ? colors.primary : colors.surface}
                        />
                    </View>
                </View>

                <View style={s.section}>
                    <Text style={s.sectionTitle}>Dietary Preferences</Text>
                    <View style={s.chipGrid}>
                        {DIETARY_OPTIONS.map((diet) => {
                            const selected = selectedDiets.includes(diet);
                            return (
                                <TouchableOpacity
                                    key={diet}
                                    style={[s.chip, selected && s.chipSelected]}
                                    onPress={() => handleDietToggle(diet)}>
                                    <Text style={[s.chipText, selected && s.chipTextSelected]}>{diet}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <TouchableOpacity style={s.signOutButton} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={20} color={colors.error} />
                    <Text style={s.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const createStyles = (colors) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
        profileHeader: { alignItems: "center", marginBottom: Spacing.xl, paddingTop: Spacing.md },
        avatar: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: Spacing.md,
        },
        avatarText: { fontSize: 32, fontWeight: "700", color: colors.textInverse },
        name: { ...Typography.h2, color: colors.text },
        email: { ...Typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
        section: { marginBottom: Spacing.xl },
        sectionTitle: { ...Typography.h3, color: colors.text, marginBottom: Spacing.md },
        settingRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: colors.surface,
            borderRadius: BorderRadius.sm,
            padding: Spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        settingInfo: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
        settingLabel: { ...Typography.body, color: colors.text },
        chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
        chip: {
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
            borderRadius: BorderRadius.full,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
        },
        chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
        chipText: { ...Typography.bodySmall, color: colors.text },
        chipTextSelected: { color: colors.textInverse, fontWeight: "600" },
        signOutButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: Spacing.sm,
            paddingVertical: Spacing.md,
            borderRadius: BorderRadius.sm,
            borderWidth: 1,
            borderColor: colors.error,
            marginTop: Spacing.md,
        },
        signOutText: { ...Typography.button, color: colors.error },
    });

export default ProfileScreen;
