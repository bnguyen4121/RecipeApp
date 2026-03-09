import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Spacing } from "../../styles/theme";
import { createAuthStyles } from "./authStyles";

const SignUpScreen = ({ navigation }) => {
    const { signUp } = useAuth();
    const { colors } = useTheme();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters.");
            return;
        }
        setLoading(true);
        const result = await signUp(email.trim(), password, name.trim());
        setLoading(false);
        if (!result.success) {
            Alert.alert("Sign Up Failed", result.error);
        }
    };

    const s = {
        ...createAuthStyles(colors),
        content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl },
    };

    return (
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
                <View style={s.header}>
                    <Text style={s.title}>Create Account</Text>
                    <Text style={s.subtitle}>Join our cooking community</Text>
                </View>

                <View style={s.form}>
                    <TextInput
                        style={s.input}
                        placeholder="Full name"
                        placeholderTextColor={colors.textSecondary}
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        style={s.input}
                        placeholder="Email address"
                        placeholderTextColor={colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TextInput
                        style={s.input}
                        placeholder="Password"
                        placeholderTextColor={colors.textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <TextInput
                        style={s.input}
                        placeholder="Confirm password"
                        placeholderTextColor={colors.textSecondary}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[s.button, loading && s.buttonDisabled]}
                        onPress={handleSignUp}
                        disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color={colors.textInverse} />
                        ) : (
                            <Text style={s.buttonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={s.footer}>
                    <Text style={s.footerText}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={s.footerLink}> Log In</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default SignUpScreen;
