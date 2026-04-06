import React from 'react';
import { Button } from '../components/Button';
import { Level1_1 } from './Level1_1';
import { Level1_2 } from './Level1_2';
import { Level1_3 } from './Level1_3';
import { ErrorBoundary } from '../components/ErrorBoundary';

interface LevelRunnerProps {
  levelId: string;
  onLevelComplete: (levelId: string, rewardId?: string) => void;
  onExit: () => void;
}

export const LevelRunner: React.FC<LevelRunnerProps> = ({ levelId, onLevelComplete, onExit }) => {
  // Render specific level components based on levelId
  if (levelId === 'level_1_1') {
    return (
      <Level1_1 
        onComplete={() => onLevelComplete(levelId, 'star')} 
      />
    );
  }

  if (levelId === 'level_1_2') {
    return (
      <Level1_2 
        onComplete={() => onLevelComplete(levelId, 'badge_hands')} 
      />
    );
  }

  if (levelId === 'level_1_3') {
    return (
      <ErrorBoundary>
        <Level1_3 
          onComplete={() => onLevelComplete(levelId, 'badge_fingers')} 
        />
      </ErrorBoundary>
    );
  }

  // Fallback for unimplemented levels
  return (
    <div className="h-full w-full bg-slate-800 text-white p-8 flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold mb-8">Playing Level: {levelId}</h2>
      <div className="flex gap-4">
        <Button onClick={() => onLevelComplete(levelId, 'star')}>Complete Level</Button>
        <Button onClick={onExit} variant="secondary">Exit</Button>
      </div>
    </div>
  );
};