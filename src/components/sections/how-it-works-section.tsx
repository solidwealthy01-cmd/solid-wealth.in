const STEPS = [
    ["Talk to us", "Tell us what you are saving for and by when. A short call is enough."],
    ["Open your account", "PAN, personal details, bank account and nominee, all on your phone. No paperwork."],
    ["Track it in the app", "Every SIP, goal and statement in one place, whenever you want to look."],
];

// The line between the steps fills as the row scrolls in (--enter, set by ScrollEffects).
export function HowItWorksSection() {
    return (
        <section className="sec" id="how">
            <div className="wrap how-in">
                <div className="sec-head rv"><p className="kicker">How it works</p><h2>Start in <em>three steps.</em></h2></div>
                <ol className="steps" data-sc>
                    {STEPS.map(([title, text], k) => <li className="rv" key={title}><b>{k + 1}</b><h3>{title}</h3><p>{text}</p></li>)}
                </ol>
            </div>
        </section>
    );
}
