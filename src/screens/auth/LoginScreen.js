import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Spacing } from "../../styles/theme";
import { createAuthStyles } from "./authStyles";

const LoginScreen = ({ navigation }) => {
    const { signIn } = useAuth();
    const { colors } = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        setLoading(true);
        const result = await signIn(email.trim(), password);
        setLoading(false);
        if (!result.success) {
            Alert.alert("Login Failed", result.error);
        }
    };

    const s = {
        ...createAuthStyles(colors),
        content: { flex: 1, justifyContent: "center", paddingHorizontal: Spacing.lg },
        logo: { fontSize: 64, marginBottom: Spacing.sm },
    };

    return (
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={s.content}>
                <View style={s.header}>
                    <Text style={s.logo}>🍳</Text>
                    <Text style={s.title}>RecipeApp</Text>
                    <Text style={s.subtitle}>Discover delicious recipes</Text>
                </View>

                <View style={s.form}>
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
                    <TouchableOpacity
                        style={[s.button, loading && s.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color={colors.textInverse} />
                        ) : (
                            <Text style={s.buttonText}>Log In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={s.footer}>
                    <Text style={s.footerText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                        <Text style={s.footerLink}> Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;
