export default function CountdownRing({
  progress,
  size = 72,
}: {
  /** 0..1, fraction of the chant elapsed so far. */
  progress: number;
  size?: number;
}) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * Math.min(1, Math.max(0, progress));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        fill="none"
        className="stroke-black/10 dark:stroke-white/10"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        // progress depends on Date.now(); SSR vs. hydration differ by a few
        // hundred ms and self-correct on the next animation frame.
        suppressHydrationWarning
        className="stroke-emerald-500 transition-[stroke-dashoffset] duration-100 ease-linear"
      />
    </svg>
  );
}
