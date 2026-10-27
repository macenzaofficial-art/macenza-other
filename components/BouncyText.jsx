import React from 'react';
import { motion } from 'framer-motion';

const BouncyText = ({ text, className = "" }) => {
  return (
    <span className={className}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ y: 0 }}
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            delay: i * 0.08,
            duration: 0.6,
            repeat: Infinity,
            repeatDelay: 2.2,
            ease: "easeInOut"
          }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
};

export default BouncyText;
