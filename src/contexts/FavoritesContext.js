import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { db, FieldValue } from "../services/firebase";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            setFavorites([]);
            return;
        }

        setLoading(true);
        const q = db.collection("users").doc(user.uid).collection("favorites").orderBy("savedAt", "desc");

        const unsubscribe = q.onSnapshot(
            (snapshot) => {
                const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
                setFavorites(items);
                setLoading(false);
            },
            (error) => {
                console.error("Favorites listener error:", error);
                setLoading(false);
            },
        );

        return unsubscribe;
    }, [user]);

    const addFavorite = useCallback(
        async (recipe) => {
            if (!user) return { success: false, error: "Not logged in" };
            try {
                await db
                    .collection("users")
                    .doc(user.uid)
                    .collection("favorites")
                    .doc(recipe.id)
                    .set({
                        recipeId: recipe.id,
                        title: recipe.title,
                        image: recipe.image,
                        cookingTime: recipe.cookingTime,
                        category: recipe.category,
                        savedAt: FieldValue.serverTimestamp(),
                    });
                return { success: true };
            } catch (error) {
                console.error("Error adding favorite:", error);
                return { success: false, error: error.message };
            }
        },
        [user],
    );

    const removeFavorite = useCallback(
        async (recipeId) => {
            if (!user) return;
            try {
                await db.collection("users").doc(user.uid).collection("favorites").doc(recipeId).delete();
            } catch (error) {
                console.error("Error removing favorite:", error);
            }
        },
        [user],
    );

    const isFavorite = useCallback((recipeId) => favorites.some((fav) => fav.recipeId === recipeId), [favorites]);

    return (
        <FavoritesContext.Provider value={{ favorites, loading, addFavorite, removeFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
};
