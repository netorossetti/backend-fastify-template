type summaryLabels = "count" | "sum" | "max" | "min" | "avg";
export type Summary = Record<string, Record<summaryLabels, number>>;
export type ListReturn<T> = {
  total: number;
  summary?: Summary;
  data: T[];
};
