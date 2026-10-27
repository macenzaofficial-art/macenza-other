import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HeroSequence = ({ onLoadingComplete, children }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const frameCount = 240;
  const currentFrame = (index) => `/Images/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`;

  useEffect(() => {
    const loadedImages = [];
    let loadedCount = 0;

    const preloadImages = () => {
      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        img.onload = () => {
          loadedCount++;
          const progress = Math.floor((loadedCount / frameCount) * 100);
          setLoadingProgress(progress);
          
          if (loadedCount === frameCount) {
            setImages(loadedImages);
            if (onLoadingComplete) onLoadingComplete();
          }
        };
        loadedImages[i] = img;
      }
    };

    preloadImages();
  }, []);

  useEffect(() => {
    if (images.length !== frameCount) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set initial canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(airpods.frame);
    };

    const airpods = {
      frame: 0
    };

    const renderFrame = (index) => {
      if (!images[index]) return;
      
      const img = images[index];
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Calculate object-fit: contain logic
      const imgRatio = img.width / img.height;
      const canvasRatio = canvasWidth / canvasHeight;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (imgRatio > canvasRatio) {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
      } else {
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgRatio;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
      }

      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    };

    const anim = gsap.to(airpods, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
      },
      onUpdate: () => renderFrame(airpods.frame)
    });

    window.addEventListener('resize', setCanvasSize);
    setCanvasSize();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      if (anim.scrollTrigger) anim.scrollTrigger.kill();
      anim.kill();
    };
  }, [images]);

  return (
    <div ref={containerRef} className="relative h-[600vh] w-full bg-white">
      <div className="sticky top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="z-0 block w-full h-full object-contain" />
        
        {/* Loading Overlay */}
        {loadingProgress < 100 && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white">
            <div className="w-64 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="mt-4 text-xs font-bold tracking-widest text-dark uppercase opacity-50">
              Loading Macenza Intelligence {loadingProgress}%
            </p>
          </div>
        )}

        {/* Text Overlays - Passed from App.jsx */}
        {children}
      </div>
    </div>
  );
};

export default HeroSequence;
