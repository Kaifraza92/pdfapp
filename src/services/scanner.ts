import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { addFile, AppFile } from "../storage/db";

const isNative = Capacitor.isNativePlatform();

export async function scanNativeDocuments(
  onProgress?: (file: string) => void,
): Promise<number> {
  if (!isNative) return 0;
  let count = 0;

  try {
    const result = await Filesystem.readdir({
      path: "",
      directory: Directory.Documents,
    });

    for (const file of result.files) {
      const name = file.name.toLowerCase();
      if (name.endsWith(".pdf") || name.endsWith(".docx")) {
        const type = name.endsWith(".pdf") ? "pdf" : "docx";
        const stats = await Filesystem.stat({
          path: file.name,
          directory: Directory.Documents,
        });

        const appFile: AppFile = {
          id: `native-${file.uri}`,
          name: file.name,
          path: file.uri,
          type,
          size: stats.size,
          lastModified: stats.mtime || Date.now(),
        };
        await addFile(appFile);
        count++;
        if (onProgress) onProgress(file.name);
      }
    }
  } catch (err) {
    console.error("Scanner error:", err);
  }
  return count;
}

export async function importWebFiles(
  files: FileList | File[],
): Promise<number> {
  let count = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf") || name.endsWith(".docx")) {
      const type = name.endsWith(".pdf") ? "pdf" : "docx";
      const appFile: AppFile = {
        id: `web-${file.name}-${file.lastModified}-${file.size}`,
        name: file.name,
        path: "",
        type,
        size: file.size,
        lastModified: file.lastModified,
        blob: file,
      };
      await addFile(appFile);
      count++;
    }
  }
  return count;
}
