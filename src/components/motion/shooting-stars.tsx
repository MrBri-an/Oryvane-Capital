"use client";

import { useEffect, useRef } from "react";

const emitterCount = 3;
const randomBetween = (minimum: number, maximum: number) => minimum + Math.random() * (maximum - minimum);

export function ShootingStars() {
  const stars = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const timers = new Map<number, ReturnType<typeof setTimeout>>();
    let stopped = false;

    function schedule(index: number, firstLaunch = false) {
      if (stopped || reducedMotion.matches) return;
      const existing = timers.get(index);
      if (existing) clearTimeout(existing);
      const mobile = window.innerWidth < 640;
      const delay = firstLaunch
        ? [500, 2100, 3900][index]
        : randomBetween(mobile ? 7200 : 4600, mobile ? 12800 : 9800);
      const timer = setTimeout(() => {
        timers.delete(index);
        requestAnimationFrame(() => launch(index));
      }, delay);
      timers.set(index, timer);
    }

    function launch(index: number) {
      const star = stars.current[index];
      if (!star || stopped || reducedMotion.matches || document.hidden) {
        schedule(index);
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;
      const mobile = width < 640;
      const fromRight = index === 1;
      const startX = fromRight ? randomBetween(width * 0.76, width * 1.02) : randomBetween(-width * 0.06, width * 0.56);
      const startY = randomBetween(-18, height * 0.18);
      const distanceX = randomBetween(width * (mobile ? 0.58 : 0.72), width * (mobile ? 0.82 : 1.02));
      const distanceY = randomBetween(height * 0.34, height * 0.68);
      const deltaX = fromRight ? -distanceX : distanceX;
      const angle = Math.atan2(distanceY, deltaX) * (180 / Math.PI);
      const duration = randomBetween(mobile ? 520 : 450, mobile ? 920 : 1100);
      const trailLength = randomBetween(mobile ? 68 : 108, mobile ? 108 : 196);

      star.style.setProperty("--meteor-length", `${trailLength}px`);
      star.style.setProperty("--meteor-angle", `${angle}deg`);
      star.style.setProperty("--meteor-x", `${startX}px`);
      star.style.setProperty("--meteor-y", `${startY}px`);

      const animation = star.animate(
        [
          { opacity: 0, transform: `translate3d(${startX}px,${startY}px,0) rotate(${angle}deg)` },
          { opacity: 1, offset: 0.08, transform: `translate3d(${startX + deltaX * 0.06}px,${startY + distanceY * 0.06}px,0) rotate(${angle}deg)` },
          { opacity: 0.9, offset: 0.55, transform: `translate3d(${startX + deltaX * 0.58}px,${startY + distanceY * 0.58}px,0) rotate(${angle}deg)` },
          { opacity: 0, transform: `translate3d(${startX + deltaX}px,${startY + distanceY}px,0) rotate(${angle}deg)` },
        ],
        { duration, easing: "cubic-bezier(.12,.68,.28,1)", fill: "none" },
      );
      animations.add(animation);
      animation.finished.catch(() => undefined).finally(() => {
        animations.delete(animation);
        star.style.opacity = "0";
        schedule(index);
      });
    }

    function handleVisibility() {
      animations.forEach((animation) => document.hidden ? animation.pause() : animation.play());
      if (!document.hidden && animations.size === 0) stars.current.forEach((_, index) => schedule(index));
    }

    function handleMotionPreference() {
      timers.forEach(clearTimeout);
      timers.clear();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      stars.current.forEach((star) => { if (star) star.style.opacity = "0"; });
      if (!reducedMotion.matches) stars.current.forEach((_, index) => schedule(index, true));
    }

    document.addEventListener("visibilitychange", handleVisibility);
    reducedMotion.addEventListener("change", handleMotionPreference);
    stars.current.forEach((_, index) => schedule(index, true));

    return () => {
      stopped = true;
      timers.forEach(clearTimeout);
      animations.forEach((animation) => animation.cancel());
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotion.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  return <div className="shooting-star-field" aria-hidden>
    {Array.from({ length: emitterCount }, (_, index) => <span key={index} ref={(node) => { stars.current[index] = node; }} className="shooting-star" />)}
  </div>;
}
