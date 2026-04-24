import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSetDataRows, useSetDatasetSchema } from "@/hooks/useQueryData";
import { useDataStore } from "@/store/useDataStore";
import type { ColumnDefinition, DataRow } from "@/types/data";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileJson,
  FileText,
  Loader2,
  Table2,
  Upload,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

// ── Type helpers ─────────────────────────────────────────────────────────────

function inferColumnType(values: string[]): ColumnDefinition["type"] {
  const nonEmpty = values.filter((v) => v.trim() !== "");
  if (nonEmpty.length === 0) return "text";

  const dateRe =
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$|^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/;
  const allNumbers = nonEmpty.every(
    (v) => !Number.isNaN(Number.parseFloat(v)) && Number.isFinite(Number(v)),
  );
  if (allNumbers) return "number";

  const allDates = nonEmpty.every(
    (v) => dateRe.test(v.trim()) && !Number.isNaN(Date.parse(v)),
  );
  if (allDates) return "date";

  return "text";
}

function parseCSV(text: string): DataRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2)
    throw new Error("CSV must have at least a header row and one data row.");

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parseRow(line);
    const row: DataRow = {};
    headers.forEach((h, i) => {
      const raw = cells[i] ?? "";
      const num = Number.parseFloat(raw);
      row[h] =
        !Number.isNaN(num) && Number.isFinite(num) && raw.trim() !== ""
          ? num
          : raw;
    });
    return row;
  });
}

function parseJSON(text: string): DataRow[] {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed))
    throw new Error("JSON must be an array of objects.");
  if (parsed.length === 0) throw new Error("JSON array is empty.");
  if (typeof parsed[0] !== "object" || parsed[0] === null)
    throw new Error("JSON array must contain objects.");
  return parsed as DataRow[];
}

function inferSchema(rows: DataRow[]): ColumnDefinition[] {
  if (rows.length === 0) return [];
  return Object.keys(rows[0]).map((name) => ({
    name,
    type: inferColumnType(rows.slice(0, 200).map((r) => String(r[name] ?? ""))),
  }));
}

// ── Sub-components ────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<ColumnDefinition["type"], string> = {
  number: "bg-primary/10 text-primary border-primary/20",
  date: "bg-accent/10 text-accent border-accent/20",
  text: "bg-muted text-muted-foreground border-border",
};

