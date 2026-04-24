export type DataRow = Record<string, string | number>;

export interface ColumnDefinition {
  name: string;
  type: "text" | "number" | "date";
}

export interface ChartData {
  labels: string[];
  values: number[];
}

export interface QueryResult {
  answer: string;
  chartType: "bar" | "pie" | "none";
  chartData?: ChartData;
}

export interface QueryRecord {
  id: string;
  question: string;
  result: QueryResult;
  timestamp: number;
}
