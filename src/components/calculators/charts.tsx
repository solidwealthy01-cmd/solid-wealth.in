import type { Row } from "@/lib/calculators";

// Plain SVG, so the same charts render on the page and inside the captured PDF pages.
export const C_A = "#FFD3A8";
export const C_B = "#FF7A1A";

/** Grouped bars, one pair per year. */
export function GrowthChart({ rows, fmt, w = 640, h = 220 }: { rows: Row[]; fmt: (v: number) => string; w?: number; h?: number }) {
    const pl = 58, pr = 6, pt = 10, pb = 24, iw = w - pl - pr, ih = h - pt - pb;
    const max = Math.max(1, ...rows.map((r) => Math.max(r[1], r[2])));
    // four round gridline steps
    const q = max / 4, mag = Math.pow(10, Math.floor(Math.log10(q))), top = 4 * mag * [1, 2, 2.5, 3, 4, 5, 10].find((n) => n * mag >= q)!;
    const slot = iw / rows.length, bw = Math.max(Math.min(slot * 0.36, 18), 1.5), rx = Math.min(2, bw / 3), every = Math.ceil(rows.length / 12);
    return (
        <svg className="gchart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Year by year chart">
            {[0, 1, 2, 3, 4].map((g) => {
                const y = pt + ih - (ih * g) / 4;
                return (
                    <g key={g}>
                        <line x1={pl} x2={w - pr} y1={y} y2={y} stroke="#EFE7D8" strokeWidth="1" />
                        <text x={pl - 8} y={y + 3.5} textAnchor="end" fontSize="10" fontWeight="600" fill="#9CA3AF">{fmt((top * g) / 4)}</text>
                    </g>
                );
            })}
            {rows.map((r, k) => {
                const x = pl + slot * k + slot / 2, ha = (ih * r[1]) / top, hb = (ih * r[2]) / top;
                return (
                    <g key={k}>
                        <rect x={x - bw - 0.5} y={pt + ih - ha} width={bw} height={ha} rx={rx} fill={C_A} />
                        <rect x={x + 0.5} y={pt + ih - hb} width={bw} height={hb} rx={rx} fill={C_B} />
                        {(k % every === 0 || k === rows.length - 1) && <text x={x} y={h - 6} textAnchor="middle" fontSize="10" fontWeight="600" fill="#9CA3AF">{r[0]}</text>}
                    </g>
                );
            })}
        </svg>
    );
}

export function Legend({ cols }: { cols: string[] }) {
    return (
        <div className="legend">
            <span><i style={{ background: C_A }} />{cols[1]}</span>
            <span><i style={{ background: C_B }} />{cols[2]}</span>
        </div>
    );
}

export function Donut({ a, b }: { a: number; b: number }) {
    const t = a + b || 1, pa = (a / t) * 100, pb = (b / t) * 100, r = 15.91549430918954;   // circumference 100, so dash lengths are percentages
    return (
        <svg viewBox="0 0 42 42" width="132" height="132" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="21" cy="21" r={r} fill="none" stroke={C_A} strokeWidth="6" strokeDasharray={`${pa} ${100 - pa}`} />
            <circle cx="21" cy="21" r={r} fill="none" stroke={C_B} strokeWidth="6" strokeDasharray={`${pb} ${100 - pb}`} strokeDashoffset={-pa} />
        </svg>
    );
}
