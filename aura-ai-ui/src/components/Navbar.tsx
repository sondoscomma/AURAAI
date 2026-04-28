// Navbar.tsx
import { Link, NavLink } from "react-router-dom";
import GradientButton from ".//GradientButton";
import type { JSX } from "react";
import logo1 from "../assets/image/iconeAURA.png";

export default function Navbar(): JSX.Element {
  const linkClass =
    "font-display text-sm text-white/80 hover:text-white transition";

  return (
    <header className="w-full border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="mx-auto flex h-[73px] max-w-[1440px] items-center justify-between px-[104px] py-[16px]">
        {/* Left */}
        <Link to="/" className="flex items-center gap-3">
          {/* 60 x 60 */}
          <div className="h-[60px] w-[60px] rounded-[8px] bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
            {/* 60 x 60 icon placeholder */}
            <span className="text-[60px] leading-none text-white"><img src={logo1} alt="Aura Ai Logo" style={{ width: "60px", height: "55px" }} /></span>
          </div>

          <span className="font-display text-[24px] font-bold leading-[32px] text-white">
            Aura Ai
          </span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-10">
          <nav className="flex items-center gap-10">
            <NavLink to="/" className={linkClass}>Home</NavLink>
            <NavLink to="/Pricing" className={linkClass}>Pricing</NavLink>
            <NavLink to="/contact" className={linkClass}>Contact</NavLink>
          </nav>

          <Link to="/signup">
            <GradientButton>Get Started</GradientButton>
          </Link>
        </div>
      </div>
    </header>
  );
}