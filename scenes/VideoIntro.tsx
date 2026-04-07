import React, { useRef, useEffect, useState } from 'react';

interface VideoIntroProps {
  onComplete: () => void;
}

export const VideoIntro: React.FC<VideoIntroProps> = ({ onComplete }) => {
  const [isBuffering, setIsBuffering] = useState(true);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
      {isBuffering && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-white font-bold tracking-widest drop-shadow-md">视频加载中...</p>
        </div>
      )}
      <video
        src="https://pianoherovideo.oss-cn-beijing.aliyuncs.com/4%E6%9C%886%E6%97%A5%20%281%29.mp4"
        className="w-full h-full object-cover"
        onEnded={onComplete}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
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
