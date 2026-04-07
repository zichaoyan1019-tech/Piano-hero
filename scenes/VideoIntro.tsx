import React, { useRef, useEffect } from 'react';

interface VideoIntroProps {
  onComplete: () => void;
}

export const VideoIntro: React.FC<VideoIntroProps> = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
      <video
        src="https://pianoherovideo.oss-cn-beijing.aliyuncs.com/S.mp4"
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
