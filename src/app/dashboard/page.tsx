"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusIcon, CodeIcon, LogOutIcon, FolderIcon, TrashIcon, ClockIcon, ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// Simple hash to generate a consistent gradient per project ID
const getGradientForId = (id: string, index: number) => {
  const gradients = [
    "from-blue-500 to-cyan-400",
    "from-purple-500 to-pink-500",
    "from-orange-500 to-red-500",
    "from-emerald-400 to-cyan-500",
    "from-indigo-500 to-purple-500"
  ];
  return gradients[index % gradients.length];
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Developer");
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUserName(user.email?.split('@')[0] || "Developer");

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load projects: " + error.message);
    } else {
      setProjects(data as Project[]);
    }
    setLoading(false);
  };

  const handleCreateNew = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name: "New Vibe Project", description: "A magical new web app." })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
    } else if (data) {
      toast.success("Project created! Navigating to editor...");
      router.push(`/project/${data.id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) toast.error("Failed to delete project");
    else {
      toast.success("Project deleted");
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-text-secondary animate-pulse">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col text-text-primary">
      {/* Top Navbar */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-border/40 bg-surface/80 backdrop-blur z-50 sticky top-0">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-button shadow-glow-button flex items-center justify-center font-bold text-white group-hover:scale-105 transition-transform">L</div>
          <span className="font-bold text-lg tracking-tight">Open Lovable</span>
        </Link>
        <Button variant="ghost" onClick={handleLogout} className="text-text-secondary hover:text-error hover:bg-error/10 transition-colors">
          <LogOutIcon className="w-4 h-4 mr-2" /> Sign out
        </Button>
      </header>

      <main className="flex-1 max-w-[1200px] w-full mx-auto p-6 md:p-12">
        {/* Top section greeting */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Good morning, <span className="gradient-text">{userName}</span>
            </h1>
            <p className="text-text-secondary text-lg">What are you building today?</p>
          </div>
          <Button size="lg" onClick={handleCreateNew} className="shadow-glow-button hover:shadow-glow-primary pulse-glow animate-fade-in-up" style={{animationDelay: '100ms'}}>
            <PlusIcon className="w-5 h-5 mr-2" /> New project
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-16 stagger-children animate-fade-in-up">
          <div className="glass rounded-xl p-5 border border-border">
            <p className="text-text-secondary text-sm font-medium mb-1">Projects created</p>
            <p className="text-3xl font-bold font-mono gradient-text">{projects.length}</p>
          </div>
          <div className="glass rounded-xl p-5 border border-border">
            <p className="text-text-secondary text-sm font-medium mb-1">Apps deployed</p>
            <p className="text-3xl font-bold font-mono text-cyan-400">0</p>
          </div>
          <div className="glass rounded-xl p-5 border border-border hidden md:block">
            <p className="text-text-secondary text-sm font-medium mb-1">AI messages sent</p>
            <p className="text-3xl font-bold font-mono text-pink-400">0</p>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-xl font-semibold">Your projects</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-hover text-text-secondary text-xs font-semibold">{projects.length}</span>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center rounded-2xl glass border border-dashed border-border/60">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <CodeIcon className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No projects yet</h3>
            <p className="text-text-secondary max-w-sm mb-8 text-lg">Start by creating your first vibe-coded project.</p>
            <Button size="lg" onClick={handleCreateNew} className="shadow-glow-button hover:-translate-y-1">
              Create your first app
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <div 
                key={project.id} 
                className="glass rounded-xl border border-border glow-border group cursor-pointer hover:scale-[1.01] hover:-translate-y-1 hover:shadow-glow-primary transition-all duration-300 flex flex-col overflow-hidden"
                onClick={() => router.push(`/project/${project.id}`)}
              >
                <div className={`h-2 w-full bg-gradient-to-r ${getGradientForId(project.id, idx)}`} />
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-hover flex items-center justify-center border border-border/50">
                      <FolderIcon className="w-5 h-5 text-primary-bright" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-primary transition-colors line-clamp-1">{project.name}</h3>
                  <p className="text-text-secondary text-sm line-clamp-2 mb-6 flex-1">{project.description}</p>
                  
                  <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
                    <div className="flex items-center text-xs text-text-tertiary font-medium">
                      <ClockIcon className="w-3.5 h-3.5 mr-1.5" />
                      {formatRelativeTime(project.created_at)}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary hover:text-error hover:bg-error/10" onClick={(e) => handleDelete(e, project.id)}>
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary hover:text-primary hover:bg-primary/10">
                        <ExternalLinkIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
