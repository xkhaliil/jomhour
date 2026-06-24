"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { NATIONAL_TEAMS } from "@/lib/national-teams";

/**
 * Searchable national-team picker with flags (flag-icons). The text input
 * itself is the form field — selecting a suggestion just fills it in, so no
 * hidden input or controlled form value is needed. Free text is still
 * accepted on submit; the list is a convenience, not a strict enum.
 */
export default function TeamSelect({
  name,
  label,
  defaultValue,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const [query, setQuery] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q
      ? NATIONAL_TEAMS.filter((t) => t.name.toLowerCase().includes(q))
      : NATIONAL_TEAMS;
    return pool.slice(0, 8);
  }, [query]);

  const selected = useMemo(
    () => NATIONAL_TEAMS.find((t) => t.name.toLowerCase() === query.trim().toLowerCase()),
    [query]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative space-y-1">
      <label className="block text-sm text-zinc-600 dark:text-zinc-400">{label}</label>
      <div className="relative">
        {selected && (
          <span
            className={`fi fi-${selected.code} pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-sm`}
            aria-hidden
          />
        )}
        <input
          name={name}
          required={required}
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search national teams…"
          className={`w-full rounded-lg border border-black/10 bg-transparent py-2 pr-3 text-sm outline-none focus:border-red-500 dark:border-white/15 dark:focus:border-red-400 ${
            selected ? "pl-9" : "pl-3"
          }`}
        />
      </div>
      {open && matches.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-black/10 bg-white py-1 shadow-lg dark:border-white/15 dark:bg-zinc-900">
          {matches.map((team) => (
            <li key={team.code}>
              <button
                type="button"
                onClick={() => {
                  setQuery(team.name);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <span className={`fi fi-${team.code} rounded-sm`} aria-hidden />
                {team.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
