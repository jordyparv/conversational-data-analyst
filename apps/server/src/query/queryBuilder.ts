import type { QueryPlan } from '../types/domain.js';

export type BuiltQuery = { sql: string; params: unknown[] };

export function buildQuery(plan: QueryPlan): BuiltQuery {
  switch (plan.metric) {
    case 'applications':
      if (plan.dimension === 'month' && plan.secondaryDimension === 'segment') {
        return { sql: `SELECT substr(oa.applied_at,1,7) AS month, c.segment, COUNT(*) AS applications FROM onboarding_applications oa JOIN customers c ON c.id=oa.customer_id GROUP BY month,c.segment ORDER BY month,c.segment`, params: [] };
      }
      if (plan.dimension === 'segment') {
        return { sql: `SELECT c.segment, COUNT(*) AS applications FROM onboarding_applications oa JOIN customers c ON c.id=oa.customer_id GROUP BY c.segment ORDER BY applications DESC`, params: [] };
      }
      break;
    case 'rejection_rate':
      if (plan.dimension === 'branch') {
        return { sql: `SELECT b.name AS branch, ROUND(100.0 * SUM(CASE WHEN oa.status='rejected' THEN 1 ELSE 0 END) / COUNT(*), 2) AS rejection_rate, COUNT(*) AS applications FROM onboarding_applications oa JOIN branches b ON b.id=oa.branch_id GROUP BY b.id ORDER BY rejection_rate DESC LIMIT ?`, params: [plan.limit ?? 5] };
      }
      break;
    case 'transaction_value':
      if (plan.dimension === 'customer') {
        return { sql: `SELECT c.name AS customer, ROUND(SUM(t.amount), 2) AS transaction_value FROM transactions t JOIN customers c ON c.id=t.customer_id GROUP BY c.id ORDER BY transaction_value DESC LIMIT ?`, params: [plan.limit ?? 5] };
      }
      break;
  }
  throw new Error('Unsupported or unsafe query plan');
}
