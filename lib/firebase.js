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
import {
    getFirestore,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    getDocs,
    getDoc,
    serverTimestamp,
    limit
} from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase (Singleton pattern for Next.js)
let app;

// Validation Check
if (!firebaseConfig.apiKey) {
    console.warn("⚠️ Firebase API Keys are missing! Please check your .env.local file.");
}

if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);
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
    await updateProfile(userCredential.user, { displayName });
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

// Simulation CRUD operations
export const saveSimulation = async (userId, simulationData) => {
    try {
        const docRef = await addDoc(collection(db, 'simulations'), {
            ...simulationData,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

export const getSimulations = async (userId) => {
    const q = query(
        collection(db, 'simulations'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateSimulation = async (simulationId, data) => {
    const docRef = doc(db, 'simulations', simulationId);
    return await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
};

export const deleteSimulation = async (simulationId) => {
    return await deleteDoc(doc(db, 'simulations', simulationId));
};

// Scenario operations (User Guide Part 1)
export const saveScenario = async (userId, scenarioData) => {
    const docRef = await addDoc(collection(db, 'scenarios'), {
        ...scenarioData,
        userId,
        createdAt: serverTimestamp()
    });
    return docRef.id;
};

export const getScenarios = async (userId) => {
    const q = query(
        collection(db, 'scenarios'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// User profile operations
export const getUserProfile = async (userId) => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
};

export const updateUserProfile = async (userId, data) => {
    const docRef = doc(db, 'users', userId);
    return await updateDoc(docRef, data); // Note: updateDoc fails if doc doesn't exist, setDoc covers both create/update if merge needed
};
