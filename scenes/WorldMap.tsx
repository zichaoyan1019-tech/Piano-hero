import React, { useRef, useEffect, useState } from 'react';
import { GAME_DATA } from '../constants';
import { UserProgress } from '../types';
import { GuideSprite } from '../components/GuideSprite';

interface WorldMapProps {
  progress: UserProgress;
  onSelectRegion: (regionId: string) => void;
}

// Placeholder: Replace this with your uploaded map URL
const MAP_IMAGE_URL = '/map.png';

export const WorldMap: React.FC<WorldMapProps> = ({ progress, onSelectRegion }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Check if it's a new game (no levels completed) to show guide
  useEffect(() => {
    if (progress.completedLevels.length === 0) {
      setShowGuide(true);
    }
  }, [progress.completedLevels.length]);

  // Auto-scroll to start or latest unlocked region on load
  useEffect(() => {
    if (containerRef.current) {
      // Simple center for now, could be smarter
      containerRef.current.scrollLeft = 0; 
    }
  }, []);

  // Generate SVG path points
  const getPathPoints = () => {
    return GAME_DATA.regions.map(r => `${r.mapPosition.x},${r.mapPosition.y}`).join(' ');
  };

  const INTRO_LINES = [
    "欢迎来到音乐世界！",
    "我是音乐精灵，是这片音乐大陆的守护者。",
    "我会陪伴你学习、成长，帮助你掌握钢琴的魔法。",
    "这片大陆一共有七大关卡，我们要一步一步前进，穿越森林、山谷与村庄。",
    "最终抵达城堡，拯救被黑暗笼罩的音乐世界！",
    "勇敢的勇者，准备好踏上旅途了吗？"
  ];

  const INTRO_AUDIO = [
    "/欢迎来到音乐世界！.mp3",
    "/我是音乐精灵.mp3",
    "/我会陪伴你学习.mp3",
    "/这片大陆一共有七大关卡.mp3",
    "/最终抵达城堡.mp3",
    "/勇敢的勇者.mp3"
  ];

  return (
    <div className="h-full w-full bg-slate-900 relative flex flex-col overflow-hidden">
      {/* Guide Sprite Overlay */}
      {showGuide && (
        <GuideSprite 
          lines={INTRO_LINES}
          audioUrls={INTRO_AUDIO}
          onComplete={() => setShowGuide(false)} 
        />
      )}

      {/* HUD Layer */}
      <div className="absolute top-0 left-0 right-0 p-2 md:p-4 flex justify-between items-center z-50 pointer-events-none">
        <div className="bg-white/90 px-3 py-1 md:px-4 md:py-2 rounded-xl border-2 md:border-4 border-blue-400 shadow-lg pointer-events-auto backdrop-blur-sm">
          <h2 className="text-blue-900 text-sm md:text-xl font-black">World Map 🗺️</h2>
        </div>
        <div className="bg-black/60 px-3 py-1 md:px-4 md:py-2 rounded-full text-yellow-400 text-xs md:text-base font-bold border border-yellow-500/50 pointer-events-auto backdrop-blur-sm">
          🎒 {progress.inventory.length} Items
        </div>
      </div>

      {/* Map Container - Centered and Scaled */}
      <div 
        ref={containerRef}
        className="flex-1 relative bg-[#1a4a6e] w-full h-full flex items-center justify-center overflow-auto"
      >
        {/* 
           Aspect Ratio Container 
           Use aspect-video to maintain map proportions.
           max-w-full max-h-full ensures it fits within the screen without scrolling if possible,
           or min-w can be added if scrolling is preferred on very small screens.
        */}
        <div className="relative w-full aspect-video max-h-full shadow-2xl">
          
          {/* The Map Image */}
          <img 
            src={MAP_IMAGE_URL} 
            alt="World Map" 
            className="w-full h-full object-contain absolute inset-0 select-none"
            draggable={false}
          />

          {/* SVG Overlay for Paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Glow Effect Filter */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Dotted Line Connection */}
            <polyline
              points={getPathPoints()}
              fill="none"
              stroke="white"
              strokeWidth="0.8"
              strokeDasharray="2, 2"
              className="opacity-60"
            />
             <polyline
              points={getPathPoints()}
              fill="none"
              stroke="#fbbf24" // Amber-400
              strokeWidth="0.5"
              strokeDasharray="1, 1"
              filter="url(#glow)"
              className="animate-pulse"
            />
          </svg>

          {/* Interactive Nodes */}
          {GAME_DATA.regions.map((region, index) => {
            const isUnlocked = progress.unlockedRegions.includes(region.id);
            const isCompleted = region.levels.every(l => progress.completedLevels.includes(l.id)) && region.levels.length > 0;
            
            return (
              <div
                key={region.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group"
                style={{ left: `${region.mapPosition.x}%`, top: `${region.mapPosition.y}%` }}
              >
                <button
                  onClick={() => isUnlocked && onSelectRegion(region.id)}
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 rounded-full border-2 md:border-4 flex items-center justify-center
                    transition-all duration-300 relative shadow-2xl
                    ${isUnlocked 
                      ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-white scale-100 hover:scale-110 hover:rotate-3 cursor-pointer' 
                      : 'bg-gray-700 border-gray-500 scale-90 cursor-not-allowed grayscale'}
                  `}
                >
                  <span className="text-sm sm:text-base md:text-2xl filter drop-shadow-md">
                    {index === 0 ? '🏠' : 
                     index === 1 ? '🍄' : 
                     index === 2 ? '🌵' :
                     index === 3 ? '🌋' :
                     index === 4 ? '🏔️' :
                     index === 5 ? '☁️' :
                     index === 6 ? '🌈' : '🏰'}
                  </span>
                  
                  {/* Lock Overlay */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                      <span className="text-xs md:text-base">🔒</span>
                    </div>
                  )}

                  {/* Ripple Effect for next available level */}
                  {isUnlocked && !isCompleted && (
                     <span className="absolute -inset-2 rounded-full bg-yellow-400 opacity-30 animate-ping"></span>
                  )}
                </button>

                {/* Tooltip Label (Visible on hover or if unlocked) */}
                <div className={`
                  absolute top-full left-1/2 -translate-x-1/2 mt-1 md:mt-2 
                  bg-black/70 text-white text-[10px] md:text-sm font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full whitespace-nowrap
                  backdrop-blur-sm border border-white/20 transition-opacity z-30
                  ${isUnlocked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                `}>
                  {region.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
