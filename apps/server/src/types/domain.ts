export const datasets = ['onboarding', 'transactions'] as const;
export const visualizations = ['table', 'kpi', 'bar', 'line'] as const;

export type Dataset = typeof datasets[number];
export type Visualization = typeof visualizations[number];

export type QueryPlan = {
  dataset: Dataset;
  metric: 'applications' | 'rejection_rate' | 'transaction_value' | 'transaction_count';
  dimension?: 'month' | 'segment' | 'branch' | 'customer';
  secondaryDimension?: 'segment';
  limit?: number;
  visualization: Visualization;
  filters?: { status?: 'approved' | 'rejected' | 'pending'; segment?: 'Retail' | 'SME' };
};

export type AnalystResult = {
  question: string;
  answer: string;
  plan: QueryPlan;
  columns: string[];
  rows: Record<string, unknown>[];
};
