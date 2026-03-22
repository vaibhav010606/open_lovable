import { create } from 'zustand';

interface FileStore {
  files: Record<string, string>;
  activeFile: string | null;
  setFiles: (files: Record<string, string>) => void;
  setActiveFile: (path: string) => void;
  updateFile: (path: string, content: string) => void;
}

export const useFileStore = create<FileStore>((set) => ({
  files: {},
  activeFile: null,
  setFiles: (files) => set({ files }),
  setActiveFile: (path) => set({ activeFile: path }),
  updateFile: (path, content) =>
    set((s) => ({ files: { ...s.files, [path]: content } })),
}));
