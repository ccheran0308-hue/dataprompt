import { cn } from "@/lib/utils";
import { useDataStore } from "@/store/useDataStore";
import type { QueryRecord } from "@/types/data";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Database, Sparkles } from "lucide-react";
import { useState } from "react";
import { QueryHistorySidebar } from "./QueryHistorySidebar";

interface LayoutProps {
  children: React.ReactNode;
  onHistorySelect?: (record: QueryRecord) => void;
  activeQueryId?: string;
}

export function Layout({
  children,
  onHistorySelect,
  activeQueryId,
}: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const queryHistory = useDataStore((s) => s.queryHistory);

  // Local delete by filtering from store
  const deleteRecord = (id: string) => {
    useDataStore.setState((state) => ({
      queryHistory: state.queryHistory.filter((r) => r.id !== id),
    }));
  };

  const onExplorerPage = location.pathname === "/explore";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "relative flex flex-col bg-sidebar border-r border-sidebar-border transition-smooth z-20",
          sidebarCollapsed ? "w-14" : "w-72",
        )}
      >
        {/* Branding header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border bg-card">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-card">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="font-display font-bold text-sm text-foreground leading-tight truncate">
                Data Studio
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono truncate">
                AI-Powered Explorer
              </p>
            </div>
          )}
        </div>

        {/* Nav icons */}
        <div className="flex flex-col gap-1 px-2 py-3 border-b border-sidebar-border">
          <Link
            to="/"
            data-ocid="nav.upload_link"
            className={cn(
              "flex items-center gap-3 rounded-lg px-2 py-2 transition-smooth text-sm font-medium",
              location.pathname === "/"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Database className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Upload Data</span>}
          </Link>
          <Link
            to="/explore"
            data-ocid="nav.explore_link"
            className={cn(
              "flex items-center gap-3 rounded-lg px-2 py-2 transition-smooth text-sm font-medium",
              onExplorerPage
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Explore</span>}
          </Link>
        </div>

        {/* Query history — only show when on explore page and not collapsed */}
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-hidden">
            <QueryHistorySidebar
              history={queryHistory}
              onSelect={onHistorySelect ?? (() => {})}
              onDelete={deleteRecord}
              activeId={activeQueryId}
            />
          </div>
        )}

        {/* Collapse toggle */}
        <button
          type="button"
          data-ocid="sidebar.toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            "absolute -right-3 top-20 z-30",
            "w-6 h-6 rounded-full bg-card border border-border shadow-card",
            "flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth",
          )}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3.5 bg-card border-b border-border shadow-card z-10">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-lg text-foreground">
              {location.pathname === "/" ? "Upload Dataset" : "Data Explorer"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground px-2 py-1 rounded bg-muted border border-border">
              AI-Powered
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>

        {/* Footer */}
        <footer className="bg-card border-t border-border px-6 py-2.5 flex items-center justify-center">
          <p className="text-[11px] text-muted-foreground font-mono">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
