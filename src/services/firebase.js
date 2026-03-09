import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCOSV9jRrNALr5hMq9ujAzkYYvIfW_HXe4",
    authDomain: "recipe-app-ec18e.firebaseapp.com",
    projectId: "recipe-app-ec18e",
    storageBucket: "recipe-app-ec18e.firebasestorage.app",
    messagingSenderId: "122668164771",
    appId: "1:122668164771:web:702c52065c44eec36a4116",
    measurementId: "G-3YSPPG6FQM",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
} catch {
    auth = getAuth(app);
}

const db = getFirestore(app);

const storage = getStorage(app);

export { app, auth, db, storage };
