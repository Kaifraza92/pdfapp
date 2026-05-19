import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { AppFile, updateMetadata, getMetadata } from "../../storage/db";
import { ZoomIn, ZoomOut, Edit3, X, Check, Maximize2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";

if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

interface Stroke {
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

function PDFPage({
  pageNum,
  pdfDoc,
  scale,
  drawMode,
  onPageVisible,
  initialStrokes = [],
  onSaveStrokes,
}: any) {
  const { ref, inView } = useInView({
    rootMargin: "800px 0px",
    triggerOnce: false,
  });
  const [rendered, setRendered] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawLayerRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>(initialStrokes);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (inView) {
      onPageVisible(pageNum);
    }
  }, [inView, pageNum, onPageVisible]);

  useEffect(() => {
    if (inView && !rendered && canvasRef.current && pdfDoc) {
      setRendered(true);
      const render = async () => {
        try {
          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({
            scale: scale * (window.devicePixelRatio || 1),
          });

          if (!canvasRef.current) return;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.style.height = "auto";

          if (drawLayerRef.current) {
            drawLayerRef.current.width = viewport.width;
            drawLayerRef.current.height = viewport.height;
            drawLayerRef.current.style.width = "100%";
            drawLayerRef.current.style.height = "auto";
            redrawStrokes();
          }

          const renderContext = { canvasContext: ctx, viewport: viewport };
          await page.render(renderContext).promise;
        } catch (e) {
          console.error(`Page ${pageNum} render error:`, e);
        }
      };
      render();
    }
  }, [inView, pdfDoc, pageNum, scale]);

  useEffect(() => {
    redrawStrokes();
  }, [strokes, currentStroke, drawMode, scale, rendered]);

  const redrawStrokes = () => {
    if (!drawLayerRef.current) return;
    const ctx = drawLayerRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, drawLayerRef.current.width, drawLayerRef.current.height);

    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    allStrokes.forEach((stroke) => {
      if (stroke.points.length === 0) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width * (scale * (window.devicePixelRatio || 1));

      const ptScaled = (p: { x: number; y: number }) => ({
        x: p.x * drawLayerRef.current!.width,
        y: p.y * drawLayerRef.current!.height,
      });

      const first = ptScaled(stroke.points[0]);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < stroke.points.length; i++) {
        const pt = ptScaled(stroke.points[i]);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    });
  };

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = drawLayerRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawMode) return;
    isDrawing.current = true;
    setCurrentStroke({ color: "#fef08a80", width: 25, points: [getPos(e)] });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !drawMode || !currentStroke) return;
    setCurrentStroke((prev) => {
      if (!prev) return prev;
      return { ...prev, points: [...prev.points, getPos(e)] };
    });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (currentStroke) {
      const newStrokes = [...strokes, currentStroke];
      setStrokes(newStrokes);
      setCurrentStroke(null);
      onSaveStrokes(pageNum, newStrokes);
    }
  };

  return (
    <div
      ref={ref}
      className="relative mx-auto mb-8 bg-white shadow-2xl rounded-lg overflow-hidden flex flex-col justify-center items-center"
      style={{ minHeight: "40vh", width: "100%" }}
    >
      {!rendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300">
          <span className="text-xs uppercase tracking-widest font-semibold animate-pulse">
            Loading Page {pageNum}
          </span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="block w-full h-auto pointer-events-none"
      />

      {rendered && (
        <canvas
          ref={drawLayerRef}
          className="absolute top-0 left-0 block w-full h-auto z-10 touch-none"
          style={{
            pointerEvents: drawMode ? "auto" : "none",
            opacity: drawMode ? 1 : 0.85,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      )}
    </div>
  );
}

interface Props {
  file: AppFile;
  initialPage: number;
  onProgress: (page: number, total: number) => void;
}

export function PDFViewer({ file, initialPage, onProgress }: Props) {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [drawMode, setDrawMode] = useState(false);
  const [allStrokes, setAllStrokes] = useState<Record<number, Stroke[]>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Pinch zoom tracking
  const lastDistance = useRef<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        let data: Uint8Array;
        if (file.blob) {
          const arrayBuffer = await file.blob.arrayBuffer();
          data = new Uint8Array(arrayBuffer);
        } else {
          throw new Error("File blob missing");
        }
        const loadingTask = pdfjsLib.getDocument({ data });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
      } catch (err) {
        console.error("Error loading PDF:", err);
      }
    };
    init();
  }, [file]);

  const handlePageVisible = useCallback(
    (pageNum: number) => {
      onProgress(pageNum, numPages);
    },
    [numPages, onProgress],
  );

  const handleSaveStrokes = (pageNum: number, newStrokes: Stroke[]) => {
    setAllStrokes((prev) => ({ ...prev, [pageNum]: newStrokes }));
  };

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 3.0));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.6));
  const handleResetZoom = () => setScale(1.2);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY,
      );
      if (lastDistance.current !== null) {
        const delta = distance - lastDistance.current;
        if (Math.abs(delta) > 5) {
          setScale((s) => Math.min(Math.max(s + delta * 0.005, 0.5), 3));
        }
      }
      lastDistance.current = distance;
    }
  };

  const handleTouchEnd = () => {
    lastDistance.current = null;
  };

  return (
    <div
      ref={containerRef}
      className={`h-full flex flex-col relative bg-gray-100 dark:bg-gray-950 overflow-y-auto overflow-x-hidden ${drawMode ? "touch-none select-none overflow-hidden" : ""}`}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        if (drawMode) e.stopPropagation();
      }}
    >
      <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-12">
        {pdfDoc &&
          Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <PDFPage
              key={pageNum}
              pageNum={pageNum}
              pdfDoc={pdfDoc}
              scale={scale}
              drawMode={drawMode}
              onPageVisible={handlePageVisible}
              initialStrokes={allStrokes[pageNum] || []}
              onSaveStrokes={handleSaveStrokes}
            />
          ))}
      </div>

      {/* Floating Industrial Toolbar */}
      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-brand-black-light/90 backdrop-blur-xl shadow-2xl px-3 py-2 rounded-2xl border border-white/10 z-50 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2 py-1 text-[10px] uppercase font-bold tracking-tighter hover:bg-white/10 rounded-md"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="w-px h-6 bg-white/10 mx-1" />

        <button
          onClick={() => setDrawMode(!drawMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider ${drawMode ? "bg-brand-gold text-brand-black shadow-lg shadow-brand-gold/20" : "hover:bg-white/10 bg-white/5"}`}
        >
          {drawMode ? <Check size={16} strokeWidth={3} /> : <Edit3 size={16} />}
          <span>{drawMode ? "Done" : "Highlight"}</span>
        </button>
      </div>
    </div>
  );
}

