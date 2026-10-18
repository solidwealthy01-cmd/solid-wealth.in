import Image from "next/image";
import { MAIN_SITE, SITE_NAME } from "@/lib/site";

export function AboutSection() {
    return (
        <section className="sec" id="about">
            <div className="wrap about">
                <div className="about-ph rv"><Image src="/logo-256.png" alt="Solid Wealth logo" width={256} height={256} /></div>
                <div className="rv">
                    <p className="kicker">About us</p>
                    <h2>Who you will <em>work with.</em></h2>
                    <p className="who">{SITE_NAME}</p>
                    <p className="body">Solid Wealth helps individuals and businesses grow, protect and preserve their wealth through mutual fund investments. You get one team to call, a clear plan for each goal, and an app that shows every rupee.</p>
                    <ul className="chips"><li>Mutual funds &amp; SIPs</li><li>Fund research</li><li>Investors across India</li></ul>
                    <a className="tlink" href={`${MAIN_SITE}/research`} rel="noopener">Learn investing with our free course <span>&rarr;</span></a>
                </div>
            </div>
        </section>
    );
}
