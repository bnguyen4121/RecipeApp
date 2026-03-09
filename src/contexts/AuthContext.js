import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, FieldValue } from "../services/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Safety timeout — if Firebase doesn't respond in 10s, unblock the app
        const timeout = setTimeout(() => setLoading(false), 10000);

        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            clearTimeout(timeout);
            if (firebaseUser) {
                setUser(firebaseUser);
                await fetchUserProfile(firebaseUser.uid);
            } else {
                setUser(null);
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => {
            clearTimeout(timeout);
            unsubscribe();
        };
    }, []);

    const fetchUserProfile = async (uid) => {
        try {
            const docSnap = await db.collection("users").doc(uid).get();
            if (docSnap.exists) {
                setUserProfile(docSnap.data());
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const signUp = async (email, password, displayName) => {
        try {
            const { user: newUser } = await auth.createUserWithEmailAndPassword(email, password);
            await newUser.updateProfile({ displayName });

            await db.collection("users").doc(newUser.uid).set({
                displayName,
                email,
                dietaryPreferences: [],
                photoURL: null,
                createdAt: FieldValue.serverTimestamp(),
            });

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const signIn = async (email, password) => {
        try {
            await auth.signInWithEmailAndPassword(email, password);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const signOut = async () => {
        try {
            await auth.signOut();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updateUserProfile = async (updates) => {
        if (!user) return { success: false, error: "No user logged in" };
        try {
            await db.collection("users").doc(user.uid).update(updates);
            setUserProfile((prev) => ({ ...prev, ...updates }));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userProfile,
                loading,
                signUp,
                signIn,
                signOut,
                updateProfile: updateUserProfile,
                fetchUserProfile,
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
