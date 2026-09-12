import { Router } from 'express';
import { chatRequestSchema } from '../validators/chat.js';
import { createQueryPlan, UnsupportedQuestionError } from '../ai/mockPlanner.js';
import { buildQuery } from '../query/queryBuilder.js';
import { db } from '../db/database.js';

export const chatRouter = Router();

chatRouter.post('/', (req, res) => {
  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: 'Question must be 3-500 characters.' });

  try {
    const plan = createQueryPlan(parsed.data.question);
    const built = buildQuery(plan);
    const rows = db.prepare(built.sql).all(...built.params) as Record<string, unknown>[];
    const answer = makeAnswer(plan, rows);
    return res.json({ success: true, data: { question: parsed.data.question, answer, plan, columns: rows[0] ? Object.keys(rows[0]) : [], rows } });
  } catch (error) {
    if (error instanceof UnsupportedQuestionError) return res.status(422).json({ success: false, error: error.message });
    console.error(error);
    return res.status(500).json({ success: false, error: 'The analysis could not be completed. Please try again.' });
  }
});

function makeAnswer(plan: ReturnType<typeof createQueryPlan>, rows: Record<string, unknown>[]) {
  if (!rows.length) return 'No matching data was found.';
  if (plan.metric === 'rejection_rate') return `The highest rejection rate is ${rows[0].rejection_rate}% at ${rows[0].branch}.`;
  if (plan.metric === 'transaction_value') return `The top customer by transaction value is ${rows[0].customer}, with ${Number(rows[0].transaction_value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}.`;
  if (plan.secondaryDimension === 'segment') return `Onboarding applications are grouped monthly and split by customer segment.`;
  if (plan.dimension === 'segment') return `Retail and SME onboarding volumes are shown side by side.`;
  return 'Analysis completed successfully.';
}
