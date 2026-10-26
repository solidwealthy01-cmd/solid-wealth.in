// One place for the site's identity and outbound links, taken from the solid-wealth
// repo (src/lib/seo.ts, app-links.ts, api-config.ts) so the two sites cannot drift apart.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://solid-wealth.in").replace(/\/$/, "");
export const SITE_NAME = "Solid Wealth";
export const SITE_TAGLINE = "Reimagine money, simple solutions";
export const EMAIL = "solidwealthy@gmail.com";
export const MAIN_SITE = "https://www.solidwealthindia.com";
export const LINKEDIN = "https://www.linkedin.com/company/solid-wealth/";

export const portalLinks = {
    client: "https://client.solidwealth.in",
    partner: "https://distributor.solidwealth.in",
} as const;

export const appLinks = {
    android: "https://play.google.com/store/apps/details?id=com.rabbitinvest.solidwealth&hl=en_IN",
    ios: "https://apps.apple.com/sg/app/themfbox/id1594370380",
} as const;

// The call back form posts to the same subscribers endpoint as the solidwealthindia.com contact form.
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend.solidwealthindia.com").replace(/\/$/, "");

export function organizationJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": "FinancialService",
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo-256.png`,
        email: EMAIL,
        areaServed: { "@type": "Country", name: "India" },
        sameAs: [MAIN_SITE, LINKEDIN],
    };
}
