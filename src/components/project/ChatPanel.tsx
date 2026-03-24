"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useFileStore } from "@/stores/fileStore";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendIcon, SparklesIcon, FileIcon, ImageIcon, CopyIcon } from "lucide-react";
import { parseFilesFromStream } from "@/lib/ai/stream-handler";
import { getAIConfig, PROVIDER_LABELS } from "@/lib/ai/providers";
import { ChevronDownIcon } from "lucide-react";

export function ChatPanel({ projectId, onFileUpdate }: { projectId: string, onFileUpdate: (path: string, content: string) => void }) {
  const { messages, addMessage, isStreaming, currentStreamText, setStreaming, appendStream, resetStream } = useChatStore();
  const { files } = useFileStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [providerLabel, setProviderLabel] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    setProviderLabel(PROVIDER_LABELS[getAIConfig().provider]);
    const handleStorage = () => setProviderLabel(PROVIDER_LABELS[getAIConfig().provider]);
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Handle scroll events to show/hide the "scroll to bottom" button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    isAtBottomRef.current = isAtBottom;
    setShowScrollButton(!isAtBottom);
    if (isAtBottom) setHasNewMessages(false);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  // Auto-scroll logic
  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom();
    } else {
      setHasNewMessages(true);
    }
  }, [messages, currentStreamText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const config = getAIConfig();
    if (!config.apiKey) {
      window.dispatchEvent(new CustomEvent('open-api-key-modal'));
      return;
    }

    const userMsg = input;
    setInput("");
    
    // Save to DB
    await supabase.from("messages").insert({ project_id: projectId, role: "user", content: userMsg });
    
    const newUserMessage = { id: crypto.randomUUID(), role: "user" as const, content: userMsg };
    addMessage(newUserMessage);
    
    setStreaming(true);
    resetStream();

    try {
      // Call AI endpoint
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, newUserMessage].map(m => ({ role: m.role, content: m.content })),
          files: files, // passing current filesystem
          provider: config.provider,
          apiKey: config.apiKey,
        }),
      });

      if (!response.body) throw new Error("No stream body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        appendStream(chunk);

        // Periodically parse for files during streaming to update the UI
        const parsedFiles = parseFilesFromStream(fullResponse);
        for (const [path, content] of Object.entries(parsedFiles)) {
          // If content actually fully replaced (basic check)
          if (content.length > 10) onFileUpdate(path, content);
        }
      }

      // Final pass to ensure all files caught
      const finalFiles = parseFilesFromStream(fullResponse);
      for (const [path, content] of Object.entries(finalFiles)) {
        onFileUpdate(path, content);
      }

      // Save assistant to DB
      await supabase.from("messages").insert({ project_id: projectId, role: "assistant", content: fullResponse });
      addMessage({ id: crypto.randomUUID(), role: "assistant", content: fullResponse });
      
    } catch (e) {
      console.error(e);
      addMessage({ id: crypto.randomUUID(), role: "assistant", content: "Sorry, an error occurred while streaming." });
    } finally {
      setStreaming(false);
      resetStream();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const renderMessageContent = (content: string) => {
    // Basic formatting for code blocks in chat (just for display purposes here)
    if (content.includes('```')) {
      const parts = content.split(/(```[\s\S]*?```)/g);
      return parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3).replace(/^[a-z]*\n/, '');
          return (
            <div key={i} className="code-block my-2 relative group">
              <pre><code>{code}</code></pre>
              <Button size="icon" variant="ghost" className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface/50 hover:bg-surface" onClick={() => navigator.clipboard.writeText(code)}>
                <CopyIcon className="w-3 h-3 text-text-secondary" />
              </Button>
            </div>
          );
        }
        return <span key={i} className="whitespace-pre-wrap">{part}</span>;
      });
    }
    return <span className="whitespace-pre-wrap">{content}</span>;
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="h-14 flex-shrink-0 border-b border-border/40 flex items-center justify-between px-4 bg-background">
        <div className="flex items-center gap-2 text-text-primary font-medium">
          <SparklesIcon className="w-4 h-4 text-primary" />
          <h2 className="text-sm">AI Assistant</h2>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-hover border border-border/50">
          <div className={`w-2 h-2 rounded-full ${providerLabel.includes('Gemini') ? 'bg-cyan' : providerLabel.includes('Claude') ? 'bg-orange-500' : 'bg-green-500'}`} />
          <span className="text-xs font-mono text-text-secondary">{providerLabel || "Select Provider"}</span>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 px-4 py-6" ref={scrollRef} onScroll={handleScroll}>
        <div className="space-y-6 pb-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center mt-20 text-text-secondary">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <SparklesIcon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm max-w-[250px]">Describe what you want to build or change, and I'll generate the code.</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex w-full animate-fade-in-up ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`text-sm py-3 px-4 shadow-sm ${
                m.role === 'user' 
                  ? 'chat-user max-w-[80%]' 
                  : 'chat-assistant max-w-[85%] text-text-primary leading-relaxed'
              }`}>
                {renderMessageContent(m.content)}
              </div>
            </div>
          ))}
          {isStreaming && (
            <div className="flex justify-start w-full animate-fade-in-up">
              <div className="text-sm py-3 px-4 chat-assistant max-w-[85%] text-text-primary leading-relaxed border-l-2 border-l-primary flex items-center">
                {currentStreamText ? (
                  <span className="cursor whitespace-pre-wrap">{currentStreamText}</span>
                ) : (
                  <div className="flex gap-1 h-5 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-100" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-200" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-300" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-background/80 backdrop-blur-md border border-border/80 px-3 py-1.5 rounded-full shadow-lg hover:bg-surface-hover transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 group"
        >
          {hasNewMessages && (
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
          <ChevronDownIcon className="w-4 h-4 text-text-primary group-hover:translate-y-0.5 transition-transform" />
          {hasNewMessages && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary">New</span>
          )}
        </button>
      )}

      <div className="flex-shrink-0 p-4 border-t border-border/40 bg-background/80 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="relative flex flex-col glass-bright rounded-2xl shadow-lg border border-border/80 p-2 glow-border focus-within:ring-1 focus-within:ring-primary/50 transition-all">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build or change..."
            className="min-h-[44px] max-h-[120px] resize-none border-none focus-visible:ring-0 bg-transparent text-text-primary text-sm p-3 placeholder:text-text-tertiary shadow-none"
            disabled={isStreaming}
            rows={1}
          />
          <div className="flex items-center justify-between pt-2 px-2 pb-1">
            <div className="flex gap-1">
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-text-tertiary hover:text-text-primary rounded-lg transition-colors">
                <FileIcon className="w-4 h-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-text-tertiary hover:text-text-primary rounded-lg transition-colors">
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isStreaming}
              className={`h-8 w-8 rounded-lg shadow-sm transition-all duration-200 active:scale-90 ${
                !input.trim() || isStreaming 
                  ? 'bg-surface-hover text-text-tertiary' 
                  : 'bg-primary text-white hover:shadow-glow-primary hover:bg-primary-glow'
              }`}
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
