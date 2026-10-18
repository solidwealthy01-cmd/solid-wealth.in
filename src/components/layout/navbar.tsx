import Image from "next/image";
import { SITE_NAME } from "@/lib/site";

export function Navbar() {
    return (
        <header className="nav" id="top">
            <div className="wrap nav-in">
                <a className="brand" href="#top"><Image src="/logo-72.png" alt="" width={36} height={36} /><span>{SITE_NAME}</span></a>
                <nav className="links"><a href="#services">Services</a><a href="#calculator">Calculator</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
                <div className="nav-cta"><a className="btn-o sm" href="#app">Get the app</a><a className="btn sm" href="#contact">Talk to us</a></div>
            </div>
        </header>
    );
}
