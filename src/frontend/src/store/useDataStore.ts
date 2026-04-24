import type { ColumnDefinition, DataRow, QueryRecord } from "@/types/data";
import { create } from "zustand";

interface DataStoreState {
  dataset: DataRow[] | null;
  schema: ColumnDefinition[] | null;
  queryHistory: QueryRecord[];
  setDataset: (rows: DataRow[]) => void;
  setSchema: (schema: ColumnDefinition[]) => void;
  addQueryRecord: (record: QueryRecord) => void;
  clearSession: () => void;
}

export const useDataStore = create<DataStoreState>((set) => ({
  dataset: null,
  schema: null,
  queryHistory: [],

  setDataset: (rows) => set({ dataset: rows }),
  setSchema: (schema) => set({ schema }),

  addQueryRecord: (record) =>
    set((state) => ({
      queryHistory: [record, ...state.queryHistory],
    })),

  clearSession: () => set({ dataset: null, schema: null, queryHistory: [] }),
}));
