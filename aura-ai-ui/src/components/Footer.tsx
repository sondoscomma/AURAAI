export default function Footer() {
  return (
    <footer className="border-t border-neutral-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-neutral-400">© {new Date().getFullYear()} Aura AI</div>
        <div className="text-sm text-neutral-400">Built with MERN (UI first)</div>
      </div>
    </footer>
  );
}
