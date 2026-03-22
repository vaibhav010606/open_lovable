import { create } from 'zustand';

interface Message { 
  id: string; 
  role: 'user' | 'assistant'; 
  content: string; 
}

interface ChatStore {
  messages: Message[];
  isStreaming: boolean;
  currentStreamText: string;
  addMessage: (msg: Message) => void;
  setStreaming: (v: boolean) => void;
  appendStream: (text: string) => void;
  resetStream: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  currentStreamText: '',
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setStreaming: (v) => set({ isStreaming: v }),
  appendStream: (text) => set((s) => ({ currentStreamText: s.currentStreamText + text })),
  resetStream: () => set({ currentStreamText: '' }),
}));
