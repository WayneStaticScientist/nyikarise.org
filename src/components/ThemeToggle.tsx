"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@heroui/react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button isIconOnly variant="ghost" className="rounded-xl border border-divider">
        <span className="w-5 h-5" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      isIconOnly
      variant="ghost"
      className="text-foreground-500 hover:text-primary relative rounded-xl bg-content2/50 border border-divider overflow-hidden"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <div className={`relative flex items-center justify-center transition-transform duration-500 ${isDark ? 'rotate-0' : '-rotate-90'}`}>
        <Sun className={`w-5 h-5 transition-all duration-500 absolute ${isDark ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`} />
        <Moon className={`w-5 h-5 transition-all duration-500 ${isDark ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
      </div>
    </Button>
  );
}
