import type { QueryPlan } from '../types/domain.js';

export class UnsupportedQuestionError extends Error {}

export function createQueryPlan(question: string): QueryPlan {
  const q = question.toLowerCase().replace(/\s+/g, ' ').trim();

  if (q.includes('monthly') && q.includes('onboarding') && q.includes('segment')) {
    return { dataset: 'onboarding', metric: 'applications', dimension: 'month', secondaryDimension: 'segment', visualization: 'line' };
  }
  if ((q.includes('highest') || q.includes('top')) && q.includes('rejection') && q.includes('branch')) {
    return { dataset: 'onboarding', metric: 'rejection_rate', dimension: 'branch', limit: 5, visualization: 'bar' };
  }
  if (q.includes('retail') && q.includes('sme') && (q.includes('onboarding') || q.includes('volume'))) {
    return { dataset: 'onboarding', metric: 'applications', dimension: 'segment', visualization: 'bar', filters: { segment: undefined } };
  }
  if ((q.includes('top five') || q.includes('top 5')) && q.includes('customer') && (q.includes('transaction') || q.includes('value'))) {
    return { dataset: 'transactions', metric: 'transaction_value', dimension: 'customer', limit: 5, visualization: 'bar' };
  }

  throw new UnsupportedQuestionError('I could not map that question to a supported banking analysis. Try one of the example questions.');
}
