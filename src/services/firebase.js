import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCOSV9jRrNALr5hMq9ujAzkYYvIfW_HXe4",
    authDomain: "recipe-app-ec18e.firebaseapp.com",
    projectId: "recipe-app-ec18e",
    storageBucket: "recipe-app-ec18e.firebasestorage.app",
    messagingSenderId: "122668164771",
    appId: "1:122668164771:web:702c52065c44eec36a4116",
    measurementId: "G-3YSPPG6FQM",
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export const FieldValue = firebase.firestore.FieldValue;
