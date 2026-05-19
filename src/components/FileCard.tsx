import React from "react";
import { motion } from "framer-motion";
import { FileText, File as FileIcon, Clock, Percent } from "lucide-react";
import { AppFile, FileMetadata } from "../storage/db";
import { formatDate } from "../lib/utils";
import { useNavigate } from "react-router-dom";

interface FileCardProps {
  file: AppFile;
  metadata?: FileMetadata;
}

export function FileCard({ file, metadata }: FileCardProps) {
  const navigate = useNavigate();
  const isPdf = file.type === "pdf";

  const progressPercent = metadata?.progress
    ? Math.round(metadata.progress * 100)
    : 0;

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/read/${file.id}`)}
      className="w-full text-left bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex items-start gap-4"
    >
      {/* Icon Area */}
      <div
        className={`p-4 rounded-xl flex-shrink-0 flex items-center justify-center ${isPdf ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400" : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"}`}
      >
        {isPdf ? (
          <FileText size={32} strokeWidth={1.5} />
        ) : (
          <FileIcon size={32} strokeWidth={1.5} />
        )}
      </div>

      {/* Detail Area */}
      <div className="flex-1 min-w-0 py-1 flex flex-col justify-between h-full">
        <div>
          <h3
            className="font-semibold text-[15px] truncate text-[var(--text-color)]"
            dir="auto"
          >
            {file.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{isPdf ? "PDF Document" : "Word Document"}</span>
            <span>&bull;</span>
            <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-gold rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-medium text-gray-500 w-8">
            {progressPercent}%
          </span>
        </div>
      </div>
    </motion.button>
  );
}
