import React, { useState, useEffect, useRef } from 'react';

interface GuideSpriteProps {
  onComplete: () => void;
  lines: string[];
  audioUrls?: (string | null)[];
}

export const GuideSprite: React.FC<GuideSpriteProps> = ({ onComplete, lines, audioUrls }) => {
  const [visible, setVisible] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Delay appearance by 0.6s
    const timer = setTimeout(() => {
      setVisible(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (visible && audioUrls && audioUrls[lineIndex]) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const audio = new Audio(audioUrls[lineIndex]!);
      audio.play().catch(e => console.error("Audio playback failed", e));
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [lineIndex, visible, audioUrls]);

  const handleNext = () => {
    if (lineIndex < lines.length - 1) {
      setLineIndex(lineIndex + 1);
    } else {
      // End of dialogue
      setIsFadingOut(true);
      setTimeout(() => {
        onComplete();
      }, 500); // Wait for fade out animation
    }
  };

  if (!visible && !isFadingOut) return null;

  return (
    <div 
      className={`absolute inset-0 z-[100] pointer-events-auto flex items-center justify-center p-4 md:p-8 transition-opacity duration-500 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Sprite Container */}
      <div className="relative flex flex-col items-center max-w-2xl w-full animate-slide-up-fade-in">
        
        {/* Sprite Image with Float Animation */}
        <div className="relative w-32 h-32 md:w-48 md:h-48 mb-4 md:mb-6 animate-float flex-shrink-0">
          {/* Glow Effect Behind */}
          <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-30 rounded-full animate-pulse"></div>
          
          <img 
            src="/Jinlin.jpg" 
            alt="Music Sprite" 
            className="w-full h-full object-contain relative z-10 drop-shadow-xl rounded-full"
          />
        </div>

        {/* Dialogue Box */}
        <div 
          onClick={handleNext}
          className="bg-white/95 backdrop-blur-md p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl border-2 md:border-4 border-yellow-300 cursor-pointer hover:scale-[1.02] transition-transform text-center w-full max-w-[90vw] md:max-w-xl"
        >
          <p className="text-base md:text-2xl font-bold text-slate-800 mb-2 md:mb-6 leading-relaxed">
            {lines[lineIndex]}
          </p>
          
          <div className="flex justify-center items-center gap-2 text-yellow-600 font-bold text-xs md:text-sm uppercase tracking-wider animate-pulse">
            <span>Click to continue</span>
            <span>▶</span>
          </div>
        </div>
      </div>
    </div>
  );
};
