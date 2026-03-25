"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { bootWebContainer } from "@/lib/webcontainer/boot";
import { Loader2Icon, MonitorIcon, AlertTriangleIcon } from "lucide-react";

export default function DeployedSitePage() {
  const { slug } = useParams();
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Finding your site...");
  const wcInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (slug) initDeployment();
  }, [slug]);

  const initDeployment = async () => {
    try {
      // 1. Fetch project by slug
      console.log(`[Deployment] Initializing with slug: ${slug}`);
      setStatus("Fetching project data...");
      
      const { data: project, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (fetchError) {
        console.error(`[Deployment] Supabase fetch error:`, fetchError);
        throw new Error(`Connection error: ${fetchError.message}`);
      }
      
      if (!project) {
        console.error(`[Deployment] Project not returned for slug: ${slug}`);
        throw new Error("Project not found. Ensure you have published your project and applied the SQL migration in Supabase.");
      }

      console.log(`[Deployment] Project found:`, project.name);
      const files = project.published_files && Object.keys(project.published_files).length > 0
        ? project.published_files 
        : project.files;

      if (!files || Object.keys(files).length === 0) {
        throw new Error("This project has no files to display.");
      }

      // 2. Boot WebContainer
      console.log(`[Deployment] Booting WebContainer...`);
      const wc = await bootWebContainer();
      wcInstanceRef.current = wc;

      // 3. Mount files
      setStatus("Preparing files...");
      const tree: any = {};
      for (const [path, content] of Object.entries(files)) {
        const parts = path.split('/');
        let current = tree;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) current[parts[i]] = { directory: {} };
          current = current[parts[i]].directory;
        }
        current[parts[parts.length - 1]] = { file: { contents: content } };
      }
      console.log(`[Deployment] Mounting ${Object.keys(files).length} files...`);
      await wc.mount(tree);

      // 4. Install & Start
      setStatus("Installing dependencies...");
      console.log(`[Deployment] Running npm install...`);
      const installProcess = await wc.spawn('npm', ['install']);
      const installCode = await installProcess.exit;
      if (installCode !== 0) throw new Error(`npm install failed with code ${installCode}`);

      setStatus("Starting dev server...");
      console.log(`[Deployment] Running npm run dev...`);
      await wc.spawn('npm', ['run', 'dev']);

      wc.on('server-ready', (port: number, url: string) => {
        console.log(`[Deployment] Server ready at: ${url}`);
        setIframeUrl(url);
        setLoading(false);
      });

      // Backup timeout for server-ready
      setTimeout(() => {
        if (loading && !iframeUrl) {
          setError("Server timed out. Please try refreshing.");
          setLoading(false);
        }
      }, 30000);

    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white p-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
          <AlertTriangleIcon className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Deployment Error</h1>
        <p className="text-slate-400 mb-8 max-w-md text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-slate-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-white relative overflow-hidden">
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white">
          <div className="relative mb-8">
            <div className="absolute inset-0 border border-indigo-500/40 rounded-full animate-ping opacity-20" />
            <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <MonitorIcon className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <p className="text-indigo-400 font-medium tracking-wide animate-pulse">{status}</p>
          <div className="mt-12 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Lovable Clone Runtime</span>
          </div>
        </div>
      )}

      {iframeUrl && (
        <>
          <iframe 
            src={iframeUrl} 
            className="w-full h-full border-none shadow-2xl"
            allow="cross-origin-isolated"
          />
          
          {/* Subtle attribution badge */}
          <div className="fixed bottom-4 right-4 z-40">
            <a 
              href="/" 
              className="flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-full hover:bg-black transition-all group scale-90 hover:scale-100 origin-bottom-right"
            >
              <span className="text-[10px] text-slate-400 font-medium">Built with</span>
              <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">Lovable Clone</span>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
