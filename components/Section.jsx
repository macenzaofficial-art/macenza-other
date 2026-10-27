import React from 'react';

const Section = ({ title, subtitle, children, id, className = "" }) => {
  return (
    <section id={id} className={`py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white ${className}`}>
      <div className="container mx-auto max-w-7xl">
        {(title || subtitle) && (
          <div className="mb-8 sm:mb-12 md:mb-14 max-w-3xl">
            {title && (
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-dark mb-3 sm:mb-4 md:mb-6 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-base sm:text-lg md:text-xl text-dark/60 font-light leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
