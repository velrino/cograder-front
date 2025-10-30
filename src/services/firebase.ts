import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  Database,
  DataSnapshot,
  query,
  orderByChild,
  limitToLast,
  endBefore,
  get,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCSEEAYrOv3RyiK64iGuGV5an9DM1sGwAc",
  authDomain: "cograder-test-4348a.firebaseapp.com",
  databaseURL: "https://cograder-test-4348a-default-rtdb.firebaseio.com",
  projectId: "cograder-test-4348a",
  storageBucket: "cograder-test-4348a.firebasestorage.app",
  messagingSenderId: "37178738881",
  appId: "1:37178738881:web:4d4b7959fa975573e5ac40",
  measurementId: "G-11QYZZW5WK",
};

let app: FirebaseApp | null = null;
let database: Database | null = null;

function initializeFirebase() {
  if (typeof window === "undefined") return;

  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    database = getDatabase(app);
  }
}

export interface DevImage {
  id: string;
  progress: number;
  originalUrl?: string;
  resultUrl: string;
  status: string;
  timestamp: number;
}

export interface PaginationOptions {
  pageSize?: number;
  lastTimestamp?: number;
}

export async function fetchDevImages(
  options: PaginationOptions = {}
): Promise<DevImage[]> {
  if (typeof window === "undefined") {
    return [];
  }

  initializeFirebase();

  if (!database) {
    console.error("Database not initialized");
    return [];
  }

  const devImagesRef = ref(database, "IMAGES");

  const pageSize = options.pageSize || 10;

  try {
    let queryRef;

    if (options.lastTimestamp) {
      // Load more: get items older than lastTimestamp
      queryRef = query(
        devImagesRef,
        orderByChild("timestamp"),
        endBefore(options.lastTimestamp),
        limitToLast(pageSize)
      );
    } else {
      // Initial load: get latest items
      queryRef = query(
        devImagesRef,
        orderByChild("timestamp"),
        limitToLast(pageSize)
      );
    }

    const snapshot = await get(queryRef);
    const data = snapshot.val();

    if (!data) {
      return [];
    }

    const images: DevImage[] = Object.entries(data).map(
      ([id, value]: [string, any]) => ({
        id,
        progress: value.progress || 0,
        originalUrl: value.originalUrl || undefined,
        resultUrl: value.resultUrl || "",
        status: value.status || "unknown",
        timestamp: value.timestamp || 0,
      })
    );

    // Sort by timestamp descending (newest first)
    images.sort((a, b) => b.timestamp - a.timestamp);

    return images;
  } catch (error) {
    console.error("Firebase error:", error);
    return [];
  }
}

export function subscribeToDevImages(callback: (images: DevImage[]) => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  initializeFirebase();

  if (!database) {
    console.error("Database not initialized");
    callback([]);
    return () => {};
  }

  const devImagesRef = ref(database, "IMAGES");

  const unsubscribe = onValue(
    devImagesRef,
    (snapshot: DataSnapshot) => {
      const data = snapshot.val();

      if (!data) {
        callback([]);
        return;
      }

      const images: DevImage[] = Object.entries(data).map(
        ([id, value]: [string, any]) => ({
          id,
          progress: value.progress || 0,
          originalUrl: value.originalUrl || undefined,
          resultUrl: value.resultUrl || "",
          status: value.status || "unknown",
          timestamp: value.timestamp || 0,
        })
      );

      // Sort by timestamp descending (newest first)
      images.sort((a, b) => b.timestamp - a.timestamp);

      callback(images);
    },
    (error) => {
      console.error("Firebase error:", error);
      callback([]);
    }
  );

  return unsubscribe;
}

export { database };
