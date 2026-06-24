import ThemeToggle from "./ThemeToggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="stadium-bg min-h-screen text-black dark:text-zinc-50">
      {/* Same dark-mode preference key the fan live view's toggle writes
          to, so the two surfaces stay in sync; falls back to system
          preference when nothing's been chosen yet. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('jomhour-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
        }}
      />
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/10">
        <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          جمهور <span className="font-normal text-zinc-400">Admin</span>
        </span>
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
