import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface ChatSession {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
  is_archived: boolean;
}

interface ChatContextType {
  sessions: ChatSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  createSession: (title: string) => string;
  renameSession: (id: string, title: string) => void;
  deleteSession: (id: string) => void;
  archiveSession: (id: string) => void;
  startNewChat: () => void;
  sessionHasMessages: boolean;
  markMessageSent: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = user ? `bizento_sessions_${user.uid}` : "bizento_sessions_anon";

  const load = () => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  };

  const [sessions, setSessions] = useState<ChatSession[]>(load);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionHasMessages, setSessionHasMessages] = useState(false);

  useEffect(() => {
    setSessions(load());
  }, [storageKey]);

  const persist = useCallback((next: ChatSession[]) => {
    setSessions(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  }, [storageKey]);

  const createSession = useCallback((title: string): string => {
    const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const session: ChatSession = {
      id,
      title: title.trim().slice(0, 55) || "New Chat",
      created_at: Date.now(),
      updated_at: Date.now(),
      is_archived: false,
    };
    setSessions(prev => {
      const next = [session, ...prev];
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
    setActiveSessionId(id);
    return id;
  }, [storageKey]);

  const renameSession = useCallback((id: string, title: string) => {
    setSessions(prev => {
      const next = prev.map(s => s.id === id ? { ...s, title: title.trim().slice(0, 55) || s.title, updated_at: Date.now() } : s);
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [storageKey]);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
    setActiveSessionId(prev => prev === id ? null : prev);
  }, [storageKey]);

  const archiveSession = useCallback((id: string) => {
    setSessions(prev => {
      const next = prev.map(s => s.id === id ? { ...s, is_archived: true, updated_at: Date.now() } : s);
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
    setActiveSessionId(prev => prev === id ? null : prev);
  }, [storageKey]);

  const startNewChat = useCallback(() => {
    setActiveSessionId(null);
    setSessionHasMessages(false);
  }, []);

  const markMessageSent = useCallback(() => {
    setSessionHasMessages(true);
  }, []);

  return (
    <ChatContext.Provider value={{
      sessions,
      activeSessionId,
      setActiveSessionId,
      createSession,
      renameSession,
      deleteSession,
      archiveSession,
      startNewChat,
      sessionHasMessages,
      markMessageSent,
    }}>
      {children}
    </ChatContext.Provider>
  );
}
