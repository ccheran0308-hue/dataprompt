import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface QueryRecord {
    id: bigint;
    result: QueryResult;
    question: string;
    timestamp: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface QueryResult {
    chartData?: ChartData;
    chartType: ChartType;
    answer: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface ColumnDefinition {
    name: string;
    colType: ColumnType;
}
export interface DatasetSchema {
    columns: Array<ColumnDefinition>;
}
export interface ChartData {
    labels: Array<string>;
    values: Array<number>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum ChartType {
    bar = "bar",
    pie = "pie",
    none = "none"
}
export enum ColumnType {
    date = "date",
    text = "text",
    number_ = "number"
}
export interface backendInterface {
    clearSession(): Promise<void>;
    getDatasetSchema(): Promise<DatasetSchema | null>;
    getQueryHistory(): Promise<Array<QueryRecord>>;
    queryData(question: string): Promise<QueryResult>;
    setDataRows(rows: string): Promise<void>;
    setDatasetSchema(columns: Array<ColumnDefinition>): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
