"use client";

import { useEffect, useState } from "react";

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "zoom" | "flash" | "done">("loading");

  useEffect(() => {
    const t = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          window.clearInterval(t);
          setPhase("zoom");
          window.setTimeout(() => setPhase("flash"), 1000);
          window.setTimeout(() => setPhase("done"), 1700);
          return 100;
        }
        return p + 0.75;
      });
    }, 30);

    return () => window.clearInterval(t);
  }, []);

  if (phase === "done") return null;

  return (
    <div className={`loader-wrapper ${phase}`}>
      <div className="avocado">
        <div className="fill" style={{ height: `${progress}%` }} />
        <div className="seed" />
      </div>
      <p className="loader-text">Benvenuti</p>
    </div>
  );
}
