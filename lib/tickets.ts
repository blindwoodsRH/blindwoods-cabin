// The tickets on this device, in IndexedDB. A ticket is a finished Privacy Pass token, the key it was signed with and
// the moment that key stops being honoured. Nothing here knows which wallet drew it: the draw happens at the wallet
// door, and this store keeps no record of who or when.

export type Ticket = { token: string; keyId: string; notAfter: number };

const DB = "blindwoods";
const STORE = "tickets";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "token" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function all(): Promise<Ticket[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as Ticket[]);
    req.onerror = () => reject(req.error);
  });
}

async function write(fn: (s: IDBObjectStore) => void): Promise<void> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Live tickets on this device; expired ones are removed on the way. */
export async function countTickets(): Promise<number> {
  const now = Date.now();
  const list = await all();
  const dead = list.filter((t) => t.notAfter <= now);
  if (dead.length) await write((s) => dead.forEach((t) => s.delete(t.token)));
  return list.length - dead.length;
}

/** Takes up to `n` live tickets off the device, soonest to expire first. */
export async function takeTickets(n: number): Promise<Ticket[]> {
  const now = Date.now();
  const got = (await all())
    .filter((t) => t.notAfter > now)
    .sort((a, b) => a.notAfter - b.notAfter)
    .slice(0, n);
  await write((s) => got.forEach((t) => s.delete(t.token)));
  return got;
}

/** Puts tickets (back) on the device: after a draw, an import, or a request the gate did not spend. */
export async function putTickets(list: Ticket[]): Promise<void> {
  await write((s) => list.forEach((t) => s.put(t)));
}
