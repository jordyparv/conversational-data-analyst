import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import type { AnalystResult } from '../types/api';

export function Result({ result }: { result: AnalystResult }) {
  const ref = useRef<HTMLDivElement>(null);
  const copy = async (value: string) => navigator.clipboard.writeText(value);
  const copyChart = async () => { if (ref.current) { const dataUrl = await toPng(ref.current); const blob = await (await fetch(dataUrl)).blob(); await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]); } };
  const { rows, plan } = result;
  const keys = result.columns;
  const xKey = keys[0];
  const numericKey = keys.find(k => typeof rows[0]?.[k] === 'number');
  const hasSegmentSeries = plan.secondaryDimension === 'segment' && keys.includes('segment');
  const chartRows = hasSegmentSeries ? Object.values(rows.reduce<Record<string, Record<string, unknown>>>((acc, row) => {
    const month = String(row.month);
    acc[month] ??= { month };
    acc[month][String(row.segment)] = row.applications;
    return acc;
  }, {})) : rows;

  return <section className="result-card">
    <div className="result-head"><span>{plan.dataset} · {plan.visualization}</span><div className="actions"><button onClick={() => copy(result.answer)}>Copy answer</button><button onClick={() => copy(JSON.stringify(rows, null, 2))}>Copy data</button>{(plan.visualization==='bar'||plan.visualization==='line') && <button onClick={copyChart}>Copy chart</button>}</div></div>
    <p className="answer">{result.answer}</p>
    {(plan.visualization==='bar' || plan.visualization==='line') && numericKey && <div ref={ref} className="chart"><ResponsiveContainer width="100%" height={320}>{plan.visualization==='bar' ? <BarChart data={chartRows}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey={xKey}/><YAxis/><Tooltip/><Legend/>{hasSegmentSeries ? <><Bar dataKey="Retail"/><Bar dataKey="SME"/></> : <Bar dataKey={numericKey}/>}</BarChart> : <LineChart data={chartRows}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey={xKey}/><YAxis/><Tooltip/><Legend/>{hasSegmentSeries ? <><Line type="monotone" dataKey="Retail"/><Line type="monotone" dataKey="SME"/></> : <Line type="monotone" dataKey={numericKey}/>}</LineChart>}</ResponsiveContainer></div>}
    <div className="table-wrap"><table><thead><tr>{keys.map(k=><th key={k}>{k.replaceAll('_',' ')}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{keys.map(k=><td key={k}>{String(row[k])}</td>)}</tr>)}</tbody></table></div>
  </section>;
}
