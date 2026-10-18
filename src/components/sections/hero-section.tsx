import Image from "next/image";

// Copy lands in sequence; the app rises in front of the disc, then drifts up as you scroll (--hs, set by ScrollEffects).
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
                <div className="art" aria-hidden="true" data-sc>
                    <Image src="/hero-app.webp" alt="" width={1024} height={806} loading="eager" fetchPriority="high" sizes="(max-width: 960px) 100vw, 600px" />
                </div>
            </div>
        </section>
    );
}
