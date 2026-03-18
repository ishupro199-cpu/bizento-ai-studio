import { useState } from "react";
import {
  Trash2, Archive, Edit3, MoreVertical, Clock,
  Image as ImageIcon, Search, Filter, Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/contexts/AppContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const TOOL_FILTERS = ["All", "Generate Catalog", "Product Photography", "Cinematic Ads", "Ad Creatives"];

export default function HistoryPage() {
  const { generations, deleteGeneration } = useAppContext();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [renamedIds, setRenamedIds] = useState<Record<string, string>>({});
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());

  const filtered = generations.filter((gen) => {
    const matchFilter = activeFilter === "All" || gen.tool === activeFilter;
    const matchSearch = !searchQuery || gen.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const notArchived = !archivedIds.has(gen.id);
    return matchFilter && matchSearch && notArchived;
  });

  const handleRename = (id: string, currentPrompt: string) => {
    const newName = window.prompt("Rename this session:", renamedIds[id] || currentPrompt);
    if (newName?.trim()) {
      setRenamedIds((prev) => ({ ...prev, [id]: newName.trim() }));
      toast.success("Session renamed");
    }
  };

  const handleArchive = (id: string) => {
    setArchivedIds((prev) => new Set([...prev, id]));
    toast.success("Session archived");
  };

  const handleDelete = (id: string) => {
    deleteGeneration(id);
    toast.success("Session deleted");
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <Clock className="h-5 w-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">History</h1>
        </div>
        <p className="text-sm text-muted-foreground">All your generation sessions — rename, archive, or delete.</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-white/20">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {TOOL_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 border whitespace-nowrap ${
                activeFilter === f
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/8 hover:text-foreground"
              }`}
            >
              {f === "All" && <Filter className="h-3 w-3" />}
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <p className="text-base font-medium text-muted-foreground mb-1">No sessions yet</p>
          <p className="text-sm text-muted-foreground/60">Your generation history will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((gen) => {
            const displayName = renamedIds[gen.id] || gen.prompt;
            return (
              <div
                key={gen.id}
                className="flex items-center gap-3 p-3 sm:p-4 bg-white/3 border border-white/8 rounded-xl hover:border-white/15 transition-all duration-150 group"
              >
                {/* Gradient thumbnail */}
                <div
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl shrink-0 flex items-center justify-center"
                  style={{ background: gen.gradient }}
                >
                  <ImageIcon className="h-5 w-5 text-white/20" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate leading-snug">{displayName}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary" className="text-[9px] py-0 px-1.5 h-4">{gen.tool}</Badge>
                    <span className="text-[10px] text-muted-foreground/60">
                      {gen.date instanceof Date
                        ? gen.date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                        : ""}
                    </span>
                    <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground/60">
                      <Coins className="h-3 w-3" />
                      {gen.creditsConsumed}
                    </div>
                    {gen.hasRealImages && (
                      <span className="text-[9px] text-primary bg-primary/10 rounded-full px-1.5 py-0.5">AI ✓</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 rounded-xl bg-popover border border-white/10">
                    <DropdownMenuItem
                      onClick={() => handleRename(gen.id, gen.prompt)}
                      className="flex items-center gap-2 cursor-pointer text-sm rounded-lg"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleArchive(gen.id)}
                      className="flex items-center gap-2 cursor-pointer text-sm rounded-lg"
                    >
                      <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={() => handleDelete(gen.id)}
                      className="flex items-center gap-2 cursor-pointer text-sm text-destructive rounded-lg hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}

      {archivedIds.size > 0 && (
        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setArchivedIds(new Set())}
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground"
          >
            Show {archivedIds.size} archived session{archivedIds.size !== 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </div>
  );
}
