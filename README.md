# solid-wealth.in

One-page Next.js site for Solid Wealth. The layout is copied from activeinvest.in, and the content, branding and calculator features come from the `solid-wealth` repo. It uses the same stack as that repo (Next 16, App Router, React 19, TypeScript), with plain CSS and no Tailwind.

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build    # the page is prerendered as static HTML
```

Copy `.env.example` to `.env.local` to point the call back form at a different backend.

## Structure

```text
src/
  app/
    layout.tsx             metadata, Montserrat (next/font), Vercel Analytics
    page.tsx               the sections in order, plus JSON-LD
    globals.css            all styles, including the A4 report pages
  components/
    layout/                navbar, footer, scroll-effects (sticky nav, hero drift, step line, reveal)
    sections/              hero, services, how it works, app, about, FAQ, contact, callback-form
    calculators/
      calculator-section   tabs, shared links (?c=sip&amt=...), report preview and download
      calculator-card      one calculator: sliders, animated result, year table, "How it is worked out"
      report-pages         the 2 A4 report pages
      report-modal         preview dialog; also renders off-screen to capture a direct download
      charts               SVG bar chart and donut, shared by the page and the PDF
  lib/
    calculators.ts         the 6 calculators: maths, result text and step-by-step explanation
    report.ts              turns a calculator's state into report data
    pdf-export.ts          html-to-image + jsPDF, loaded only when someone downloads
    site.ts                name, links, email, API URL, organisation JSON-LD
public/                    logo, app mockups, report-template.svg (solid-wealth public/Printable.svg)
```

## What comes from solid-wealth

- Brand: name, logo, orange/navy colours, taglines, email, LinkedIn, Play Store and App Store links, app mockups.
- Calculator reports, as on solidwealthindia.com/calculators: preview, then download a 2-page A4 PDF on the Printable template. The same breakdown appears on the page under "How it is worked out".
- Call back form: posts to the same `/api/subscribers/` endpoint as the solidwealthindia.com contact form. If the request fails, the visitor gets a ready-to-send email instead.

## Still to fill in

- AMFI registration (ARN / EUIN). There is a TODO in `src/components/layout/footer.tsx`.
- A phone or WhatsApp number and an office address, if wanted. The solid-wealth repo has none.
- The backend has to allow CORS from `https://solid-wealth.in` for the form to post.
