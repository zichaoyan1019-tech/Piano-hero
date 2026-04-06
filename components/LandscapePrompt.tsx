import React from 'react';

export const LandscapePrompt: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-black text-white flex flex-col items-center justify-center p-8 md:hidden landscape:hidden">
      <div className="text-6xl mb-8 animate-bounce">📱➡️🔄</div>
      <h2 className="text-2xl font-bold text-center mb-4">Please Rotate Your Device</h2>
      <p className="text-center text-gray-300">
        This adventure is best experienced in landscape mode.
      </p>
    </div>
  );
};
