const DB_NAME = "api_cache";
const STORE_NAME = "responses";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in ms
const DB_VERSION = 1;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "cacheKey" });
            }
        };

        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

async function getCached(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = (e) => {
            const entry = e.target.result;
            if (!entry) return resolve(null);

            const isExpired = Date.now() - entry.timestamp > CACHE_DURATION;
            resolve(isExpired ? null : entry.data);
        };

        request.onerror = (e) => reject(e.target.error);
    });
}

async function setCached(key, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.put({
            cacheKey: key,
            data,
            timestamp: Date.now(),
        });

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}

export async function invalidateCached(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);

        // If key is a prefix (e.g. "users"), delete all entries that start with it
        const request = store.openCursor();
        request.onsuccess = (e) => {
            const cursor = e.target.result;
            if (!cursor) return resolve();
            if (cursor.key.startsWith(key)) cursor.delete();
            cursor.continue();
        };

        request.onerror = (e) => reject(e.target.error);
    });
}

// Wraps a fetch function with caching
export async function withCache(cacheKey, fetchFn) {
    const cached = await getCached(cacheKey);
    if (cached !== null) {
        console.log("Cache hit for", cacheKey);
        return cached;
    }

    const data = await fetchFn();
    await setCached(cacheKey, data);
    return data;
}
