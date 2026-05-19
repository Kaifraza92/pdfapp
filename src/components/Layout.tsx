import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { useAppStore } from "../store";

export function Layout() {
  const { theme } = useAppStore();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] pb-20 selection:bg-brand-emerald/20 selection:text-brand-emerald">
      <main className="max-w-7xl mx-auto min-h-screen">
        <Outlet />
      </main>
      <Navigation />
    </div>
  );
}
