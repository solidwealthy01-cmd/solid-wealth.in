"use client";
import { useState, type FormEvent } from "react";
import { API_BASE_URL, EMAIL, SITE_NAME } from "@/lib/site";

const TOPICS = ["Starting a SIP", "Investing a lump sum", "Saving tax", "Planning a goal", "Monthly income (SWP)", "Reviewing my investments", "Something else"];
const SOURCES = ["Instagram", "Facebook", "Meta Ads", "Google Ads", "Website", "Other"];

type Status = { kind: "ok"; text: string } | { kind: "err"; text: string; mail?: string } | null;

// Uncontrolled on purpose: "Plan this with us" on a calculator sets the topic straight on the form.
// Posts the same payload as the solidwealthindia.com contact form; if that fails, offers a ready-to-send email.
export function CallbackForm() {
    const [status, setStatus] = useState<Status>(null);
    const [busy, setBusy] = useState(false);

    async function submit(ev: FormEvent<HTMLFormElement>) {
        ev.preventDefault();
        if (busy) return;
        const f = ev.currentTarget, el = (n: string) => f.elements.namedItem(n) as HTMLInputElement;
        el("m").value = el("m").value.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
        if (!f.checkValidity()) {
            const bad = f.querySelector<HTMLInputElement>(":invalid")!;
            setStatus({ kind: "err", text: bad.name === "m" ? "Please enter a 10 digit mobile number." : bad.name === "e" ? "Please enter a valid email address." : "Please fill in your name." });
            bad.focus();
            return;
        }
        const body = { name: el("n").value.trim(), email: el("e").value.trim(), mobile_number: "+91" + el("m").value, source: el("s").value || "solid-wealth.in", interests: [el("t").value] };
        const mail = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Call back request: " + body.interests[0]) + "&body=" + encodeURIComponent(
            `Hi ${SITE_NAME}, please call me back.\nName: ${body.name}\nMobile: ${body.mobile_number}\nEmail: ${body.email}\nTopic: ${body.interests[0]}`);
        setBusy(true);
        setStatus(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/subscribers/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error("HTTP " + res.status);
            setStatus({ kind: "ok", text: `Thank you, ${body.name.split(" ")[0]}. We will call you back soon.` });
            f.reset();
        } catch {
            setStatus({ kind: "err", text: "We could not send that just now.", mail });
        } finally {
            setBusy(false);
        }
    }

    return (
        <form className="form rv" id="cb" noValidate onSubmit={submit}>
            <h3>Request a call back</h3>
            <label>Name<input name="n" required autoComplete="name" /></label>
            <label>Mobile<span className="tel"><span>+91</span><input name="m" required inputMode="tel" autoComplete="tel-national" pattern="[0-9 ]{10,12}" maxLength={12} /></span></label>
            <label>Email<input name="e" type="email" required autoComplete="email" /></label>
            <label>What would you like to talk about?<select name="t">{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></label>
            <label><span>How did you hear about us? <small>Optional</small></span>
                <select name="s" defaultValue=""><option value="">Choose one</option>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select></label>
            <button className="btn full" type="submit" disabled={busy}>{busy ? "Sending…" : "Request a call back"}</button>
            <p className={status ? "fstat " + status.kind : "fstat"} role="status" aria-live="polite">
                {status?.text}{status?.kind === "err" && status.mail && <> <a href={status.mail}>Send it by email instead</a>.</>}
            </p>
            <p className="note">We use these details only to get back to you.</p>
        </form>
    );
}
