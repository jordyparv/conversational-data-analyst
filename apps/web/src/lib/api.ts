import type { ChatResponse } from '../types/api';
export async function askAnalyst(question: string): Promise<ChatResponse> {
  const response = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:4000'}/api/chat`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({question}) });
  return response.json();
}
