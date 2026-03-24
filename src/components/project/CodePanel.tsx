"use client";

import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFileStore } from "@/stores/fileStore";
import { CodeIcon, MonitorIcon, FileTextIcon, FolderIcon } from "lucide-react";

export function CodePanel({ iframeUrl, bootError }: { iframeUrl: string; bootError?: string | null }) {
  const { files, activeFile, setActiveFile, updateFile } = useFileStore();
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [previewTimedOut, setPreviewTimedOut] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start 20s timeout once iframeUrl is set
  useEffect(() => {
    if (!iframeUrl) return;
    setPreviewTimedOut(false);
    setIframeLoaded(false);
    timeoutRef.current = setTimeout(() => {
      setPreviewTimedOut(true);
    }, 20000);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [iframeUrl]);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setPreviewTimedOut(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFile(activeFile, value);
    }
  };

  const fileTree = Object.keys(files).sort();

  return (
    <div className="h-full flex flex-col bg-background relative w-full overflow-hidden">
      <Tabs value={tab} onValueChange={(v: any) => setTab(v)} className="w-full flex flex-col h-full rounded-none">
        
        {/* Top hidden tabs logic — the actual styling will be handled by page.tsx or we put it here */}
        <div className="absolute top-0 left-0 w-full h-14 bg-background-secondary border-b border-border/40 flex items-center justify-center -translate-y-full opacity-0 pointer-events-none">
          {/* This is a placeholder since the requested spec moved these tabs to the top bar. Keep state logic here but we render them to look like the center top bar. */}
        </div>

        {/* Temporary tab display while we manage logic locally */}
        <div className="h-14 flex-shrink-0 flex items-center justify-center px-4 border-b border-border/40 bg-background-secondary sticky top-0 z-10 shadow-sm">
          <TabsList className="bg-surface/50 h-9 p-1 gap-1 rounded-full border border-border/60 shadow-inner w-[240px]">
            <TabsTrigger 
              value="preview" 
              className="w-1/2 rounded-full text-xs font-semibold tracking-wide transition-all data-[state=active]:bg-background data-[state=active]:text-text-primary data-[state=active]:shadow-sm text-text-secondary hover:text-text-primary flex items-center gap-1.5"
            >
              <MonitorIcon className="w-3.5 h-3.5" /> Preview
            </TabsTrigger>
            <TabsTrigger 
              value="code"
              className="w-1/2 rounded-full text-xs font-semibold tracking-wide transition-all data-[state=active]:bg-background data-[state=active]:text-text-primary data-[state=active]:shadow-sm text-text-secondary hover:text-text-primary flex items-center gap-1.5"
            >
              <CodeIcon className="w-3.5 h-3.5" /> Code
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="preview" className="flex-1 m-0 p-0 overflow-hidden relative border-none outline-none bg-white">
          {bootError ? (
            // Boot error state
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
              <div className="glass-bright p-8 rounded-2xl border border-red-500/30 flex flex-col items-center w-96 text-center shadow-2xl">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                  <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2 text-red-400">Preview failed to start</h3>
                <p className="text-text-secondary text-sm mb-4">{bootError}</p>
                <p className="text-text-tertiary text-xs">Check the browser console for more details.</p>
              </div>
            </div>
          ) : iframeUrl ? (
            <div className="w-full h-full flex flex-col">
              <div className="h-10 border-b border-gray-200 bg-gray-50 flex items-center px-4 shadow-sm z-10 flex-shrink-0">
                <div className="flex gap-1.5 border px-2.5 py-1 rounded bg-white text-xs text-gray-500 font-mono shadow-sm">
                  <span className="text-green-600">https://</span>{new URL(iframeUrl).host}
                </div>
              </div>
              {previewTimedOut ? (
                // Timeout error state
                <div className="flex-1 flex flex-col items-center justify-center bg-background text-center px-6">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20">
                    <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold mb-1 text-text-primary">Preview taking too long</h3>
                  <p className="text-text-secondary text-sm mb-4">The dev server may have encountered an error.</p>
                  <button
                    onClick={() => { setPreviewTimedOut(false); }}
                    className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <iframe
                  src={iframeUrl}
                  allow="cross-origin-isolated"
                  className="w-full flex-1 border-none bg-white"
                  onLoad={handleIframeLoad}
                />
              )}
            </div>
          ) : (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="glass-bright p-8 rounded-2xl glow-border flex flex-col items-center w-80 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-primary w-full animate-shimmer" style={{ backgroundSize: '200% auto' }} />
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 relative">
                  <div className="absolute inset-0 rounded-full border border-primary/40 animate-ping opacity-20" />
                  <div className="loading-dot absolute top-2 left-2" />
                  <MonitorIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-text-primary">Booting environment</h3>
                <p className="text-text-secondary text-sm mb-6">Installing dependencies and starting dev server...</p>
                <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-2/3 animate-pulse" />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="code" className="flex-1 m-0 p-0 flex h-[calc(100%-3.5rem)] border-none outline-none">
          {/* File Explorer */}
          <div className="w-64 h-full flex-shrink-0 bg-background-tertiary border-r border-border/40 flex flex-col pt-4 overflow-y-auto">
            <div className="px-5 mb-4 flex items-center gap-2">
              <FolderIcon className="w-4 h-4 text-text-tertiary" />
              <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Project Files</span>
            </div>
            
            {fileTree.length === 0 ? (
              <div className="px-5 py-4 text-sm text-text-tertiary">
                No files yet. Start chatting to generate code.
              </div>
            ) : (
              <div className="flex flex-col">
                {fileTree.map(file => {
                  const isActive = activeFile === file;
                  return (
                    <button 
                      key={file}
                      onClick={() => setActiveFile(file)}
                      className={`text-left text-sm px-5 py-2 transition-all truncate flex items-center gap-2 relative group overflow-hidden
                        ${isActive ? "text-primary font-medium bg-primary/5" : "text-text-secondary hover:text-text-primary"}
                      `}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-0.5 transition-all ${isActive ? 'bg-primary' : 'bg-transparent group-hover:bg-border'}`} />
                      <div className="absolute inset-0 bg-surface -translate-x-full group-hover:translate-x-0 transition-transform -z-10" />
                      <FileTextIcon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-text-tertiary'}`} />
                      <span className="truncate z-10">{file.replace(/^src\//, '')}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Code Editor */}
          <div className="flex-1 h-full bg-[#1e1e1e]">
            {activeFile ? (
              <Editor
                height="100%"
                language={activeFile.endsWith('.css') ? 'css' : activeFile.endsWith('.html') ? 'html' : activeFile.endsWith('.ts') || activeFile.endsWith('.tsx') ? 'typescript' : 'javascript'}
                theme="vs-dark"
                value={files[activeFile] || ''}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  padding: { top: 24, bottom: 24 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  fontFamily: 'var(--font-mono)',
                  renderLineHighlight: 'all',
                  cursorBlinking: 'smooth',
                  fontLigatures: true,
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-tertiary bg-background bg-grid">
                <CodeIcon className="w-12 h-12 mb-4 opacity-20" />
                <p>Select a file to edit</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
