import type { JSX } from "react";
import { NavLink, Outlet } from "react-router-dom";

const linkBase =
  "rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-white";
const linkActive = "bg-neutral-900 text-white";

export default function AppLayout(): JSX.Element {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-brand-600" />
            <div className="leading-tight">
              <div className="font-semibold">Aura AI</div>
              <div className="text-xs text-neutral-400">Workspace</div>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <NavLink
              to="/app"
              end
              className={({ isActive }: { isActive: boolean }) =>
                `${linkBase} ${isActive ? linkActive : ""}`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/app/chat"
              className={({ isActive }: { isActive: boolean }) =>
                `${linkBase} ${isActive ? linkActive : ""}`
              }
            >
              Chat
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
