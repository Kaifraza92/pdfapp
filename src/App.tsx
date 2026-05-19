import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import { Reader } from "./pages/Reader";
import { SplashScreen } from "./components/SplashScreen";
import { AnimatePresence } from "framer-motion";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        ) : null}
      </AnimatePresence>

      {!showSplash && (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/read/:id" element={<Reader />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
}
