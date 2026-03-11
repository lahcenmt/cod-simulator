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
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  setDoc,
  increment
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBqm_7_MsjtCNaEcgaxR9dcv-Nm1aWVlj0",
  authDomain: "simulator-cod.firebaseapp.com",
  projectId: "simulator-cod",
  storageBucket: "simulator-cod.firebasestorage.app",
  messagingSenderId: "328190135483",
  appId: "1:328190135483:web:c83078349faef3505ead9e",
  measurementId: "G-ZXVZ2026TG"
};

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
const db = app ? getFirestore(app) : null;
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
    // As per new requirements, initialize user profile in Firestore
    if (db && userCredential.user) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: displayName || "",
            createdAt: serverTimestamp(),
            plan: "free",
            preferences: {
                language: "en",
                currency: "MAD",
                theme: "light",
                autoSaveSimulations: true
            },
            stats: {
                totalSimulations: 0,
                totalScenarios: 0,
                totalBudgetPlans: 0
            }
        });
        if (displayName) {
            await updateProfile(userCredential.user, { displayName });
        }
    }
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
    const result = await signInWithPopup(auth, provider);
    if (db && result.user) {
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', result.user.uid), {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName || "",
                photoURL: result.user.photoURL || "",
                createdAt: serverTimestamp(),
                plan: "free",
                preferences: { language: "en", currency: "MAD", theme: "light", autoSaveSimulations: true },
                stats: { totalSimulations: 0, totalScenarios: 0, totalBudgetPlans: 0 }
            });
        }
    }
    return result;
};


// ============================================
// USER PROFILE MANAGEMENT
// ============================================

export const getUserProfile = async (userId) => {
  if (!db) return null;
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const updateUserProfile = async (userId, data) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId);
  return await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const updateUserPreferences = async (userId, preferences) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId);
  return await updateDoc(docRef, { preferences: preferences, updatedAt: serverTimestamp() });
};

// ============================================
// CURRENT STATE (AUTO-SAVE SIMULATOR INPUTS)
// ============================================

export const saveCurrentState = async (userId, stateData) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'currentState', 'simulator');
  return await setDoc(docRef, { ...stateData, lastUpdated: serverTimestamp() }, { merge: true });
};

export const getCurrentState = async (userId) => {
  if (!db) return null;
  const docRef = doc(db, 'users', userId, 'currentState', 'simulator');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const clearCurrentState = async (userId) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'currentState', 'simulator');
  return await deleteDoc(docRef);
};

// ============================================
// SIMULATIONS (COMPLETE HISTORY)
// ============================================

export const saveSimulation = async (userId, simulationData) => {
  if (!db) return "mock-id";
  const docRef = await addDoc(collection(db, 'users', userId, 'simulations'), {
    ...simulationData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  await updateDoc(doc(db, 'users', userId), {
    'stats.totalSimulations': increment(1),
    'stats.lastSimulationDate': serverTimestamp()
  });
  
  return docRef.id;
};

export const getSimulations = async (userId, options = {}) => {
  if (!db) return [];
  const { folderId = null, limit: limitCount = 50, orderByField = 'createdAt', orderDirection = 'desc' } = options;
  let q = query(collection(db, 'users', userId, 'simulations'), orderBy(orderByField, orderDirection));
  
  if (folderId) q = query(q, where('folderId', '==', folderId));
  if (limitCount) q = query(q, limit(limitCount));
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getSimulation = async (userId, simulationId) => {
  if (!db) return null;
  const docRef = doc(db, 'users', userId, 'simulations', simulationId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const updateSimulation = async (userId, simulationId, data) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'simulations', simulationId);
  return await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteSimulation = async (userId, simulationId) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'simulations', simulationId);
  await deleteDoc(docRef);
  await updateDoc(doc(db, 'users', userId), { 'stats.totalSimulations': increment(-1) });
};

export const moveSimulationToFolder = async (userId, simulationId, folderId) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'simulations', simulationId);
  return await updateDoc(docRef, { folderId: folderId || null, updatedAt: serverTimestamp() });
};

export const toggleFavoriteSimulation = async (userId, simulationId, currentValue) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'simulations', simulationId);
  return await updateDoc(docRef, { isFavorite: !currentValue, updatedAt: serverTimestamp() });
};

export const duplicateSimulation = async (userId, simulationId) => {
  const original = await getSimulation(userId, simulationId);
  if (!original) throw new Error('Simulation not found');
  
  const duplicate = { ...original, name: `${original.name} (Copy)`, isFavorite: false, isPinned: false };
  delete duplicate.id;
  delete duplicate.createdAt;
  delete duplicate.updatedAt;
  
  return await saveSimulation(userId, duplicate);
};

// ============================================
// SCENARIOS (COMPARISON)
// ============================================

