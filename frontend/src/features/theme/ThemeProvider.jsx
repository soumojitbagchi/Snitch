import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "../redux/auth.slice";
import { updateThemePreference } from "../auth/services/auth.api";
import { ThemeContext } from "./theme.context";

const STORAGE_KEY = "snitch:theme";
const MODES = ["light", "dark"];

function readStoredMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return MODES.includes(stored) ? stored : "light";
  } catch {
    return "light";
  }
}

function applyMode(mode) {
  const dark = mode === "dark";
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  const colorScheme = document.querySelector('meta[name="color-scheme"]');
  if (colorScheme) colorScheme.content = dark ? "dark" : "light";
}

function waveFrames({ x, y }) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const originX = Math.max(0, Math.min(x, width));
  const originY = Math.max(0, Math.min(y, height));

  return [0, 0.08, 0.18, 0.3, 0.43, 0.57, 0.7, 0.82, 0.92, 1].map((progress) => {
    const spread = Math.sin(Math.min(1, progress * 2.7) * Math.PI / 2);
    const left = originX * (1 - spread);
    const right = originX + (width - originX) * spread;
    const top = originY * (1 - spread);
    const front = originY + (height + 48 - originY) * progress * progress * (3 - 2 * progress);
    const curve = 64 * Math.sin(Math.PI * progress);
    const points = [`${left}px ${top}px`, `${right}px ${top}px`];

    for (let index = 24; index >= 0; index--) {
      const fraction = index / 24;
      const px = left + (right - left) * fraction;
      const py = front + curve * Math.sin(fraction * Math.PI);
      points.push(`${px}px ${py}px`);
    }

    return { clipPath: `polygon(${points.join(", ")})`, offset: progress };
  });
}

export default function ThemeProvider({ children }) {
  const { user, loading } = useSelector(selectAuth);
  const [mode, setMode] = useState(readStoredMode);
  const modeRef = useRef(mode);
  const userIdRef = useRef(null);
  const serverThemeRef = useRef(null);
  const timerRef = useRef(null);
  const pendingRef = useRef(null);
  const savingRef = useRef(null);
  const preAuthSelectionRef = useRef(null);
  const wipeRef = useRef(null);
  const wipeVersionRef = useRef(0);

  const changeMode = useCallback((nextMode) => {
    if (!MODES.includes(nextMode)) return;
    modeRef.current = nextMode;
    setMode(nextMode);
    applyMode(nextMode);
    try {
      localStorage.setItem(STORAGE_KEY, nextMode);
    } catch {
      // Theme remains active for this tab when storage is unavailable.
    }
  }, []);

  const flushPending = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    if (savingRef.current) {
      await savingRef.current;
      if (!pendingRef.current) return;
    }
    savingRef.current = (async () => {
      while (pendingRef.current?.userId === userIdRef.current) {
        const pending = pendingRef.current;
        pendingRef.current = null;
        try {
          await updateThemePreference(pending.mode);
        } catch {
          if (pending.userId === userIdRef.current && !pendingRef.current) pendingRef.current = pending;
          break;
        }
      }
    })();
    try {
      await savingRef.current;
    } finally {
      savingRef.current = null;
    }
  }, []);

  const selectMode = useCallback((nextMode, origin) => {
    if (!MODES.includes(nextMode) || modeRef.current === nextMode) return;
    const version = ++wipeVersionRef.current;
    const previous = wipeRef.current;
    wipeRef.current = null;
    previous?.skipTransition();
    modeRef.current = nextMode;

    if (origin && document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.add("theme-wipe");
      try {
        const transition = document.startViewTransition(() => {
          if (version === wipeVersionRef.current) flushSync(() => changeMode(nextMode));
        });
        wipeRef.current = transition;
        transition.ready.then(() => {
          if (version !== wipeVersionRef.current) return;
          try {
            document.documentElement.animate(waveFrames(origin), {
              duration: 480,
              easing: "linear",
              pseudoElement: "::view-transition-new(root)",
            });
          } catch {
            transition.skipTransition();
          }
        }, () => {
          if (version === wipeVersionRef.current) changeMode(nextMode);
        });
        const finish = () => {
          if (wipeRef.current !== transition) return;
          wipeRef.current = null;
          document.documentElement.classList.remove("theme-wipe");
        };
        transition.finished.then(finish, () => {
          if (version === wipeVersionRef.current) changeMode(nextMode);
          finish();
        });
      } catch {
        document.documentElement.classList.remove("theme-wipe");
        changeMode(nextMode);
      }
    } else {
      document.documentElement.classList.remove("theme-wipe");
      changeMode(nextMode);
    }

    if (userIdRef.current) {
      pendingRef.current = { userId: userIdRef.current, mode: nextMode };
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flushPending, 500);
    } else {
      preAuthSelectionRef.current = nextMode;
    }
  }, [changeMode, flushPending]);

  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  useEffect(() => {
    if (loading && !user) preAuthSelectionRef.current = null;
  }, [loading, user]);

  useEffect(() => {
    let cancelled = false;
    const userId = user?.id ? String(user.id) : null;
    const serverMode = user?.preferences?.theme === "system" ? "light" : user?.preferences?.theme;
    const applyServerMode = (nextMode) => {
      queueMicrotask(() => {
        if (!cancelled && userIdRef.current === userId) changeMode(nextMode);
      });
    };
    if (userId !== userIdRef.current) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      pendingRef.current = null;
      userIdRef.current = userId;
      serverThemeRef.current = MODES.includes(serverMode) ? serverMode : null;
      if (userId) {
        const selectedMode = preAuthSelectionRef.current;
        preAuthSelectionRef.current = null;
        if (selectedMode && selectedMode !== serverMode) {
          pendingRef.current = { userId, mode: selectedMode };
          timerRef.current = setTimeout(flushPending, 500);
        } else if (MODES.includes(serverMode)) {
          applyServerMode(serverMode);
        }
      } else {
        preAuthSelectionRef.current = null;
        applyServerMode(readStoredMode());
      }
    } else if (userId && MODES.includes(serverMode) && serverMode !== serverThemeRef.current && !pendingRef.current && !savingRef.current) {
      serverThemeRef.current = serverMode;
      applyServerMode(serverMode);
    }
    return () => { cancelled = true; };
  }, [user?.id, user?.preferences?.theme, changeMode, flushPending]);

  useEffect(() => {
    window.addEventListener("online", flushPending);
    return () => {
      window.removeEventListener("online", flushPending);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [flushPending]);

  const cycleMode = (origin) => selectMode(MODES[(MODES.indexOf(modeRef.current) + 1) % MODES.length], origin);

  return (
    <ThemeContext.Provider value={{ mode, selectMode, cycleMode, flushPending }}>
      {children}
    </ThemeContext.Provider>
  );
}
