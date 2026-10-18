// The six calculators: their fields, the result panel, and how each result is worked out
// (shown under "How it is worked out" and on page 2 of the PDF report).

// ---------- formatting
export function inr(v: number) { return "₹" + Math.round(v).toLocaleString("en-IN"); }
export function short(v: number) {
    v = Math.round(v);
    if (v >= 1e7) return "₹" + (v / 1e7).toFixed(v >= 1e9 ? 0 : 2).replace(/\.?0+$/, "") + " Cr";
    if (v >= 1e5) return "₹" + (v / 1e5).toFixed(2).replace(/\.?0+$/, "") + " L";
    return inr(v);
}
/** Chart axis labels: as short as possible. */
export function axis(v: number) {
    if (!v) return "0";
    if (v >= 1e7) return "₹" + +(v / 1e7).toFixed(1) + "Cr";
    if (v >= 1e5) return "₹" + +(v / 1e5).toFixed(1) + "L";
    if (v >= 1e3) return "₹" + +(v / 1e3).toFixed(1) + "K";
    return "₹" + Math.round(v);
}
export function yrs(m: number) { const y = Math.floor(m / 12), r = m % 12; return (y ? y + (y === 1 ? " year" : " years") : "") + (y && r ? " " : "") + (r ? r + (r === 1 ? " month" : " months") : ""); }
function pct(v: number, d: number) { return v.toFixed(d) + "%"; }
function mrate(r: number) { return (r / 12).toFixed(4) + "%"; }
function grouped(v: number) { return v.toLocaleString("en-IN", { maximumFractionDigits: 2 }); }
function real(v: number, y: number) { return v / Math.pow(1.06, y); }   // in today's money, at 6% inflation

// ---------- maths, matching the Rabbit portal (monthly rate = annual / 12, SIP paid at the start of the month)
/** [year, first series, second series] */
export type Row = [number, number, number];
function sipFV(p: number, r: number, n: number) { const i = r / 1200; return i ? p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i) : p * n; }
function sipTable(amountFor: (m: number) => number, r: number, n: number) {   // month-by-month, so step-ups and year rows come out exact
    const i = r / 1200, rows: Row[] = [];
    let bal = 0, paid = 0;
    for (let m = 1; m <= n; m++) { const p = amountFor(m); paid += p; bal = (bal + p) * (1 + i); if (m % 12 === 0 || m === n) rows.push([Math.ceil(m / 12), paid, bal]); }
    return { paid, value: bal, rows };
}
function stepped(amt: number, step: number) { return (m: number) => amt * Math.pow(1 + step / 100, Math.floor((m - 1) / 12)); }

// ---------- types
export type Unit = "money" | "pct" | "yrs" | "mos";
/** key, label, unit, min, max, default, slider step */
export type Field = [string, string, Unit, number, number, number, number?];
export type Vals = Record<string, number>;
export interface Result {
    label: string;
    big: number | null;
    bigText?: string | null;
    sub: string;
    a: [string, number];
    b: [string, number];
    extra?: [string, number][];
    rows?: Row[];
    cols?: string[];
    share: string;
    // working values the explanation reuses
    flat?: number; ranOut?: number; fv?: number; lump?: number; now?: number; late?: number; d?: number;
}
/** label, value, note, highlighted */
export type Kpi = [string, string | number, string, boolean?];
export interface Explanation {
    name: string;
    def: string;
    assume: string[];
    formula: string;
    vars: [string, string, string | number][];
    steps: string[];
    kpis: Kpi[];
    tips: string[];
}
export interface Calc {
    title: string;
    lede: string;
    tab: string;
    /** The call back form opens on this topic from "Plan this with us". */
    topic: string;
    fields: Field[];
    run: (v: Vals) => Result;
    /** Columns of the PDF schedule after "Year", and how a year row fills them. */
    sched: { cols: string[]; row: (x: Row, v: Vals, r: Result) => string[] };
    explain: (v: Vals, r: Result) => Explanation;
}

