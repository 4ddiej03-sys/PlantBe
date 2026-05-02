// src/utils/photoStorage.js
// Stores plant photos in IndexedDB — on the user's device only
// Never sent to Supabase, Vercel or GitHub
// Each photo is ~500KB-2MB max, stored locally forever until user clears browser data

const DB_NAME = "PlantBePhotos";
const DB_VERSION = 1;
const STORE_NAME = "photos";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "plantId" });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

// Save a photo for a plant (overwrites if exists)
export async function savePhoto(plantId, photoData) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ plantId, photoData, savedAt: new Date().toISOString() });
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error("Photo save failed:", e);
    return false;
  }
}

// Get a photo for a plant
export async function getPhoto(plantId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(plantId);
      req.onsuccess = () => resolve(req.result?.photoData || null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error("Photo load failed:", e);
    return null;
  }
}

// Delete a photo
export async function deletePhoto(plantId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(plantId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error("Photo delete failed:", e);
    return false;
  }
}

// Get all saved photo IDs
export async function getAllPhotoIds() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAllKeys();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    return [];
  }
}
