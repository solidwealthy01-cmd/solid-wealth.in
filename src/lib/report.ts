import { CALCS, fmtField, inr, type Explanation, type Result, type Row, type Vals } from "@/lib/calculators";

// Everything the 2-page PDF report shows, already worked out and formatted.
export interface Report {
    title: string;
    filename: string;
    inputs: [string, string][];
    /** label, value, highlighted */
    results: [string, string, boolean?][];
    total: [string, string];
    split: { a: [string, number]; b: [string, number] };
    rows?: Row[];
    cols: string[];
    schedule: { cols: string[]; rows: string[][] } | null;
    algo: Explanation;
}

// The years the schedule lists: year 1, then a round step (1, 2, 5 or 10 years), then the last.
// At most 9 rows, so page 2 fits above the template's footer.
function milestones(total: number) {
    const step = [1, 2, 5, 10].find((s) => total / s <= 8) ?? 10, out = [1];
    for (let y = step; y < total; y += step) if (y > 1) out.push(y);
    out.push(total);
    return out.filter((y, k) => out.indexOf(y) === k);
}

export function buildReport(id: string, v: Vals, r: Result, x: Explanation): Report {
    const c = CALCS[id];
    const all: Report["results"] = [
        [r.label, r.bigText || inr(r.big!), true],
        ...(r.extra || []).map(([l, n]): [string, string] => [l, inr(n)]),
        [r.a[0], inr(r.a[1])],
        [r.b[0], inr(r.b[1])],
    ];
    const results = all.filter((row, k) => !k || row[0] !== r.label);   // SWP's headline is already "Balance left"
    return {
        title: c.title,
        filename: "solid_wealth_" + id.replace(/-/g, "_") + "_report.pdf",
        inputs: c.fields.map((f) => [f[1], fmtField(f, v[f[0]])]),
        results,
        total: [r.label, r.bigText || inr(r.big!)],
        split: { a: r.a, b: r.b },
        rows: r.rows,
        cols: r.cols || ["Year", "Invested", "Value"],
        schedule: r.rows ? { cols: c.sched.cols, rows: milestones(r.rows.length).map((y) => ["Year " + y, ...c.sched.row(r.rows![y - 1], v, r)]) } : null,
        algo: x,
    };
}
