import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { db } from "../services/firebase";
import { useAuth } from "./AuthContext";

const ShoppingListContext = createContext();

export const ShoppingListProvider = ({ children }) => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const getListRef = useCallback(() => (user ? collection(db, "users", user.uid, "shoppingList") : null), [user]);

    useEffect(() => {
        if (!user) {
            setItems([]);
            return;
        }

        setLoading(true);
        const listRef = getListRef();
        const q = query(listRef, orderBy("addedAt", "desc"));

        const unsubscribe = onSnapshot(
            q,
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
                await addDoc(listRef, {
                    name: ingredient.name,
                    amount: ingredient.amount || "",
                    unit: ingredient.unit || "",
                    checked: false,
                    recipeTitle,
                    addedAt: serverTimestamp(),
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
                const snapshot = await getDocs(listRef);
                const existing = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

                const batch = writeBatch(db);
                ingredients.forEach((ingredient) => {
                    const name = ingredient.name.toLowerCase().trim();
                    const unit = (ingredient.unit || "").toLowerCase().trim();
                    // Find existing item with same name and unit
                    const match = existing.find(
                        (e) => e.name.toLowerCase().trim() === name && (e.unit || "").toLowerCase().trim() === unit,
                    );

                    if (match) {
                        // Merge amounts
                        const existingAmt = parseFloat(match.amount) || 0;
                        const newAmt = parseFloat(ingredient.amount) || 0;
                        const mergedAmount = existingAmt + newAmt;
                        const ref = doc(db, "users", user.uid, "shoppingList", match.id);
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
                        const ref = doc(listRef);
                        batch.set(ref, {
                            name: ingredient.name,
                            amount: ingredient.amount || "",
                            unit: ingredient.unit || "",
                            checked: false,
                            recipeTitle,
                            addedAt: serverTimestamp(),
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
                await updateDoc(doc(db, "users", user.uid, "shoppingList", itemId), {
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
                await deleteDoc(doc(db, "users", user.uid, "shoppingList", itemId));
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
            const snapshot = await getDocs(listRef);
            const batch = writeBatch(db);
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
            const q = query(listRef, where("checked", "==", true));
            const snapshot = await getDocs(q);
            const batch = writeBatch(db);
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
