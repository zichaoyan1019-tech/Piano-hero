import React, { useState, useEffect } from 'react';
import { Scene, UserProgress } from './types';
import { loadGame, saveGame } from './services/storage';
import { INITIAL_PROGRESS } from './constants';

// Scenes
import { Cover } from './scenes/Cover';
import { Intro } from './scenes/Intro';
import { VideoIntro } from './scenes/VideoIntro';
import { WorldMap } from './scenes/WorldMap';
import { RegionMap } from './scenes/RegionMap';
import { LevelRunner } from './scenes/LevelRunner';
import { LandscapePrompt } from './components/LandscapePrompt';

export default function App() {
  const [scene, setScene] = useState<Scene>(Scene.COVER);
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  
  // Navigation State
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const [activeLevelId, setActiveLevelId] = useState<string | null>(null);

  // Load save on mount
  useEffect(() => {
    const loaded = loadGame();
    if (loaded) {
      setProgress(loaded);
    }
  }, []);

  // Save whenever progress changes
  useEffect(() => {
    saveGame(progress);
  }, [progress]);

  // --- Actions ---

  const startGame = () => {
    // If new game, show Video Intro. If existing save (already unlocked region), go to map
    const hasPlayed = progress.completedLevels.length > 0;
    setScene(hasPlayed ? Scene.WORLD_MAP : Scene.VIDEO_INTRO);
  };

  const handleIntroComplete = () => {
    setScene(Scene.WORLD_MAP);
  };

  const enterRegion = (regionId: string) => {
    setActiveRegionId(regionId);
    setScene(Scene.REGION_MAP);
  };

  const enterLevel = (levelId: string) => {
    setActiveLevelId(levelId);
    setScene(Scene.LEVEL);
  };

  const handleLevelComplete = (levelId: string, rewardId?: string) => {
    setProgress(prev => {
      const newCompleted = prev.completedLevels.includes(levelId) 
        ? prev.completedLevels 
        : [...prev.completedLevels, levelId];
      
      const newInventory = (rewardId && !prev.inventory.includes(rewardId))
        ? [...prev.inventory, rewardId]
        : prev.inventory;

      // Simple logic: Unlocking next level (hardcoded for MVP demo flow)
      // In real app, verify Region hierarchy
      const newUnlockedLevels = [...prev.unlockedLevels];
      if (levelId === 'level_1_1' && !newUnlockedLevels.includes('level_1_2')) {
        newUnlockedLevels.push('level_1_2');
      }
      if (levelId === 'level_1_2' && !newUnlockedLevels.includes('level_1_3')) {
        newUnlockedLevels.push('level_1_3');
      }
      if (levelId === 'level_1_3' && !newUnlockedLevels.includes('level_1_4')) {
        newUnlockedLevels.push('level_1_4');
      }

      return {
        ...prev,
        completedLevels: newCompleted,
        inventory: newInventory,
        unlockedLevels: newUnlockedLevels
      };
    });
    
    // Return to region map
    setScene(Scene.REGION_MAP);
  };

  // --- Render ---

  return (
    <div className="w-full h-[100dvh] bg-black overflow-hidden relative">
      <LandscapePrompt />
      
      {scene === Scene.COVER && (
        <Cover onStart={startGame} hasSave={progress.completedLevels.length > 0} />
      )}

      {scene === Scene.VIDEO_INTRO && (
        <VideoIntro onComplete={handleIntroComplete} />
      )}

      {scene === Scene.INTRO && (
        <Intro onComplete={handleIntroComplete} />
      )}

      {/* Map Background Music */}
      {(scene === Scene.WORLD_MAP || scene === Scene.REGION_MAP) && (
        <audio 
          src="/map music.mp3" 
          autoPlay 
          loop 
          ref={(el) => { if (el) el.volume = 0.3; }} /* 0.3 表示 30% 的音量，您可以修改这个数字 (0.0 到 1.0) */
        />
      )}

      {scene === Scene.WORLD_MAP && (
        <WorldMap 
          progress={progress} 
          onSelectRegion={enterRegion} 
        />
      )}

      {scene === Scene.REGION_MAP && activeRegionId && (
        <RegionMap 
          regionId={activeRegionId} 
          progress={progress}
          onSelectLevel={enterLevel}
          onBack={() => setScene(Scene.WORLD_MAP)}
        />
      )}

      {scene === Scene.LEVEL && activeLevelId && (
        <LevelRunner
          levelId={activeLevelId}
          onLevelComplete={handleLevelComplete}
          onExit={() => setScene(Scene.REGION_MAP)}
        />
      )}
    </div>
  );
}
