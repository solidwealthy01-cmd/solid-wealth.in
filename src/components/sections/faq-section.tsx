const FAQS = [
    ["Is my money safe with you?", "Your money goes straight from your bank account to the fund house. We never hold it. Units are held in your name and every transaction is confirmed to you by CAMS or KFintech."],
    ["How much do I need to start?", "Many funds accept a SIP from Rs 500 a month. The minimum depends on the scheme, and we will tell you before you invest."],
    ["Can I stop or change my SIP?", "Yes. You can pause, stop, or increase a SIP at any time. There is no penalty from us, though some schemes carry an exit load on early redemption."],
    ["Is a SIP better than a lumpsum?", "Neither is better every time. A SIP spreads your entry across market levels and suits money you earn monthly. A lumpsum puts the full amount to work at once, which helps when markets rise steadily afterwards. The calculators above show both."],
    ["What do I need to open an account?", "Your PAN, personal details, bank account and a nominee. It is done online in the app in a few minutes, and you only do it once."],
    ["Can I see investments I made elsewhere?", "Yes. Add your outside mutual funds to the app and they show next to the ones made with us."],
];

export function FaqSection() {
    return (
        <section className="sec soft" id="faq">
            <div className="wrap">
                <div className="sec-head rv"><p className="kicker">Questions</p><h2>Asked <em>often.</em></h2></div>
                <div className="faq">{FAQS.map(([q, a]) => <details className="rv" key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
            </div>
        </section>
    );
}
