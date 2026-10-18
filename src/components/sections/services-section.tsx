import type { ReactNode } from "react";

const SERVICES: { title: string; text: string; icon: ReactNode }[] = [
    { title: "SIP investing", text: "Invest a fixed amount every month and let it add up. Start, pause or step it up any time.", icon: <path d="M4 19V11M10 19V7M16 19v-5M22 19V4" /> },
    { title: "Lumpsum", text: "Put a bonus, maturity or savings to work in one go, in funds that match how long you can stay invested.", icon: <><circle cx="13" cy="13" r="8" /><path d="M13 9v8M10 12h6" /></> },
    { title: "Tax saving (ELSS)", text: "Claim up to Rs 1.5 lakh under Section 80C with a three year lock-in, the shortest among 80C options.", icon: <><path d="M6 4h14v18l-3-2-4 2-4-2-3 2z" /><path d="M10 10h6M10 14h6" /></> },
    { title: "Goal planning", text: "A home, a child’s education, retirement. Each goal gets its own plan and its own progress bar.", icon: <><circle cx="13" cy="13" r="9" /><circle cx="13" cy="13" r="5" /><circle cx="13" cy="13" r="1.5" /></> },
    { title: "Portfolio review", text: "Bring investments you made elsewhere. We show them in one view and go through them with you.", icon: <path d="M4 13h4l3-7 4 14 3-7h4" /> },
    { title: "Risk analyzer", text: "Answer a short questionnaire in the app to see your risk profile before you choose a fund.", icon: <><path d="M13 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" /><path d="M9 13l3 3 5-6" /></> },
];

export function ServicesSection() {
    return (
        <section className="sec soft" id="services">
            <div className="wrap">
                <div className="sec-head rv"><p className="kicker">What we do</p><h2>Everything your money <em>needs.</em></h2></div>
                <div className="grid3">
                    {SERVICES.map((s) => (
                        <article className="card rv" key={s.title}>
                            <svg viewBox="0 0 26 26" aria-hidden="true">{s.icon}</svg>
                            <h3>{s.title}</h3><p>{s.text}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
