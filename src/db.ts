import { openDB, DBSchema } from 'idb';

interface Task {
    date: Date,
    text: string,
    project: string
}

interface MyDBSchema extends DBSchema {
    projects: {
        key: string;
        value: Task;
    };
    entrys: {
        key: string;
        value: Task;
    };
};

export const startDB =  function () {
    let db!: IDBDatabase;
    const request = indexedDB.open('tasks', 3);
    request.onerror = (err) => console.error(`IndexedDB error: ${request.error}`, err);
    request.onsuccess = () => (db = request.result);
    request.onupgradeneeded = () => {
        //const db = request.result;
        // Überprüfe, ob der Objektstore bereits vorhanden ist
        if (!db.objectStoreNames.contains('entrys')) {
            // Erstelle den Objektstore entsprechend dem Schema
            const entrysStore = db.createObjectStore('entrys', { keyPath: 'string' });
            // Erstelle Indizes, wenn benötigt
            entrysStore.createIndex('title', 'title', { unique: false });
        }
    };
    return db;
};
export const addTask = (payload: Task) => {
    const store = "tasks";
    const open = indexedDB.open('data');
    open.onsuccess = () => {
        const db = open.result;
        if ([...db.objectStoreNames].find((name) => name === store)) {
            const transaction = db.transaction(store, 'readwrite');
            const objectStore = transaction.objectStore(store);
            const request = objectStore.add(payload);
            request.onerror = () => console.error(request.error);
            transaction.oncomplete = () => db.close();
        } else {
            indexedDB.deleteDatabase('data');
        }
    };
};


export async function addItemToStore(tasks: Task[]) {
    // Öffne die IndexedDB-Datenbank oder erstelle sie, falls sie noch nicht existiert
    const db = await openDB('tasks', 1, {
      upgrade(db) {
        // Erstelle einen Objektspeicher für die Tasks
        const store = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
        // Definiere Indexe, wenn nötig
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('project', 'project', { unique: false });
        store.createIndex('text', 'text', { unique: false });
      },
    });
  
    // Füge jeden Task einzeln der Datenbank hinzu
    for (const task of tasks) {
      await db.add('tasks', { date: task.date, project: task.project, text: task.text });
    }
  }
  

export async function addItemToStore(tasks: Task[]) {
    // Öffne die IndexedDB-Datenbank oder erstelle sie, falls sie noch nicht existiert
    const db = await openDB('tasks', 1, {
      upgrade(db) {
        // Erstelle einen Objektspeicher für die Tasks
        const store = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
        // Definiere Indexe, wenn nötig
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('project', 'project', { unique: false });
        store.createIndex('text', 'text', { unique: false });
      },
    });
  
    // Füge jeden Task einzeln der Datenbank hinzu
    for (const task of tasks) {
      await db.add('tasks', { date: task.date, project: task.project, text: task.text });
    }
  }
  

let db: IDBDatabase;
export const getElement = <T>(store: string, key: string) => {
    const open = indexedDB.open('data');
    return new Promise<T>((resolve, reject) => {
        open.onsuccess = () => {
            let request!: IDBRequest;
            db = open.result;
            if ([...db.objectStoreNames].find((name) => name === store)) {
                const transaction = db.transaction(store);
                const objectStore = transaction.objectStore(store);
                if (key === 'all') request = objectStore.getAll();
                else request = objectStore.get(key);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
                transaction.oncomplete = () => db.close();
            } else {
                indexedDB.deleteDatabase('data');
            }
        };
    });
};

export const addProject = (payload: Project) => {
    const store = "projects";
    const open = indexedDB.open('data');
    open.onsuccess = () => {
        const db = open.result;
        if ([...db.objectStoreNames].find((name) => name === store)) {
            const transaction = db.transaction(store, 'readwrite');
            const objectStore = transaction.objectStore(store);
            const request = objectStore.add(payload);
            request.onerror = () => console.error(request.error);
            transaction.oncomplete = () => db.close();
        } else {
            indexedDB.deleteDatabase('data');
        }
    };
};

export const editElement = <T>(store: string, key: string, payload: object) => {
    const open = indexedDB.open('data');
    return new Promise<T>((resolve, reject) => {
        open.onsuccess = () => {
            let request: IDBRequest;
            db = open.result;
            if ([...db.objectStoreNames].find((name) => name === store)) {
                const transaction = db.transaction(store, 'readwrite');
                const objectStore = transaction.objectStore(store);
                if (key === 'all') request = objectStore.getAll();
                else request = objectStore.get(key);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => {
                    const serialized = JSON.parse(JSON.stringify(payload));
                    const updateRequest = objectStore.put(serialized);
                    updateRequest.onsuccess = () => resolve(request.result);
                };
                transaction.oncomplete = () => db.close();
            } else {
                indexedDB.deleteDatabase('data');
            }
        };
    });
};
export const removeElement = (store: string, key: string) => {
    const open = indexedDB.open('data');
    open.onsuccess = () => {
        let request: IDBRequest;
        db = open.result;
        if ([...db.objectStoreNames].find((name) => name === store)) {
            const transaction = db.transaction(store, 'readwrite');
            const objectStore = transaction.objectStore(store);
            if (key === 'all') request = objectStore.clear();
            else request = objectStore.delete(key);
            request.onerror = () => console.error(request.error);
            transaction.oncomplete = () => db.close();
        } else {
            indexedDB.deleteDatabase('data');
        }
    };
};