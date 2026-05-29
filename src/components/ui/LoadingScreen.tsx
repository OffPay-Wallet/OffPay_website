"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SpecialText } from "@/components/special-text";
import { useLoading } from "@/context/LoadingContext";

const LOADING_DURATION = 2400;

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [textReady, setTextReady] = useState(false);
  const { onLoadingComplete } = useLoading();

  useEffect(() => {
    // Small delay before starting text animation
    const textTimer = setTimeout(() => setTextReady(true), 200);

    // Dismiss after animation completes
    const dismissTimer = setTimeout(() => {
      setVisible(false);
      // Re-enable scroll
      document.body.style.overflow = "";
      // Notify the app that loading is done
      onLoadingComplete();
    }, LOADING_DURATION);

    // Lock scroll while loading
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(textTimer);
      clearTimeout(dismissTimer);
      document.body.style.overflow = "";
    };
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="loading-screen"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{
            duration: 0.7,
            ease: [0.76, 0, 0.24, 1],
          }}
        >
          <div className="loading-screen__content">
            <div className="loading-screen__wordmark">
              {textReady && (
                <SpecialText
                  speed={30}
                  className="loading-screen__text"
                >
                  OffPay
                </SpecialText>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
