import { create } from "zustand";
import {
  AppFile,
  FileMetadata,
  getAllFiles,
  getAllMetadata,
  updateMetadata,
} from "../storage/db";

export type SortOption = "date" | "name" | "size";

interface AppState {
  files: AppFile[];
  metadata: Record<string, FileMetadata>;
  searchQuery: string;
  isScanning: boolean;
  theme: "light" | "dark";
  sortBy: SortOption;
  sortDesc: boolean;
  toggleTheme: () => void;
  setSearchQuery: (q: string) => void;
  setSortBy: (sort: SortOption) => void;
  toggleSortDesc: () => void;
  loadLibrary: () => Promise<void>;
  setIsScanning: (scanning: boolean) => void;
  updateFileProgress: (
    fileId: string,
    page: number,
    total: number,
  ) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  files: [],
  metadata: {},
  searchQuery: "",
  isScanning: false,
  sortBy: "date",
  sortDesc: true,
  theme:
    (localStorage.getItem("al_zuhra_theme") as "light" | "dark") || "light",

  toggleTheme: () => {
    const newTheme = get().theme === "light" ? "dark" : "light";
    localStorage.setItem("al_zuhra_theme", newTheme);
    set({ theme: newTheme });
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),

  setSortBy: (sort) => set({ sortBy: sort }),
  toggleSortDesc: () => set((state) => ({ sortDesc: !state.sortDesc })),

  loadLibrary: async () => {
    const files = await getAllFiles();
    const metadataList = await getAllMetadata();

    // Convert to map
    const metadataMap: Record<string, FileMetadata> = {};
    metadataList.forEach((m) => {
      metadataMap[m.fileId] = m;
    });

    // Sort files by last opened (newest first)
    files.sort((a, b) => {
      const aTime = metadataMap[a.id]?.lastOpened || a.lastModified;
      const bTime = metadataMap[b.id]?.lastOpened || b.lastModified;
      return bTime - aTime;
    });

    set({ files, metadata: metadataMap });
  },

  setIsScanning: (scanning) => set({ isScanning: scanning }),

  updateFileProgress: async (fileId, page, total) => {
    const progress = total > 0 ? page / total : 0;
    const metadata = await updateMetadata(fileId, {
      lastReadPage: page,
      totalPages: total,
      progress,
    });

    set((state) => ({
      metadata: {
        ...state.metadata,
        [fileId]: metadata,
      },
    }));
  },
}));
