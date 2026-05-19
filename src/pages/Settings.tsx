import React from "react";
import { useAppStore } from "../store";
import { Moon, Sun, HardDrive, Trash2, Info, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { initDB } from "../storage/db";

export function Settings() {
  const { theme, toggleTheme, files } = useAppStore();

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const sizeMb = (totalSize / 1024 / 1024).toFixed(1);

  return (
    <div className="pt-10 px-6 pb-20 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-gray-500">Manage your reading experience</p>
      </header>

      <div className="space-y-6">
        {/* Appearance */}
        <section>
          <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase mb-3">
            Appearance
          </h2>
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <span className="font-medium">Dark Mode</span>
              </div>
              <div className="w-11 h-6 bg-gray-200 dark:bg-brand-emerald rounded-full relative transition-colors shadow-inner">
                <motion.div
                  layout
                  className="w-5 h-5 bg-white rounded-full absolute top-[2px] shadow-md"
                  initial={false}
                  animate={{ left: theme === "dark" ? "22px" : "2px" }}
                />
              </div>
            </button>
            {/* Arabic Font scale could go here */}
          </div>
        </section>

        {/* Data & Storage */}
        <section>
          <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase mb-3">
            Storage
          </h2>
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-blue-500">
                  <HardDrive size={20} />
                </div>
                <span className="font-medium">Library Size</span>
              </div>
              <span className="text-gray-500">{sizeMb} MB</span>
            </div>

            <button
              onClick={async () => {
                if (
                  window.confirm(
                    "This will clear your reading progress and bookmarks. Continue?",
                  )
                ) {
                  const db = await initDB();
                  await db.clear("metadata");
                  window.location.reload();
                }
              }}
              className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <Trash2 size={20} />
                </div>
                <span className="font-medium">Clear All Progress</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase mb-3">
            About App
          </h2>
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl overflow-hidden p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-brand-emerald text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-emerald/20">
              <Info size={32} />
            </div>
            <h3 className="font-bold text-lg mb-1">AL Zuhra Academy Reader</h3>
            <p className="text-sm text-gray-500 mb-4">Version 1.0.0</p>
            <p className="text-xs text-gray-400">
              Built for teachers and students of AL Zuhra Academy. Premium
              offline reading experience.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
