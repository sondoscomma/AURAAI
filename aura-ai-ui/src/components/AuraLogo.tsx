import type { JSX } from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import logoImg from "../assets/image/iconeAURA.png";

/* ─────────── Global keyframe styles (injected once) ─────────── */
let stylesInjected = false;
function ensureStyles(): void {
  if (stylesInjected) return;
  if (document.getElementById("aura-logo-anim-styles")) return;
  const style = document.createElement("style");
  style.id = "aura-logo-anim-styles";
  style.textContent = `
    /* ── Core pulse ── */
    @keyframes auraLogoPulse {
      0%, 100% {
        transform: scale(1);
        box-shadow:
          0 0 16px rgba(139,92,246,0.5),
          0 0 32px rgba(139,92,246,0.2),
          inset 0 0 12px rgba(255,255,255,0.08);
      }
      50% {
        transform: scale(1.08);
        box-shadow:
          0 0 28px rgba(139,92,246,0.7),
          0 0 56px rgba(139,92,246,0.3),
          0 0 80px rgba(139,92,246,0.12),
          inset 0 0 20px rgba(255,255,255,0.15);
      }
    }

    /* ── Expanding ring pulses ── */
    @keyframes auraLogoRingPulse {
      0%   { transform: scale(1); opacity: 0.6; }
      50%  { transform: scale(1.8); opacity: 0.2; }
      100% { transform: scale(2.8); opacity: 0; }
    }
    @keyframes auraLogoRingPulse3 {
      0%   { transform: scale(1); opacity: 0.35; }
      50%  { transform: scale(2.2); opacity: 0.1; }
      100% { transform: scale(3.4); opacity: 0; }
    }

    /* ── Shimmer sweep ── */
    @keyframes auraLogoShimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    /* ── Orbiting particles ── */
    @keyframes auraLogoOrbit {
      0%   { transform: rotate(0deg) translateX(24px) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(24px) rotate(-360deg); }
    }
    @keyframes auraLogoOrbit2 {
      0%   { transform: rotate(0deg) translateX(20px) rotate(0deg); }
      100% { transform: rotate(-360deg) translateX(20px) rotate(360deg); }
    }
    @keyframes auraLogoOrbit3 {
      0%   { transform: rotate(60deg) translateX(28px) rotate(-60deg); }
      100% { transform: rotate(420deg) translateX(28px) rotate(-420deg); }
    }

    /* ── Sparkle twinkle ── */
    @keyframes auraSparkle {
      0%, 100% { opacity: 0; transform: scale(0.4) rotate(0deg); }
      50%      { opacity: 1; transform: scale(1.1) rotate(180deg); }
    }
    @keyframes auraSparkleFloat {
      0%, 100% { opacity: 0; transform: translateY(0) scale(0.3); }
      30%      { opacity: 0.8; }
      70%      { opacity: 0.6; }
      100%     { opacity: 0; transform: translateY(-18px) scale(0.1); }
    }

    /* ── Star cross glow ── */
    @keyframes auraStarCrossGlow {
      0%, 100% { opacity: 0.15; transform: scale(0.9); }
      50%      { opacity: 0.5; transform: scale(1.1); }
    }

    /* ── Explosion particles ── */
    @keyframes particleBurst {
      0%   { transform: translate(0,0) scale(1); opacity: 1; }
      60%  { opacity: 0.8; }
      100% { opacity: 0; }
    }
    @keyframes shockwave {
      0%   { transform: scale(0.3); opacity: 0.8; border-width: 4px; }
      100% { transform: scale(3.5); opacity: 0; border-width: 1px; }
    }
    @keyframes starTrail {
      0%   { opacity: 0.9; transform: scale(1.2); }
      100% { opacity: 0; transform: scale(0.2); }
    }

    /* ── Logo button ── */
    .aura-anim-logo-btn {
      animation: auraLogoPulse 2.4s ease-in-out infinite;
      cursor: pointer;
      position: relative;
      overflow: visible;
    }
    .aura-anim-logo-btn:hover {
      animation: auraLogoPulse 1.2s ease-in-out infinite;
    }

    /* ── Rings ── */
    .aura-anim-logo-ring {
      position: absolute;
      inset: -4px;
      border-radius: 12px;
      border: 2px solid rgba(139,92,246,0.35);
      animation: auraLogoRingPulse 2.2s ease-out infinite;
      pointer-events: none;
    }
    .aura-anim-logo-ring-2 {
      position: absolute;
      inset: -4px;
      border-radius: 12px;
      border: 1.5px solid rgba(167,139,250,0.25);
      animation: auraLogoRingPulse 2.2s ease-out 0.8s infinite;
      pointer-events: none;
    }
    .aura-anim-logo-ring-3 {
      position: absolute;
      inset: -6px;
      border-radius: 14px;
      border: 1px solid rgba(196,181,253,0.15);
      animation: auraLogoRingPulse3 3s ease-out 1.4s infinite;
      pointer-events: none;
    }

    /* ── Shimmer overlay ── */
    .aura-anim-logo-shimmer {
      background: linear-gradient(
        90deg,
        rgba(255,255,255,0) 0%,
        rgba(255,255,255,0.4) 50%,
        rgba(255,255,255,0) 100%
      );
      background-size: 200% 100%;
      animation: auraLogoShimmer 2.5s linear infinite;
      position: absolute;
      inset: 0;
      border-radius: 12px;
      pointer-events: none;
    }

    /* ── Orbit dots ── */
    .aura-anim-logo-orbit {
      position: absolute;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: rgba(167,139,250,0.7);
      top: 50%;
      left: 50%;
      margin: -2.5px 0 0 -2.5px;
      animation: auraLogoOrbit 3s linear infinite;
      pointer-events: none;
      box-shadow: 0 0 6px rgba(167,139,250,0.5);
    }
    .aura-anim-logo-orbit-2 {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(196,181,253,0.5);
      top: 50%;
      left: 50%;
      margin: -2px 0 0 -2px;
      animation: auraLogoOrbit2 4s linear 1s infinite;
      pointer-events: none;
      box-shadow: 0 0 4px rgba(196,181,253,0.4);
    }
    .aura-anim-logo-orbit-3 {
      position: absolute;
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: rgba(221,214,254,0.4);
      top: 50%;
      left: 50%;
      margin: -1.5px 0 0 -1.5px;
      animation: auraLogoOrbit3 5s linear 2s infinite;
      pointer-events: none;
      box-shadow: 0 0 3px rgba(221,214,254,0.3);
    }

    /* ── Sparkle (4-pointed star shape) ── */
    .aura-sparkle {
      position: absolute;
      pointer-events: none;
      animation: auraSparkle var(--sparkle-dur, 2s) ease-in-out var(--sparkle-delay, 0s) infinite;
    }
    .aura-sparkle::before,
    .aura-sparkle::after {
      content: '';
      position: absolute;
      background: rgba(255,255,255,0.85);
      border-radius: 2px;
    }
    .aura-sparkle::before {
      width: 2px;
      height: var(--sparkle-size, 8px);
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .aura-sparkle::after {
      width: var(--sparkle-size, 8px);
      height: 2px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    /* ── Floating mini stars ── */
    .aura-float-star {
      position: absolute;
      pointer-events: none;
      border-radius: 50%;
      animation: auraSparkleFloat var(--float-dur, 3s) ease-out var(--float-delay, 0s) infinite;
    }

    /* ── Star cross glow behind logo ── */
    .aura-star-cross {
      position: absolute;
      inset: -12px;
      pointer-events: none;
      animation: auraStarCrossGlow 3s ease-in-out infinite;
    }
    .aura-star-cross::before,
    .aura-star-cross::after {
      content: '';
      position: absolute;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(167,139,250,0.25) 30%,
        rgba(167,139,250,0.4) 50%,
        rgba(167,139,250,0.25) 70%,
        transparent 100%
      );
    }
    .aura-star-cross::before {
      width: 100%;
      height: 2px;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
    .aura-star-cross::after {
      width: 2px;
      height: 100%;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
    }

    /* ── Explosion / click particles ── */
    .aura-logo-particle {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      animation: particleBurst 0.9s ease-out forwards;
    }
    .aura-logo-shockwave {
      position: absolute;
      border-radius: 50%;
      border: 3px solid rgba(139,92,246,0.6);
      pointer-events: none;
      animation: shockwave 0.6s ease-out forwards;
    }
    .aura-logo-star-trail {
      position: absolute;
      pointer-events: none;
      animation: starTrail 0.7s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
  stylesInjected = true;
}

/* ─────────── Types ─────────── */
interface AuraLogoProps {
  size?: number;
  onClick?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
}

interface StarTrail {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
}

/* ─────────── Sparkle positions (static, deterministic) ─────────── */
const SPARKLE_POSITIONS = [
  { top: -8, left: 12, size: 6, dur: "2.2s", delay: "0s" },
  { top: 6, left: -10, size: 5, dur: "1.8s", delay: "0.6s" },
  { top: -4, left: -6, size: 7, dur: "2.5s", delay: "1.2s" },
  { top: -12, left: -2, size: 4, dur: "1.6s", delay: "0.3s" },
  { top: 8, left: -14, size: 5, dur: "2s", delay: "0.9s" },
  { top: -10, left: 6, size: 6, dur: "2.8s", delay: "1.5s" },
];

const FLOAT_STAR_POSITIONS = [
  { top: -16, left: 20, size: 3, dur: "3s", delay: "0s", color: "rgba(196,181,253,0.6)" },
  { top: 22, left: -18, size: 2.5, dur: "2.5s", delay: "0.8s", color: "rgba(167,139,250,0.5)" },
  { top: -14, left: -12, size: 2, dur: "3.5s", delay: "1.6s", color: "rgba(221,214,254,0.4)" },
  { top: 18, left: 22, size: 3, dur: "2.8s", delay: "0.4s", color: "rgba(196,181,253,0.55)" },
  { top: -6, left: -20, size: 2, dur: "3.2s", delay: "1.2s", color: "rgba(167,139,250,0.45)" },
];

/* ─────────── Component ─────────── */
export default function AuraLogo({ size = 44, onClick }: AuraLogoProps): JSX.Element {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [starTrails, setStarTrails] = useState<StarTrail[]>([]);
  const [exploding, setExploding] = useState(false);

  useEffect(() => {
    ensureStyles();
  }, []);

  const triggerExplosion = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const colors = [
      "#8B5CF6", "#A78BFA", "#C4B5FD", "#6B46C1",
      "#DDD6FE", "#E9D5FF", "#7C3AED", "#A855F7",
      "#ffffff", "#f0e6ff", "#c084fc", "#7dd3fc",
    ];

    // Main burst particles
    const mainP: Particle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: cx,
      y: cy,
      color: colors[i % colors.length],
      size: Math.random() * 10 + 4,
      angle: (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.3,
      speed: Math.random() * 80 + 45,
    }));

    // Star trail particles (smaller, faster)
    const trails: StarTrail[] = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: cx,
      y: cy,
      color: colors[(i + 4) % colors.length],
      size: Math.random() * 6 + 2,
      angle: (Math.PI * 2 * i) / 10 + (Math.random() - 0.5) * 0.5,
      speed: Math.random() * 60 + 30,
    }));

    setParticles(mainP);
    setStarTrails(trails);
    setExploding(true);

    setTimeout(() => {
      setParticles([]);
      setStarTrails([]);
      setExploding(false);
      if (onClick) onClick();
    }, 800);
  }, [onClick]);

  const fontSize = Math.round(size * 0.55);

  return (
    <>
      <button
        ref={btnRef}
        className="aura-anim-logo-btn"
        onClick={onClick ? triggerExplosion : undefined}
        style={{
          width: size,
          height: size,
          borderRadius: "12px",
          border: "none",
          background: exploding
            ? "rgba(139,92,246,0.35)"
            : "linear-gradient(135deg, #6B46C1, #8B5CF6)",
          color: "#fff",
          cursor: onClick ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          outline: "none",
          flexShrink: 0,
          padding: 0,
        }}
      >
        {/* Star cross glow behind everything */}
        {!exploding && <span className="aura-star-cross" />}

        {/* Ring pulses */}
        {!exploding && <span className="aura-anim-logo-ring" />}
        {!exploding && <span className="aura-anim-logo-ring-2" />}
        {!exploding && <span className="aura-anim-logo-ring-3" />}

        {/* Shimmer sweep */}
        <span className="aura-anim-logo-shimmer" />

        {/* Orbiting dots */}
        {!exploding && <span className="aura-anim-logo-orbit" />}
        {!exploding && <span className="aura-anim-logo-orbit-2" />}
        {!exploding && <span className="aura-anim-logo-orbit-3" />}

        {/* Sparkle crosses */}
        {!exploding && SPARKLE_POSITIONS.map((sp, i) => (
          <span
            key={`sparkle-${i}`}
            className="aura-sparkle"
            style={{
              top: sp.top,
              left: sp.left,
              "--sparkle-size": `${sp.size}px`,
              "--sparkle-dur": sp.dur,
              "--sparkle-delay": sp.delay,
            } as React.CSSProperties}
          />
        ))}

        {/* Floating mini stars */}
        {!exploding && FLOAT_STAR_POSITIONS.map((fs, i) => (
          <span
            key={`float-${i}`}
            className="aura-float-star"
            style={{
              top: fs.top,
              left: fs.left,
              width: fs.size,
              height: fs.size,
              background: fs.color,
              boxShadow: `0 0 ${fs.size + 2}px ${fs.color}`,
              "--float-dur": fs.dur,
              "--float-delay": fs.delay,
            } as React.CSSProperties}
          />
        ))}

        {/* Logo image */}
        <img
          src={logoImg}
          alt="AURA AI"
          style={{
            width: fontSize + 6,
            height: fontSize + 4,
            objectFit: "contain",
            position: "relative",
            zIndex: 1,
          }}
        />
      </button>

      {/* ── Explosion particles + shockwave + star trails ── */}
      {particles.length > 0 && (
        <>
          <div
            className="aura-logo-shockwave"
            style={{
              position: "fixed",
              left: btnRef.current
                ? btnRef.current.getBoundingClientRect().left + size / 2 - size / 2
                : 20,
              top: btnRef.current
                ? btnRef.current.getBoundingClientRect().top + size / 2 - size / 2
                : 20,
              width: size,
              height: size,
              zIndex: 10002,
              pointerEvents: "none",
            }}
          />
          {particles.map((p) => (
            <div
              key={p.id}
              className="aura-logo-particle"
              style={{
                position: "fixed",
                left: p.x - p.size / 2,
                top: p.y - p.size / 2,
                width: p.size,
                height: p.size,
                background: p.color,
                transform: `translate(${Math.cos(p.angle) * p.speed}px, ${Math.sin(p.angle) * p.speed}px)`,
                zIndex: 10002,
                pointerEvents: "none",
                boxShadow: `0 0 ${p.size}px ${p.color}88`,
              }}
            />
          ))}
          {starTrails.map((t) => (
            <div
              key={`trail-${t.id}`}
              className="aura-logo-star-trail"
              style={{
                position: "fixed",
                left: t.x - t.size / 2,
                top: t.y - t.size / 2,
                width: t.size,
                height: t.size,
                borderRadius: "50%",
                background: t.color,
                transform: `translate(${Math.cos(t.angle) * t.speed}px, ${Math.sin(t.angle) * t.speed}px)`,
                zIndex: 10002,
                pointerEvents: "none",
                boxShadow: `0 0 ${t.size + 4}px ${t.color}`,
              }}
            />
          ))}
        </>
      )}
    </>
  );
}
