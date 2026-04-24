import { cn } from "@/lib/utils";
import type { QueryRecord } from "@/types/data";
import {
  BarChart2,
  Clock,
  MessageCircle,
  PieChart,
  Trash2,
} from "lucide-react";

interface QueryHistorySidebarProps {
  history: QueryRecord[];
  onSelect: (record: QueryRecord) => void;
  onDelete: (id: string) => void;
  activeId?: string;
}

function ChartIcon({ type }: { type: "bar" | "pie" | "none" }) {
  if (type === "bar") return <BarChart2 className="w-3.5 h-3.5 shrink-0" />;
  if (type === "pie") return <PieChart className="w-3.5 h-3.5 shrink-0" />;
  return <MessageCircle className="w-3.5 h-3.5 shrink-0" />;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function QueryHistorySidebar({
  history,
  onSelect,
  onDelete,
  activeId,
}: QueryHistorySidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-0.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-label text-xs">History</span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5">
        {history.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            data-ocid="query_history.empty_state"
          >
            <MessageCircle className="w-8 h-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground font-mono leading-relaxed">
              No queries yet.
              <br />
              Ask your data something.
            </p>
          </div>
        ) : (
          history.map((record, index) => (
            <div
              key={record.id}
              className="group relative"
              data-ocid={`query_history.item.${index + 1}`}
            >
              <button
                type="button"
                className={cn(
                  "w-full flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer text-left",
                  "border transition-smooth hover:shadow-card pr-8",
                  record.result.chartType === "none"
                    ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                    : "border-accent/40 bg-accent/8 hover:bg-accent/12",
                  activeId === record.id &&
                    (record.result.chartType === "none"
                      ? "border-primary/60 bg-primary/15"
                      : "border-accent/70 bg-accent/20"),
                )}
                onClick={() => onSelect(record)}
                aria-label={`Load query: ${record.question}`}
              >
                <span
                  className={cn(
                    "shrink-0",
                    record.result.chartType === "none"
                      ? "text-primary"
                      : "text-accent",
                  )}
                >
                  <ChartIcon type={record.result.chartType} />
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-medium truncate text-foreground leading-snug">
                    {record.question}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                    {timeAgo(record.timestamp)}
                  </p>
                </div>
              </button>

              <button
                type="button"
                data-ocid={`query_history.delete_button.${index + 1}`}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2",
                  "shrink-0 opacity-0 group-hover:opacity-100 transition-smooth",
                  "p-1 rounded hover:bg-destructive/15 hover:text-destructive text-muted-foreground",
                )}
                onClick={() => onDelete(record.id)}
                aria-label="Remove query from history"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
