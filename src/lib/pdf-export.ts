/**
 * Multi-page A4 PDF from rendered report pages, as in the solid-wealth calculators:
 * each 794 x 1123 px page is captured with html-to-image and placed on an A4 page with jsPDF.
 * Both libraries are loaded only when someone downloads a report.
 */
export async function exportPagesToPdf(container: HTMLElement, filename: string) {
    const pages = Array.from(container.querySelectorAll<HTMLElement>(".rp-page"));
    if (!pages.length) return false;
    const [{ toPng }, { jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
        document.fonts?.ready,
        ...Array.from(container.querySelectorAll("img")).map((img) => img.decode().catch(() => undefined)),
    ]);
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    for (let k = 0; k < pages.length; k++) {
        // the preview may scale pages down to fit a phone; the capture always uses the full-size page
        const png = await toPng(pages[k], { pixelRatio: 2, width: 794, height: 1123, style: { transform: "none" } });
        if (k) pdf.addPage("a4", "portrait");
        pdf.addImage(png, "PNG", 0, 0, 595.28, 841.89, "p" + k, "FAST");   // without compression each page is ~14 MB of raw pixels
    }
    pdf.save(filename);
    return true;
}
