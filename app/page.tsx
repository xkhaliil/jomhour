import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        جمهور <span className="text-zinc-400">— Jomhour</span>
      </h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Real-time, synchronized stadium chants. An admin triggers a chant; every
        fan&apos;s phone animates the lyrics in lockstep, with no audio
        broadcast between phones — just a shared clock.
      </p>
      <Link
        href="/admin"
        className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
      >
        Admin sign in
      </Link>
    </div>
  );
}
