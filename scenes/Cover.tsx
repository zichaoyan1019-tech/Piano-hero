import React from 'react';
import { Button } from '../components/Button';

interface CoverProps {
  onStart: () => void;
  onNewGame?: () => void;
  hasSave: boolean;
}

// ⚠️ IMPORTANT: Please replace the URL below with the actual link to your uploaded image!
// I have left the map URL as a placeholder so the app doesn't crash if you copy-paste immediately.
const COVER_IMAGE_URL = '/start.png'; 

export const Cover: React.FC<CoverProps> = ({ onStart, onNewGame, hasSave }) => {
  return (
    <div className="h-full w-full relative flex flex-col items-center justify-between overflow-hidden font-fredoka">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 bg-black">
        <img 
          src={COVER_IMAGE_URL} 
          alt="Piano Hero Adventure Cover" 
          className="w-full h-full object-cover object-center opacity-100"
        />
        {/* Gradient Overlay for text readability (subtle at top/bottom) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none"></div>
      </div>

      {/* Content Layer */}
      <div className="z-10 flex flex-col items-center justify-between w-full h-full p-6 pb-20 safe-area-pb">
        
        {/* Title Section - Positioned at top */}
        <div className="mt-10 md:mt-16 animate-float">
          <h1 className="text-6xl md:text-8xl font-black text-white text-center transform -rotate-2 tracking-wide drop-shadow-2xl">
             <span className="text-yellow-400 stroke-text" style={{ textShadow: '4px 4px 0px #b45309' }}>PIANO</span>
             <br />
             <span className="text-white stroke-text" style={{ textShadow: '4px 4px 0px #2563eb' }}>HERO</span>
          </h1>
        </div>

        {/* Start Button Section - Positioned above the piano keys area */}
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
           <Button 
             onClick={onStart} 
             variant="primary" 
             size="lg" 
             fullWidth
             className="shadow-[0_0_20px_rgba(250,204,21,0.6)] hover:scale-105 transition-transform border-4 border-white"
           >
             <span className="text-2xl drop-shadow-md">{hasSave ? '继续游戏 (CONTINUE) ▶' : '开始游戏 (START) ▶'}</span>
           </Button>

           {hasSave && onNewGame && (
             <Button 
               onClick={() => {
                 if (window.confirm('重新开始将清除您当前的进度，确定要重新开始吗？')) {
                   onNewGame();
                 }
               }} 
               variant="secondary" 
               size="md" 
               fullWidth
               className="hover:scale-105 transition-transform border-2 border-white/50 bg-black/50 text-white"
             >
               <span className="text-xl drop-shadow-md">重新开始 (NEW GAME) ↺</span>
             </Button>
           )}
           
           <div className="text-white/80 text-xs font-bold bg-black/40 px-4 py-1 rounded-full backdrop-blur-sm border border-white/20 mt-2">
             Build v0.1.0
           </div>
        </div>
      </div>

      {/* Custom Styles for Text Stroke and Animations */}
      <style>{`
        .stroke-text {
          -webkit-text-stroke: 2px black;
          paint-order: stroke fill;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-10px) rotate(-2deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .safe-area-pb {
          padding-bottom: max(5rem, env(safe-area-inset-bottom));
        }
      `}</style>
    </div>
  );
};
