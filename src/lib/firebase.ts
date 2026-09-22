import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredFirebaseConfig = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId,
};

let emulatorsConnected = false;

function assertFirebaseConfig(): void {
  const missingKeys = Object.entries(requiredFirebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing Firebase environment variables: ${missingKeys.join(', ')}`,
    );
  }
}

export function getFirebaseApp(): FirebaseApp {
  assertFirebaseConfig();
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseServices(): {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  if (
    import.meta.env.DEV &&
    import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true' &&
    !emulatorsConnected
  ) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', {
      disableWarnings: true,
    });
    connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
    emulatorsConnected = true;
  }

  return { app, auth, firestore };
}

/**
 * Call only after analytics consent has been granted. Analytics is intentionally
 * not initialized during application startup.
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined' || !firebaseConfig.measurementId) {
    return null;
  }

  if (!(await isSupported())) {
    return null;
  }

  return getAnalytics(getFirebaseApp());
}
