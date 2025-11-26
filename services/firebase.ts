
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAppConfig, saveAppConfig, saveChannels, saveMovies, getChannels, getMovies } from "./store";

let app: any = null;
let db: any = null;

export const initFirebase = () => {
  try {
    const configStr = getAppConfig().firebaseConfig;
    if (!configStr) return;

    const firebaseConfig = JSON.parse(configStr);
    
    // Check if app is already initialized
    if (!app) {
        app = initializeApp(firebaseConfig);
        
        // Analytics can sometimes fail in certain environments or if blocked by ad-blockers.
        // We wrap it in try-catch to ensure the DB still initializes.
        try {
            const analytics = getAnalytics(app);
        } catch (err) {
            console.warn("Firebase Analytics failed to init (non-fatal):", err);
        }

        db = getFirestore(app);
        console.log("Firebase Initialized Successfully");
    }
  } catch (e) {
    console.error("Failed to initialize Firebase:", e);
  }
};

// Function to save current app state to Firestore
export const saveToFirebase = async () => {
    if (!db) {
        initFirebase();
        if(!db) throw new Error("Firebase not initialized");
    }

    try {
        const config = getAppConfig();
        const channels = getChannels();
        const movies = getMovies();

        // Save to a specific document 'main/backup'
        await setDoc(doc(db, "app_data", "main"), {
            config,
            channels,
            movies,
            updatedAt: new Date().toISOString()
        });
        return true;
    } catch (e) {
        console.error("Firebase Save Error:", e);
        return false;
    }
};

// Function to load app state from Firestore
export const loadFromFirebase = async () => {
    if (!db) {
        initFirebase();
        if(!db) throw new Error("Firebase not initialized");
    }

    try {
        const docRef = doc(db, "app_data", "main");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.config) saveAppConfig(data.config);
            if (data.channels) saveChannels(data.channels);
            if (data.movies) saveMovies(data.movies);
            return true;
        } else {
            console.log("No backup found!");
            return false;
        }
    } catch (e) {
        console.error("Firebase Load Error:", e);
        return false;
    }
};
