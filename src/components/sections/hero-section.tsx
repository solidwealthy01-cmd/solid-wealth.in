import Image from "next/image";

// Three app screens in phone frames, in the activeinvest.in hero layout: the copy lands in sequence, the side
// phones fan out from behind the middle one, then drift apart as you scroll (--hs, set by ScrollEffects).
const PHONES = [
    { cls: "ph ph-l", src: "/hero1.jpeg", sizes: "(max-width: 960px) 36vw, 230px" },
    { cls: "ph ph-c", src: "/hero2.jpeg", sizes: "(max-width: 960px) 42vw, 270px" },
    { cls: "ph ph-r", src: "/hero3.jpeg", sizes: "(max-width: 960px) 36vw, 230px" },
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
                <div className="phones" aria-hidden="true" data-sc>
                    {PHONES.map((p) => (
                        <div className={p.cls} key={p.src}>
                            <Image src={p.src} alt="" width={720} height={1600} loading="eager" fetchPriority={p.cls === "ph ph-c" ? "high" : "auto"} sizes={p.sizes} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
