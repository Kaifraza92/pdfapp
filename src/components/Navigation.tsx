import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Settings, BookOpen } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "framer-motion";

export function Navigation() {
  const location = useLocation();

  const links = [
    { to: "/", icon: Home, label: "Library" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-[var(--border-color)] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 relative",
                isActive
                  ? "text-brand-emerald dark:text-brand-emerald-light"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{link.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav_indicator"
                  className="absolute top-0 w-8 h-1 rounded-b-full bg-brand-emerald dark:bg-brand-emerald-light"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
