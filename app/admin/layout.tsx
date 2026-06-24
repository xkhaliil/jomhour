export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="stadium-bg min-h-screen">
      {/* Same dark-mode preference key the fan live view writes to, so an
          admin who toggled it there gets a consistent panel; otherwise
          falls back to system preference. No toggle control here — the
          spec scopes the manual switch to the fan live view only. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('jomhour-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
        }}
      />
      <div className="border-b border-black/5 px-4 py-3 dark:border-white/10">
        <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          جمهور <span className="font-normal text-zinc-400">Admin</span>
        </span>
      </div>
      {children}
    </div>
  );
}
