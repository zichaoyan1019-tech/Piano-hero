import React, { useRef, useEffect } from 'react';

interface VideoIntroProps {
  onComplete: () => void;
}

export const VideoIntro: React.FC<VideoIntroProps> = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
      <video
        src="https://firebasestorage.googleapis.com/v0/b/pianoherovideo.firebasestorage.app/o/S.mp4?alt=media&token=f2db57b3-7676-4fd3-9196-814870c29b19"
        className="w-full h-full object-cover"
        onEnded={onComplete}
        playsInline
        autoPlay
        preload="auto"
      />
      
      <button
        onClick={onComplete}
        className="absolute top-8 right-8 bg-black/50 hover:bg-black/70 text-white px-6 py-2 rounded-full backdrop-blur-md border border-white/30 font-bold transition-all z-50 active:scale-95"
      >
        SKIP ⏩
      </button>
    </div>
  );
};
