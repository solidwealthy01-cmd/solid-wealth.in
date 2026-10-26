"use client";
import { useEffect } from "react";

// Scroll-driven motion from the activeinvest.in layout, run once over the server-rendered page:
// the nav gets a border once scrolled, the hero art drifts (--hs 0..1), [data-sc] blocks get
// --enter 0..1 as they come in (the steps light up in turn), and .rv blocks reveal in a stagger.
export function ScrollEffects() {
    useEffect(() => {
        const nav = document.querySelector(".nav"), hero = document.querySelector<HTMLElement>(".phones");
        const still = matchMedia("(prefers-reduced-motion: reduce)").matches, sc = Array.from(document.querySelectorAll<HTMLElement>("[data-sc]"));
        const cl = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
        let tick = false;
        function frame() {
            tick = false;
            const vh = innerHeight;
            nav?.classList.toggle("scrolled", scrollY > 8);
            if (still) return;
            hero?.style.setProperty("--hs", cl(scrollY / (vh * 0.9)).toFixed(3));
            sc.forEach((el) => {
                if (el === hero) return;
                const r = el.getBoundingClientRect(), en = cl((vh - r.top) / (vh * 0.55));
                el.style.setProperty("--enter", en.toFixed(3));
                if (el.classList.contains("steps")) Array.from(el.children).forEach((li, k, all) => li.classList.toggle("lit", en >= (all.length > 1 ? (k / (all.length - 1)) * 0.92 : 0) + 0.02));
            });
        }
        const onScroll = () => { if (!tick) { tick = true; requestAnimationFrame(frame); } };
        addEventListener("scroll", onScroll, { passive: true });
        addEventListener("resize", frame);
        frame();
        if (still) document.querySelectorAll(".steps li").forEach((li) => li.classList.add("lit"));

        // staggered reveal
        const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((en) => {
            if (!en.isIntersecting) return;
            const el = en.target as HTMLElement, sib = Array.from(el.parentNode!.children).filter((c) => c.classList.contains("rv")), k = sib.indexOf(el);
            el.style.transitionDelay = Math.min(k * 60, 420) + "ms";
            el.classList.add("in");
            io!.unobserve(el);
            el.addEventListener("transitionend", () => { el.style.transitionDelay = ""; }, { once: true });
        }), { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }) : null;
        document.querySelectorAll(".rv").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));

        // close the nav login menu on an outside click or Escape
        const login = document.querySelector<HTMLDetailsElement>(".login");
        const onDown = (e: PointerEvent) => { if (login?.open && !login.contains(e.target as Node)) login.open = false; };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && login?.open) { login.open = false; login.querySelector("summary")?.focus(); } };
        addEventListener("pointerdown", onDown);
        addEventListener("keydown", onKey);

        return () => { removeEventListener("scroll", onScroll); removeEventListener("resize", frame); removeEventListener("pointerdown", onDown); removeEventListener("keydown", onKey); io?.disconnect(); };
    }, []);
    return null;
}
