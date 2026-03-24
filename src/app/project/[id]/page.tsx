"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ChatPanel } from "@/components/project/ChatPanel";
import { CodePanel } from "@/components/project/CodePanel";
import { Button } from "@/components/ui/button";
import { bootWebContainer, starterFiles } from "@/lib/webcontainer/boot";
import { useFileStore } from "@/stores/fileStore";
import { useChatStore } from "@/stores/chatStore";
import { ShareIcon, RocketIcon, SettingsIcon, CheckIcon, Edit2Icon, ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ApiKeyModal } from "@/components/settings/ApiKeyModal";
import { getAIConfig, PROVIDER_LABELS } from "@/lib/ai/providers";

export default function ProjectEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState("Loading...");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [providerLabel, setProviderLabel] = useState("");
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    const handleOpenModal = () => setIsApiKeyModalOpen(true);
    window.addEventListener('open-api-key-modal', handleOpenModal);
    
    // Check if key exists
    const config = getAIConfig();
    if (!config.apiKey) setIsApiKeyModalOpen(true);
    setProviderLabel(PROVIDER_LABELS[config.provider]);

    const handleStorage = () => setProviderLabel(PROVIDER_LABELS[getAIConfig().provider]);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('open-api-key-modal', handleOpenModal);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const { files, setFiles, updateFile, setActiveFile, activeFile } = useFileStore();
  const { messages, addMessage } = useChatStore();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wcInstanceRef = useRef<any>(null);

  useEffect(() => {
    initProject();
  }, [id]);

  const initProject = async () => {
    // 1. Fetch project data
    const { data: project, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !project) {
      toast.error("Failed to load project");
      router.push("/dashboard");
      return;
    }

    setProjectName(project.name);

    // 2. Load files into store
    const initialFiles = Object.keys(project.files).length > 0 
      ? project.files 
      : Object.fromEntries(
          Object.entries(starterFiles)
            .filter(([_, val]: any) => val.file)
            .map(([path, val]: any) => [path, val.file.contents])
        );

    setFiles(initialFiles);
    setActiveFile("src/App.tsx");

    // 3. Fetch past messages
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: true });

    if (msgs) {
      msgs.forEach(m => addMessage(m)); 
    }

    // 4. Boot WebContainer
    try {
      const wc = await bootWebContainer();
      wcInstanceRef.current = wc;

      const tree: any = {};
      for (const [path, content] of Object.entries(initialFiles)) {
        const parts = path.split('/');
        let current = tree;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) current[parts[i]] = { directory: {} };
          current = current[parts[i]].directory;
        }
        current[parts[parts.length - 1]] = { file: { contents: content } };
      }

      // Step 1: mount files
      await wc.mount(tree);

      // Step 2: install dependencies (await completion)
      const installProcess = await wc.spawn('npm', ['install']);
      installProcess.output.pipeTo(new WritableStream({
        write(data) { console.log('[npm install]', data); }
      }));
      const installCode = await installProcess.exit;
      if (installCode !== 0) {
        throw new Error(`npm install failed with exit code ${installCode}`);
      }

      // Step 3: start dev server
      const devProcess = await wc.spawn('npm', ['run', 'dev']);
      devProcess.output.pipeTo(new WritableStream({
        write(data) { console.log('[vite]', data); }
      }));

      // Step 4: wait for server-ready
      wc.on('server-ready', (port: number, url: string) => {
        console.log('Server ready at', url);
        setIframeUrl(url);
      });

    } catch (e: any) {
      console.error("WebContainer failed:", e);
      setBootError(e.message || "Failed to start WebContainer");
    }

    setLoading(false);
  };

  const handleSaveFiles = async () => {
    toast.success("Saving files...");
    await supabase.from("projects").update({ files }).eq("id", id);
  };

  const handleUpdateName = async () => {
    if (!editNameValue.trim() || editNameValue === projectName) {
      setIsEditingName(false);
      return;
    }
    setProjectName(editNameValue);
    setIsEditingName(false);
    toast.success("Project name updated");
    await supabase.from("projects").update({ name: editNameValue }).eq("id", id);
  };

  const [deploying, setDeploying] = useState(false);

  const handleDeploy = async () => {
    setDeploying(true);
    toast.info("Deploying project to preview Netlify instance...");
    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files })
      });
      const data = await res.json();
      if (data.url) {
        toast.success(
          <div className="flex flex-col gap-1">
            <span>Deployment successful!</span>
            <a href={data.url} target="_blank" rel="noreferrer" className="text-cyan-400 font-bold hover:underline">{data.url}</a>
          </div>
        );
        await supabase.from("messages").insert({ project_id: id as string, role: "assistant", content: `Your site is deployed at: ${data.url}` });
        addMessage({ role: "assistant", content: `Your site is deployed at: ${data.url}`, id: crypto.randomUUID() });
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (e: any) {
      toast.error("Deployment failed: " + e.message);
    } finally {
      setDeploying(false);
    }
  };

  const writeFileToContainer = async (wc: any, path: string, content: string) => {
    // Ensure parent directories exist
    const parts = path.split('/');
    if (parts.length > 1) {
      let currentDir = '';
      for (let i = 0; i < parts.length - 1; i++) {
        currentDir += (currentDir ? '/' : '') + parts[i];
        try {
          await wc.fs.mkdir(currentDir, { recursive: true });
        } catch {
          // Directory might already exist
        }
      }
    }

    let finalContent = content;
    // If AI outputs index.html without CDN script, inject it
    if (path === 'index.html' && !content.includes('cdn.tailwindcss.com')) {
      finalContent = content.replace(
        '</head>',
        `  <script src="https://cdn.tailwindcss.com"></script>\n</head>`
      );
    }

    await wc.fs.writeFile('/' + path, finalContent);
  };

  const handleRunFileUpdate = async (path: string, content: string) => {
    if (!wcInstanceRef.current) return;
    updateFile(path, content);
    try {
      await writeFileToContainer(wcInstanceRef.current, path, content);
    } catch (e) {
      console.error("Error writing to WC:", e);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-primary">
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
          <div className="relative">
            <div className="absolute inset-0 border border-primary/40 rounded-full animate-ping opacity-20" />
            <div className="w-16 h-16 rounded-full border-4 border-surface border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-primary pulse-glow" />
            </div>
          </div>
          <span className="text-text-secondary text-sm font-medium tracking-wide animate-pulse">Initializing Environment...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background font-sans">
      {/* Top Bar */}
      <header className="h-14 flex-shrink-0 border-b border-border/40 px-4 flex items-center justify-between bg-background-secondary relative z-20">
        <div className="flex items-center gap-4 w-1/3">
          <Link href="/dashboard" className="w-8 h-8 rounded shrink-0 bg-surface-hover hover:bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-all">
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 max-w-[200px] group">
            <div className="w-6 h-6 rounded shrink-0 bg-gradient-text flex items-center justify-center text-[10px] font-bold text-white shadow-glow-primary">
              L
            </div>
            {isEditingName ? (
              <div className="flex items-center gap-1 w-full relative">
                <input 
                  autoFocus
                  className="bg-surface border border-primary px-2 py-1 text-sm rounded w-full outline-none text-text-primary shadow-glow-primary"
                  value={editNameValue}
                  onChange={e => setEditNameValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleUpdateName()}
                  onBlur={handleUpdateName}
                />
              </div>
            ) : (
              <div 
                className="flex items-center gap-2 cursor-text rounded px-2 py-1 -ml-2 border border-transparent hover:border-border/50 hover:bg-surface-hover/50 transition-colors w-full overflow-hidden"
                onClick={() => { setEditNameValue(projectName); setIsEditingName(true); }}
              >
                <span className="font-semibold text-text-primary text-sm truncate">{projectName}</span>
                <Edit2Icon className="w-3 h-3 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            )}
          </div>
        </div>

        {/* Center Tab Switcher is handled transparently inside CodePanel, so we keep center empty to match spec layout flow */}
        <div className="flex-1 flex justify-center pointer-events-none" />

        <div className="flex items-center justify-end gap-3 w-1/3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border/50 mr-2 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${providerLabel.includes('Gemini') ? 'bg-cyan' : providerLabel.includes('Claude') ? 'bg-orange-500' : 'bg-green-500'} animate-pulse`} />
            <span className="text-xs font-semibold text-text-secondary">{providerLabel || "Select Provider"}</span>
          </div>

          <Button variant="ghost" size="icon" className="h-9 w-9 text-text-secondary hover:text-text-primary hidden sm:flex" onClick={() => window.dispatchEvent(new CustomEvent('open-api-key-modal'))} title="Settings">
            <SettingsIcon className="w-4 h-4"/>
          </Button>

          <Button variant="outline" size="sm" className="h-9 font-medium shadow-sm active:scale-95 hidden sm:flex" onClick={() => {toast("Share link copied!"); navigator.clipboard.writeText(window.location.href)}}>
            <ShareIcon className="w-4 h-4 mr-2"/> Share
          </Button>
          
          <Button size="sm" onClick={handleDeploy} disabled={deploying} className="h-9 font-medium transition-all shadow-glow-button hover:shadow-glow-primary active:scale-95 w-24">
            {deploying ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              </div>
            ) : (
              <><RocketIcon className="w-4 h-4 mr-2"/> Deploy</>
            )}
          </Button>
        </div>
      </header>
      
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} />

      {/* Main Split Interface */}
      {/* @ts-ignore - shadcn types mismatch with react-resizable-panels v2 */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden relative z-10">
        
        {/* Chat Panel */}
        <ResizablePanel defaultSize={30} minSize={20} className="border-r border-border/40 relative z-20 shadow-xl bg-background">
          <ChatPanel projectId={id as string} onFileUpdate={handleRunFileUpdate} />
        </ResizablePanel>

        <ResizableHandle withHandle className="w-1.5 bg-border hover:bg-primary transition-colors cursor-col-resize active:bg-primary z-30 flex flex-col items-center justify-center">
          <div className="w-1 h-6 bg-border-bright rounded-full hidden sm:block" />
        </ResizableHandle>

        {/* Editor & Preview Panel */}
        <ResizablePanel defaultSize={70} className="relative z-10 bg-[#1e1e1e]">
          <CodePanel iframeUrl={iframeUrl} bootError={bootError} />
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  );
}
