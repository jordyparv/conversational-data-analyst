# Conversational Data Analyst

A full-stack TypeScript application for asking banking/business questions in natural language and receiving safe, database-derived answers.

## Architecture

- **React + TypeScript + Vite**: chat UI, result cards, tables and Recharts visualisations.
- **Node.js + Express + TypeScript**: API, validation, query planning, safe query execution and error handling.
- **SQLite**: sample banking data with customer/branch data, onboarding applications and transactions.
- **Mock LLM**: converts supported natural-language questions into a typed `QueryPlan`. The backend never executes model-generated SQL.
- **Safe SQL layer**: only allowlisted datasets, dimensions, metrics, filters and query templates can produce SQL.

## Data model

Two logical datasets are included:

1. **Onboarding**: customers, branches, onboarding applications.
2. **Transactions**: customers, branches, transactions.

## Supported examples

- Show monthly onboarding applications by customer segment.
- Which branches have the highest rejection rate?
- Compare retail and SME onboarding volumes.
- Show the top five customers by transaction value.

The mock planner also handles close variants of these questions.

## Setup

```bash
npm install
npm --prefix apps/server install
npm --prefix apps/web install
npm run dev
```

Open http://localhost:5173.

The server seeds the SQLite database automatically on startup.

## Environment

Copy `.env.example` to `.env` if you need custom settings.

## API

`POST /api/chat`

Request:
```json
{ "question": "Show monthly onboarding applications by customer segment." }
```

Response:
```json
{
  "success": true,
  "data": {
    "question": "...",
    "answer": "...",
    "plan": { "dataset": "onboarding", "visualization": "line" },
    "columns": ["month", "segment", "applications"],
    "rows": []
  }
}
```

## Security decisions

The model does not generate executable SQL. It selects from a constrained query plan. The query builder maps the plan to fixed SQL templates and parameterised values. The server validates the input with Zod and rejects unsupported intents before touching the database.

For production, replace the mock planner with a real LLM structured-output call, validate the returned JSON against the same schema, enforce tenant/user authorisation, add query cost/time limits, audit requests, rate-limit the endpoint, use a managed database, and add observability.

## Automated test

`apps/server/src/query/queryBuilder.test.ts` tests the generated parameterised SQL and parameters for a representative query.

## Known limitations

- Mock AI supports a finite set of intents rather than arbitrary business questions.
- The demo uses SQLite and a small synthetic dataset.
- Authentication and multi-tenant authorisation are intentionally omitted from the take-home demo.
