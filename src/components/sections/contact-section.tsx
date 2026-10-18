import { CallbackForm } from "@/components/sections/callback-form";
import { EMAIL, LINKEDIN, MAIN_SITE, appLinks } from "@/lib/site";

export function ContactSection() {
    return (
        <section className="sec" id="contact">
            <div className="wrap contact">
                <div className="rv">
                    <p className="kicker">Contact</p>
                    <h2>Let’s <em>talk.</em></h2>
                    <p className="lead">Tell us your financial goals and we will help you build a plan for long-term growth.</p>
                    <ul className="clist">
                        <li><small>Email</small><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
                        <li><small>LinkedIn</small><a href={LINKEDIN} rel="noopener">Solid Wealth</a></li>
                        <li><small>App</small><a href={appLinks.android} rel="noopener">Google Play</a><span className="sep">&middot;</span><a href={appLinks.ios} rel="noopener">App Store</a></li>
                        <li><small>Research &amp; blog</small><a href={MAIN_SITE} rel="noopener">www.solidwealthindia.com</a></li>
                    </ul>
                </div>
                <CallbackForm />
            </div>
        </section>
    );
}
