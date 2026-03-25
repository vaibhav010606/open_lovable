"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyIcon, ExternalLinkIcon, RocketIcon, GlobeIcon, Loader2Icon, CheckCircle2Icon } from "lucide-react";
import { toast } from "sonner";

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (slug: string) => Promise<string | null>;
  projectName: string;
  existingSlug?: string;
}

export function DeployModal({ isOpen, onClose, onDeploy, projectName, existingSlug }: DeployModalProps) {
  const [slug, setSlug] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSlug(existingSlug || projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
      setDeployUrl(null);
    }
  }, [isOpen, projectName, existingSlug]);

  if (!isOpen) return null;

  const handleDeploy = async () => {
    if (!slug.trim()) {
      toast.error("Please enter a slug");
      return;
    }
    
    setDeploying(true);
    const resultUrl = await onDeploy(slug.trim());
    setDeploying(false);
    
    if (resultUrl) {
      setDeployUrl(resultUrl);
    }
  };

  const handleCopy = () => {
    if (deployUrl) {
      navigator.clipboard.writeText(deployUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const currentHost = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-background-secondary border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <RocketIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Publish Project</h2>
              <p className="text-sm text-text-secondary">Make your project live on the web.</p>
            </div>
          </div>

          {!deployUrl ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Custom Slug</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input 
                      value={slug} 
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="pl-3 pr-4 py-2 border-white/10 bg-surface text-sm font-mono"
                      placeholder="my-cool-project"
                      disabled={deploying}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-text-tertiary flex items-center gap-1 mt-1">
                  <GlobeIcon className="w-3 h-3" />
                  Your site will be at: <span className="text-primary font-mono">{currentHost}/s/{slug || '...'}</span>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="ghost" 
                  onClick={onClose} 
                  className="flex-1 border border-white/5 hover:bg-white/5"
                  disabled={deploying}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeploy} 
                  className="flex-[2] bg-primary text-white hover:bg-primary-glow shadow-glow-primary active:scale-95 transition-all"
                  disabled={deploying}
                >
                  {deploying ? (
                    <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> Deploying...</>
                  ) : (
                    <><RocketIcon className="w-4 h-4 mr-2" /> Publish Live</>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle2Icon className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-emerald-400 font-bold text-sm">Deployment Successful!</h3>
                  <p className="text-emerald-400/80 text-[11px]">Your project is now live for everyone to see.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Public URL</label>
                <div className="flex items-center gap-2 p-3 bg-surface border border-white/10 rounded-lg">
                  <span className="text-sm font-mono text-primary truncate flex-1">{deployUrl}</span>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={handleCopy} className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Copy link">
                      <CopyIcon className="w-4 h-4 text-text-secondary" />
                    </button>
                    <a href={deployUrl} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-white/10 rounded transition-colors" title="Open site">
                      <ExternalLinkIcon className="w-4 h-4 text-text-secondary" />
                    </a>
                  </div>
                </div>
              </div>

              <Button onClick={onClose} className="w-full bg-surface-hover hover:bg-surface border border-white/10">
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
