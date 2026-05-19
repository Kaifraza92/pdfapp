import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // Wait for 2.5 seconds before transitioning out
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-brand-emerald"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-gold/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center relative z-10"
      >
        <div className="w-32 h-32 md:w-40 md:h-40 mb-8 rounded-3xl overflow-hidden shadow-2xl relative bg-brand-emerald-light/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
          <img
            src="/assets/logo.png"
            alt="AL Zuhra Academy Logo"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide image and show fallback icon if logo.png not found
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement?.classList.add("fallback-icon");
            }}
          />
          <style>{`
            .fallback-icon::after {
              content: 'AZ';
              font-size: 3rem;
              font-weight: bold;
              color: white;
              font-family: 'Amiri', serif;
            }
          `}</style>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-brand-cream font-arabic mb-3 tracking-wide drop-shadow-md text-center">
          AL Zuhra Academy
        </h1>
        <p className="text-brand-gold font-semibold tracking-[0.3em] uppercase text-xs md:text-sm drop-shadow-sm">
          Premium Reader
        </p>

        <motion.div
          className="mt-12 flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-brand-gold rounded-full"
              animate={{
                y: [0, -6, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
