import Image from "next/image";
import { EMAIL, MAIN_SITE, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export function Footer() {
    return (
        <footer className="foot">
            <div className="wrap">
                <div className="foot-top">
                    <div>
                        <a className="brand" href="#top"><Image src="/logo-72.png" alt="" width={32} height={32} /><span>{SITE_NAME}</span></a>
                        {/* TODO: add AMFI registration (ARN / EUIN) here once confirmed. Mutual fund distributors are expected to show it. */}
                        <p className="foot-reg"><span>{SITE_TAGLINE}.</span>Mutual fund investments, research and calculators for Indian investors.</p>
                    </div>
                    <div className="foot-links">
                        <a href="#services">Services</a><a href="#calculator">Calculator</a><a href="#contact">Contact</a>
                        <a href={`${MAIN_SITE}/mutual-funds`} rel="noopener">Fund research</a><a href={`${MAIN_SITE}/research`} rel="noopener">Learn investing</a><a href={`${MAIN_SITE}/blog`} rel="noopener">Blog</a>
                    </div>
                </div>
                <p className="risk">Mutual Fund investments are subject to market risks, read all scheme related documents carefully.</p>
                <p className="small">Calculator results and PDF reports are illustrations based on the return you enter, not a promise of future returns. Past performance may or may not be sustained in future. Complaints can be raised with us first at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>, then on <a href="https://scores.sebi.gov.in" rel="noopener">SEBI SCORES</a> or <a href="https://smartodr.in" rel="noopener">SMART ODR</a>.</p>
                <p className="small">&copy; 2026 {SITE_NAME}. All rights reserved.</p>
            </div>
        </footer>
    );
}
