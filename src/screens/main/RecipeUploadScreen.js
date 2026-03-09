import { Ionicons } from "@expo/vector-icons";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { CATEGORIES, uploadRecipe } from "../../services/recipeService";
import { createStyles } from "./recipeUploadStyles";

const RecipeUploadScreen = ({ navigation }) => {
    const { colors } = useTheme();
    const { user, userProfile } = useAuth();

    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [category, setCategory] = useState("");
    const [cookingTime, setCookingTime] = useState("");
    const [servings, setServings] = useState("");
    const [ingredients, setIngredients] = useState([{ name: "", amount: "", unit: "" }]);
    const [instructions, setInstructions] = useState([""]);
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fat, setFat] = useState("");
    const [loading, setLoading] = useState(false);

    const addIngredient = () => {
        setIngredients((prev) => [...prev, { name: "", amount: "", unit: "" }]);
    };

    const removeIngredient = (index) => {
        if (ingredients.length <= 1) return;
        setIngredients((prev) => prev.filter((_, i) => i !== index));
    };

    const updateIngredient = (index, field, value) => {
        setIngredients((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addInstruction = () => {
        setInstructions((prev) => [...prev, ""]);
    };

    const removeInstruction = (index) => {
        if (instructions.length <= 1) return;
        setInstructions((prev) => prev.filter((_, i) => i !== index));
    };

    const updateInstruction = (index, value) => {
        setInstructions((prev) => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    const validate = () => {
        if (!title.trim()) {
            Alert.alert("Error", "Please enter a recipe title.");
            return false;
        }
        if (!category) {
            Alert.alert("Error", "Please select a category.");
            return false;
        }
        if (!cookingTime.trim()) {
            Alert.alert("Error", "Please enter cooking time.");
            return false;
        }
        if (!servings.trim()) {
            Alert.alert("Error", "Please enter number of servings.");
            return false;
        }
        const validIngredients = ingredients.filter((i) => i.name.trim());
        if (validIngredients.length === 0) {
            Alert.alert("Error", "Please add at least one ingredient.");
            return false;
        }
        const validInstructions = instructions.filter((i) => i.trim());
        if (validInstructions.length === 0) {
            Alert.alert("Error", "Please add at least one instruction step.");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);

        const validIngredients = ingredients.filter((i) => i.name.trim());
        const validInstructions = instructions.filter((i) => i.trim());

        const keywords = [
            ...title.toLowerCase().split(/\s+/),
            ...validIngredients.map((i) => i.name.toLowerCase().trim()),
            category.toLowerCase(),
        ].filter((k) => k.length > 2);

        const recipeData = {
            title: title.trim(),
            image: imageUrl.trim() || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600",
            category,
            cookingTime: parseInt(cookingTime, 10),
            servings: parseInt(servings, 10),
            keywords: [...new Set(keywords)],
            ingredients: validIngredients.map((i) => ({
                name: i.name.trim(),
                amount: i.amount.trim(),
                unit: i.unit.trim(),
            })),
            instructions: validInstructions.map((text, index) => ({
                step: index + 1,
                text: text.trim(),
            })),
            nutrition:
                calories || protein || carbs || fat
                    ? {
                          calories: parseInt(calories, 10) || 0,
                          protein: parseInt(protein, 10) || 0,
                          carbs: parseInt(carbs, 10) || 0,
                          fat: parseInt(fat, 10) || 0,
                      }
                    : null,
            authorId: user.uid,
            authorName: userProfile?.displayName || user.email,
        };

        const result = await uploadRecipe(recipeData);
        setLoading(false);

        if (result.success) {
            Alert.alert("Recipe Published!", "Your recipe is now live.", [
                {
                    text: "Create Another",
                    onPress: () => {
                        setTitle("");
                        setImageUrl("");
                        setCategory("");
                        setCookingTime("");
                        setServings("");
                        setIngredients([{ name: "", amount: "", unit: "" }]);
                        setInstructions([""]);
                        setCalories("");
                        setProtein("");
                        setCarbs("");
                        setFat("");
                    },
                },
                {
                    text: "View Recipe",
                    onPress: () => {
                        navigation.replace("MainTabs", {
                            screen: "Home",
                            params: {
                                screen: "RecipeDetail",
                                params: { recipeId: result.id },
                            },
                        });
                    },
                },
            ]);
        } else {
            Alert.alert("Upload Failed", result.error);
        }
    };

    const s = createStyles(colors);

    return (
        <SafeAreaView style={s.container} edges={["top"]}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
                    <View style={s.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="close" size={28} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={s.headerTitle}>New Recipe</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    <Text style={s.label}>Recipe Title *</Text>
                    <TextInput
                        style={s.input}
                        placeholder="e.g. Grandma's Apple Pie"
                        placeholderTextColor={colors.textSecondary}
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text style={s.label}>Image URL</Text>
                    <TextInput
                        style={s.input}
                        placeholder="https://example.com/image.jpg (optional)"
                        placeholderTextColor={colors.textSecondary}
                        value={imageUrl}
                        onChangeText={setImageUrl}
                        autoCapitalize="none"
                        keyboardType="url"
                    />

                    <Text style={s.label}>Category *</Text>
                    <View style={s.categoryGrid}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[s.categoryChip, category === cat.id && s.categoryChipActive]}
                                onPress={() => setCategory(cat.id)}>
                                <Ionicons
                                    name={cat.icon}
                                    size={16}
                                    color={category === cat.id ? colors.textInverse : colors.primary}
                                />
                                <Text style={[s.categoryChipText, category === cat.id && s.categoryChipTextActive]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={s.row}>
                        <View style={s.halfField}>
                            <Text style={s.label}>Cooking Time (min) *</Text>
                            <TextInput
                                style={s.input}
                                placeholder="30"
                                placeholderTextColor={colors.textSecondary}
                                value={cookingTime}
                                onChangeText={setCookingTime}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={s.halfField}>
                            <Text style={s.label}>Servings *</Text>
                            <TextInput
                                style={s.input}
                                placeholder="4"
                                placeholderTextColor={colors.textSecondary}
                                value={servings}
                                onChangeText={setServings}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={s.sectionHeader}>
                        <Text style={s.sectionTitle}>Ingredients *</Text>
                        <TouchableOpacity onPress={addIngredient} style={s.addRowButton}>
                            <Ionicons name="add-circle" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {ingredients.map((ing, index) => (
                        <View key={index} style={s.ingredientRow}>
                            <TextInput
                                style={[s.input, s.ingredientAmount]}
                                placeholder="Qty"
                                placeholderTextColor={colors.textSecondary}
                                value={ing.amount}
                                onChangeText={(v) => updateIngredient(index, "amount", v)}
                            />
                            <TextInput
                                style={[s.input, s.ingredientUnit]}
                                placeholder="Unit"
                                placeholderTextColor={colors.textSecondary}
                                value={ing.unit}
                                onChangeText={(v) => updateIngredient(index, "unit", v)}
                            />
                            <TextInput
                                style={[s.input, s.ingredientName]}
                                placeholder="Ingredient name"
                                placeholderTextColor={colors.textSecondary}
                                value={ing.name}
                                onChangeText={(v) => updateIngredient(index, "name", v)}
                            />
                            {ingredients.length > 1 && (
                                <TouchableOpacity
                                    onPress={() => removeIngredient(index)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Ionicons name="close-circle" size={22} color={colors.error} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <View style={s.sectionHeader}>
                        <Text style={s.sectionTitle}>Instructions *</Text>
                        <TouchableOpacity onPress={addInstruction} style={s.addRowButton}>
                            <Ionicons name="add-circle" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {instructions.map((step, index) => (
                        <View key={index} style={s.stepRow}>
                            <View style={s.stepNumberBadge}>
                                <Text style={s.stepNumberText}>{index + 1}</Text>
                            </View>
                            <TextInput
                                style={[s.input, s.stepInput]}
                                placeholder={`Step ${index + 1}...`}
                                placeholderTextColor={colors.textSecondary}
                                value={step}
                                onChangeText={(v) => updateInstruction(index, v)}
                                multiline
                            />
                            {instructions.length > 1 && (
                                <TouchableOpacity
                                    onPress={() => removeInstruction(index)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Ionicons name="close-circle" size={22} color={colors.error} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <Text style={s.sectionTitle}>Nutrition (optional)</Text>
                    <Text style={s.sectionHint}>Per serving</Text>
                    <View style={s.nutritionGrid}>
                        <View style={s.nutritionField}>
                            <Text style={s.nutritionLabel}>Calories</Text>
                            <TextInput
                                style={s.nutritionInput}
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                                value={calories}
                                onChangeText={setCalories}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={s.nutritionField}>
                            <Text style={s.nutritionLabel}>Protein (g)</Text>
                            <TextInput
                                style={s.nutritionInput}
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                                value={protein}
                                onChangeText={setProtein}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={s.nutritionField}>
                            <Text style={s.nutritionLabel}>Carbs (g)</Text>
                            <TextInput
                                style={s.nutritionInput}
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                                value={carbs}
                                onChangeText={setCarbs}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={s.nutritionField}>
                            <Text style={s.nutritionLabel}>Fat (g)</Text>
                            <TextInput
                                style={s.nutritionInput}
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                                value={fat}
                                onChangeText={setFat}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[s.submitButton, loading && s.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color={colors.textInverse} />
                        ) : (
                            <>
                                <Ionicons name="cloud-upload-outline" size={20} color={colors.textInverse} />
                                <Text style={s.submitButtonText}>Publish Recipe</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RecipeUploadScreen;
