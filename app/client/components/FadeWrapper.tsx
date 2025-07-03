"use client";
import { useEffect, useState } from "react";

export default function FadeWrapper({ children }: { children: React.ReactNode }) {
  const [fade, setFade] = useState(false);
  useEffect(() => {
    setFade(true);
  }, []);
  return (
    <div className={`transition-opacity duration-400 ${fade ? 'opacity-100' : 'opacity-0'}`}>
      {children}
    </div>
  );
} 