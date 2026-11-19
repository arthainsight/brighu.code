import type { OgdbPerson } from './ogdb';

// The people of the Open Gauquelin Database the user has loaded, kept in the browser's IndexedDB (24 000 of them do not fit the 5 MB of localStorage).
// Nothing is sent to a server.

const DB_NAME = 'bcp-gauquelin';
const STORE = 'people';
const BATCH = 2000;

export const ogdbStorageAvailable = () => typeof indexedDB !== 'undefined';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  return open().then(db => new Promise<T | undefined>((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const request = work(transaction.objectStore(STORE));
    transaction.oncomplete = () => { db.close(); resolve(request ? request.result : undefined); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
    transaction.onabort = () => { db.close(); reject(transaction.error); };
  }));
}

/** Replaces what is kept with these people, a batch at a time. */
export async function replaceOgdb(people: readonly OgdbPerson[]): Promise<void> {
  await run('readwrite', store => { store.clear(); });
  for (let start = 0; start < people.length; start += BATCH) {
    const batch = people.slice(start, start + BATCH);
    await run('readwrite', store => { for (const person of batch) store.put(person); });
  }
}

export async function loadOgdb(): Promise<OgdbPerson[]> {
  return (await run<OgdbPerson[]>('readonly', store => store.getAll())) ?? [];
}

export async function clearOgdb(): Promise<void> {
  await run('readwrite', store => { store.clear(); });
}
