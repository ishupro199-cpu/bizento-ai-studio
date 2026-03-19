import { createContext, useContext, useState, ReactNode } from "react";
import { useAppContext } from "@/contexts/AppContext";

export interface Workspace {
  id: string;
  name: string;
  isPersonal: boolean;
  memberCount?: number;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  activeWorkspace: Workspace;
  setActiveWorkspaceId: (id: string) => void;
  addWorkspace: (name: string) => Workspace;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAppContext();
  const firstName = user.name?.split(" ")[0] || "User";

  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: "personal", name: `${firstName}'s Personal`, isPersonal: true },
  ]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("personal");

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  const addWorkspace = (name: string): Workspace => {
    const id = `ws_${Date.now()}`;
    const ws: Workspace = { id, name, isPersonal: false, memberCount: 1 };
    setWorkspaces(prev => [...prev, ws]);
    return ws;
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspaceId, activeWorkspace, setActiveWorkspaceId, addWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
