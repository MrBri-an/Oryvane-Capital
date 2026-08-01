"use client";
import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
export function PublicSmoothScroll({ children }: { children: ReactNode }) { useEffect(() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; const lenis = new Lenis({ duration: 1, smoothWheel: true }); let frame = 0; const raf = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(raf); }; frame = requestAnimationFrame(raf); return () => { cancelAnimationFrame(frame); lenis.destroy(); }; }, []); return children; }
