import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Brain, Code2, Database, GitBranch, Rocket } from "lucide-react";

export const metadata = {
  title: "Open Lovable - AI-Powered Coding Workbench",
  description: "Describe a web app in natural language, and build it live in your browser preview.",
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar */}
      <header className="fixed top-0 w-full px-6 py-4 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur z-50 transition-all">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary shadow-glow-primary flex items-center justify-center font-bold text-white relative overflow-hidden">
            L
            <div className="absolute inset-0 bg-white/20 animate-pulse-glow" />
          </div>
          <span className="font-bold text-xl tracking-tight gradient-text">Open Lovable</span>
        </div>
        <nav className="flex gap-4 items-center">
          <Link href="/login">
            <Button variant="ghost" className="text-text-secondary hover:text-text-primary">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="default" className="shadow-glow-button hover:shadow-glow-primary">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-32 pb-20 overflow-hidden bg-grid">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
          
          <div className="absolute top-20 right-[10%] w-64 h-64 bg-primary rounded-full blur-[120px] opacity-20 pointer-events-none" />
          <div className="absolute bottom-20 left-[10%] w-64 h-64 bg-cyan rounded-full blur-[120px] opacity-20 pointer-events-none" />

          <div className="animate-fade-in-up stagger-children flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-border bg-surface/50 backdrop-blur-sm shadow-sm glass">
              <span className="status-dot animate-pulse"></span>
              <span className="text-sm font-medium text-text-secondary">Now with multi-provider AI</span>
            </div>

            <h1 className="text-5xl sm:text-[72px] font-bold tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6">
              Build apps with<br/>
              <span className="gradient-text">AI that codes</span><br/>
              in real time
            </h1>
            
            <p className="text-xl text-text-secondary max-w-lg mx-auto mb-10 leading-relaxed">
              Describe your idea. Watch it become a live web app. No setup, no deployment headaches.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="xl" className="w-full sm:w-auto font-semibold text-lg pulse-glow">
                  Start building free
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button size="xl" variant="secondary" className="w-full text-lg">
                  See how it works
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex flex-col items-center gap-3">
              <p className="text-sm text-text-tertiary font-medium uppercase tracking-wider">Trusted by 12,000+ builders</p>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-surface-hover flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="Avatar" className="w-full h-full opacity-80" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-20 w-full max-w-5xl mx-auto glow-border rounded-xl">
              <div className="rounded-xl overflow-hidden glass-bright border border-border shadow-2xl relative aspect-video bg-background flex flex-col">
                <div className="h-10 border-b border-border/50 flex items-center px-4 gap-2 bg-surface">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-error/80" />
                    <div className="w-3 h-3 rounded-full bg-warning/80" />
                    <div className="w-3 h-3 rounded-full bg-success/80" />
                  </div>
                  <div className="mx-auto w-1/2 h-6 bg-background rounded border border-border/50 text-center text-xs text-text-tertiary flex items-center justify-center">
                    localhost:3000
                  </div>
                </div>
                <div className="flex-1 flex bg-noise relative">
                  <div className="w-64 border-r border-border/50 bg-background/50 p-4 flex flex-col gap-4">
                    <div className="w-full h-8 bg-surface rounded shimmer" />
                    <div className="w-3/4 h-8 bg-surface rounded shimmer" />
                    <div className="w-5/6 h-8 bg-surface rounded shimmer" />
                  </div>
                  <div className="flex-1 bg-background p-8 flexitems-center justify-center">
                    <div className="w-full h-full border border-border/40 rounded-lg bg-surface/30 p-8 flex flex-col gap-4">
                      <div className="w-1/3 h-10 bg-primary/20 rounded shimmer" />
                      <div className="w-full h-4 bg-surface rounded shimmer" />
                      <div className="w-5/6 h-4 bg-surface rounded shimmer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="py-32 px-4 border-t border-border/40 bg-background relative z-10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              Everything you need to <span className="gradient-text">ship faster</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Zap, title: "Instant preview", desc: "See your app run live as the AI writes each file" },
                { icon: Brain, title: "Your AI, your key", desc: "Bring your Gemini, Claude, or OpenAI API key" },
                { icon: Code2, title: "Real code output", desc: "Full React + TypeScript + Tailwind. No black boxes." },
                { icon: Database, title: "Supabase built-in", desc: "Auth, database, and storage wired up automatically" },
                { icon: GitBranch, title: "GitHub sync", desc: "Push to your repo with one click" },
                { icon: Rocket, title: "One-click deploy", desc: "Ship to Netlify or Vercel instantly" },
              ].map((Feature, i) => (
                <div key={i} className="glass rounded-xl p-8 hover:-translate-y-1 hover:shadow-glow-primary transition-all duration-300 border border-border group">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-text-primary">{Feature.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{Feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Provider section */}
        <section className="py-32 px-4 bg-surface relative z-10 border-t border-b border-border/50">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-16">Works with your <span className="gradient-text">favorite AI</span></h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-bright rounded-2xl p-8 border-cyan/30 hover:border-cyan/60 hover:shadow-glow-cyan transition-all relative overflow-hidden group hover:scale-[1.02]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400" />
                <div className="absolute top-4 right-4 bg-cyan/10 text-cyan text-xs px-2 py-1 rounded-full font-medium">Default</div>
                <h3 className="text-2xl font-bold mt-4 mb-2">Google Gemini</h3>
                <div className="inline-block px-3 py-1 bg-background rounded-full text-xs text-text-secondary font-mono mb-6 border border-border">gemini-2.5-flash</div>
                <p className="text-sm text-text-secondary mb-8">Ultra-fast multimodal reasoning optimized for complex code generation.</p>
              </div>
              
              <div className="glass-bright rounded-2xl p-8 border-orange-500/30 hover:border-orange-500/60 hover:shadow-[0_0_30px_rgba(249,115,22,0.2)] transition-all relative overflow-hidden group hover:scale-[1.02]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-400" />
                <h3 className="text-2xl font-bold mt-4 mb-2">Anthropic Claude</h3>
                <div className="inline-block px-3 py-1 bg-background rounded-full text-xs text-text-secondary font-mono mb-6 border border-border">claude-3-5-sonnet</div>
                <p className="text-sm text-text-secondary mb-8">Industry-leading coding capabilities with deep understanding of React patterns.</p>
              </div>

              <div className="glass-bright rounded-2xl p-8 border-green-500/30 hover:border-green-500/60 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-all relative overflow-hidden group hover:scale-[1.02]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-400" />
                <h3 className="text-2xl font-bold mt-4 mb-2">OpenAI GPT-4o</h3>
                <div className="inline-block px-3 py-1 bg-background rounded-full text-xs text-text-secondary font-mono mb-6 border border-border">gpt-4o</div>
                <p className="text-sm text-text-secondary mb-8">Unmatched general reasoning and vast training knowledge across all frameworks.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-32 px-4 relative flex items-center justify-center text-center overflow-hidden">
          <div className="absolute inset-0 bg-background-secondary z-0">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
          </div>
          
          <div className="relative z-10 max-w-2xl px-6">
            <h2 className="text-5xl font-bold tracking-tight mb-8">Ready to build something?</h2>
            <Link href="/register">
              <Button size="xl" className="px-10 text-lg shadow-glow-button hover:shadow-glow-primary hover:-translate-y-1 transition-all">
                Get started free  
              </Button>
            </Link>
            <p className="mt-6 text-sm text-text-secondary uppercase tracking-widest">No credit card required</p>
          </div>
        </section>
      </main>
    </div>
  );
}
