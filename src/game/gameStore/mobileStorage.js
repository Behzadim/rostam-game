// آداپتور ذخیره‌سازی دائمی مخصوص موبایل (بدون وابستگی به localStorage)
// اولویت ۱: حافظه بومی اندروید/iOS (Capacitor Preferences)
// اولویت ۲: دیتابیس IndexedDB (برای تست روی ویندوز و پیش‌نمایش)

const DB_NAME = "RostamHaftKhanNativeDB";
const STORE_NAME = "game_saves";
const DB_VERSION = 1;

function getNativePreferences() {
  if (typeof window !== "undefined" && window.Capacitor?.Plugins?.Preferences) {
    return window.Capacitor.Plugins.Preferences;
  }
  return null;
}

function openIDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGet(key) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbRemove(key) {
  const db = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export const mobileStorage = {
  getItem: async (name) => {
    try {
      const nativePrefs = getNativePreferences();
      if (nativePrefs) {
        const { value } = await nativePrefs.get({ key: name });
        return value ?? null;
      }
      return await idbGet(name);
    } catch {
      return null;
    }
  },

  setItem: async (name, value) => {
    try {
      const nativePrefs = getNativePreferences();
      if (nativePrefs) {
        await nativePrefs.set({ key: name, value });
        return;
      }
      await idbSet(name, value);
    } catch {
      // جلوگیری از کرش در صورت پر بودن کامل حافظه گوشی
    }
  },

  removeItem: async (name) => {
    try {
      const nativePrefs = getNativePreferences();
      if (nativePrefs) {
        await nativePrefs.remove({ key: name });
        return;
      }
      await idbRemove(name);
    } catch {
      // نادیده گرفتن خطای حذف
    }
  },
};