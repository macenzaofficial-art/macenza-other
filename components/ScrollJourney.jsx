import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';

const ScrollJourney = ({ title, steps }) => {
  const containerRef = useRef(null);

  // Track the scroll position of the section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth the scroll progress for a buttery-smooth animation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    restDelta: 0.001
  });

  const totalSteps = steps.length;

  // Calculate the horizontal translation of the steps wrapper.
  // We want the first step to be on screen initially, and the last step at the end.
  // The percentage to translate is (totalSteps - 1) * (some amount).
  // A percentage of around 60-70% works beautifully depending on screen size.
  // Let's use a responsive transform:
  const x = useTransform(smoothProgress, [0, 1], ["0%", `-${(totalSteps - 1) * 13.5}%`]);

  // Light beam width (percentage of the timeline line)
  const beamWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="relative h-[250vh] w-full bg-white select-none">
      {/* Sticky container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden px-4 md:px-12 lg:px-24">
        {/* Title */}
        <div className="max-w-4xl mb-12 md:mb-16">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-black">
            {title}
          </h2>
        </div>

        {/* Journey/Timeline Container */}
        <div className="relative w-full py-10">
          
          {/* Timeline Background Line */}
          <div className="absolute top-[34px] left-8 right-8 h-[2px] bg-black/10 z-0"></div>

          {/* Glowing Light Beam Progress Line */}
          <motion.div 
            style={{ width: beamWidth }}
            className="absolute top-[33px] left-8 h-[4px] bg-gradient-to-r from-primary to-sky-400 z-0 shadow-[0_0_15px_#2563eb,0_0_30px_#38bdf8] rounded-full origin-left"
          />

          {/* Light Beam Head (the glowing dot at the tip of the beam) */}
          <motion.div
            style={{ 
              left: beamWidth,
              x: "-50%"
            }}
            className="absolute top-[31px] w-[8px] h-[8px] bg-white rounded-full z-10 shadow-[0_0_10px_#fff,0_0_20px_#2563eb,0_0_30px_#38bdf8]"
          />

          {/* Translating Steps Wrapper */}
          <motion.div 
            style={{ x }} 
            className="flex gap-16 md:gap-24 items-start w-max z-10 relative"
          >
            {steps.map((step, i) => {
              // Convert string steps to objects
              const isString = typeof step === 'string';
              const stepTitle = isString ? step : step.title;
              const stepDesc = isString ? null : step.desc;

              // Calculate active state threshold
              // If scroll progress is past the step's relative position, it lights up
              const stepThreshold = i / (totalSteps - 1);
              
              // We'll use Framer Motion custom hooks to check if active
              return (
                <StepNode
                  key={i}
                  index={i}
                  title={stepTitle}
                  desc={stepDesc}
                  progress={smoothProgress}
                  threshold={stepThreshold}
                />
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Sub-component to manage active state styling dynamically
const StepNode = ({ index, title, desc, progress, threshold }) => {
  const [isActive, setIsActive] = React.useState(false);

  useMotionValueEvent(progress, "change", (latest) => {
    // Light up step slightly early (e.g. 0.02 tolerance) so it activates when the beam hits it
    setIsActive(latest >= threshold - 0.02);
  });

  return (
    <div className="w-[280px] md:w-[320px] flex-shrink-0 flex flex-col items-start group">
      {/* Node Circle */}
      <motion.div 
        animate={{ 
          scale: isActive ? 1.15 : 1,
          backgroundColor: isActive ? '#2563eb' : '#e5e7eb',
          color: isActive ? '#ffffff' : '#9ca3af',
          boxShadow: isActive 
            ? '0 0 20px rgba(37,99,235,0.6), 0 0 40px rgba(37,99,235,0.3)' 
            : '0 0 0px rgba(0,0,0,0)'
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg z-10 select-none relative"
      >
        {index + 1}
        {/* Pulsing light ring behind active node */}
        {isActive && (
          <span className="absolute inset-0 rounded-full animate-ping bg-primary/30 opacity-75 pointer-events-none" />
        )}
      </motion.div>

      {/* Step Info */}
      <motion.div
        animate={{
          opacity: isActive ? 1 : 0.4,
          y: isActive ? 0 : 5
        }}
        transition={{ duration: 0.5 }}
        className="mt-6 text-left"
      >
        <h4 className="text-xl font-bold mb-3 text-black group-hover:text-primary transition-colors duration-300">
          {title}
        </h4>
        {desc && (
          <p className="text-sm text-black/60 leading-relaxed font-light">
            {desc}
          </p>
        )}
        <div className={`h-[2px] mt-4 w-12 bg-primary/20 group-hover:w-full transition-all duration-700 ${isActive ? 'bg-primary/50 w-24' : ''}`}></div>
      </motion.div>
    </div>
  );
};

export default ScrollJourney;
