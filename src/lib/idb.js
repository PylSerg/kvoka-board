const DB_NAME = 'kvokaBoardDB';
const STORE_NAME = 'boardStore';
const DB_VERSION = 1;
const BOARD_KEY = 'autosave_board';
const PANELS_KEY = 'custom_panels';

function getDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

export async function saveBoardToDB(data) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(data, BOARD_KEY);
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function loadBoardFromDB() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(BOARD_KEY);
        
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function deleteBoardFromDB() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(BOARD_KEY);
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function savePanelsToDB(panels) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(panels, PANELS_KEY);
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function loadPanelsFromDB() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(PANELS_KEY);
        
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}
