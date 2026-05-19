import { openDB, DBSchema, IDBPDatabase } from "idb";

export interface AppFile {
  id: string; // Unique ID (path or generated)
  name: string;
  path: string; // The original path if native, or empty if web imported
  type: "pdf" | "docx";
  size: number;
  lastModified: number;
  blob?: Blob; // Exists if we imported via web file picker
}

export interface FileMetadata {
  fileId: string;
  progress: number; // 0 to 1
  lastReadPage: number;
  totalPages: number;
  lastOpened: number; // timestamp
  bookmarks: number[];
  highlights: any[];
}

interface ReaderDB extends DBSchema {
  files: {
    key: string;
    value: AppFile;
    indexes: {
      "by-type": string;
      "by-date": number;
    };
  };
  metadata: {
    key: string;
    value: FileMetadata;
    indexes: {
      "by-lastOpened": number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<ReaderDB>> | null = null;

export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<ReaderDB>("AlZuhraDB", 1, {
      upgrade(db) {
        const fileStore = db.createObjectStore("files", { keyPath: "id" });
        fileStore.createIndex("by-type", "type");
        fileStore.createIndex("by-date", "lastModified");

        const metadataStore = db.createObjectStore("metadata", {
          keyPath: "fileId",
        });
        metadataStore.createIndex("by-lastOpened", "lastOpened");
      },
    });
  }
  return dbPromise;
}

export async function addFile(file: AppFile) {
  const db = await initDB();
  await db.put("files", file);
}

export async function getAllFiles(): Promise<AppFile[]> {
  const db = await initDB();
  return db.getAll("files");
}

export async function getFile(id: string): Promise<AppFile | undefined> {
  const db = await initDB();
  return db.get("files", id);
}

export async function removeFile(id: string) {
  const db = await initDB();
  await db.delete("files", id);
  await db.delete("metadata", id);
}

export async function getMetadata(
  fileId: string,
): Promise<FileMetadata | undefined> {
  const db = await initDB();
  return db.get("metadata", fileId);
}

export async function updateMetadata(
  fileId: string,
  data: Partial<FileMetadata>,
) {
  const db = await initDB();
  const existing = await db.get("metadata", fileId);
  const metadata: FileMetadata = {
    fileId,
    progress: existing?.progress || 0,
    lastReadPage: existing?.lastReadPage || 1,
    totalPages: existing?.totalPages || 0,
    lastOpened: Date.now(),
    bookmarks: existing?.bookmarks || [],
    highlights: existing?.highlights || [],
    ...data,
  };
  await db.put("metadata", metadata);
  return metadata;
}

export async function getAllMetadata(): Promise<FileMetadata[]> {
  const db = await initDB();
  return db.getAll("metadata");
}
