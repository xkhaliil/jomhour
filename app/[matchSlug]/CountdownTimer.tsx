"use client";

import { useEffect, useState } from "react";

export default function CountdownTimer({ kickoffAt }: { kickoffAt: string }) {
  const target = new Date(kickoffAt).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = Math.max(0, target - now);

  if (remainingMs <= 0) {
    return <p className="text-2xl font-semibold">Kickoff! 🎉</p>;
  }

  const totalSec = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return (
    <div className="flex gap-4 text-center">
      <TimeBlock label="Days" value={days} />
      <TimeBlock label="Hours" value={hours} />
      <TimeBlock label="Min" value={minutes} />
      <TimeBlock label="Sec" value={seconds} />
    </div>
  );
}

function TimeBlock({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-3xl font-bold tabular-nums">{String(value).padStart(2, "0")}</p>
      <p className="text-xs uppercase text-zinc-500">{label}</p>
    </div>
  );
}
