import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { askAnalyst } from "../lib/api";
import type { AnalystResult } from "../types/api";
import { Result } from "./Result";

const examples = [
  "Show monthly onboarding applications by customer segment.",
  "Which branches have the highest rejection rate?",
  "Compare retail and SME onboarding volumes.",
  "Show the top five customers by transaction value.",
];

export function Chat() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AnalystResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (q = question) => {
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    try {
      const r = await askAnalyst(q);
      if (r.success) setResult(r.data);
      else setError(r.error);
    } catch {
      setError(
        "Unable to reach the analyst API. Check that the server is running.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="app-shell">
      <header>
        <div className="logo">
          <Sparkles size={20} /> Data Analyst
        </div>
        <span className="status">● Demo data</span>
      </header>
      <div className="content">
        <div className="hero">
          <p className="eyebrow">CONVERSATIONAL DATA ANALYST</p>
          <h1>
            Ask your banking data
            <br />a question.
          </h1>
          <p>Natural language in. Safe, database-backed analysis out.</p>
        </div>
        <div className="examples">
          <span>Try an example</span>
          {examples.map((e) => (
            <button
              key={e}
              onClick={() => {
                setQuestion(e);
                submit(e);
              }}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="composer">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask about onboarding, customers, branches or transactions..."
          />
          <button disabled={loading} onClick={() => submit()} aria-label="Send">
            <Send size={19} />
          </button>
        </div>
        {loading && (
          <div className="loading">
            Building a query plan and analysing the database…
          </div>
        )}
        {error && <div className="error">{error}</div>}
        {result && <Result result={result} />}
      </div>
    </main>
  );
}
