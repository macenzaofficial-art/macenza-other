import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const AnimatedBeam = ({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  duration = 5,
  delay = 0,
  reverse = false,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#2563eb",
  gradientStopColor = "#38bdf8",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  className
}) => {
  const [pathD, setPathD] = useState("");
  const [svgId] = useState(() => `beam-grad-${Math.random().toString(36).substring(2, 9)}`);

  const updatePath = () => {
    if (fromRef?.current && toRef?.current && containerRef?.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const fromRect = fromRef.current.getBoundingClientRect();
      const toRect = toRef.current.getBoundingClientRect();

      const x1 = fromRect.left - containerRect.left + fromRect.width / 2 + startXOffset;
      const y1 = fromRect.top - containerRect.top + fromRect.height / 2 + startYOffset;
      const x2 = toRect.left - containerRect.left + toRect.width / 2 + endXOffset;
      const y2 = toRect.top - containerRect.top + toRect.height / 2 + endYOffset;

      // Handle curvature
      let d = "";
      if (curvature !== 0) {
        // Curve: Control point calculated by shifting from midpoint
        const cx1 = x1 + (x2 - x1) / 2;
        const cy1 = y1 + (y2 - y1) / 2 + curvature;
        d = `M ${x1} ${y1} Q ${cx1} ${cy1} ${x2} ${y2}`;
      } else {
        d = `M ${x1} ${y1} L ${x2} ${y2}`;
      }
      setPathD(d);
    }
  };

  useEffect(() => {
    updatePath();
    
    // Setup ResizeObserver for responsive redraws
    const observer = new ResizeObserver(() => {
      updatePath();
    });
    
    if (containerRef?.current) observer.observe(containerRef.current);
    if (fromRef?.current) observer.observe(fromRef.current);
    if (toRef?.current) observer.observe(toRef.current);

    window.addEventListener("resize", updatePath);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePath);
    };
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset]);

  return (
    <svg
      className={`absolute inset-0 pointer-events-none w-full h-full z-0 ${className || ""}`}
    >
      <defs>
        <linearGradient id={svgId} gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity={0} />
          <stop offset="5%" stopColor={gradientStartColor} stopOpacity={1} />
          <stop offset="95%" stopColor={gradientStopColor} stopOpacity={1} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Background static path */}
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        fill="none"
      />
      {/* Animated path */}
      <motion.path
        d={pathD}
        stroke={`url(#${svgId})`}
        strokeWidth={pathWidth + 1}
        fill="none"
        initial={{ strokeDasharray: "10 200", strokeDashoffset: reverse ? 0 : 200 }}
        animate={{ strokeDashoffset: reverse ? 200 : 0 }}
        transition={{
          repeat: Infinity,
          duration: duration,
          delay: delay,
          ease: "linear"
        }}
      />
    </svg>
  );
};
