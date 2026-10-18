"use client";
import { useEffect, useState, type ReactNode } from "react";
import { GrowthChart, Legend } from "@/components/calculators/charts";
import { CALCS, UNIT, axis, clamp, fromSlider, inr, short, toSlider, type Field, type Vals } from "@/lib/calculators";
import { buildReport, type Report } from "@/lib/report";
import { SITE_URL } from "@/lib/site";

const still = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function FieldInput({ id, f, value, onChange }: { id: string; f: Field; value: number; onChange: (v: number) => void }) {
    // while someone types, the box shows what they typed; on blur it goes back to the clamped value
    const [draft, setDraft] = useState<string | null>(null);
    const money = f[2] === "money", u = UNIT[f[2]], sv = toSlider(f, value);
    const min = money ? 0 : f[3], max = money ? 1000 : f[4];
    return (
        <div className="field">
            <div className="field-top">
                <label htmlFor={`${id}-${f[0]}`}>{f[1]}</label>
                <div className="num">
                    <span>{u[0]}</span>
                    <input id={`${id}-${f[0]}`} type="number" inputMode="decimal" step="any" value={draft ?? value}
                        onChange={(e) => { setDraft(e.target.value); const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(clamp(f, v)); }}
                        onBlur={() => setDraft(null)} />
                    <span>{u[1]}</span>
                </div>
            </div>
            <input type="range" aria-label={f[1]} min={min} max={max} step={money ? 1 : (f[6] || (f[2] === "pct" ? 0.5 : 1))} value={sv}
                style={{ "--p": ((sv - min) / (max - min)) * 100 + "%" } as React.CSSProperties}
                onChange={(e) => { setDraft(null); onChange(fromSlider(f, +e.target.value)); }} />
            {money && <div className="hint">{value >= 100000 ? short(value) : ""}</div>}
        </div>
    );
}

/** The big number counts to each new value; `replay` counts it up from zero again. */
function BigNumber({ value, text, replay }: { value: number | null; text?: string | null; replay: number }) {
    // tween: the count in progress; anim: the number it has reached (null until its first frame)
    const [tween, setTween] = useState<{ from: number; to: number; ms: number } | null>(null);
    const [anim, setAnim] = useState<number | null>(null);
    const [prev, setPrev] = useState(value), [prevReplay, setPrevReplay] = useState(replay);
    // start a count while rendering the new value, so the final number never flashes up first
    if (value !== prev) {
        const from = anim ?? (tween ? tween.from : prev);
        setPrev(value);
        setAnim(null);
        setTween(from != null && value != null && from !== value && !still() ? { from, to: value, ms: 320 } : null);
    }
    if (replay !== prevReplay) {
        setPrevReplay(replay);
        if (replay && value != null && !still()) { setAnim(null); setTween({ from: 0, to: value, ms: 900 }); }
    }
    useEffect(() => {
        if (!tween) return;
        const t0 = performance.now();
        let raf = requestAnimationFrame(function step(now) {
            const k = Math.min((now - t0) / tween.ms, 1), e = 1 - Math.pow(1 - k, 3);
            if (k < 1) { setAnim(tween.from + (tween.to - tween.from) * e); raf = requestAnimationFrame(step); } else { setAnim(null); setTween(null); }
        });
        return () => cancelAnimationFrame(raf);
    }, [tween]);
    return <div className="res-big">{text || inr(anim ?? (tween ? tween.from : value!))}</div>;
}

const DL = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>;

export function CalculatorCard({ id, initial, on, how, replay, busy, onPlan, onPdf, onPreview }: {
    id: string;
    initial: Vals;
    on: boolean;
    how: ReactNode;
    replay: number;
    busy: boolean;
    onPlan: (topic: string) => void;
    onPdf: (rep: Report) => void;
    onPreview: (rep: Report) => void;
}) {
    const c = CALCS[id];
    const [vals, setVals] = useState(initial);
    const r = c.run(vals), x = c.explain(vals, r);
    const a = Math.max(r.a[1], 0), b = Math.max(r.b[1], 0), tot = a + b || 1;
    const cols = r.cols || ["Year", "Invested", "Value"];
    const link = `${SITE_URL}/?c=${id}&` + c.fields.map((f) => f[0] + "=" + vals[f[0]]).join("&");
    const report = () => buildReport(id, vals, r, x);

    return (
        <section className={on ? "calc on" : "calc"} id={id}>
            <div className="ccard">
                <div className="inputs">
                    <h2>{c.title}</h2>
                    <p className="lede">{c.lede}</p>
                    <div className="fields">
                        {c.fields.map((f) => <FieldInput key={f[0]} id={id} f={f} value={vals[f[0]]} onChange={(v) => setVals((o) => ({ ...o, [f[0]]: v }))} />)}
                    </div>
                </div>
                <div className="results">
                    <div className="res-label">{r.label}</div>
                    <BigNumber value={r.big} text={r.bigText} replay={replay} />
                    <div className="res-sub">{r.sub}</div>
                    <div className="csplit"><i style={{ width: (a / tot) * 100 + "%" }} /><i style={{ width: (b / tot) * 100 + "%" }} /></div>
                    <div className="rows">
                        {(r.extra || []).map(([l, n]) => <div className="row" key={l}><span>{l}</span><b>{inr(n)}</b></div>)}
                        <div className="row"><span><i style={{ background: "#F5CB7A" }} />{r.a[0]}</span><b>{inr(r.a[1])}</b></div>
                        <div className="row"><span><i style={{ background: "var(--ac)" }} />{r.b[0]}</span><b>{inr(r.b[1])}</b></div>
                    </div>
                    {r.rows && (
                        <details className="years">
                            <summary>See year by year</summary>
                            <GrowthChart rows={r.rows} fmt={axis} w={480} h={190} />
                            <Legend cols={cols} />
                            <table>
                                <thead><tr>{cols.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                                <tbody>{r.rows.map((row) => <tr key={row[0]}><td>{row[0]}</td><td>{inr(row[1])}</td><td>{inr(row[2])}</td></tr>)}</tbody>
                            </table>
                        </details>
                    )}
                    <div className="actions">
                        <a className="btn" href="#contact" onClick={() => onPlan(c.topic)}>Plan this with us</a>
                        <button className="btn-o" type="button" disabled={busy} onClick={() => onPdf(report())}>{DL}{busy ? "Creating PDF…" : "Download PDF"}</button>
                        <a className="btn-o" target="_blank" rel="noopener" href={"https://wa.me/?text=" + encodeURIComponent(r.share + "\nWork it out yourself: " + link)}>Share</a>
                    </div>
                    <p className="rep-note">A 2-page report with the method and schedule. <button className="tlink" type="button" onClick={() => onPreview(report())}>Preview it</button></p>
                </div>
            </div>
            <details className="how">
                <summary>How it is worked out</summary>
                {how}
                <div className="deep">
                    <h4>With your numbers</h4>
                    <code>{x.formula}</code>
                    <ol style={{ marginTop: 12 }}>{x.steps.map((t) => <li key={t}>{t}</li>)}</ol>
                    <h4>Key numbers</h4>
                    <div className="kpis">{x.kpis.map((k) => <div key={k[0]} className={k[3] ? "hl" : undefined}><small>{k[0]}</small><b>{k[1]}</b><span>{k[2]}</span></div>)}</div>
                    <h4>Things to know</h4>
                    <ul>{x.tips.map((t) => <li key={t}>{t}</li>)}</ul>
                </div>
            </details>
        </section>
    );
}
