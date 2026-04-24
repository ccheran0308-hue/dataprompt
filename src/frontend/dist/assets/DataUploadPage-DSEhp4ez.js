import { u as useNavigate, r as reactExports, a as ue, j as jsxRuntimeExports } from "./index-6EHyKMpv.js";
import { c as createLucideIcon, u as useDataStore, a as useSetDatasetSchema, b as useSetDataRows, L as Layout, B as Badge, d as Button, S as Skeleton, C as CircleAlert } from "./useQueryData-CoRHUNhy.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$6 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
];
const ArrowRight = createLucideIcon("arrow-right", __iconNode$6);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
const CircleCheck = createLucideIcon("circle-check", __iconNode$5);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  [
    "path",
    { d: "M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1", key: "1oajmo" }
  ],
  [
    "path",
    { d: "M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1", key: "mpwhp6" }
  ]
];
const FileJson = createLucideIcon("file-json", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
];
const FileText = createLucideIcon("file-text", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]];
const LoaderCircle = createLucideIcon("loader-circle", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
      key: "gugj83"
    }
  ]
];
const Table2 = createLucideIcon("table-2", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode);
function inferColumnType(values) {
  const nonEmpty = values.filter((v) => v.trim() !== "");
  if (nonEmpty.length === 0) return "text";
  const dateRe = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$|^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/;
  const allNumbers = nonEmpty.every(
    (v) => !Number.isNaN(Number.parseFloat(v)) && Number.isFinite(Number(v))
  );
  if (allNumbers) return "number";
  const allDates = nonEmpty.every(
    (v) => dateRe.test(v.trim()) && !Number.isNaN(Date.parse(v))
  );
  if (allDates) return "date";
  return "text";
}
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2)
    throw new Error("CSV must have at least a header row and one data row.");
  const parseRow = (line) => {
    const result = [];
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
    const row = {};
    headers.forEach((h, i) => {
      const raw = cells[i] ?? "";
      const num = Number.parseFloat(raw);
      row[h] = !Number.isNaN(num) && Number.isFinite(num) && raw.trim() !== "" ? num : raw;
    });
    return row;
  });
}
function parseJSON(text) {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed))
    throw new Error("JSON must be an array of objects.");
  if (parsed.length === 0) throw new Error("JSON array is empty.");
  if (typeof parsed[0] !== "object" || parsed[0] === null)
    throw new Error("JSON array must contain objects.");
  return parsed;
}
function inferSchema(rows) {
  if (rows.length === 0) return [];
  return Object.keys(rows[0]).map((name) => ({
    name,
    type: inferColumnType(rows.slice(0, 200).map((r) => String(r[name] ?? "")))
  }));
}
const TYPE_COLORS = {
  number: "bg-primary/10 text-primary border-primary/20",
  date: "bg-accent/10 text-accent border-accent/20",
  text: "bg-muted text-muted-foreground border-border"
};
function TypeBadge({ type }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: `inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${TYPE_COLORS[type]}`,
      children: type
    }
  );
}
function PreviewTable({ rows, schema }) {
  const preview = rows.slice(0, 100);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-ocid": "upload.preview_table",
      className: "overflow-auto rounded-xl border border-border shadow-card bg-card",
      style: { maxHeight: "420px" },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm border-collapse", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 z-10 bg-muted/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: schema.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "th",
          {
            className: "px-4 py-3 text-left whitespace-nowrap border-b border-border font-semibold text-foreground",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[160px]", title: col.name, children: col.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TypeBadge, { type: col.type })
            ] })
          },
          col.name
        )) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: preview.map((row, ri) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "tr",
          {
            "data-ocid": `upload.preview_row.${ri + 1}`,
            className: "hover:bg-muted/40 transition-colors duration-150 border-b border-border last:border-0",
            children: schema.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "td",
              {
                className: `px-4 py-2.5 whitespace-nowrap max-w-[220px] truncate ${col.type === "number" ? "text-right font-mono text-primary tabular-nums" : "text-foreground"}`,
                title: String(row[col.name] ?? ""),
                children: String(row[col.name] ?? "")
              },
              col.name
            ))
          },
          `row-${ri}-${Object.values(row).slice(0, 2).join("-")}`
        )) })
      ] })
    }
  );
}
const EXAMPLE_QUESTIONS = [
  "What is the average Revenue by Region?",
  "Show me the top 5 rows by Sales amount",
  "Compare Q3 vs Q4 performance",
  "What percentage of orders came from each category?",
  "Which product had the highest growth rate?"
];
function DataUploadPage() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = reactExports.useState(false);
  const [uploadStatus, setUploadStatus] = reactExports.useState("idle");
  const [fileName, setFileName] = reactExports.useState(null);
  const inputRef = reactExports.useRef(null);
  const dataset = useDataStore((s) => s.dataset);
  const schema = useDataStore((s) => s.schema);
  const setDataset = useDataStore((s) => s.setDataset);
  const setSchema = useDataStore((s) => s.setSchema);
  const { mutateAsync: setDatasetSchema } = useSetDatasetSchema();
  const { mutateAsync: setDataRows } = useSetDataRows();
  const processFile = reactExports.useCallback(
    async (file) => {
      var _a;
      const ext = (_a = file.name.split(".").pop()) == null ? void 0 : _a.toLowerCase();
      if (!["csv", "json"].includes(ext ?? "")) {
        ue.error("Unsupported file type", {
          description: "Please upload a .csv or .json file."
        });
        return;
      }
      if (file.size === 0) {
        ue.error("Empty file", {
          description: "The selected file contains no data."
        });
        return;
      }
      setFileName(file.name);
      setUploadStatus("parsing");
      try {
        const text = await file.text();
        let rows;
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
        ue.success("Dataset ready!", {
          description: `${rows.length.toLocaleString()} rows · ${cols.length} columns loaded.`
        });
      } catch (err) {
        setUploadStatus("idle");
        setFileName(null);
        const msg = err instanceof Error ? err.message : "Unknown parse error";
        ue.error("Failed to parse file", { description: msg });
      }
    },
    [setDataset, setSchema, setDatasetSchema, setDataRows]
  );
  const onDrop = reactExports.useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );
  const onFileChange = reactExports.useCallback(
    (e) => {
      var _a;
      const file = (_a = e.target.files) == null ? void 0 : _a[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );
  const hasData = dataset && schema && dataset.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 md:p-8 max-w-4xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "data-ocid": "upload.section", className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-xl text-foreground", children: "Upload Dataset" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Drop a CSV or JSON file to start exploring your data with AI." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: inputRef,
          type: "file",
          accept: ".csv,.json",
          className: "hidden",
          onChange: onFileChange,
          "data-ocid": "upload.file_input",
          "aria-label": "Upload CSV or JSON file"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": "upload.dropzone",
          disabled: uploadStatus === "parsing" || uploadStatus === "syncing",
          onClick: () => {
            var _a;
            return (_a = inputRef.current) == null ? void 0 : _a.click();
          },
          onDragOver: (e) => {
            e.preventDefault();
            setIsDragging(true);
          },
          onDragLeave: () => setIsDragging(false),
          onDrop,
          className: `w-full rounded-2xl border-2 border-dashed px-8 py-14 flex flex-col items-center justify-center gap-4 transition-smooth cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isDragging ? "border-primary bg-primary/10 scale-[1.01]" : uploadStatus === "done" ? "border-primary/60 bg-primary/5" : "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5"} disabled:cursor-not-allowed disabled:opacity-60`,
          "aria-label": "Drop CSV or JSON file here, or click to browse",
          children: uploadStatus === "parsing" || uploadStatus === "syncing" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-10 h-10 text-primary animate-spin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: uploadStatus === "parsing" ? "Parsing file…" : "Syncing with backend…" }),
              fileName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-mono mt-1 truncate max-w-xs", children: fileName })
            ] })
          ] }) : uploadStatus === "done" && hasData ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-6 h-6 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "Dataset loaded" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground font-mono mt-1 flex items-center gap-2 justify-center", children: [
                (fileName == null ? void 0 : fileName.endsWith(".json")) ? /* @__PURE__ */ jsxRuntimeExports.jsx(FileJson, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4" }),
                fileName
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Click to replace with a new file" })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-7 h-7 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-foreground text-lg", children: [
                "Drop files here or",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary underline decoration-dotted", children: "browse" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Supports CSV and JSON" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: "outline",
                  className: "font-mono text-xs border-primary/30 text-primary",
                  children: ".csv"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: "outline",
                  className: "font-mono text-xs border-accent/30 text-accent",
                  children: ".json"
                }
              )
            ] })
          ] })
        }
      )
    ] }),
    hasData && schema && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "section",
      {
        "data-ocid": "upload.summary_section",
        className: "flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-card border border-border shadow-card",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-label text-xs", children: "Rows" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display font-bold text-2xl text-foreground tabular-nums", children: dataset.length.toLocaleString() })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px bg-border" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-label text-xs", children: "Columns" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display font-bold text-2xl text-foreground tabular-nums", children: schema.length })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px bg-border" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-label text-xs", children: "Types" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 flex-wrap", children: ["number", "date", "text"].map((t) => {
                const count = schema.filter((c) => c.type === t).length;
                if (count === 0) return null;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TypeBadge, { type: t }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: count })
                ] }, t);
              }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              "data-ocid": "upload.explore_button",
              onClick: () => navigate({ to: "/explore" }),
              size: "lg",
              className: "gap-2 shrink-0",
              children: [
                "Start Exploring",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4" })
              ]
            }
          )
        ]
      }
    ),
    hasData && schema && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "data-ocid": "upload.preview_section", className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Table2, { className: "w-4 h-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-foreground text-sm", children: [
          "Preview",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground font-normal", children: [
            "(first ",
            Math.min(100, dataset.length),
            " rows)"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PreviewTable, { rows: dataset, schema })
    ] }),
    uploadStatus === "syncing" && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full rounded-xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 w-full rounded-xl" })
    ] }),
    uploadStatus === "idle" && !hasData && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "section",
      {
        "data-ocid": "upload.empty_state",
        className: "rounded-2xl border border-dashed border-border bg-muted/20 px-8 py-10 space-y-5",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-muted-foreground shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground mb-1", children: "No dataset loaded yet" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Upload a CSV or JSON file above to begin. Here are example questions you can ask once your data is loaded:" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 pl-8", children: EXAMPLE_QUESTIONS.map((q, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "li",
            {
              className: "flex items-start gap-2 text-sm text-muted-foreground",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0", children: i + 1 }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "italic", children: [
                  '"',
                  q,
                  '"'
                ] })
              ]
            },
            q
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pl-8 pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": "upload.browse_button",
              onClick: () => {
                var _a;
                return (_a = inputRef.current) == null ? void 0 : _a.click();
              },
              className: "text-sm font-semibold text-primary hover:text-primary/80 underline decoration-dotted transition-colors duration-150",
              children: "Browse for a file to get started →"
            }
          ) })
        ]
      }
    )
  ] }) });
}
export {
  DataUploadPage as default
};
