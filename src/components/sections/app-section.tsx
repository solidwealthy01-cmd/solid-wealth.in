import Image from "next/image";
import { appLinks } from "@/lib/site";

export function AppSection() {
    return (
        <section className="band" id="app" data-sc>
            <div className="wrap band-in">
                <div className="rv">
                    <p className="kicker">The Solid Wealth app</p>
                    <h2>Your money, <em>in your pocket.</em></h2>
                    <p className="band-p">See what you own, what it is worth and how each fund is doing. Check your risk profile, and start a SIP in a few taps.</p>
                    <div className="stores">
                        <a className="store" href={appLinks.android} rel="noopener"><small>Get it on</small>Google Play</a>
                        <a className="store" href={appLinks.ios} rel="noopener"><small>Download on the</small>App Store</a>
                    </div>
                </div>
                <div className="band-ph rv">
                    <div className="ph"><Image src="/hero2.jpeg" alt="Home screen of the Solid Wealth app" width={720} height={1600} sizes="(max-width: 560px) 210px, (min-width: 1536px) 290px, 250px" /></div>
                </div>
            </div>
        </section>
    );
}