export const saveScenario = async (userId, scenarioData) => {
  if (!db) return "mock-id";
  const docRef = await addDoc(collection(db, 'users', userId, 'scenarios'), {
    ...scenarioData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  await updateDoc(doc(db, 'users', userId), { 'stats.totalScenarios': increment(1) });
  return docRef.id;
};

export const getScenarios = async (userId, comparisonGroupId = null) => {
  if (!db) return [];
  let q = query(collection(db, 'users', userId, 'scenarios'), orderBy('createdAt', 'desc'));
  if (comparisonGroupId) q = query(q, where('comparisonGroupId', '==', comparisonGroupId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getScenario = async (userId, scenarioId) => {
  if (!db) return null;
  const docRef = doc(db, 'users', userId, 'scenarios', scenarioId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const updateScenario = async (userId, scenarioId, data) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'scenarios', scenarioId);
  return await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteScenario = async (userId, scenarioId) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'scenarios', scenarioId);
  await deleteDoc(docRef);
  await updateDoc(doc(db, 'users', userId), { 'stats.totalScenarios': increment(-1) });
};

export const deleteComparisonGroup = async (userId, comparisonGroupId) => {
  const scenarios = await getScenarios(userId, comparisonGroupId);
  const deletePromises = scenarios.map(s => deleteScenario(userId, s.id));
  return await Promise.all(deletePromises);
};

// ============================================
// BUDGET PLANS
// ============================================

export const saveBudgetPlan = async (userId, budgetData) => {
  if (!db) return "mock-id";
  const docRef = await addDoc(collection(db, 'users', userId, 'budgetPlans'), {
    ...budgetData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  await updateDoc(doc(db, 'users', userId), { 'stats.totalBudgetPlans': increment(1) });
  return docRef.id;
};

export const getBudgetPlans = async (userId) => {
  if (!db) return [];
  const q = query(collection(db, 'users', userId, 'budgetPlans'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getBudgetPlan = async (userId, planId) => {
  if (!db) return null;
  const docRef = doc(db, 'users', userId, 'budgetPlans', planId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const updateBudgetPlan = async (userId, planId, data) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'budgetPlans', planId);
  return await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteBudgetPlan = async (userId, planId) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'budgetPlans', planId);
  await deleteDoc(docRef);
  await updateDoc(doc(db, 'users', userId), { 'stats.totalBudgetPlans': increment(-1) });
};

export const setActiveBudgetPlan = async (userId, planId) => {
  const plans = await getBudgetPlans(userId);
  const updatePromises = plans.map(p => updateBudgetPlan(userId, p.id, { isActive: false }));
  await Promise.all(updatePromises);
  return await updateBudgetPlan(userId, planId, { isActive: true });
};

// ============================================
// FOLDERS
// ============================================

export const createFolder = async (userId, folderData) => {
  if (!db) return "mock-id";
  const docRef = await addDoc(collection(db, 'users', userId, 'folders'), {
    ...folderData, simulationCount: 0, totalProfit: 0, avgROI: 0,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getFolders = async (userId) => {
  if (!db) return [];
  const q = query(collection(db, 'users', userId, 'folders'), where('isArchived', '==', false), orderBy('order', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateFolder = async (userId, folderId, data) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'folders', folderId);
  return await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteFolder = async (userId, folderId) => {
  if (!db) return;
  const simulations = await getSimulations(userId, { folderId });
  const movePromises = simulations.map(s => moveSimulationToFolder(userId, s.id, null));
  await Promise.all(movePromises);
  const docRef = doc(db, 'users', userId, 'folders', folderId);
  return await deleteDoc(docRef);
};

export const updateFolderStats = async (userId, folderId) => {
  const simulations = await getSimulations(userId, { folderId });
  const totalProfit = simulations.reduce((sum, s) => sum + (s.results?.netProfit || 0), 0);
  const avgROI = simulations.length > 0 ? simulations.reduce((sum, s) => sum + (s.results?.roi || 0), 0) / simulations.length : 0;
  return await updateFolder(userId, folderId, { simulationCount: simulations.length, totalProfit, avgROI });
};

// ============================================
// NOTES
// ============================================

export const createNote = async (userId, noteData) => {
  if (!db) return "mock-id";
  const docRef = await addDoc(collection(db, 'users', userId, 'notes'), {
    ...noteData, isPinned: noteData.isPinned || false, tags: noteData.tags || [],
    createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getNotes = async (userId) => {
  if (!db) return [];
  const q = query(collection(db, 'users', userId, 'notes'), orderBy('isPinned', 'desc'), orderBy('updatedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateNote = async (userId, noteId, data) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'notes', noteId);
  return await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteNote = async (userId, noteId) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'notes', noteId);
  return await deleteDoc(docRef);
};

export const togglePinNote = async (userId, noteId, currentValue) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'notes', noteId);
  return await updateDoc(docRef, { isPinned: !currentValue, updatedAt: serverTimestamp() });
};

// ============================================
// TEAM MEMBERS
// ============================================

export const inviteTeamMember = async (userId, memberData) => {
  if (!db) return "mock-id";
  const docRef = await addDoc(collection(db, 'users', userId, 'teamMembers'), {
    ...memberData, status: 'pending', invitedBy: userId, invitedAt: serverTimestamp(),
    createdAt: serverTimestamp(), actionsCount: 0
  });
  return docRef.id;
};

export const getTeamMembers = async (userId) => {
  if (!db) return [];
  const q = query(collection(db, 'users', userId, 'teamMembers'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateTeamMember = async (userId, memberId, data) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'teamMembers', memberId);
  return await updateDoc(docRef, data);
};

export const removeTeamMember = async (userId, memberId) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'teamMembers', memberId);
  return await deleteDoc(docRef);
};
