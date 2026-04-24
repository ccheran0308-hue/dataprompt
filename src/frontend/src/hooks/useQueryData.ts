import { createActor } from "@/backend";
import { useDataStore } from "@/store/useDataStore";
import type {
  ColumnDefinition,
  DataRow,
  QueryRecord,
  QueryResult,
} from "@/types/data";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery } from "@tanstack/react-query";

// Fetch query history from backend
export function useGetQueryHistory() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<QueryRecord[]>({
    queryKey: ["queryHistory"],
    queryFn: async () => {
      if (!actor) return [];
      const records = await (
        actor as unknown as { getQueryHistory: () => Promise<QueryRecord[]> }
      ).getQueryHistory();
      return records.map((r: QueryRecord) => ({
        id: r.id,
        question: r.question,
        result: r.result,
        timestamp:
          typeof r.timestamp === "bigint" ? Number(r.timestamp) : r.timestamp,
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

// Submit a natural language query
export function useQueryData() {
  const { actor } = useActor(createActor);
  const addQueryRecord = useDataStore((s) => s.addQueryRecord);

  return useMutation<QueryResult, Error, string>({
    mutationFn: async (question: string) => {
      if (!actor) throw new Error("Actor not ready");
      return (
        actor as unknown as { queryData: (q: string) => Promise<QueryResult> }
      ).queryData(question);
    },
    onSuccess: (result, question) => {
      const record: QueryRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        question,
        result,
        timestamp: Date.now(),
      };
      addQueryRecord(record);
    },
  });
}

// Upload dataset schema to backend
export function useSetDatasetSchema() {
  const { actor } = useActor(createActor);
  return useMutation<void, Error, ColumnDefinition[]>({
    mutationFn: async (schema: ColumnDefinition[]) => {
      if (!actor) throw new Error("Actor not ready");
      await (
        actor as unknown as {
          setDatasetSchema: (s: ColumnDefinition[]) => Promise<void>;
        }
      ).setDatasetSchema(schema);
    },
  });
}

// Upload dataset rows (as JSON text) to backend
export function useSetDataRows() {
  const { actor } = useActor(createActor);
  return useMutation<void, Error, DataRow[]>({
    mutationFn: async (rows: DataRow[]) => {
      if (!actor) throw new Error("Actor not ready");
      await (
        actor as unknown as { setDataRows: (s: string) => Promise<void> }
      ).setDataRows(JSON.stringify(rows));
    },
  });
}

// Clear the session on backend
export function useClearSession() {
  const { actor } = useActor(createActor);
  const clearLocal = useDataStore((s) => s.clearSession);
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      await (
        actor as unknown as { clearSession: () => Promise<void> }
      ).clearSession();
    },
    onSuccess: () => {
      clearLocal();
    },
  });
}
