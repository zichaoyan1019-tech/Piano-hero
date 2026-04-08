import React, { useState, useEffect } from 'react';
import { UserProgress } from '../types';
import { Button } from '../components/Button';
import { GuideSprite } from '../components/GuideSprite';

interface RegionMapProps {
  regionId: string;
  progress: UserProgress;
  onSelectLevel: (levelId: string) => void;
  onBack: () => void;
}

export const RegionMap: React.FC<RegionMapProps> = ({ regionId, progress, onSelectLevel, onBack }) => {
  const [showGuide, setShowGuide] = useState(false);

  // Check if we should show guide for Home Village (if level 1-1 is not completed)
  useEffect(() => {
    if (regionId === 'region_1' && !progress.completedLevels.includes('level_1_1')) {
      setShowGuide(true);
    }
  }, [regionId, progress.completedLevels]);

  const HOME_VILLAGE_LINES = [
    "这里是我们的训练村庄。",
    "右边的四个关卡，会教你最重要的钢琴技能。",
    "每学会一个技能，你就会变得更强。",
    "当你完成四个训练，中央的音乐之泉就会出现。",
    "那时，你就准备好继续新的冒险了。",
    "我们从第一个关卡开始吧！"
  ];

  const HOME_VILLAGE_AUDIO = [
    "/这里是我们的训练村庄.mp3",
    "/右边的四个关卡.mp3",
    "/每学会一个技能.mp3",
    "/当你完成四个训练.mp3",
    "/那时.mp3",
    "/我们从第一个关卡开始吧.mp3"
  ];

  // Special layout for Home Village (Region 1)
  if (regionId === 'region_1') {
    const buildings = [
      { 
        id: 'level_1_1', img: '/第一关.png', left: '8%', bottom: '35%',
        isUnlocked: true,
        isCompleted: progress.completedLevels.includes('level_1_1')
      },
      { 
        id: 'level_1_2', img: '/第二关.png', left: '30%', bottom: '65%',
        isUnlocked: progress.completedLevels.includes('level_1_1'),
        isCompleted: progress.completedLevels.includes('level_1_2')
      },
      { 
        id: 'level_1_3', img: '/第三关.png', left: '65%', bottom: '69%',
        isUnlocked: progress.completedLevels.includes('level_1_2'),
        isCompleted: progress.completedLevels.includes('level_1_3')
      },
      { 
        id: 'level_1_4', img: '/第四关.png', left: '90%', bottom: '39%',
        isUnlocked: progress.completedLevels.includes('level_1_3'),
        isCompleted: progress.completedLevels.includes('level_1_4')
      },
    ];

    return (
      <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
        {/* Guide Sprite Overlay - Fixed to screen, not scaled container, to ensure readability */}
        {showGuide && (
          <GuideSprite 
            lines={HOME_VILLAGE_LINES}
            audioUrls={HOME_VILLAGE_AUDIO}
            onComplete={() => setShowGuide(false)} 
          />
        )}

        {/* Back Button - Fixed to screen top-left */}
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 bg-white/80 p-2 md:p-3 rounded-full shadow-lg hover:bg-white transition-all z-50 font-bold text-slate-800 text-sm md:text-base"
        >
          ⬅️ Back
        </button>

        {/* Scaled Container - Maintains Aspect Ratio (16:9) to keep positions accurate */}
        <div className="relative w-full aspect-video max-h-full">
          {/* Layer 0: Background Image */}
          <img 
            src="/Home village.png" 
            alt="Home Village Background" 
            className="absolute inset-0 w-full h-full object-cover z-0 rounded-lg shadow-2xl"
          />

          {/* Layer 2: Buildings */}
          {buildings.map((b) => (
            <div
              key={b.id}
              className={`absolute z-20 ${b.isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              style={{
                left: b.left,
                bottom: b.bottom,
                width: '35%', // Relative to the aspect-ratio container
                transform: 'translateX(-50%)' 
              }}
              onClick={() => b.isUnlocked && onSelectLevel(b.id)}
            >
              <div className={`relative transition-transform duration-300 ${b.isUnlocked ? 'hover:scale-110 drop-shadow-lg' : 'opacity-60 grayscale'}`}>
                <img
                  src={b.img}
                  alt={b.id}
                  className="w-full h-auto"
                />
                {b.isCompleted && (
                  <div className="absolute -top-2 right-1/4 bg-green-500 text-white text-xs md:text-sm font-bold px-2 py-1 rounded-full border-2 border-white shadow-md transform translate-x-1/2 z-30">
                    ✅ 已完成
                  </div>
                )}
                {!b.isUnlocked && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl md:text-5xl drop-shadow-md z-30">
                    🔒
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Layer 3: Hero (Placeholder for now) */}
          <div className="absolute z-30 pointer-events-none">
            {/* Hero character would go here */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-green-800 text-white p-8 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-8">Region: {regionId}</h2>
      <div className="flex gap-4 mb-8">
        <Button onClick={() => onSelectLevel('level_1_1')}>Level 1-1</Button>
        <Button onClick={() => onSelectLevel('level_1_2')}>Level 1-2</Button>
      </div>
      <Button onClick={onBack} variant="secondary">Back to World Map</Button>
    </div>
  );
};