export const CALCS: Record<string, Calc> = {
    "sip": {
        title: "SIP calculator", lede: "What a monthly SIP grows to.", tab: "SIP",
        topic: "Starting a SIP",
        fields: [["amt", "Monthly SIP", "money", 500, 1000000, 5000], ["yrs", "Time period", "yrs", 1, 40, 10], ["ret", "Expected return", "pct", 1, 30, 12]],
        run: (v) => {
            const t = sipTable(() => v.amt, v.ret, v.yrs * 12);
            return { label: "Maturity value", big: t.value, sub: "in " + v.yrs + " years", a: ["Invested", t.paid], b: ["Estimated returns", t.value - t.paid], rows: t.rows,
                share: "A SIP of " + inr(v.amt) + " a month for " + v.yrs + " years at " + v.ret + "% could grow to " + inr(t.value) + "." };
        },
        sched: { cols: ["Year", "Monthly SIP", "Invested", "Returns", "Value"], row: (x, v) => [inr(v.amt), inr(x[1]), inr(x[2] - x[1]), inr(x[2])] },
        explain: (v, r) => {
            const big = r.big!, i = v.ret / 1200, n = v.yrs * 12, fac = (Math.pow(1 + i, n) - 1) / i, up = sipTable(stepped(v.amt, 10), v.ret, n).value;
            return {
                name: "Start-of-month SIP compounding",
                def: "Each monthly instalment goes in at the start of the month and compounds at the monthly rate i (the annual return divided by 12) for as long as it stays invested. The maturity value is the sum of every instalment's growth.",
                assume: ["each instalment is invested on the first day of the month", "the return stays the same every year", "returns are reinvested; tax and exit load are not deducted"],
                formula: "FV = P × [((1 + i)^n − 1) ÷ i] × (1 + i)",
                vars: [["P", "Monthly SIP", inr(v.amt)], ["i", "Monthly rate", mrate(v.ret)], ["n", "Instalments", n]],
                steps: ["Monthly rate i = " + v.ret + "% ÷ 12 = " + mrate(v.ret) + " (" + i.toFixed(6) + ").",
                    "Instalments n = " + v.yrs + " years × 12 = " + n + ".",
                    "Growth factor ((1 + i)^n − 1) ÷ i = " + fac.toFixed(4) + ".",
                    "Maturity = " + inr(v.amt) + " × " + fac.toFixed(4) + " × " + (1 + i).toFixed(6) + " = " + inr(big) + ".",
                    "You invest " + inr(r.a[1]) + ", so the estimated returns are " + inr(r.b[1]) + "."],
                kpis: [["Wealth multiplier", (big / r.a[1]).toFixed(2) + "x", "Value ÷ amount invested", true], ["Total gain", "+" + pct(r.b[1] / r.a[1] * 100, 1), "Returns on what you invest"],
                    ["Returns share", pct(r.b[1] / big * 100, 0), "Of the maturity value"], ["In today’s money", short(real(big, v.yrs)), "At 6% inflation"]],
                tips: ["Returns make up " + pct(r.b[1] / big * 100, 0) + " of the maturity value. The longer you stay invested, the bigger that share gets.",
                    "Stepping this SIP up by 10% every year would take it to about " + short(up) + ", " + pct((up / big - 1) * 100, 0) + " more.",
                    "At 6% inflation, " + short(big) + " in " + v.yrs + " years buys about what " + short(real(big, v.yrs)) + " buys today."],
            };
        },
    },
    "step-up-sip": {
        title: "Step-up SIP calculator", lede: "A SIP that rises every year.", tab: "Step-up SIP",
        topic: "Starting a SIP",
        fields: [["amt", "Starting monthly SIP", "money", 500, 1000000, 5000], ["step", "Yearly step-up", "pct", 1, 50, 10], ["yrs", "Time period", "yrs", 1, 40, 10], ["ret", "Expected return", "pct", 1, 30, 12]],
        run: (v) => {
            const t = sipTable(stepped(v.amt, v.step), v.ret, v.yrs * 12);
            const flat = sipFV(v.amt, v.ret, v.yrs * 12);
            return { label: "Maturity value", big: t.value, sub: short(t.value - flat) + " more than a flat SIP", a: ["Invested", t.paid], b: ["Estimated returns", t.value - t.paid], rows: t.rows, flat,
                share: "A SIP of " + inr(v.amt) + " a month, stepped up " + v.step + "% every year for " + v.yrs + " years at " + v.ret + "%, could grow to " + inr(t.value) + "." };
        },
        sched: { cols: ["Year", "Monthly SIP", "Invested", "Returns", "Value"], row: (x, v) => [inr(v.amt * Math.pow(1 + v.step / 100, x[0] - 1)), inr(x[1]), inr(x[2] - x[1]), inr(x[2])] },
        explain: (v, r) => {
            const big = r.big!, flat = r.flat!, n = v.yrs * 12, last = v.amt * Math.pow(1 + v.step / 100, v.yrs - 1);
            return {
                name: "Step-up SIP, compounded month by month",
                def: "The SIP starts at the amount you enter and rises by the step-up percentage every 12 months. Each month the balance grows at the monthly rate, then the next instalment is added, so every instalment compounds from the day it goes in.",
                assume: ["the SIP rises once a year, on each 12-month mark", "each instalment is invested at the start of the month", "the return stays the same every year"],
                formula: "B(m) = (B(m − 1) + SIP(m)) × (1 + i)",
                vars: [["SIP(1)", "Starting SIP", inr(v.amt)], ["s", "Yearly step-up", v.step + "%"], ["i", "Monthly rate", mrate(v.ret)]],
                steps: ["Year 1 SIP is " + inr(v.amt) + " a month. It rises " + v.step + "% a year, reaching " + inr(last) + " a month in year " + v.yrs + ".",
                    "Each month the balance grows by i = " + v.ret + "% ÷ 12 = " + mrate(v.ret) + ", then the next instalment is added.",
                    "Over " + n + " months you invest " + inr(r.a[1]) + " in total.",
                    "The balance at the end is " + inr(big) + ", of which " + inr(r.b[1]) + " is returns.",
                    "A flat SIP of " + inr(v.amt) + " would reach " + inr(flat) + ", so the step-up adds " + inr(big - flat) + "."],
                kpis: [["Step-up bonus", "+" + short(big - flat), "More than a flat SIP", true], ["Wealth multiplier", (big / r.a[1]).toFixed(2) + "x", "Value ÷ amount invested"],
                    ["Final monthly SIP", inr(last), "In year " + v.yrs], ["In today’s money", short(real(big, v.yrs)), "At 6% inflation"]],
                tips: ["The step-up adds " + inr(big - flat) + " over a flat SIP, for " + inr(r.a[1] - v.amt * n) + " more invested.",
                    "Matching the step-up to your yearly pay rise keeps your savings rate steady as your income grows.",
                    "Later, larger instalments have less time to compound, so starting early matters more than the size of the step-up."],
            };
        },
    },
    "lumpsum": {
        title: "Lumpsum calculator", lede: "What a one-time investment grows to.", tab: "Lumpsum",
        topic: "Investing a lump sum",
        fields: [["amt", "One-time investment", "money", 5000, 100000000, 100000], ["yrs", "Time period", "yrs", 1, 40, 10], ["ret", "Expected return", "pct", 1, 30, 12]],
        run: (v) => {
            const fv = v.amt * Math.pow(1 + v.ret / 100, v.yrs), rows: Row[] = [];
            for (let y = 1; y <= v.yrs; y++) rows.push([y, v.amt, v.amt * Math.pow(1 + v.ret / 100, y)]);
            return { label: "Future value", big: fv, sub: "in " + v.yrs + " years", a: ["Invested", v.amt], b: ["Estimated returns", fv - v.amt], rows,
                share: inr(v.amt) + " invested once for " + v.yrs + " years at " + v.ret + "% could grow to " + inr(fv) + "." };
        },
        sched: { cols: ["Year", "Invested", "Growth", "Value"], row: (x) => [inr(x[1]), inr(x[2] - x[1]), inr(x[2])] },
        explain: (v, r) => {
            const big = r.big!, g = Math.pow(1 + v.ret / 100, v.yrs), dbl = Math.log(2) / Math.log(1 + v.ret / 100);
            return {
                name: "Annual compounding",
                def: "The whole amount is invested on day one and grows at the annual return you enter, compounding once a year with the returns reinvested.",
                assume: ["one investment on day one, with no additions or withdrawals", "returns compound once a year and are reinvested", "tax and exit load are not deducted"],
                formula: "FV = P × (1 + r)^t",
                vars: [["P", "Investment", inr(v.amt)], ["r", "Annual return", v.ret + "%"], ["t", "Years", v.yrs]],
                steps: ["Growth in one year = 1 + " + v.ret + "% = " + (1 + v.ret / 100).toFixed(4) + ".",
                    "Over " + v.yrs + " years: " + (1 + v.ret / 100).toFixed(4) + "^" + v.yrs + " = " + g.toFixed(4) + ".",
                    "Future value = " + inr(v.amt) + " × " + g.toFixed(4) + " = " + inr(big) + ".",
                    "Estimated returns = " + inr(big) + " − " + inr(v.amt) + " = " + inr(r.b[1]) + "."],
                kpis: [["Wealth multiplier", g.toFixed(2) + "x", "Value ÷ amount invested", true], ["Doubles in", "~" + dbl.toFixed(1) + " years", "At " + v.ret + "% a year"],
                    ["Total gain", "+" + pct((g - 1) * 100, 1), "On the amount invested"], ["In today’s money", short(real(big, v.yrs)), "At 6% inflation"]],
                tips: ["At " + v.ret + "% a year the money doubles about every " + dbl.toFixed(1) + " years (the rule of 72 gives " + (72 / v.ret).toFixed(1) + ").",
                    "All of it is invested from day one, so the full amount compounds for the whole period.",
                    "If markets look expensive, moving the money in over 6 to 12 months through an STP spreads out the entry."],
            };
        },
    },
    "swp": {
        title: "SWP calculator", lede: "A monthly payout from a corpus.", tab: "SWP",
        topic: "Monthly income (SWP)",
        fields: [["corpus", "Corpus", "money", 100000, 100000000, 5000000], ["wd", "Monthly withdrawal", "money", 1000, 1000000, 30000], ["yrs", "Time period", "yrs", 1, 40, 15], ["ret", "Expected return", "pct", 1, 20, 8]],
        run: (v) => {
            const i = v.ret / 1200, n = v.yrs * 12, rows: Row[] = [];
            let bal = v.corpus, out = 0, ranOut = 0;
            for (let m = 1; m <= n; m++) {
                bal = bal * (1 + i); const w = Math.min(v.wd, bal); bal -= w; out += w;
                if (bal <= 0.5 && !ranOut) { ranOut = m; bal = 0; }
                if (m % 12 === 0 || m === n) rows.push([Math.ceil(m / 12), out, bal]);
            }
            return { label: ranOut ? "Runs out after" : "Balance left", big: ranOut ? null : bal, bigText: ranOut ? yrs(ranOut) : null, ranOut,
                sub: ranOut ? "at " + inr(v.wd) + " a month" : "after " + v.yrs + " years of " + inr(v.wd) + " a month",
                a: ["Total withdrawn", out], b: ["Balance left", bal], rows, cols: ["Year", "Withdrawn", "Balance"],
                share: ranOut ? "A corpus of " + inr(v.corpus) + " paying " + inr(v.wd) + " a month at " + v.ret + "% lasts " + yrs(ranOut) + "."
                    : "A corpus of " + inr(v.corpus) + " can pay " + inr(v.wd) + " a month for " + v.yrs + " years at " + v.ret + "%, with " + inr(bal) + " left over." };
        },
        sched: { cols: ["Year", "Monthly payout", "Withdrawn so far", "Balance"], row: (x, v) => [inr(x[2] > 0 ? v.wd : 0), inr(x[1]), inr(x[2])] },
        explain: (v, r) => {
            const i = v.ret / 1200, earn = v.corpus * i, rate = v.wd * 12 / v.corpus * 100;
            return {
                name: "Monthly withdrawal from a compounding corpus",
                def: "Each month the remaining corpus grows at the monthly rate i (the annual return divided by 12), then the withdrawal is paid out. If the withdrawal is more than the corpus earns, the corpus shrinks each month until it runs out.",
                assume: ["withdrawals are paid at the end of each month", "the remaining corpus keeps earning the same return", "tax on redemptions is not deducted"],
                formula: "B(m) = B(m − 1) × (1 + i) − W",
                vars: [["B(0)", "Corpus", inr(v.corpus)], ["W", "Monthly withdrawal", inr(v.wd)], ["i", "Monthly rate", mrate(v.ret)]],
                steps: ["Monthly rate i = " + v.ret + "% ÷ 12 = " + mrate(v.ret) + ".",
                    "In month 1 the corpus earns " + inr(earn) + " and " + inr(Math.min(v.wd, v.corpus * (1 + i))) + " is paid out.",
                    v.wd > earn ? "That is " + inr(v.wd - earn) + " more than the corpus earns, so it shrinks a little more every month."
                        : "The corpus earns " + inr(earn - v.wd) + " more than you take out, so it keeps growing.",
                    "Withdrawals add up to " + inr(r.a[1]) + (r.ranOut ? " before the corpus runs out after " + yrs(r.ranOut) + "." : " over " + v.yrs + " years."),
                    "Balance left at the end: " + inr(r.b[1]) + "."],
                kpis: [["Withdrawal rate", pct(rate, 1) + " a year", "Of the starting corpus", true], ["Total withdrawn", short(r.a[1]), pct(r.a[1] / v.corpus * 100, 0) + " of the corpus"],
                    ["Balance left", short(r.b[1]), r.b[1] >= v.corpus ? "Corpus kept intact" : "Corpus partly used"], ["Lasts", r.ranOut ? yrs(r.ranOut) : "All " + v.yrs + " years", r.ranOut ? "Then the corpus is used up" : "At " + v.ret + "% a year"]],
                tips: ["At " + v.ret + "% the corpus earns about " + inr(earn) + " a month to begin with. Withdrawing up to that keeps the capital intact.",
                    "Tax applies only to the gains in each withdrawal, not the whole amount.",
                    "A withdrawal rate below the return you expect leaves room for inflation and weak years."],
            };
        },
    },
    "goal-sip": {
        title: "Goal SIP calculator", lede: "The monthly SIP a goal needs.", tab: "Goal SIP",
        topic: "Planning a goal",
        fields: [["cost", "Goal cost today", "money", 10000, 100000000, 2500000], ["yrs", "Years to goal", "yrs", 1, 40, 12], ["inf", "Inflation", "pct", 0, 15, 6], ["ret", "Expected return", "pct", 1, 30, 12]],
        run: (v) => {
            const fv = v.cost * Math.pow(1 + v.inf / 100, v.yrs), n = v.yrs * 12, sip = fv / sipFV(1, v.ret, n);
            const lump = fv / Math.pow(1 + v.ret / 100, v.yrs);
            return { label: "Monthly SIP needed", big: sip, sub: "or " + short(lump) + " invested once today", a: ["You invest", sip * n], b: ["Estimated returns", fv - sip * n],
                extra: [["Goal cost in " + v.yrs + " years", fv]], rows: sipTable(() => sip, v.ret, n).rows, fv, lump,
                share: "A goal costing " + inr(v.cost) + " today will cost about " + inr(fv) + " in " + v.yrs + " years. A SIP of " + inr(sip) + " a month at " + v.ret + "% gets there." };
        },
        sched: { cols: ["Year", "Monthly SIP", "Invested", "Value", "Of goal"], row: (x, v, r) => [inr(r.big!), inr(x[1]), inr(x[2]), pct(x[2] / r.fv! * 100, 0)] },
        explain: (v, r) => {
            const big = r.big!, fv = r.fv!, n = v.yrs * 12, fac = sipFV(1, v.ret, n), infl = Math.pow(1 + v.inf / 100, v.yrs);
            const later = v.yrs > 1 ? fv / sipFV(1, v.ret, n - 12) : 0, up = fv / sipTable(stepped(1, 10), v.ret, n).value;
            return {
                name: "Inflation-adjusted goal SIP",
                def: "The goal's cost today is grown at the inflation rate to the year you need it. The monthly SIP is the start-of-month instalment that, compounding at the monthly rate, adds up to exactly that amount.",
                assume: ["inflation stays at the rate you enter", "each instalment is invested at the start of the month", "the return stays the same every year"],
                formula: "SIP = Cost × (1 + f)^t ÷ ([((1 + i)^n − 1) ÷ i] × (1 + i))",
                vars: [["Cost", "Goal cost today", inr(v.cost)], ["f", "Inflation", v.inf + "%"], ["i", "Monthly rate", mrate(v.ret)]],
                steps: ["Inflation factor = (1 + " + v.inf + "%)^" + v.yrs + " = " + infl.toFixed(4) + ".",
                    "Goal cost in " + v.yrs + " years = " + inr(v.cost) + " × " + infl.toFixed(4) + " = " + inr(fv) + ".",
                    "₹1 a month for " + n + " months at " + v.ret + "% grows to ₹" + grouped(fac) + ".",
                    "Monthly SIP = " + inr(fv) + " ÷ " + grouped(fac) + " = " + inr(big) + ".",
                    "Or invest " + inr(r.lump!) + " once today at " + v.ret + "% a year."],
                kpis: [["Monthly SIP", inr(big), "For " + n + " months", true], ["Goal cost then", short(fv), "At " + v.inf + "% inflation"],
                    ["Cost grows", (fv / v.cost).toFixed(2) + "x", "Over " + v.yrs + " years"], ["Returns share", pct(r.b[1] / fv * 100, 0), "Of the goal amount"]],
                tips: (later ? ["Starting a year later needs " + inr(later) + " a month instead of " + inr(big) + "."] : []).concat(
                    ["With a 10% yearly step-up you could start at " + inr(up) + " a month and still reach the goal.",
                        "Education and healthcare costs often rise faster than general inflation. Use a higher rate for those goals."]),
            };
        },
    },
    "sip-delay": {
        title: "SIP delay cost calculator", lede: "What waiting to start costs.", tab: "SIP delay cost",
        topic: "Starting a SIP",
        fields: [["amt", "Monthly SIP", "money", 500, 1000000, 10000], ["yrs", "Investing for", "yrs", 2, 40, 20], ["delay", "Delay in starting", "mos", 1, 60, 12], ["ret", "Expected return", "pct", 1, 30, 12]],
        run: (v) => {
            const n = v.yrs * 12, d = Math.min(v.delay, n - 1), now = sipFV(v.amt, v.ret, n), late = sipFV(v.amt, v.ret, n - d);
            const a = sipTable(() => v.amt, v.ret, n).rows, b = sipTable((m) => m > d ? v.amt : 0, v.ret, n).rows;
            return { label: "Cost of waiting", big: now - late, sub: "by starting " + yrs(d) + " later", a: ["Value if you start later", late], b: ["Lost to the delay", now - late],
                extra: [["Value if you start today", now]], now, late, d,
                rows: a.map((x, k): Row => [x[0], x[2], b[k][2]]), cols: ["Year", "Start today", "Start later"],
                share: "Waiting " + yrs(d) + " to start a SIP of " + inr(v.amt) + " a month costs about " + inr(now - late) + " over " + v.yrs + " years at " + v.ret + "%." };
        },
        sched: { cols: ["Year", "Start today", "Start later", "Gap"], row: (x) => [inr(x[1]), inr(x[2]), inr(x[1] - x[2])] },
        explain: (v, r) => {
            const now = r.now!, late = r.late!, d = r.d!, n = v.yrs * 12, lost = now - late, catchUp = now / sipFV(1, v.ret, n - d);
            return {
                name: "Cost of delay: two SIPs, same end date",
                def: "Two SIPs of the same amount end on the same date. One starts today, the other after the delay, so it gets fewer instalments and less time to compound. The cost of waiting is the gap between their final values.",
                assume: ["both SIPs end on the same date", "each instalment is invested at the start of the month", "the return stays the same every year"],
                formula: "Cost = FV(P, i, n) − FV(P, i, n − d)",
                vars: [["P", "Monthly SIP", inr(v.amt)], ["n", "Months", n], ["d", "Delay", d + " months"]],
                steps: ["Start today: " + n + " instalments of " + inr(v.amt) + " grow to " + inr(now) + ".",
                    "Start after " + yrs(d) + ": " + (n - d) + " instalments grow to " + inr(late) + ".",
                    "Cost of waiting = " + inr(now) + " − " + inr(late) + " = " + inr(lost) + ".",
                    "You skip " + d + " instalments worth " + inr(v.amt * d) + ", and they would have grown into " + inr(lost) + "."],
                kpis: [["Cost of waiting", short(lost), "By starting " + yrs(d) + " later", true], ["Corpus lost", pct(lost / now * 100, 1), "Of the start-today value"],
                    ["Per month of delay", short(lost / d), "On average"], ["Instalments skipped", d, inr(v.amt * d) + " not invested"]],
                tips: ["To end with the same " + short(now) + " after waiting, you would need " + inr(catchUp) + " a month instead of " + inr(v.amt) + ".",
                    "The skipped " + inr(v.amt * d) + " would have grown " + (lost / (v.amt * d)).toFixed(1) + " times by the end, because the earliest instalments compound the longest.",
                    "Starting small today beats starting bigger later. You can step the SIP up as your income grows."],
            };
        },
    },
};
export const CALC_IDS = Object.keys(CALCS);

