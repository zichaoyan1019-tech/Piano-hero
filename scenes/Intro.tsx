import React from 'react';
import { Button } from '../components/Button';

interface IntroProps {
  onComplete: () => void;
}

export const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-blue-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome, Hero!</h1>
      <p className="text-xl mb-8 text-center max-w-md">
        The world has lost its music. Only you can restore the melody using the magical piano!
      </p>
      <Button onClick={onComplete} size="lg">Start Adventure</Button>
    </div>
  );
};
