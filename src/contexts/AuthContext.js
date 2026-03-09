import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Safety timeout — if Firebase doesn't respond in 10s, unblock the app
        const timeout = setTimeout(() => setLoading(false), 10000);

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
            const docSnap = await getDoc(doc(db, "users", uid));
            if (docSnap.exists()) {
                setUserProfile(docSnap.data());
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const signUp = async (email, password, displayName) => {
        try {
            const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(newUser, { displayName });

            await setDoc(doc(db, "users", newUser.uid), {
                displayName,
                email,
                dietaryPreferences: [],
                photoURL: null,
                createdAt: serverTimestamp(),
            });

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const signIn = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updateUserProfile = async (updates) => {
        if (!user) return { success: false, error: "No user logged in" };
        try {
            await updateDoc(doc(db, "users", user.uid), updates);
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
