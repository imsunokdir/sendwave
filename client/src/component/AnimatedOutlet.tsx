import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";

const routeOrder: Record<string, number> = {
  "/": 0,
  "/hub": 1,
  "/settings": 2,
  "/profile": 3,
};

export default function AnimatedOutlet() {
  const location = useLocation();
  const prevIndex = useRef(routeOrder[location.pathname] ?? 0);

  const currentIndex = routeOrder[location.pathname] ?? 0;
  const direction = currentIndex > prevIndex.current ? 1 : -1;

  prevIndex.current = currentIndex;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ x: direction === 1 ? 100 : -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: direction === 1 ? -100 : 100, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="h-full"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
