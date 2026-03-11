// lib/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from "firebase/analytics";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqm_7_MsjtCNaEcgaxR9dcv-Nm1aWVlj0",
  authDomain: "simulator-cod.firebaseapp.com",
  projectId: "simulator-cod",
  storageBucket: "simulator-cod.firebasestorage.app",
  messagingSenderId: "328190135483",
  appId: "1:328190135483:web:c83078349faef3505ead9e",
  measurementId: "G-ZXVZ2026TG"
};

// Initialize Firebase (Singleton pattern for Next.js)
let app;

// Validation Check & Initialization
if (!firebaseConfig.apiKey) {
    console.warn("⚠️ Firebase API Keys are missing!");
}

try {
    if (firebaseConfig.apiKey) {
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApps()[0];
        }
    }
} catch (error) {
    console.error("Firebase Initialization Error:", error);
}

const auth = app ? getAuth(app) : null;
const db = null;
let analytics = null;

if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

// Export services
export { auth, db, analytics };

// Authentication methods
export const signUp = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Authenticate users only - Do NOT save user profile data
    return userCredential.user;
};

export const signIn = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async () => {
    return await signOut(auth);
};

export const resetPassword = async (email) => {
    return await sendPasswordResetEmail(auth, email);
};

export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
};

// Simulation CRUD operations - Stubbed out
export const saveSimulation = async (userId, simulationData) => {
    return "mock-id";
};

export const getSimulations = async (userId) => {
    return [];
};

export const updateSimulation = async (simulationId, data) => {
    return;
};

export const deleteSimulation = async (simulationId) => {
    return;
};

// Scenario operations (User Guide Part 1)
export const saveScenario = async (userId, scenarioData) => {
    return "mock-id";
};

export const getScenarios = async (userId) => {
    return [];
};

// User profile operations - Disabled
export const getUserProfile = async (userId) => {
    return null;
};

export const updateUserProfile = async (userId, data) => {
    return;
};
