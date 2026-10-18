"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { CalculatorCard } from "@/components/calculators/calculator-card";
import { ReportModal } from "@/components/calculators/report-modal";
import { CALCS, CALC_IDS, initialVals } from "@/lib/calculators";
import { exportPagesToPdf } from "@/lib/pdf-export";
import type { Report } from "@/lib/report";

const HOW: Record<string, ReactNode> = {
    "sip": <p>Each instalment is invested at the start of the month and compounds monthly at the annual return divided by 12. Maturity = P × [((1 + i)<sup>n</sup> − 1) ÷ i] × (1 + i), where P is the monthly SIP, i the monthly rate and n the number of months. ₹5,000 a month for 10 years at 12% comes to ₹11,61,695.</p>,
    "step-up-sip": <p>The SIP starts at the amount you enter and rises by the step-up percentage every 12 months. Each instalment compounds monthly from the day it goes in, so the result is the sum of every instalment&apos;s growth to the end date.</p>,
    "lumpsum": <p>A single amount compounds once a year at the return you enter. Future value = P × (1 + r)<sup>t</sup>, where r is the annual return and t the number of years.</p>,
    "swp": <p>The corpus earns the annual return divided by 12 each month, and the withdrawal comes out at the end of the month. If the withdrawal is more than the corpus earns, the corpus runs down, and the result shows the month it runs out.</p>,
    "goal-sip": <p>The goal&apos;s cost today is first grown by inflation to the year you need it. The monthly SIP is then the instalment that reaches that amount at the return you enter, using the same monthly compounding as the SIP calculator.</p>,
    "sip-delay": <p>Both SIPs end on the same date. One starts today, the other after the delay, so it gets fewer instalments and less time to compound. The cost of waiting is the difference between the two final values.</p>,
};

// A shared link (?c=swp&corpus=...) opens that calculator with those numbers. The server
// renders the defaults; the browser switches to the link's numbers once it hydrates.
const noop = () => () => {};
function useSearch() { return useSyncExternalStore(noop, () => location.search, () => ""); }

export function CalculatorSection() {
    const search = useSearch();
    const params = search ? new URLSearchParams(search) : null;
    const linked = params?.get("c") && CALCS[params.get("c")!] ? params.get("c")! : null;
    const [picked, setPicked] = useState<string | null>(null);
    const active = picked ?? linked ?? "sip";
    const activeRef = useRef(active);
    useEffect(() => { activeRef.current = active; }, [active]);
    const tabs = useRef<HTMLDivElement>(null), sec = useRef<HTMLElement>(null), pagesRef = useRef<HTMLDivElement>(null);
    const [replayId, setReplayId] = useState<string | null>(null);
    const [rep, setRep] = useState<{ data: Report; offscreen: boolean } | null>(null);
    const [busy, setBusy] = useState(false);

    // a shared link lands on the calculator
    useEffect(() => { if (linked) sec.current?.scrollIntoView(); }, [linked]);

    // first time the calculator scrolls into view, the result counts up from zero
    useEffect(() => {
        if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches || !sec.current) return;
        const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); setReplayId(activeRef.current); } }, { threshold: 0.35 });
        io.observe(sec.current);
        return () => io.disconnect();
    }, []);

    const pick = (id: string) => {
        setPicked(id);
        tabs.current?.querySelector(`[data-c="${id}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    };

    // the call back form opens on the right topic
    const plan = (topic: string) => {
        const form = document.getElementById("cb") as HTMLFormElement | null;
        if (!form) return;
        (form.elements.namedItem("t") as HTMLSelectElement).value = topic;
        setTimeout(() => (form.elements.namedItem("n") as HTMLInputElement).focus({ preventScroll: true }), 600);
    };

    const capture = useCallback(async (data: Report) => {
        setBusy(true);
        try {
            if (pagesRef.current) await exportPagesToPdf(pagesRef.current, data.filename);
        } catch (err) {
            console.error("Could not create the PDF", err);
            alert("We could not create the PDF just now. Please check your connection and try again.");
        } finally {
            setBusy(false);
        }
    }, []);

    // a download without the preview open renders the pages off-screen, captures them, then removes them
    const download = async (data: Report) => {
        if (busy) return;
        flushSync(() => setRep({ data, offscreen: true }));
        await capture(data);
        setRep(null);
    };

    const close = useCallback(() => setRep(null), []);

    return (
        <section className="sec soft" id="calculator" ref={sec}>
            <div className="wrap">
                <div className="sec-head rv"><p className="kicker">Calculators</p><h2>Work out <em>your numbers.</em></h2></div>
                <div className="picker rv" role="tablist" aria-label="Calculators" ref={tabs}>
                    {CALC_IDS.map((id) => (
                        <button key={id} role="tab" data-c={id} className={id === active ? "on" : undefined} aria-selected={id === active} onClick={() => pick(id)}>{CALCS[id].tab}</button>
                    ))}
                </div>
                <div className="rv">
                    {CALC_IDS.map((id) => (
                        <CalculatorCard key={id + (id === linked ? search : "")} id={id} initial={initialVals(id, params)} on={id === active} how={HOW[id]}
                            replay={id === replayId ? 1 : 0} busy={busy} onPlan={plan}
                            onPdf={download}
                            onPreview={(data) => setRep({ data, offscreen: false })} />
                    ))}
                </div>
                <p className="note center">For illustration only. Results depend on the return you enter and are not a promise of future returns.</p>
            </div>
            {rep && <ReportModal rep={rep.data} offscreen={rep.offscreen} busy={busy} pagesRef={pagesRef} onClose={close} onDownload={() => capture(rep.data)} />}
        </section>
    );
}
