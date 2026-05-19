import React, { useEffect, useRef, useState } from "react";
import { useAppStore } from "../store";
import { SortOption } from "../store";
import { FileCard } from "../components/FileCard";
import {
  Search,
  Plus,
  LoaderCircle,
  Sparkles,
  File as FileIcon,
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarDays,
  HardDrive,
} from "lucide-react";
import { importWebFiles, scanNativeDocuments } from "../services/scanner";
import { motion, AnimatePresence } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import { Filesystem } from "@capacitor/filesystem";

export function Home() {
  const {
    files,
    metadata,
    loadLibrary,
    searchQuery,
    setSearchQuery,
    sortBy,
    sortDesc,
    setSortBy,
    toggleSortDesc,
  } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [filter, setFilter] = useState<"all" | "pdf" | "docx">("all");

  useEffect(() => {
    loadLibrary();

    // Auto-scan on native devices
    const autoScan = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const perm = await Filesystem.requestPermissions();
          if (perm.publicStorage === "granted") {
            await scanNativeDocuments();
            await loadLibrary();
          }
        } catch (e) {
          console.error("Auto scan failed", e);
        }
      }
    };
    autoScan();
  }, [loadLibrary]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsImporting(true);
      try {
        await importWebFiles(e.target.files);
        await loadLibrary();
      } finally {
        setIsImporting(false);
      }
    }
  };

  const filteredFiles = files
    .filter((f) => {
      const matchesSearch = f.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFilter = filter === "all" || f.type === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "date") {
        const aTime = metadata[a.id]?.lastOpened || a.lastModified;
        const bTime = metadata[b.id]?.lastOpened || b.lastModified;
        comparison = aTime - bTime;
      } else if (sortBy === "size") {
        comparison = a.size - b.size;
      }
      return sortDesc ? -comparison : comparison;
    });

  const recentFiles = [...files]
    .filter((f) => metadata[f.id]?.lastOpened)
    .sort(
      (a, b) =>
        (metadata[b.id]?.lastOpened || 0) - (metadata[a.id]?.lastOpened || 0),
    )
    .slice(0, 2);

  const categories = [
    { id: "all", label: "All Library" },
    { id: "pdf", label: "PDFs" },
    { id: "docx", label: "DOCX Notes" },
  ];

  const sortOptions = [
    { id: "date" as SortOption, icon: CalendarDays, label: "Date" },
    {
      id: "name" as SortOption,
      icon: sortDesc ? ArrowDownAZ : ArrowUpAZ,
      label: "Name",
    },
    { id: "size" as SortOption, icon: HardDrive, label: "Size" },
  ];

  return (
    <div className="pt-10 px-6 pb-20 min-h-screen">
      {/* Header Greeting */}
      <header className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <p className="text-sm font-arabic text-brand-gold-muted mb-1 text-lg">
              ٱلسَّلَامُ عَلَيْكُمْ
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-color)]">
              Library
            </h1>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-full bg-brand-emerald text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            disabled={isImporting}
          >
            {isImporting ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Plus strokeWidth={2.5} />
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleImport}
          />
        </motion.div>
      </header>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8 relative"
      >
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search books, notes, documents..."
          className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent transition-shadow shadow-sm placeholder:text-gray-400"
        />
      </motion.div>

      {/* Continue Reading / Recent */}
      {!searchQuery && recentFiles.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-brand-gold" />
            <h2 className="text-lg font-semibold">Continue Reading</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                metadata={metadata[file.id]}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Categories & Sorting Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Categories */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id as any)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                filter === cat.id
                  ? "bg-[var(--text-color)] text-[var(--bg-color)] border-[var(--text-color)]"
                  : "bg-transparent text-gray-500 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Sort Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2"
        >
          {sortOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = sortBy === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  if (isActive) {
                    toggleSortDesc();
                  } else {
                    setSortBy(opt.id);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-brand-emerald bg-brand-emerald/10"
                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-brand-emerald" : ""}
                />
                {opt.label}
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* Main List */}
      <motion.section layout className="space-y-4">
        <AnimatePresence>
          {filteredFiles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center text-gray-500"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileIcon size={24} className="text-gray-400" />
              </div>
              <p className="text-lg font-medium text-[var(--text-color)] mb-2">
                No documents found
              </p>
              <p className="text-sm">
                Tap the + button above to import your study materials.
              </p>
            </motion.div>
          ) : (
            filteredFiles.map((file) => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <FileCard file={file} metadata={metadata[file.id]} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  );
}
