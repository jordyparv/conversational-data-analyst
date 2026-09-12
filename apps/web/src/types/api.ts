export type QueryPlan = { dataset: 'onboarding'|'transactions'; metric: string; dimension?: string; secondaryDimension?: string; visualization: 'table'|'kpi'|'bar'|'line'; limit?: number };
export type AnalystResult = { question: string; answer: string; plan: QueryPlan; columns: string[]; rows: Record<string, unknown>[] };
export type ChatResponse = { success: true; data: AnalystResult } | { success: false; error: string };
