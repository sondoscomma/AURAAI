import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import type { JSX } from "react";

export default function PublicLayout(): JSX.Element {
  return (
    <div className="min-h-screen text-white">
      {/* background */}
      <div className="fixed inset-0 -z-10 bg-neutral-950" />
      <div className="fixed inset-0 -z-10 opacity-70 [background:radial-gradient(900px_500px_at_20%_65%,rgba(139,92,246,0.35),transparent_60%),radial-gradient(900px_500px_at_75%_75%,rgba(168,85,247,0.28),transparent_60%)]" />

      <Navbar />
      <Outlet />
    </div>
  );
}
