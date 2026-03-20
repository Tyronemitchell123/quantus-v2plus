import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, FileText, BarChart3, Wand2, Tags, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";

export type HistoryEntry = {
  id: string;
  mode: string;
  title: string;
  input_text: string;
  prompt: string | null;
  result: any;
  created_at: string;
};

const modeIcons: Record<string, any> = {
  summarize: FileText,
  sentiment: BarChart3,
  generate: Wand2,
  "extract-entities": Tags,
};

const modeLabels: Record<string, string> = {
  summarize: "Summary",
  sentiment: "Sentiment",
  generate: "Generated",
  "extract-entities": "Entities",
};

interface Props {
  history: HistoryEntry[];
  loading: boolean;
  activeId: string | null;
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

export default function NLPHistorySidebar({ history, loading, activeId, onSelect, onDelete }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`relative flex flex-col border-r border-border bg-card/50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 ${
        collapsed ? "w-12" : "w-72"
      }`}
    >
      {/* Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 z-10 h-6 w-6 rounded-full border border-border bg-card p-0 shadow-sm hover:bg-secondary"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </Button>

      {/* Header */}
      <div className={`flex items-center gap-2 px-3 py-4 border-b border-border ${collapsed ? "justify-center" : ""}`}>
        <History size={16} className="text-muted-foreground shrink-0" />
        {!collapsed && <span className="text-sm font-medium text-foreground">History</span>}
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={16} className="animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          !collapsed && (
            <div className="px-3 py-8 text-center">
              <p className="text-xs text-muted-foreground">No saved analyses yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Run an analysis to save it here.</p>
            </div>
          )
        ) : (
          <div className="p-1.5 space-y-0.5">
            <AnimatePresence initial={false}>
              {history.map((entry) => {
                const Icon = modeIcons[entry.mode] || FileText;
                const isActive = activeId === entry.id;

                return collapsed ? (
                  <TooltipProvider key={entry.id} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onSelect(entry)}
                          className={`w-full flex items-center justify-center py-2 rounded-md transition-colors ${
                            isActive ? "bg-quantum-purple/10 text-quantum-purple" : "text-muted-foreground hover:bg-secondary/50"
                          }`}
                        >
                          <Icon size={14} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        <p className="font-medium">{entry.title}</p>
                        <p className="text-muted-foreground">{modeLabels[entry.mode]}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <motion.button
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onSelect(entry)}
                    className={`group w-full text-left rounded-lg px-3 py-2.5 transition-colors ${
                      isActive
                        ? "bg-quantum-purple/10 border border-quantum-purple/20"
                        : "hover:bg-secondary/50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon size={14} className={`mt-0.5 shrink-0 ${isActive ? "text-quantum-purple" : "text-muted-foreground"}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm truncate ${isActive ? "text-quantum-purple font-medium" : "text-foreground"}`}>
                          {entry.title}
                        </p>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {modeLabels[entry.mode]}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-0.5 rounded hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
