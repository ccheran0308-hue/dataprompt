import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryData } from "@/hooks/useQueryData";
import { useDataStore } from "@/store/useDataStore";
import type { ChartData, QueryRecord, QueryResult } from "@/types/data";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  BarChart2,
  PieChart,
  Send,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

// ── Chart color palette (matches CSS vars — hardcoded OKLCH equivalents for Recharts) ──
const CHART_COLORS = [
  "oklch(0.58 0.2 200)",
  "oklch(0.65 0.19 40)",
  "oklch(0.6 0.16 182)",
  "oklch(0.62 0.14 215)",
  "oklch(0.58 0.18 22)",
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function toRechartsData(chart: ChartData) {
  return chart.labels.map((label, i) => ({
    name: label,
    value: chart.values[i] ?? 0,
  }));
}

function formatPercent(value: number, total: number) {
  return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "0%";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function QueryBarChart({ data }: { data: ChartData }) {
  const chartData = toRechartsData(data);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.87 0.01 220)" />
        <XAxis
          dataKey="name"
          tick={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            fill: "oklch(0.48 0.01 220)",
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            fill: "oklch(0.48 0.01 220)",
          }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            color: "var(--card-foreground)",
            border: "1px solid oklch(0.87 0.01 220)",
            borderRadius: "8px",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-body)" }}
        />
        <Bar
          dataKey="value"
          fill="oklch(0.58 0.2 200)"
          radius={[4, 4, 0, 0]}
          name="Value"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function QueryPieChart({ data }: { data: ChartData }) {
  const chartData = toRechartsData(data);
  const total = chartData.reduce((sum, d) => sum + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RechartsPieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, value }) =>
            `${name}: ${formatPercent(value as number, total)}`
          }
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            color: "var(--card-foreground)",
            border: "1px solid oklch(0.87 0.01 220)",
            borderRadius: "8px",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
          formatter={(value: number) => [
            `${value} (${formatPercent(value, total)})`,
            "Value",
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-body)" }}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

function DataTable({ data }: { data: ChartData }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/60 border-b border-border">
            <th className="text-left px-4 py-2.5 font-semibold text-foreground font-body text-xs uppercase tracking-wide">
              Label
            </th>
            <th className="text-right px-4 py-2.5 font-semibold text-foreground font-body text-xs uppercase tracking-wide">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {data.labels.map((label, i) => (
            <tr
              key={label}
              className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors duration-150"
            >
              <td className="px-4 py-2.5 font-mono text-xs text-foreground">
                {label}
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-right text-foreground font-semibold">
                {(data.values[i] ?? 0).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultCard({
  result,
  question,
  index,
}: {
  result: QueryResult;
  question: string;
  index: number;
}) {
  const hasChart = result.chartType !== "none" && result.chartData;
  const hasTableData =
    result.chartData &&
    result.chartData.labels.length > 0 &&
    result.chartData.values.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.35,
        ease: [0.4, 0, 0.2, 1],
        delay: index * 0.06,
      }}
      data-ocid={`result.card.${index + 1}`}
    >
      <Card className="shadow-card border-border overflow-hidden">
        <CardHeader className="pb-3 bg-card border-b border-border/60">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-mono text-muted-foreground truncate">
                {question}
              </p>
            </div>
            {hasChart && (
              <Badge
                variant="secondary"
                className="shrink-0 text-[10px] font-mono gap-1 ml-auto"
              >
                {result.chartType === "bar" ? (
                  <BarChart2 className="w-3 h-3" />
                ) : (
                  <PieChart className="w-3 h-3" />
                )}
                {result.chartType} chart
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-5">
          {/* Answer text */}
          <p
            className="text-base text-foreground leading-relaxed font-body"
            data-ocid={`result.answer.${index + 1}`}
          >
            {result.answer}
          </p>

          {/* Chart */}
          {hasChart && result.chartData && (
            <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
              <CardTitle className="text-sm font-semibold text-foreground mb-4 font-body">
                {result.chartType === "bar" ? "Bar Chart" : "Pie Chart"}
              </CardTitle>
              {result.chartType === "bar" && (
                <QueryBarChart data={result.chartData} />
              )}
              {result.chartType === "pie" && (
                <QueryPieChart data={result.chartData} />
              )}
            </div>
          )}

          {/* Data table */}
          {hasTableData && result.chartData && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5 font-body">
                Data Summary
              </p>
              <DataTable data={result.chartData} />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoadingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      data-ocid="result.loading_state"
    >
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3 bg-card border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-sm font-mono text-muted-foreground animate-pulse">
              Analyzing your data...
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-40 w-full mt-2 rounded-xl" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ExplorerPage() {
  const dataset = useDataStore((s) => s.dataset);
  const queryHistory = useDataStore((s) => s.queryHistory);
  const [prompt, setPrompt] = useState("");
  const [activeQueryId, setActiveQueryId] = useState<string | undefined>();
  const [localResults, setLocalResults] = useState<
    Array<{ question: string; result: QueryResult; id: string }>
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: queryData, isPending } = useQueryData();

  const handleHistorySelect = useCallback((record: QueryRecord) => {
    setActiveQueryId(record.id);
    setLocalResults((prev) => {
      const exists = prev.find((r) => r.id === record.id);
      if (exists) return prev;
      return [
        { question: record.question, result: record.result, id: record.id },
        ...prev,
      ];
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const q = prompt.trim();
    if (!q || isPending) return;

    setPrompt("");
    queryData(q, {
      onSuccess: (result) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const newEntry = { question: q, result, id };
        setLocalResults((prev) => [newEntry, ...prev]);
        setActiveQueryId(id);
      },
      onError: (err) => {
        toast.error("Query failed", {
          description: err.message || "Something went wrong. Try again.",
        });
      },
    });
  }, [prompt, isPending, queryData]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  // ── No dataset guard ──────────────────────────────────────────────────────
  if (!dataset) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-full p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-md w-full"
            data-ocid="explorer.no_dataset_banner"
          >
            <Card className="shadow-elevated border-accent/30 bg-accent/5">
              <CardContent className="pt-8 pb-8 text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-7 h-7 text-accent" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-display font-bold text-xl text-foreground">
                    No Dataset Loaded
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You need to upload a dataset before you can explore it with
                    natural language queries.
                  </p>
                </div>
                <Link to="/" data-ocid="explorer.upload_link">
                  <Button variant="default" className="gap-2 mt-1">
                    <ArrowLeft className="w-4 h-4" />
                    Upload Data First
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // ── Main explorer ─────────────────────────────────────────────────────────
  const displayResults = localResults.length > 0 ? localResults : [];

  return (
    <Layout onHistorySelect={handleHistorySelect} activeQueryId={activeQueryId}>
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Query input section */}
        <section
          className="space-y-3"
          data-ocid="explorer.query_section"
          aria-label="Natural language query"
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="font-display font-semibold text-base text-foreground">
              Natural Language Query
            </h2>
            <Badge
              variant="secondary"
              className="text-[10px] font-mono ml-auto gap-1"
            >
              {queryHistory.length} queries
            </Badge>
          </div>

          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your data..."
              disabled={isPending}
              data-ocid="explorer.query_input"
              className={[
                "flex-1 h-11 px-4 rounded-lg border border-input bg-card text-foreground",
                "placeholder:text-muted-foreground font-body text-sm",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-smooth",
              ].join(" ")}
              aria-label="Enter a natural language question about your data"
            />
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!prompt.trim() || isPending}
              data-ocid="explorer.analyze_button"
              className="h-11 px-5 gap-2 shrink-0"
            >
              {isPending ? (
                <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Analyze
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground font-mono">
            Press{" "}
            <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px]">
              Enter
            </kbd>{" "}
            to submit · {dataset.length.toLocaleString()} rows loaded
          </p>
        </section>

        {/* Results */}
        {(displayResults.length > 0 || isPending) && (
          <section
            className="space-y-5"
            aria-label="Query results"
            data-ocid="explorer.results_section"
          >
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold text-base text-foreground">
                Results
              </h2>
            </div>

            <div className="space-y-5">
              <AnimatePresence mode="popLayout">
                {isPending && <LoadingCard key="loading" />}
                {displayResults.map((entry, i) => (
                  <ResultCard
                    key={entry.id}
                    question={entry.question}
                    result={entry.result}
                    index={i}
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Empty prompt state — when dataset is loaded but no queries yet */}
        {displayResults.length === 0 && !isPending && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
            data-ocid="explorer.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">
              Ready to Explore
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Type a question above — like "What are the top 5 categories by
              revenue?" or "Show sales by region as a bar chart."
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-sm">
              {[
                "Summarize the dataset",
                "Show top 5 by value",
                "Compare categories",
                "What's the average?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setPrompt(suggestion);
                    inputRef.current?.focus();
                  }}
                  data-ocid="explorer.suggestion_button"
                  className={[
                    "px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5",
                    "text-xs font-mono text-primary hover:bg-primary/10 hover:border-primary/50",
                    "transition-smooth cursor-pointer",
                  ].join(" ")}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
