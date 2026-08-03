"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShootingStars } from "@/components/motion/shooting-stars";

const symbols = ["$", "€", "£", "¥", "₦", "₿", "Ξ", "BTC", "ETH", "SOL", "BNB", "XRP", "USDT"];

export function CosmicMarketBackground() {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const quiet = pathname.startsWith("/dashboard") || (pathname.startsWith("/admin") && !["/admin/login", "/admin/mfa", "/admin/setup"].includes(pathname));
  const { scrollYProgress } = useScroll();
  const [paused, setPaused] = useState(false);
  const moonX = useTransform(scrollYProgress, [0, .24, .5, .76, 1], ["4vw", "62vw", "18vw", "70vw", "8vw"]);
  const moonY = useTransform(scrollYProgress, [0, .24, .5, .76, 1], ["8vh", "52vh", "16vh", "64vh", "28vh"]);
  const moonRotate = useTransform(scrollYProgress, [0, 1], [-8, 34]);
  const moonScale = useTransform(scrollYProgress, [0, .5, 1], [.78, 1.12, .88]);
  const coinX = useTransform(scrollYProgress, [0, .2, .45, .7, 1], ["74vw", "18vw", "68vw", "12vw", "76vw"]);
  const coinY = useTransform(scrollYProgress, [0, .2, .45, .7, 1], ["68vh", "20vh", "58vh", "34vh", "12vh"]);
  const coinScale = useTransform(scrollYProgress, [0, .3, .65, 1], [.65, 1.18, .72, 1]);
  const coinRotate = useTransform(scrollYProgress, [0, 1], [0, 720]);

  useEffect(() => {
    const update = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return <div aria-hidden className={`cosmic-market fixed inset-0 overflow-hidden ${quiet ? "cosmic-quiet" : ""} ${paused ? "motion-paused" : ""}`}>
    <div className="cosmic-grid absolute inset-0" />
    <div className="cosmic-aurora absolute inset-0" />
    <ShootingStars />
    <motion.div className="cosmic-moon absolute" style={reduced ? undefined : { x: moonX, y: moonY, rotate: moonRotate, scale: moonScale }}><span className="moon-crater moon-crater-one"/><span className="moon-crater moon-crater-two"/><span className="moon-crater moon-crater-three"/></motion.div>
    <motion.div className="bitcoin-coin absolute" style={reduced ? undefined : { x: coinX, y: coinY, scale: coinScale, rotate: coinRotate }}><div className="bitcoin-rim"><span>₿</span></div></motion.div>
    <svg className="cosmic-chart absolute inset-x-0 bottom-[8%] h-[38%] w-full" viewBox="0 0 1600 360" preserveAspectRatio="none"><path d="M0 300 C130 240 180 320 300 245 S490 170 590 220 S760 80 870 145 S1040 245 1160 125 S1400 80 1600 28"/><path className="chart-ghost" d="M0 330 C180 275 260 290 390 210 S620 300 760 185 S980 115 1120 190 S1380 105 1600 142"/></svg>
    <div className="particle-field absolute inset-0" />
    {symbols.map((symbol, index) => <span key={symbol} className={`static-market-symbol symbol-${index + 1} absolute font-reference`}>{symbol}</span>)}
    <div className="data-ribbon absolute bottom-[18%] left-0 font-reference">BTC/USD · MARKET CAP · VOLUME 24H · ETH/EUR · SOL/GBP · RISK CONTROL · AAL2 · IMMUTABLE LEDGER ·</div>
  </div>;
}