function TypeBadge({ type }: { type: ColumnDefinition["type"] }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${TYPE_COLORS[type]}`}
    >
      {type}
    </span>
  );
}

interface PreviewTableProps {
  rows: DataRow[];
  schema: ColumnDefinition[];
}

function PreviewTable({ rows, schema }: PreviewTableProps) {
  const preview = rows.slice(0, 100);
  return (
    <div
      data-ocid="upload.preview_table"
      className="overflow-auto rounded-xl border border-border shadow-card bg-card"
      style={{ maxHeight: "420px" }}
    >
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
          <tr>
            {schema.map((col) => (
              <th
                key={col.name}
                className="px-4 py-3 text-left whitespace-nowrap border-b border-border font-semibold text-foreground"
              >
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-[160px]" title={col.name}>
                    {col.name}
                  </span>
                  <TypeBadge type={col.type} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {preview.map((row, ri) => (
            <tr
              key={`row-${ri}-${Object.values(row).slice(0, 2).join("-")}`}
              data-ocid={`upload.preview_row.${ri + 1}`}
              className="hover:bg-muted/40 transition-colors duration-150 border-b border-border last:border-0"
            >
              {schema.map((col) => (
                <td
                  key={col.name}
                  className={`px-4 py-2.5 whitespace-nowrap max-w-[220px] truncate ${
                    col.type === "number"
                      ? "text-right font-mono text-primary tabular-nums"
                      : "text-foreground"
                  }`}
                  title={String(row[col.name] ?? "")}
                >
                  {String(row[col.name] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const EXAMPLE_QUESTIONS = [
  "What is the average Revenue by Region?",
  "Show me the top 5 rows by Sales amount",
  "Compare Q3 vs Q4 performance",
  "What percentage of orders came from each category?",
  "Which product had the highest growth rate?",
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DataUploadPage() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "parsing" | "syncing" | "done"
  >("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dataset = useDataStore((s) => s.dataset);
  const schema = useDataStore((s) => s.schema);
  const setDataset = useDataStore((s) => s.setDataset);
  const setSchema = useDataStore((s) => s.setSchema);

  const { mutateAsync: setDatasetSchema } = useSetDatasetSchema();
  const { mutateAsync: setDataRows } = useSetDataRows();

  const processFile = useCallback(
    async (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["csv", "json"].includes(ext ?? "")) {
        toast.error("Unsupported file type", {
          description: "Please upload a .csv or .json file.",
        });
        return;
      }
      if (file.size === 0) {
        toast.error("Empty file", {
          description: "The selected file contains no data.",
        });
        return;
      }

      setFileName(file.name);
      setUploadStatus("parsing");

      try {
        const text = await file.text();
        let rows: DataRow[];

        if (ext === "csv") {
          rows = parseCSV(text);
        } else {
          rows = parseJSON(text);
        }

        if (rows.length === 0) {
          throw new Error("No data rows found in the file.");
        }

        const cols = inferSchema(rows);
        setSchema(cols);
        setDataset(rows);

        setUploadStatus("syncing");

        await Promise.all([setDatasetSchema(cols), setDataRows(rows)]);

        setUploadStatus("done");
        toast.success("Dataset ready!", {
          description: `${rows.length.toLocaleString()} rows · ${cols.length} columns loaded.`,
        });
      } catch (err) {
        setUploadStatus("idle");
        setFileName(null);
        const msg = err instanceof Error ? err.message : "Unknown parse error";
        toast.error("Failed to parse file", { description: msg });
      }
    },
    [setDataset, setSchema, setDatasetSchema, setDataRows],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile],
  );

  const hasData = dataset && schema && dataset.length > 0;

  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        {/* ── Drop zone ───────────────────────────────────────────────── */}
        <section data-ocid="upload.section" className="space-y-2">
          <h2 className="font-display font-bold text-xl text-foreground">
            Upload Dataset
          </h2>
          <p className="text-sm text-muted-foreground">
            Drop a CSV or JSON file to start exploring your data with AI.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,.json"
            className="hidden"
            onChange={onFileChange}
            data-ocid="upload.file_input"
            aria-label="Upload CSV or JSON file"
          />

          <button
            type="button"
            data-ocid="upload.dropzone"
            disabled={uploadStatus === "parsing" || uploadStatus === "syncing"}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`w-full rounded-2xl border-2 border-dashed px-8 py-14 flex flex-col items-center justify-center gap-4 transition-smooth cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              isDragging
                ? "border-primary bg-primary/10 scale-[1.01]"
                : uploadStatus === "done"
                  ? "border-primary/60 bg-primary/5"
                  : "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5"
            } disabled:cursor-not-allowed disabled:opacity-60`}
            aria-label="Drop CSV or JSON file here, or click to browse"
          >
            {uploadStatus === "parsing" || uploadStatus === "syncing" ? (
              <>
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <div className="text-center">
                  <p className="font-semibold text-foreground">
                    {uploadStatus === "parsing"
                      ? "Parsing file…"
                      : "Syncing with backend…"}
                  </p>
                  {fileName && (
                    <p className="text-sm text-muted-foreground font-mono mt-1 truncate max-w-xs">
                      {fileName}
                    </p>
                  )}
                </div>
              </>
            ) : uploadStatus === "done" && hasData ? (
              <>
                <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">
                    Dataset loaded
                  </p>
                  <p className="text-sm text-muted-foreground font-mono mt-1 flex items-center gap-2 justify-center">
                    {fileName?.endsWith(".json") ? (
                      <FileJson className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    {fileName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click to replace with a new file
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-semibold text-foreground text-lg">
                    Drop files here or{" "}
                    <span className="text-primary underline decoration-dotted">
                      browse
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports CSV and JSON
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono text-xs border-primary/30 text-primary"
                  >
                    .csv
                  </Badge>
                  <Badge
                    variant="outline"
                    className="font-mono text-xs border-accent/30 text-accent"
                  >
                    .json
                  </Badge>
                </div>
              </>
            )}
          </button>
        </section>

        {/* ── Stats + CTA ─────────────────────────────────────────────── */}
        {hasData && schema && (
          <section
            data-ocid="upload.summary_section"
            className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-card border border-border shadow-card"
          >
            <div className="flex flex-wrap gap-6">
              <div className="flex flex-col">
                <span className="text-label text-xs">Rows</span>
                <span className="font-display font-bold text-2xl text-foreground tabular-nums">
                  {dataset.length.toLocaleString()}
                </span>
              </div>
              <div className="w-px bg-border" />
              <div className="flex flex-col">
                <span className="text-label text-xs">Columns</span>
                <span className="font-display font-bold text-2xl text-foreground tabular-nums">
                  {schema.length}
                </span>
              </div>
              <div className="w-px bg-border" />
              <div className="flex flex-col gap-1">
                <span className="text-label text-xs">Types</span>
                <div className="flex gap-1.5 flex-wrap">
                  {(
                    ["number", "date", "text"] as ColumnDefinition["type"][]
                  ).map((t) => {
                    const count = schema.filter((c) => c.type === t).length;
                    if (count === 0) return null;
                    return (
                      <span key={t} className="flex items-center gap-1">
                        <TypeBadge type={t} />
                        <span className="text-xs text-muted-foreground">
                          {count}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
            <Button
              data-ocid="upload.explore_button"
              onClick={() => navigate({ to: "/explore" })}
              size="lg"
              className="gap-2 shrink-0"
            >
              Start Exploring
              <ArrowRight className="w-4 h-4" />
            </Button>
          </section>
        )}

        {/* ── Data preview table ───────────────────────────────────────── */}
        {hasData && schema && (
          <section data-ocid="upload.preview_section" className="space-y-3">
            <div className="flex items-center gap-2">
              <Table2 className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground text-sm">
                Preview{" "}
                <span className="text-muted-foreground font-normal">
                  (first {Math.min(100, dataset.length)} rows)
                </span>
              </h3>
            </div>
            <PreviewTable rows={dataset} schema={schema} />
          </section>
        )}

        {/* ── Sync in-progress skeleton ────────────────────────────────── */}
        {uploadStatus === "syncing" && (
          <section className="space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </section>
        )}

        {/* ── Empty state ──────────────────────────────────────────────── */}
        {uploadStatus === "idle" && !hasData && (
          <section
            data-ocid="upload.empty_state"
            className="rounded-2xl border border-dashed border-border bg-muted/20 px-8 py-10 space-y-5"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  No dataset loaded yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upload a CSV or JSON file above to begin. Here are example
                  questions you can ask once your data is loaded:
                </p>
              </div>
            </div>
            <ul className="space-y-2 pl-8">
              {EXAMPLE_QUESTIONS.map((q, i) => (
                <li
                  key={q}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="italic">"{q}"</span>
                </li>
              ))}
            </ul>
            <div className="pl-8 pt-1">
              <button
                type="button"
                data-ocid="upload.browse_button"
                onClick={() => inputRef.current?.click()}
                className="text-sm font-semibold text-primary hover:text-primary/80 underline decoration-dotted transition-colors duration-150"
              >
                Browse for a file to get started →
              </button>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