// ---------- money sliders run on a log scale, so ₹500 and ₹10 Cr are both reachable
export function toSlider(f: Field, val: number) {
    if (f[2] !== "money") return val;
    const lo = Math.max(f[3], 1), t = (Math.log(Math.max(val, lo)) - Math.log(lo)) / (Math.log(f[4]) - Math.log(lo));
    return Math.round(t * 1000);
}
export function fromSlider(f: Field, s: number) {
    if (f[2] !== "money") return s;
    const lo = Math.max(f[3], 1), v = Math.exp(Math.log(lo) + (s / 1000) * (Math.log(f[4]) - Math.log(lo)));
    const mag = Math.pow(10, Math.max(Math.floor(Math.log10(v)) - 1, 2));
    return f[3] === 0 && s === 0 ? 0 : Math.round(v / mag) * mag;
}
export function clamp(f: Field, v: number) { return Math.min(Math.max(v, f[3]), f[4]); }
export const UNIT: Record<Unit, [string, string]> = { money: ["₹", ""], pct: ["", "%"], yrs: ["", "yrs"], mos: ["", "mos"] };
export function fmtField(f: Field, v: number) { return f[2] === "money" ? inr(v) : f[2] === "pct" ? v + "%" : f[2] === "yrs" ? v + (v === 1 ? " year" : " years") : v + (v === 1 ? " month" : " months"); }

/** Defaults, overridden by a shared link (?c=sip&amt=5000&...) when it names this calculator. */
export function initialVals(id: string, params: URLSearchParams | null): Vals {
    const vals: Vals = {};
    for (const f of CALCS[id].fields) {
        const raw = params && params.get("c") === id ? params.get(f[0]) : null, start = raw === null ? NaN : +raw;
        vals[f[0]] = clamp(f, isNaN(start) ? f[5] : start);
    }
    return vals;
}
