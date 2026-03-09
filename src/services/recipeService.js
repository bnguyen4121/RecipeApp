import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    limit as firestoreLimit,
    getDoc,
    getDocs,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    startAfter,
    where,
} from "firebase/firestore";
import { db } from "./firebase";

const recipesRef = collection(db, "recipes");

export const getRecipes = async ({ category, limit = 20, lastDoc } = {}) => {
    try {
        const constraints = [orderBy("createdAt", "desc")];
        if (category) constraints.unshift(where("category", "==", category));
        if (lastDoc) constraints.push(startAfter(lastDoc));
        constraints.push(firestoreLimit(limit));
        const q = query(recipesRef, ...constraints);
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error("Error fetching recipes:", error);
        return [];
    }
};

export const getRecipeById = async (recipeId) => {
    try {
        const docSnap = await getDoc(doc(db, "recipes", recipeId));
        if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
        return null;
    } catch (error) {
        console.error("Error fetching recipe:", error);
        return null;
    }
};

export const searchRecipes = async (searchQuery) => {
    try {
        const normalized = searchQuery.toLowerCase().trim();

        // Fetch exact keyword matches and a broader set in parallel
        const [exactSnapshot, allSnapshot] = await Promise.all([
            getDocs(query(recipesRef, where("keywords", "array-contains", normalized), firestoreLimit(20))),
            getDocs(query(recipesRef, firestoreLimit(100))),
        ]);

        const exactIds = new Set(exactSnapshot.docs.map((d) => d.id));
        const exactResults = exactSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Client-side partial matching on title, keywords, and category
        const partialResults = allSnapshot.docs
            .filter((d) => !exactIds.has(d.id))
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((recipe) => {
                const title = (recipe.title || "").toLowerCase();
                const category = (recipe.category || "").toLowerCase();
                const keywords = (recipe.keywords || []).map((k) => k.toLowerCase());
                return (
                    title.includes(normalized) ||
                    category.includes(normalized) ||
                    keywords.some((k) => k.includes(normalized))
                );
            });

        return [...exactResults, ...partialResults].slice(0, 20);
    } catch (error) {
        console.error("Error searching recipes:", error);
        return [];
    }
};

export const searchByIngredients = async (ingredients) => {
    if (!ingredients || ingredients.length === 0) return [];
    try {
        const firstIngredient = ingredients[0].toLowerCase().trim();
        const q = query(recipesRef, where("keywords", "array-contains", firstIngredient), firestoreLimit(50));
        const snapshot = await getDocs(q);
        let results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (ingredients.length === 1) return results;
        const otherIngredients = ingredients.slice(1).map((i) => i.toLowerCase().trim());
        results = results.filter((recipe) => {
            const recipeKeywords = (recipe.keywords || []).map((k) => k.toLowerCase());
            const recipeIngredientNames = (recipe.ingredients || []).map((i) => i.name.toLowerCase());
            const allSearchable = [...recipeKeywords, ...recipeIngredientNames];
            return otherIngredients.every((ing) => allSearchable.some((searchable) => searchable.includes(ing)));
        });
        return results;
    } catch (error) {
        console.error("Error searching by ingredients:", error);
        try {
            const allSnapshot = await getDocs(query(recipesRef, firestoreLimit(100)));
            const allRecipes = allSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            return allRecipes.filter((recipe) => {
                const recipeIngredientNames = (recipe.ingredients || []).map((i) => i.name.toLowerCase());
                return ingredients.every((ing) =>
                    recipeIngredientNames.some((name) => name.includes(ing.toLowerCase().trim())),
                );
            });
        } catch (fallbackError) {
            console.error("Fallback search also failed:", fallbackError);
            return [];
        }
    }
};

export const uploadRecipe = async (recipeData) => {
    try {
        const docRef = await addDoc(recipesRef, {
            ...recipeData,
            averageRating: 0,
            totalRatings: 0,
            createdAt: serverTimestamp(),
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error uploading recipe:", error);
        return { success: false, error: error.message };
    }
};

export const deleteRecipe = async (recipeId) => {
    try {
        // Delete all ratings in the subcollection first
        const ratingsRef = collection(db, "recipes", recipeId, "ratings");
        const ratingsSnapshot = await getDocs(ratingsRef);
        const deletePromises = ratingsSnapshot.docs.map((d) => deleteDoc(d.ref));
        await Promise.all(deletePromises);

        await deleteDoc(doc(db, "recipes", recipeId));

        return { success: true };
    } catch (error) {
        console.error("Error deleting recipe:", error);
        return { success: false, error: error.message };
    }
};

export const CATEGORIES = [
    { id: "breakfast", label: "Breakfast", icon: "sunny-outline" },
    { id: "lunch", label: "Lunch", icon: "restaurant-outline" },
    { id: "dinner", label: "Dinner", icon: "moon-outline" },
    { id: "dessert", label: "Desserts", icon: "ice-cream-outline" },
    { id: "snack", label: "Snacks", icon: "cafe-outline" },
    { id: "drink", label: "Drinks", icon: "wine-outline" },
];

export const rateRecipe = async (recipeId, userId, score, comment = "") => {
    try {
        const recipeRef = doc(db, "recipes", recipeId);
        const ratingRef = doc(db, "recipes", recipeId, "ratings", userId);
        await runTransaction(db, async (transaction) => {
            const recipeDoc = await transaction.get(recipeRef);
            const existingRating = await transaction.get(ratingRef);
            const data = recipeDoc.data();
            let { averageRating = 0, totalRatings = 0 } = data;
            if (existingRating.exists()) {
                const oldScore = existingRating.data().score;
                const totalScore = averageRating * totalRatings - oldScore + score;
                averageRating = totalScore / totalRatings;
            } else {
                const totalScore = averageRating * totalRatings + score;
                totalRatings += 1;
                averageRating = totalScore / totalRatings;
            }
            transaction.set(ratingRef, { score, comment, createdAt: serverTimestamp() });
            transaction.update(recipeRef, {
                averageRating: Math.round(averageRating * 10) / 10,
                totalRatings,
            });
        });
        return { success: true };
    } catch (error) {
        console.error("Error rating recipe:", error);
        return { success: false, error: error.message };
    }
};

export const getRecipeRatings = async (recipeId, limit = 10) => {
    try {
        const ratingsRef = collection(db, "recipes", recipeId, "ratings");
        const q = query(ratingsRef, orderBy("createdAt", "desc"), firestoreLimit(limit));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({ userId: d.id, ...d.data() }));
    } catch (error) {
        console.error("Error fetching ratings:", error);
        return [];
    }
};
