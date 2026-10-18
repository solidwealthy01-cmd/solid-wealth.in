/* eslint-disable @next/next/no-img-element -- html-to-image has to fetch the template itself; an optimised, lazy next/image may not be loaded when the page is captured */
import { Donut, GrowthChart, Legend } from "@/components/calculators/charts";
import { axis, inr } from "@/lib/calculators";
import type { Report } from "@/lib/report";

// The two A4 pages of a calculator report, laid out at 794 x 1123 px on the Solid Wealth
// printable template (solid-wealth public/Printable.svg).

function Kv({ row }: { row: [string, string, boolean?] }) {
    return <div className={row[2] ? "rp-kv hl" : "rp-kv"}><span>{row[0]}</span><b>{row[1]}</b></div>;
}

function Head({ kick, title, n, date }: { kick: string; title: string; n: number; date: string }) {
    return (
        <div className="rp-head">
            <div><small>{kick}</small><h1>{title}</h1></div>
            <span>Prepared on {date}<br />Page {n} of 2</span>
        </div>
    );
}

export function ReportPages({ rep }: { rep: Report }) {
    const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const x = rep.algo, sp = rep.split, a = Math.max(sp.a[1], 0), b = Math.max(sp.b[1], 0), tot = a + b || 1;
    const share = b >= a ? { label: sp.b[0], p: b / tot } : { label: sp.a[0], p: a / tot };
    return (
        <>
            <div className="rp-fit">
                <div className="rp-page">
                    <img src="/report-template.svg" alt="" />
                    <div className="rp-in">
                        <Head kick="Solid Wealth financial report" title={rep.title} n={1} date={date} />
                        <div className="rp-formula"><span><b>Method</b>&nbsp; {x.name}</span><code>{x.formula}</code></div>
                        <div className="rp-cols">
                            <div><div className="rp-h">Your inputs</div>{rep.inputs.map((r) => <Kv key={r[0]} row={r} />)}</div>
                            <div><div className="rp-h">Results</div>{rep.results.map((r) => <Kv key={r[0]} row={r} />)}</div>
                        </div>
                        <div className="rp-total">
                            <div className="rp-box">
                                <div className="rp-h">{rep.total[0]}</div>
                                <div className="big">{rep.total[1]}</div>
                                <Kv row={[sp.a[0], `${inr(sp.a[1])}  (${Math.round((a / tot) * 100)}%)`]} />
                                <Kv row={[sp.b[0], `${inr(sp.b[1])}  (${Math.round((b / tot) * 100)}%)`]} />
                            </div>
                            <div className="rp-donut">
                                <div style={{ position: "relative", width: 132, height: 132 }}>
                                    <Donut a={a} b={b} />
                                    <div style={{ position: "absolute", inset: 0, display: "grid", placeContent: "center" }}>
                                        <b>{Math.round(share.p * 100)}%</b><small>{share.label}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {rep.rows && (
                            <div className="rp-chart"><div className="rp-h">Year by year</div><GrowthChart rows={rep.rows} fmt={axis} w={640} h={200} /><Legend cols={rep.cols} /></div>
                        )}
                        <div className="rp-foot">Generated with the Solid Wealth calculators at solid-wealth.in. The method, your numbers step by step and the schedule are on page 2.</div>
                    </div>
                </div>
            </div>
            <div className="rp-fit">
                <div className="rp-page">
                    <img src="/report-template.svg" alt="" />
                    <div className="rp-in">
                        <Head kick={rep.title} title="How it is worked out" n={2} date={date} />
                        <div className="rp-card">
                            <div className="rp-h">{x.name}</div>
                            <p>{x.def}</p>
                            <p className="rp-assume">Assumes {x.assume.join("; ")}.</p>
                            <div className="rp-tags">{x.vars.map((v) => <div key={v[0]}><b>{v[0]} = {v[2]}</b>{v[1]}</div>)}</div>
                        </div>
                        <div className="rp-card">
                            <div className="rp-h">Your numbers, step by step</div>
                            <ol className="rp-steps">{x.steps.map((t) => <li key={t}>{t}</li>)}</ol>
                        </div>
                        <div className="rp-kpis">
                            {x.kpis.map((k) => <div key={k[0]} className={k[3] ? "hl" : undefined}><small>{k[0]}</small><b>{k[1]}</b><span>{k[2]}</span></div>)}
                        </div>
                        {rep.schedule && (
                            <table className="rp-table">
                                <thead><tr>{rep.schedule.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                                <tbody>{rep.schedule.rows.map((r) => <tr key={r[0]}>{r.map((c, k) => <td key={k}>{c}</td>)}</tr>)}</tbody>
                            </table>
                        )}
                        <div className="rp-tips"><div className="rp-h">Things to know</div><ul>{x.tips.map((t) => <li key={t}>{t}</li>)}</ul></div>
                        <div className="rp-foot">For illustration only. Results depend on the return you enter and are not a promise of future returns.<br />Mutual Fund investments are subject to market risks, read all scheme related documents carefully.</div>
                    </div>
                </div>
            </div>
        </>
    );
}
