import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { db, FieldValue } from "../services/firebase";
import { useAuth } from "./AuthContext";

const ShoppingListContext = createContext();

export const ShoppingListProvider = ({ children }) => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const getListRef = useCallback(
        () => (user ? db.collection("users").doc(user.uid).collection("shoppingList") : null),
        [user],
    );

    useEffect(() => {
        if (!user) {
            setItems([]);
            return;
        }

        setLoading(true);
        const q = getListRef().orderBy("addedAt", "desc");

        const unsubscribe = q.onSnapshot(
            (snapshot) => {
                const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
                setItems(list);
                setLoading(false);
            },
            (error) => {
                console.error("Shopping list listener error:", error);
                setLoading(false);
            },
        );

        return unsubscribe;
    }, [user, getListRef]);

    const addItem = useCallback(
        async (ingredient, recipeTitle = null) => {
            const listRef = getListRef();
            if (!listRef) return;
            try {
                await listRef.add({
                    name: ingredient.name,
                    amount: ingredient.amount || "",
                    unit: ingredient.unit || "",
                    checked: false,
                    recipeTitle,
                    addedAt: FieldValue.serverTimestamp(),
                });
            } catch (error) {
                console.error("Error adding shopping item:", error);
            }
        },
        [getListRef],
    );

    const addIngredientsFromRecipe = useCallback(
        async (ingredients, recipeTitle) => {
            const listRef = getListRef();
            if (!listRef) return;
            try {
                // Fetch existing items to merge duplicates
                const snapshot = await listRef.get();
                const existing = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

                const batch = db.batch();
                ingredients.forEach((ingredient) => {
                    const name = ingredient.name.toLowerCase().trim();
                    const unit = (ingredient.unit || "").toLowerCase().trim();
                    const match = existing.find(
                        (e) => e.name.toLowerCase().trim() === name && (e.unit || "").toLowerCase().trim() === unit,
                    );

                    if (match) {
                        const existingAmt = parseFloat(match.amount) || 0;
                        const newAmt = parseFloat(ingredient.amount) || 0;
                        const mergedAmount = existingAmt + newAmt;
                        const ref = db.collection("users").doc(user.uid).collection("shoppingList").doc(match.id);
                        const existingTitles = (match.recipeTitle || "").split(", ").filter(Boolean);
                        const updatedTitle = existingTitles.includes(recipeTitle)
                            ? match.recipeTitle
                            : match.recipeTitle
                              ? `${match.recipeTitle}, ${recipeTitle}`
                              : recipeTitle;
                        batch.update(ref, {
                            amount: mergedAmount > 0 ? String(mergedAmount) : match.amount,
                            recipeTitle: updatedTitle,
                        });
                    } else {
                        const ref = listRef.doc();
                        batch.set(ref, {
                            name: ingredient.name,
                            amount: ingredient.amount || "",
                            unit: ingredient.unit || "",
                            checked: false,
                            recipeTitle,
                            addedAt: FieldValue.serverTimestamp(),
                        });
                    }
                });
                await batch.commit();
            } catch (error) {
                console.error("Error adding ingredients:", error);
            }
        },
        [getListRef, user],
    );

    const toggleItem = useCallback(
        async (itemId, currentChecked) => {
            if (!user) return;
            try {
                await db.collection("users").doc(user.uid).collection("shoppingList").doc(itemId).update({
                    checked: !currentChecked,
                });
            } catch (error) {
                console.error("Error toggling item:", error);
            }
        },
        [user],
    );

    const removeItem = useCallback(
        async (itemId) => {
            if (!user) return;
            try {
                await db.collection("users").doc(user.uid).collection("shoppingList").doc(itemId).delete();
            } catch (error) {
                console.error("Error removing item:", error);
            }
        },
        [user],
    );

    const clearList = useCallback(async () => {
        const listRef = getListRef();
        if (!listRef) return;
        try {
            const snapshot = await listRef.get();
            const batch = db.batch();
            snapshot.docs.forEach((d) => batch.delete(d.ref));
            await batch.commit();
        } catch (error) {
            console.error("Error clearing list:", error);
        }
    }, [getListRef]);

    const clearChecked = useCallback(async () => {
        const listRef = getListRef();
        if (!listRef) return;
        try {
            const snapshot = await listRef.where("checked", "==", true).get();
            const batch = db.batch();
            snapshot.docs.forEach((d) => batch.delete(d.ref));
            await batch.commit();
        } catch (error) {
            console.error("Error clearing checked items:", error);
        }
    }, [getListRef]);

    return (
        <ShoppingListContext.Provider
            value={{
                items,
                loading,
                addItem,
                addIngredientsFromRecipe,
                toggleItem,
                removeItem,
                clearList,
                clearChecked,
            }}>
            {children}
        </ShoppingListContext.Provider>
    );
};

export const useShoppingList = () => {
    const context = useContext(ShoppingListContext);
    if (!context) {
        throw new Error("useShoppingList must be used within a ShoppingListProvider");
    }
    return context;
};
