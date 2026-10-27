import * as React from 'react';
import { motion } from 'framer-motion';

export function TestimonialCard({ handleShuffle, testimonial, position, id, author, avatar }) {
  const dragRef = React.useRef(0);
  const isFront = position === "front";

  // Use either the provided custom avatar or fall back to pravatar.cc
  const avatarUrl = avatar || `https://i.pravatar.cc/128?img=${id}`;

  return (
    <motion.div
      style={{
        zIndex: position === "front" ? "2" : position === "middle" ? "1" : "0"
      }}
      animate={{
        rotate: position === "front" ? "-4deg" : position === "middle" ? "0deg" : "4deg",
        x: position === "front" ? "0%" : position === "middle" ? "10%" : "20%"
      }}
      drag={true}
      dragElastic={0.35}
      dragListener={isFront}
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onDragStart={(e) => {
        dragRef.current = e.clientX;
      }}
      onDragEnd={(e) => {
        if (dragRef.current - e.clientX > 120) {
          handleShuffle();
        }
        dragRef.current = 0;
      }}
      transition={{ duration: 0.35 }}
      className={`absolute left-0 top-0 grid h-[380px] sm:h-[420px] md:h-[450px] w-[260px] min-[360px]:w-[280px] min-[400px]:w-[310px] sm:w-[330px] md:w-[350px] select-none place-content-center space-y-4 sm:space-y-6 rounded-3xl border border-black/10 bg-white/90 p-5 sm:p-7 md:p-8 shadow-xl backdrop-blur-md ${
        isFront ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <img
        src={avatarUrl}
        alt={`Avatar of ${author}`}
        className="pointer-events-none mx-auto h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-full border border-black/10 bg-slate-100 object-cover shadow-sm"
      />
      <span className="text-center text-sm sm:text-base md:text-lg italic text-black/70 leading-relaxed line-clamp-4 sm:line-clamp-none">
        "{testimonial}"
      </span>
      <div className="text-center flex flex-col gap-0.5 sm:gap-1">
        <span className="text-xs sm:text-sm font-bold text-primary">{author}</span>
      </div>
    </motion.div>
  );
}
