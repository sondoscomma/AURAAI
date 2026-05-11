// Navbar.tsx
import { Link, NavLink } from "react-router-dom";
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
          <div className="h-[60px] w-[60px] rounded-[8px] bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
            <span className="text-[60px] leading-none text-white">
              <img src={logo1} alt="Aura Ai Logo" style={{ width: "60px", height: "55px" }} />
            </span>
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
            <button
              className="font-bold text-white text-sm"
              style={{
                background: "linear-gradient(135deg, #532C86 0%, #2B144C 100%)",
                border: "1px solid #00BFFF",
                borderRadius: "8px",
                padding: "8px 24px",
                height: "40px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2), 0 0 10px rgba(0, 191, 255, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "inset 0 2px 4px rgba(0,0,0,0.2), 0 0 15px rgba(0, 191, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "inset 0 2px 4px rgba(0,0,0,0.2), 0 0 10px rgba(0, 191, 255, 0.3)";
              }}
            >
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}