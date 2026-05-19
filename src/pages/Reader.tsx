import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getFile,
  getMetadata,
  AppFile,
  FileMetadata,
  updateMetadata,
} from "../storage/db";
import { ChevronLeft, Share2, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PDFViewer } from "../components/reader/PDFViewer";
import { DocxViewer } from "../components/reader/DocxViewer";

export function Reader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<AppFile | null>(null);
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        const f = await getFile(id);
        if (f) {
          setFile(f);
          let m = await getMetadata(id);
          if (!m) {
            m = await updateMetadata(id, { lastOpened: Date.now() });
          } else {
            await updateMetadata(id, { lastOpened: Date.now() });
          }
          setMetadata(m);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    // Hide controls after 3 seconds of inactivity
    let timeout: any;
    if (controlsVisible) {
      timeout = setTimeout(() => setControlsVisible(false), 4000);
    }
    return () => clearTimeout(timeout);
  }, [controlsVisible]);

  const toggleControls = () => setControlsVisible((v) => !v);

  const handleProgress = async (page: number, totalPages: number) => {
    if (!id) return;
    const progress = totalPages > 0 ? page / totalPages : 0;
    await updateMetadata(id, { lastReadPage: page, totalPages, progress });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-color)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-emerald"></div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-2">File Not Found</h2>
        <p className="text-gray-500 mb-6">
          The document might have been deleted or moved.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-brand-emerald text-white rounded-full font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-full bg-[var(--bg-color)] overflow-hidden relative"
      onClick={toggleControls}
    >
      {/* Top Header */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-0 left-0 right-0 z-50 bg-[var(--surface-color)]/90 backdrop-blur-md pb-4 pt-safe-top border-b border-[var(--border-color)] shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 h-14 pt-4 md:pt-0">
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="flex-1 min-w-0 px-4 text-center">
                <h1 className="text-[15px] font-semibold truncate" dir="auto">
                  {file.name}
                </h1>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                  {file.type}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Bookmark size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reader Content */}
      <div className="h-full w-full pt-[env(safe-area-inset-top)]">
        {file.type === "pdf" ? (
          <PDFViewer
            file={file}
            initialPage={metadata?.lastReadPage || 1}
            onProgress={handleProgress}
          />
        ) : (
          <DocxViewer file={file} />
        )}
      </div>
    </div>
  );
}
