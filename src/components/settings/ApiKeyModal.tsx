"use client";

import { useEffect, useState } from "react";
import { getAIConfig, saveAIConfig, PROVIDER_LABELS, PROVIDER_KEY_LINKS, Provider } from "@/lib/ai/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircleIcon, ExternalLinkIcon, RefreshCwIcon, EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";

export function ApiKeyModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [provider, setProvider] = useState<Provider>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [savedConfig, setSavedConfig] = useState(getAIConfig());

  useEffect(() => {
    if (isOpen) {
      const config = getAIConfig();
      setProvider(config.provider || "gemini");
      setApiKey(config.provider === provider ? config.apiKey : "");
      setSavedConfig(config);
    }
  }, [isOpen, provider]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveAIConfig({ provider, apiKey });
    setSavedConfig({ provider, apiKey });
    toast.success(`${PROVIDER_LABELS[provider]} configuration saved!`);
    onClose();
  };

  const handleTest = async () => {
    if (!apiKey) {
      toast.error("Please enter an API key to test");
      return;
    }
    
    setTesting(true);
    try {
      const res = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      });
      
      let data;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(res.statusText || "Server returned an invalid response");
      }
      
      if (data.success) {
        toast.success("Connection successful!");
        saveAIConfig({ provider, apiKey });
        setSavedConfig({ provider, apiKey });
      } else {
        toast.error(data.error || "Connection failed");
      }
    } catch (e: any) {
      toast.error("Test request failed: " + e.message);
    } finally {
      setTesting(false);
    }
  };

  const providers: Provider[] = ["gemini", "claude", "openai"];

  const providerStyles: Record<Provider, { bg: string, border: string, dot: string, glow: string }> = {
    gemini: { bg: "from-blue-400/10 to-cyan-400/10", border: "border-cyan/30 focus-within:border-cyan", dot: "bg-cyan", glow: "shadow-glow-cyan" },
    claude: { bg: "from-orange-400/10 to-red-400/10", border: "border-orange/30 focus-within:border-orange", dot: "bg-orange-500", glow: "shadow-[0_0_30px_rgba(249,115,22,0.2)]" },
    openai: { bg: "from-green-400/10 to-emerald-400/10", border: "border-green/30 focus-within:border-green", dot: "bg-green-500", glow: "shadow-[0_0_30px_rgba(34,197,94,0.2)]" },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-fade-in-up">
      <div 
        className="w-full max-w-xl glass-bright border border-border rounded-2xl glow-border flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 text-center pb-6">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary mb-2">Choose your AI</h2>
          <p className="text-text-secondary text-sm">Select a provider and enter your API key to power the coding engine.</p>
        </div>
        
        <div className="px-8 pb-4 space-y-8 flex-1">
          <div className="grid grid-cols-3 gap-4">
            {providers.map((p) => {
              const styles = providerStyles[p];
              const isSelected = p === provider;
              
              return (
                <div 
                  key={p}
                  onClick={() => { setProvider(p); setApiKey(""); }}
                  className={`rounded-xl p-4 transition-all cursor-pointer border bg-gradient-to-br hover:scale-[1.02] flex flex-col items-center justify-center text-center gap-2 group
                    ${isSelected ? `${styles.border} ${styles.glow} ring-1 ring-inset ring-${styles.dot.replace('bg-', '')}` : "border-border/50 hover:border-border"}
                    ${styles.bg}
                  `}
                >
                  <div className={`w-3 h-3 rounded-full ${styles.dot} ${isSelected ? 'animate-pulse' : 'opacity-50 group-hover:opacity-100'}`} />
                  <h3 className={`font-semibold text-sm ${isSelected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                    {p === 'gemini' ? 'Gemini' : p === 'claude' ? 'Claude' : 'OpenAI'}
                  </h3>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-text-primary">API Key</label>
            </div>
            <div className="relative group">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-surface border-border font-mono text-text-primary pr-12 h-12 rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all shadow-inner"
              />
              <button 
                type="button" 
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-1 transition-colors"
              >
                {showKey ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
            
            <a 
              href={PROVIDER_KEY_LINKS[provider]} 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-primary hover:text-primary-bright flex items-center gap-1 w-fit transition-colors"
            >
              Get your {PROVIDER_LABELS[provider]} key <ExternalLinkIcon className="w-3 h-3" />
            </a>
          </div>
          
          <div className="flex gap-4 pt-2">
            <Button onClick={handleTest} disabled={testing || !apiKey} variant="outline" size="lg" className="flex-1 font-medium bg-surface text-text-primary hover:bg-surface-hover">
              {testing ? <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" /> : "Test connection"}
            </Button>
            <Button onClick={handleSave} disabled={!apiKey} size="lg" className="flex-1 font-medium bg-gradient-button hover:shadow-glow-button text-white">
              {savedConfig.provider === provider && savedConfig.apiKey === apiKey ? (
                <div className="flex items-center text-white">
                  <CheckCircleIcon className="w-4 h-4 mr-2" /> Connected
                </div>
              ) : (
                "Save key"
              )}
            </Button>
          </div>
        </div>

        <div className="px-8 py-5 border-t border-border/50 bg-background-secondary/50 flex items-center justify-center gap-2">
          <LockIcon className="w-3.5 h-3.5 text-text-tertiary" />
          <p className="text-xs text-text-tertiary font-medium">
            Stored locally in your browser only.
          </p>
        </div>
      </div>
    </div>
  );
}
