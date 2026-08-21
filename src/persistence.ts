import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { MediaItem, MemoryStory } from './types';

interface GiftDB extends DBSchema {
  media: {
    key: number;
    value: {
      id: string;
      type: string;
      name: string;
      width?: number;
      height?: number;
      orientation?: number;
      date?: string;
      duration?: number;
      qualityScore?: number;
      selected?: boolean;
      isFavorite?: boolean;
      alt?: string;
      file: Blob;
    };
    autoIncrement: true;
  };
  story: {
    key: string;
    value: MemoryStory;
  };
}

let dbPromise: Promise<IDBPDatabase<GiftDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<GiftDB>('gift-db', 1, {
      upgrade(db) {
        db.createObjectStore('media', { keyPath: 'id', autoIncrement: true });
        db.createObjectStore('story');
      },
    });
  }
  return dbPromise;
}

/** Save an array of MediaItem objects (with attached Blob) to IndexedDB. */
export async function saveMedia(media: MediaItem[]) {
  const db = await getDB();
  const txClear = db.transaction('media', 'readwrite');
  await txClear.objectStore('media').clear();
  await txClear.done;

  const tx = db.transaction('media', 'readwrite');
  const store = tx.objectStore('media');
  for (const m of media) {
    const anyItem = m as any;
    if (anyItem.file instanceof Blob) {
      await store.add({
        id: m.id,
        type: m.type,
        name: m.name,
        width: m.width,
        height: m.height,
        orientation: m.orientation,
        date: m.date,
        duration: m.duration,
        qualityScore: m.qualityScore,
        selected: m.selected,
        isFavorite: m.isFavorite,
        alt: m.alt,
        file: anyItem.file,
      });
    }
  }
  await tx.done;
}

/** Load persisted MediaItem array, rebuilding object URLs from stored Blobs. */
export async function loadMedia(): Promise<MediaItem[]> {
  const db = await getDB();
  const tx = db.transaction('media', 'readonly');
  const all = await tx.objectStore('media').getAll();
  await tx.done;
  return all.map((record) => {
    const url = URL.createObjectURL(record.file);
    const item: MediaItem = {
      id: record.id,
      type: record.type as any,
      name: record.name,
      url,
      width: record.width,
      height: record.height,
      orientation: record.orientation,
      date: record.date,
      duration: record.duration,
      qualityScore: record.qualityScore,
      selected: record.selected,
      isFavorite: record.isFavorite,
      alt: record.alt,
    } as MediaItem;
    // Keep reference to the blob for future saves (non‑enumerable)
    (item as any).file = record.file;
    return item;
  });
}

/** Persist the generated story. */
export async function saveStory(story: MemoryStory) {
  const db = await getDB();
  const tx = db.transaction('story', 'readwrite');
  await tx.objectStore('story').put(story, 'current');
  await tx.done;
}

/** Load the persisted story, if any. */
export async function loadStory(): Promise<MemoryStory | undefined> {
  const db = await getDB();
  const tx = db.transaction('story', 'readonly');
  const story = await tx.objectStore('story').get('current');
  await tx.done;
  return story as MemoryStory | undefined;
}

/** Revoke all blob URLs stored in media items – useful on app unload. */
export async function revokeAllMediaUrls() {
  const media = await loadMedia();
  for (const m of media) {
    if (m.url && m.url.startsWith('blob:')) {
      URL.revokeObjectURL(m.url);
    }
  }
}
