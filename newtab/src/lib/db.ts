// ZERO veri katmanı — IndexedDB birinci, localStorage yedek.
// Anahtarlar: zero.settings.v1 (ayar), zero.state.v2 (mevcut state, aynen korunur).
// Göç: v2 localStorage kaydı varsa ayarlara activeModeId taşınır, ezme yok.

import { SETTINGS_KEY, defaultSettings, validateSettings, type ZeroSettings } from '../settings/schema';

const DB_NAME = 'zero-db';
const DB_STORE = 'kv';

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(DB_STORE)) {
          req.result.createObjectStore(DB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

async function idbGet(key: string): Promise<string | null> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const rq = tx.objectStore(DB_STORE).get(key);
    rq.onsuccess = () => resolve(typeof rq.result === 'string' ? rq.result : null);
    rq.onerror = () => reject(rq.error);
  });
}

async function idbSet(key: string, value: string): Promise<void> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function localGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function localSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode — yoksay */
  }
}

export async function loadSettings(): Promise<ZeroSettings> {
  // 1. IDB dene
  try {
    const raw = await idbGet(SETTINGS_KEY);
    if (raw) return validateSettings(JSON.parse(raw));
  } catch {
    /* IDB yok — alta düş */
  }
  // 2. localStorage
  const ls = localGet(SETTINGS_KEY);
  if (ls) {
    try {
      return validateSettings(JSON.parse(ls));
    } catch {
      /* bozuk — default + göç dene */
    }
  }
  // 3. v2 state'ten mod göçü (ezmeden)
  try {
    const v2 = localGet('zero.state.v2');
    if (v2) {
      const p = JSON.parse(v2) as { activeModeId?: unknown };
      const d = defaultSettings();
      if (p.activeModeId === 'developer' || p.activeModeId === 'cyber' || p.activeModeId === 'privacy') {
        d.activeModeId = p.activeModeId;
      }
      return d;
    }
  } catch {
    /* yoksay */
  }
  return defaultSettings();
}

export async function saveSettings(s: ZeroSettings): Promise<void> {
  const raw = JSON.stringify(s);
  localSet(SETTINGS_KEY, raw);
  try {
    await idbSet(SETTINGS_KEY, raw);
  } catch {
    /* IDB yazılamazsa localStorage yeter */
  }
}
