import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, writeBatch } from "firebase/firestore";
import { Customer, Channel, AppConfig } from "../types";
import { getAppConfig } from "./store";

// Helper to get config safely
const getConfig = () => {
    try {
        const conf = getAppConfig().firebaseConfig;
        return conf ? JSON.parse(conf) : null;
    } catch (e) {
        return null;
    }
};

let db: any = null;
let isOfflineMode = false;

// Initialize Firebase safely
export const initFirebase = () => {
    if (db) return db;
    
    const config = getConfig();
    if (!config) {
        console.warn("No Firebase config found. Using Local Mode.");
        isOfflineMode = true;
        return null;
    }

    try {
        const app = initializeApp(config);
        db = getFirestore(app);
        console.log("Firebase connected successfully.");
        isOfflineMode = false;
        return db;
    } catch (e) {
        console.error("Firebase init failed (falling back to local):", e);
        isOfflineMode = true;
        return null;
    }
};

// --- Subscription Logic ---

export const registerDevice = async (deviceId: string) => {
    if (isOfflineMode || !db) {
        // Local Fallback
        const key = `mock_user_${deviceId}`;
        if (!localStorage.getItem(key)) {
            const newUser: Customer = {
                id: deviceId,
                deviceId,
                status: 'Pending',
                subscriptionEnd: null,
                lastActive: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };
            localStorage.setItem(key, JSON.stringify(newUser));
        }
        return;
    }

    // Cloud Logic
    try {
        const ref = doc(db, "users", deviceId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            await setDoc(ref, {
                deviceId,
                status: 'Pending',
                subscriptionEnd: null,
                lastActive: new Date().toISOString(),
                createdAt: new Date().toISOString()
            });
        }
    } catch (e) {
        console.error("Register device failed:", e);
    }
};

export const subscribeToUserStatus = (deviceId: string, callback: (status: Customer | null) => void) => {
    if (isOfflineMode || !db) {
        // Local Polling
        const key = `mock_user_${deviceId}`;
        const check = () => {
            const data = localStorage.getItem(key);
            if (data) callback(JSON.parse(data));
        };
        check();
        const interval = setInterval(check, 2000);
        return () => clearInterval(interval);
    }

    // Cloud Listener
    try {
        return onSnapshot(doc(db, "users", deviceId), (doc) => {
            if (doc.exists()) callback({ id: doc.id, ...doc.data() } as Customer);
            else callback(null);
        }, (err) => {
            console.warn("Firestore listener failed, switching to offline:", err);
            isOfflineMode = true;
        });
    } catch (e) {
        console.error("Subscribe failed:", e);
        return () => {};
    }
};

export const updateUserSubscription = async (deviceId: string, days: number) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    const isoDate = endDate.toISOString();

    if (isOfflineMode || !db) {
        const key = `mock_user_${deviceId}`;
        const data = localStorage.getItem(key);
        if (data) {
            const user = JSON.parse(data);
            user.status = 'Active';
            user.subscriptionEnd = isoDate;
            localStorage.setItem(key, JSON.stringify(user));
        }
        return;
    }

    try {
        await setDoc(doc(db, "users", deviceId), {
            status: 'Active',
            subscriptionEnd: isoDate, // Storing as string for simplicity in this demo
            lastActive: new Date().toISOString()
        }, { merge: true });
    } catch (e) {
        console.error("Update sub failed:", e);
    }
};

export const subscribeToUsersCollection = (callback: (users: Customer[]) => void) => {
    if (isOfflineMode || !db) {
        const check = () => {
            const users: Customer[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('mock_user_')) {
                    users.push(JSON.parse(localStorage.getItem(key) || '{}'));
                }
            }
            callback(users);
        };
        check();
        const interval = setInterval(check, 2000);
        return () => clearInterval(interval);
    }

    try {
        const userRef = collection(db, "users");
        return onSnapshot(userRef, (snapshot) => {
            const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
            callback(users);
        });
    } catch (e) {
        return () => {};
    }
};

// --- Content Logic ---

export const uploadChannelsBatch = async (channels: Channel[]) => {
    if (isOfflineMode || !db) return false;

    try {
        const batch = writeBatch(db);
        // Upload first 400 only to avoid batch limits in this demo
        channels.slice(0, 400).forEach(ch => {
            const ref = doc(db, "channels", ch.id);
            batch.set(ref, ch);
        });
        await batch.commit();
        return true;
    } catch (e) {
        console.error("Batch upload failed:", e);
        return false;
    }
};