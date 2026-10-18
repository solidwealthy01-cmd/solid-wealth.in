import Image from "next/image";

// The three app mockups from the solid-wealth feature section, in the activeinvest.in hero layout:
// the copy lands in sequence, the side shots fan out from behind the middle one, then drift apart
// as you scroll (--hs, set by ScrollEffects).
const SHOTS = [
    { cls: "shot shot-l", src: "/feature-onboarding.webp" },
    { cls: "shot shot-c", src: "/feature-portfolio.webp" },
    { cls: "shot shot-r", src: "/feature-risk.webp" },
];

export function HeroSection() {
    return (
        <section className="hero">
            <div className="wrap hero-in">
                <div className="hero-copy">
                    <p className="kicker">Your mutual fund investment partner, simplified</p>
                    <h1>Invest with <em>a plan.</em></h1>
                    <p className="lead">Mutual funds, SIPs and tax saving, set up with Solid Wealth and tracked in your own app.</p>
                    <div className="ctas"><a className="btn" href="#contact">Talk to us</a><a className="tlink" href="#app">Get the app <span>&rarr;</span></a></div>
                </div>
                <div className="trio" aria-hidden="true" data-sc>
                    {SHOTS.map((s) => (
                        <div className={s.cls} key={s.src}>
                            <Image src={s.src} alt="" width={800} height={886} loading="eager" fetchPriority={s.cls.endsWith("c") ? "high" : "auto"} sizes="(max-width: 960px) 280px, 360px" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
