'use client';

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const TrueFocus = ({
  sentence = "True Focus",
  manualMode = false,
  blurAmount = 5,
  borderColor = "blue",
  glowColor = "rgba(255, 165, 0)",
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
  cornerSize =12, // tamaño de las esquinas en px
  padding = 9, // cuánto agrandar el cuadro (px)
}) => {
  const words = sentence.split(" ");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActiveIndex, setLastActiveIndex] = useState(null);
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Ciclo automático para cambiar la palabra activa
  useEffect(() => {
    if (!manualMode) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
      }, (animationDuration + pauseBetweenAnimations) * 1000);

      return () => clearInterval(interval);
    }
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

  // Actualiza la posición y tamaño del borde animado
  useEffect(() => {
    if (currentIndex === null || currentIndex === -1) return;
    if (!wordRefs.current[currentIndex] || !containerRef.current) return;

    const parentRect = containerRef.current.getBoundingClientRect();
    const activeRect = wordRefs.current[currentIndex].getBoundingClientRect();

    setFocusRect({
      x: activeRect.left - parentRect.left - padding,
      y: activeRect.top - parentRect.top - padding,
      width: activeRect.width + padding * 2,
      height: activeRect.height + padding * 2,
    });
  }, [currentIndex, words.length, padding]);

  // Control manual con mouse para cambiar palabra activa
  const handleMouseEnter = (index) => {
    if (manualMode) {
      setLastActiveIndex(index);
      setCurrentIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (manualMode) {
      setCurrentIndex(lastActiveIndex);
    }
  };

  return (
    <div
      className="relative flex gap-4 justify-center items-center flex-wrap"
      ref={containerRef}
    >
      {words.map((word, index) => {
        const isActive = index === currentIndex;
        return (
          <span
            key={index}
            ref={(el) => (wordRefs.current[index] = el)}
            className="relative text-3xl font-black cursor-pointer"
            style={{
              filter: isActive ? `blur(0px)` : `blur(${blurAmount}px)`,
              transition: `filter ${animationDuration}s ease`,
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {word}
          </span>
        );
      })}

      {/* Borde animado solo con esquinas */}
      <motion.div
        className="absolute top-0 left-0 pointer-events-none box-border border-0"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: currentIndex >= 0 ? 1 : 0,
        }}
        transition={{
          duration: animationDuration,
        }}
        style={{
          position: "absolute",
          pointerEvents: "none",
        }}
      >
        {/* Esquinas */}
        <span
          className="absolute border-[3px] rounded-md"
          style={{
            width: cornerSize,
            height: cornerSize,
            top: -cornerSize / 2,
            left: -cornerSize / 2,
            borderTopColor: borderColor,
            borderLeftColor: borderColor,
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
            filter: `drop-shadow(0 0 6px ${glowColor})`,
          }}
        />
        <span
          className="absolute border-[3px] rounded-md"
          style={{
            width: cornerSize,
            height: cornerSize,
            top: -cornerSize / 2,
            right: -cornerSize / 2,
            borderTopColor: borderColor,
            borderRightColor: borderColor,
            borderLeftColor: "transparent",
            borderBottomColor: "transparent",
            filter: `drop-shadow(0 0 6px ${glowColor})`,
          }}
        />
        <span
          className="absolute border-[3px] rounded-md"
          style={{
            width: cornerSize,
            height: cornerSize,
            bottom: -cornerSize / 2,
            left: -cornerSize / 2,
            borderBottomColor: borderColor,
            borderLeftColor: borderColor,
            borderRightColor: "transparent",
            borderTopColor: "transparent",
            filter: `drop-shadow(0 0 6px ${glowColor})`,
          }}
        />
        <span
          className="absolute border-[3px] rounded-md"
          style={{
            width: cornerSize,
            height: cornerSize,
            bottom: -cornerSize / 2,
            right: -cornerSize / 2,
            borderBottomColor: borderColor,
            borderRightColor: borderColor,
            borderLeftColor: "transparent",
            borderTopColor: "transparent",
            filter: `drop-shadow(0 0 px ${glowColor})`,
          }}
        />
      </motion.div>
    </div>
  );
};

export default TrueFocus;
