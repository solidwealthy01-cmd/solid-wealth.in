"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { ReportPages } from "@/components/calculators/report-pages";
import type { Report } from "@/lib/report";

// Shown as a preview, or rendered off-screen just long enough to capture a download.
export function ReportModal({ rep, offscreen, busy, pagesRef, onClose, onDownload }: {
    rep: Report;
    offscreen: boolean;
    busy: boolean;
    pagesRef: RefObject<HTMLDivElement | null>;
    onClose: () => void;
    onDownload: () => void;
}) {
    const closeRef = useRef<HTMLButtonElement>(null);
    // start from the size the dialog will have (full width on a phone, else up to 900px), so the
    // pages never paint at full size first: Chrome can leave SVG text at the old scale when they shrink
    const [scale, setScale] = useState(() => offscreen ? 1 : Math.min(1, ((innerWidth <= 560 ? innerWidth : Math.min(900, innerWidth - 32)) - 32) / 794));

    // pages are 794px wide; on a phone the preview scales them down to fit
    useEffect(() => {
        const box = pagesRef.current;
        if (offscreen || !box) return;
        const ro = new ResizeObserver(() => setScale(Math.min(1, (box.clientWidth - 32) / 794)));
        ro.observe(box);
        return () => ro.disconnect();
    }, [offscreen, pagesRef]);

    useEffect(() => {
        if (offscreen) return;
        const last = document.activeElement as HTMLElement | null;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        addEventListener("keydown", onKey);
        return () => { document.body.style.overflow = ""; removeEventListener("keydown", onKey); last?.focus(); };
    }, [offscreen, onClose]);

    return createPortal(
        <div className={offscreen ? "rp-modal off" : "rp-modal"} role="dialog" aria-modal="true" aria-label="Report preview" aria-hidden={offscreen || undefined}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            style={{ "--rp-scale": scale } as React.CSSProperties}>
            <div className="rp-dialog">
                <div className="rp-bar">
                    <div><h3>Report preview</h3><p>2 pages, A4. Summary, then the method and schedule.</p></div>
                    <div>
                        <button className="btn sm" type="button" disabled={busy} onClick={onDownload}>{busy ? "Creating PDF…" : "Download PDF"}</button>
                        <button ref={closeRef} className="rp-x" type="button" aria-label="Close preview" onClick={onClose}>&times;</button>
                    </div>
                </div>
                <div className="rp-scroll" ref={pagesRef}><ReportPages rep={rep} /></div>
            </div>
        </div>,
        document.body,
    );
}
