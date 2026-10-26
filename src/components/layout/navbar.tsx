import Image from "next/image";
import { SITE_NAME, portalLinks } from "@/lib/site";

export function Navbar() {
    return (
        <header className="nav" id="top">
            <div className="wrap nav-in">
                <a className="brand" href="#top"><Image src="/logo-72.png" alt="" width={36} height={36} /><span>{SITE_NAME}</span></a>
                <nav className="links"><a href="#services">Services</a><a href="#calculator">Calculator</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
                <div className="nav-cta">
                    <a className="btn-o sm nav-app" href="#app">Get the app</a>
                    <details className="login">
                        <summary className="btn-o sm">Login<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></summary>
                        <div className="login-menu">
                            <a href={portalLinks.client} rel="noopener"><b>Client Portal</b><span>For investors</span></a>
                            <a href={portalLinks.partner} rel="noopener"><b>Partner Portal</b><span>For partners</span></a>
                        </div>
                    </details>
                    <a className="btn sm" href="#contact">Talk to us</a>
                </div>
            </div>
        </header>
    );
}
