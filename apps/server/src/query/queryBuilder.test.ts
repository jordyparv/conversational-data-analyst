import { describe, expect, it } from 'vitest';
import { buildQuery } from './queryBuilder.js';

describe('buildQuery', () => {
  it('builds parameterised top-customer query without accepting raw SQL', () => {
    const result = buildQuery({ dataset: 'transactions', metric: 'transaction_value', dimension: 'customer', limit: 5, visualization: 'bar' });
    expect(result.sql).toContain('ORDER BY transaction_value DESC LIMIT ?');
    expect(result.params).toEqual([5]);
    expect(result.sql.toLowerCase()).not.toContain('drop table');
  });
});
