const DB_NAME = "voxtrans-media";
const DB_VERSION = 1;
const STORE_NAME = "audioBlobs";

type AudioBlobRecord = {
  key: string;
  blob: Blob;
  createdAt: number;
};

function openAudioDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
  });
}

function completeRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed"));
  });
}

export async function putHistoryAudioBlob(key: string, blob: Blob): Promise<void> {
  const db = await openAudioDb();
  try {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const payload: AudioBlobRecord = {
      key,
      blob,
      createdAt: Date.now(),
    };
    await completeRequest(store.put(payload));
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("IndexedDB transaction failed"));
      tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted"));
    });
  } finally {
    db.close();
  }
}

export async function getHistoryAudioBlob(key: string): Promise<Blob | null> {
  const db = await openAudioDb();
  try {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const record = await completeRequest(store.get(key));
    if (!record || typeof record !== "object") return null;
    const maybeRecord = record as Partial<AudioBlobRecord>;
    return maybeRecord.blob instanceof Blob ? maybeRecord.blob : null;
  } finally {
    db.close();
  }
}

export async function deleteHistoryAudioBlob(key: string): Promise<void> {
  const db = await openAudioDb();
  try {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await completeRequest(store.delete(key));
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("IndexedDB transaction failed"));
      tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted"));
    });
  } finally {
    db.close();
  }
}

export async function clearHistoryAudioBlobs(): Promise<void> {
  const db = await openAudioDb();
  try {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await completeRequest(store.clear());
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("IndexedDB transaction failed"));
      tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted"));
    });
  } finally {
    db.close();
  }
}
