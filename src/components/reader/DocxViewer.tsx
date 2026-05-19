import React, { useEffect, useState, useRef } from "react";
import mammoth from "mammoth";
import { AppFile } from "../../storage/db";

interface Props {
  file: AppFile;
}

export function DocxViewer({ file }: Props) {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parseDocx = async () => {
      try {
        setLoading(true);
        if (!file.blob) throw new Error("File Blob missing");

        const arrayBuffer = await file.blob.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setHtmlContent(result.value);
      } catch (err) {
        console.error("Docx parsing error", err);
        setHtmlContent('<p class="text-red-500">Failed to load DOCX file.</p>');
      } finally {
        setLoading(false);
      }
    };
    parseDocx();
  }, [file]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Loading document...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-color)] px-4 py-8">
      <div
        ref={containerRef}
        dir="auto"
        className="max-w-3xl mx-auto prose dark:prose-invert prose-emerald font-sans prose-p:leading-relaxed prose-headings:font-bold pb-24"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
