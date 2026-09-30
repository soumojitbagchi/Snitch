import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "./theme.context";

function ThemeIcon({ mode }) {
  if (mode === "dark") {
    return (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />
      </svg>
    );
  }
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { mode, cycleMode } = useTheme();
  const reduceMotion = useReducedMotion();
  const next = mode === "light" ? "dark" : "light";
  const label = `Theme: ${mode}. Switch to ${next}`;

  const handleClick = (event) => {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    cycleMode({ x: left + width / 2, y: top + height / 2 });
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={reduceMotion ? undefined : { scale: 1.07 }}
      whileTap={reduceMotion ? undefined : { scale: 0.88 }}
      transition={{ type: "spring", stiffness: 480, damping: 28 }}
      aria-label={label}
      aria-pressed={mode === "dark"}
      title={label}
      className="flex h-11 w-11 shrink-0 items-center justify-center text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-white dark:focus-visible:outline-white"
    >
      <ThemeIcon mode={mode} />
    </motion.button>
  );
}
