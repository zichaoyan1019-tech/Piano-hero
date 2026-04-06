import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

interface Level1_2Props {
  onComplete: () => void;
}

export const Level1_2: React.FC<Level1_2Props> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const requestRef = useRef<number>(0);

  const [stage, setStage] = useState(-1);
  const [spriteMessage, setSpriteMessage] = useState("欢迎来到左右手魔法试炼！想成为真正的音乐勇者，必须先分清你的左右手哦！");
  const [isSpriteFlying, setIsSpriteFlying] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Game State
  const [leftHandRaised, setLeftHandRaised] = useState(false);
  const [rightHandRaised, setRightHandRaised] = useState(false);
  const [stars, setStars] = useState(0);
  const [reactionTarget, setReactionTarget] = useState<'left' | 'right' | null>(null);
  const [reactionTimer, setReactionTimer] = useState(3);
  const [reactionCount, setReactionCount] = useState(0);

  // Audio Context for simple synths
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = useCallback((type: 'high' | 'low' | 'ding' | 'win' | 'fail') => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'high') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'low') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'ding') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'win') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'fail') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  }, []);

  // Initialize Pose Detection
  useEffect(() => {
    const initDetector = async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        
        const model = poseDetection.SupportedModels.BlazePose;
        const detectorConfig = {
          runtime: 'tfjs',
          modelType: 'lite'
        };
        detectorRef.current = await poseDetection.createDetector(model, detectorConfig);
      } catch (err) {
        console.error("Failed to initialize detector:", err);
      }
    };
    initDetector();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (detectorRef.current) detectorRef.current.dispose();
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          const video = videoRef.current!;
          video.play();
          
          // Sync intrinsic dimensions to ensure canvas aligns perfectly with video
          video.width = video.videoWidth;
          video.height = video.videoHeight;
          if (canvasRef.current) {
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
          }
          
          setStage(2);
          setSpriteMessage("举起你的右手，让它发光吧！");
          detectPose();
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setSpriteMessage("哎呀，无法打开摄像头。请检查权限设置哦！");
    }
  };

  const detectPose = async () => {
    if (!detectorRef.current || !videoRef.current || !canvasRef.current) return;
    if (videoRef.current.readyState < 2) {
      requestRef.current = requestAnimationFrame(detectPose);
      return;
    }

    const poses = await detectorRef.current.estimatePoses(videoRef.current, {
      flipHorizontal: false // We flip via CSS
    });

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      if (poses.length > 0) {
        const pose = poses[0];
        const keypoints = pose.keypoints;

        const getKp = (name: string) => keypoints.find(k => k.name === name);
        const ls = getKp('left_shoulder');
        const rs = getKp('right_shoulder');
        const le = getKp('left_elbow');
        const re = getKp('right_elbow');
        const lw = getKp('left_wrist');
        const rw = getKp('right_wrist');

        const threshold = 0.3; // Lowered threshold for better recognition

        let lRaised = false;
        let rRaised = false;

        // Note: y goes down. So wrist.y < shoulder.y means wrist is higher.
        // Added a 20px buffer so it requires a clear raise
        if (ls && lw && ls.score! > threshold && lw.score! > threshold) {
          if (lw.y < ls.y - 20) lRaised = true;
        }
        if (rs && rw && rs.score! > threshold && rw.score! > threshold) {
          if (rw.y < rs.y - 20) rRaised = true;
        }

        setLeftHandRaised(lRaised);
        setRightHandRaised(rRaised);

        // Draw skeleton arms
        const drawLine = (p1: any, p2: any, color: string) => {
          if (p1 && p2 && p1.score! > threshold && p2.score! > threshold) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.stroke();
          }
        };

        drawLine(ls, le, 'rgba(96, 165, 250, 0.6)'); // Blue for left arm
        drawLine(le, lw, 'rgba(96, 165, 250, 0.6)');
        drawLine(rs, re, 'rgba(250, 204, 21, 0.6)'); // Gold for right arm
        drawLine(re, rw, 'rgba(250, 204, 21, 0.6)');

        // Draw glowing wrists
        const drawWrist = (kp: any, color: string, isRaised: boolean) => {
          if (kp && kp.score! > threshold) {
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, isRaised ? 25 : 12, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            if (isRaised) {
              ctx.beginPath();
              ctx.arc(kp.x, kp.y, 45, 0, 2 * Math.PI);
              ctx.fillStyle = color.replace('1)', '0.3').replace('0.6)', '0.3');
              ctx.fill();
            }
          }
        };

        drawWrist(lw, 'rgba(96, 165, 250, 1)', lRaised);
        drawWrist(rw, 'rgba(250, 204, 21, 1)', rRaised);
      } else {
        setLeftHandRaised(false);
        setRightHandRaised(false);
      }
    }

    requestRef.current = requestAnimationFrame(detectPose);
  };

  // Game Logic Loop
  useEffect(() => {
    if (stage === 2) {
      // Task 1: Right Hand
      if (rightHandRaised && !leftHandRaised) {
        playSound('high');
        setStage(3);
        setSpriteMessage("太棒了！现在举起你的左手，感受蓝色的力量！");
      }
    } else if (stage === 3) {
      // Task 2: Left Hand
      if (leftHandRaised && !rightHandRaised) {
        playSound('low');
        setStage(4);
        setSpriteMessage("非常好！接下来是快速反应挑战！准备好了吗？");
        setTimeout(() => {
          startReactionChallenge();
        }, 3000);
      }
    } else if (stage === 4) {
      // Reaction Challenge
      if (reactionTarget === 'right' && rightHandRaised && !leftHandRaised) {
        playSound('ding');
        setStars(s => s + 1);
        nextReaction();
      } else if (reactionTarget === 'left' && leftHandRaised && !rightHandRaised) {
        playSound('ding');
        setStars(s => s + 1);
        nextReaction();
      }
    } else if (stage === 5) {
      // Music Combine
      if (rightHandRaised) playSound('high');
      if (leftHandRaised) playSound('low');
    }
  }, [leftHandRaised, rightHandRaised, stage, reactionTarget]);

  const startReactionChallenge = () => {
    setReactionCount(0);
    setStars(0);
    nextReaction(0);
  };

  const nextReaction = (count = reactionCount) => {
    if (count >= 4) {
      setReactionTarget(null);
      setStage(5);
      setSpriteMessage("右手负责高音魔法，左手守护低音力量。试着同时或者交替举起双手吧！");
      setTimeout(() => {
        setStage(6);
        setSpriteMessage("恭喜你！你的左右手已经觉醒啦！");
        playSound('win');
        setIsSpriteFlying(true);
      }, 10000); // 10 seconds of free play
      return;
    }

    const target = Math.random() > 0.5 ? 'left' : 'right';
    setReactionTarget(target);
    setSpriteMessage(target === 'left' ? "左手！" : "右手！");
    setReactionTimer(3);
    setReactionCount(count + 1);
  };

  // Timer for reaction challenge
  useEffect(() => {
    if (stage === 4 && reactionTarget) {
      const interval = setInterval(() => {
        setReactionTimer(t => {
          if (t <= 1) {
            playSound('fail');
            nextReaction(reactionCount); // Move to next even if failed
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [stage, reactionTarget, reactionCount]);

  const handleDialogueClick = () => {
    if (stage === 0) {
      setStage(1);
      setSpriteMessage("请允许打开摄像头，我们不会保存你的画面，只是用来识别动作哦！");
    }
  };

  const finish = () => {
    setIsFadingOut(true);
    setTimeout(onComplete, 1000);
  };

  return (
    <div className={`w-full h-full bg-[#fdf6e3] flex flex-col items-center justify-center p-4 relative overflow-hidden text-slate-800 transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Fullscreen Video Step */}
      {stage === -1 && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fade-in">
          <video 
            src="https://firebasestorage.googleapis.com/v0/b/pianoherovideo.firebasestorage.app/o/%E5%B7%A6%E5%8F%B3%E6%89%8B.mp4?alt=media&token=a85d8b33-82ef-43e2-a71e-71f90ee72810" 
            autoPlay 
            controls 
            playsInline
            className="w-full h-full object-contain"
            onEnded={() => {
              setStage(0);
            }}
          />
          <button 
            onClick={() => {
              setStage(0);
            }}
            className="absolute top-6 right-6 px-6 py-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full font-bold transition-all z-50"
          >
            跳过视频 ⏭
          </button>
        </div>
      )}

      {/* Magic Circles Background */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 flex justify-around items-end pb-10 pointer-events-none">
        {/* Left Circle (Blue) */}
        <div className={`w-48 h-16 md:w-64 md:h-24 rounded-[100%] border-4 border-blue-400 transition-all duration-300 transform
          ${leftHandRaised || stage === 0 ? 'bg-blue-400/40 shadow-[0_0_50px_rgba(96,165,250,0.8)] scale-110' : 'bg-blue-400/10'}
        `}>
          <div className="absolute inset-0 border-2 border-blue-300 rounded-[100%] animate-ping opacity-20"></div>
        </div>
        
        {/* Right Circle (Gold) */}
        <div className={`w-48 h-16 md:w-64 md:h-24 rounded-[100%] border-4 border-yellow-400 transition-all duration-300 transform
          ${rightHandRaised || stage === 0 ? 'bg-yellow-400/40 shadow-[0_0_50px_rgba(250,204,21,0.8)] scale-110' : 'bg-yellow-400/10'}
        `}>
          <div className="absolute inset-0 border-2 border-yellow-300 rounded-[100%] animate-ping opacity-20"></div>
        </div>
      </div>

      {/* Sprite Area */}
      <div className={`absolute z-40 flex flex-col items-center transition-all duration-1000 ease-in-out pointer-events-none
          ${stage === -1 ? 'opacity-0 pointer-events-none scale-50' : 'opacity-100'}
          ${stage === 0 ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-125' : 
            stage === 6 ? 'left-1/2 bottom-8 -translate-x-1/2 scale-110' : 
            'left-4 md:left-12 top-4 md:top-12 scale-100'}
        `}
      >
        <div 
          onClick={handleDialogueClick}
          className={`bg-white p-3 md:p-4 rounded-2xl shadow-lg border-2 border-yellow-300 mb-4 max-w-[200px] md:max-w-xs text-center relative animate-slide-up-fade-in pointer-events-auto
            ${stage === 0 ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}
          `}
        >
          <p className="text-sm md:text-lg font-bold text-slate-700">{spriteMessage}</p>
          
          {stage === 0 && (
            <div className="mt-2 flex justify-center items-center gap-1 text-yellow-600 font-bold text-xs uppercase tracking-wider animate-pulse">
              <span>点击继续</span>
              <span>▶</span>
            </div>
          )}

          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-yellow-300 transform rotate-45"></div>
        </div>
        
        <div className={`relative w-24 h-24 md:w-32 md:h-32 pointer-events-none ${isSpriteFlying ? 'animate-fly-circle' : 'animate-float'}`}>
          <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-40 rounded-full animate-pulse"></div>
          <img src="/Jinlin.jpg" alt="Sprite" className="w-full h-full object-contain relative z-10 rounded-full drop-shadow-md" />
        </div>
      </div>

      {/* Camera and Game UI */}
      {stage >= 1 && stage < 6 && (
        <div className="relative w-full max-w-3xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-8 border-white z-10 animate-slide-up-fade-in">
          
          {stage === 1 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/90 z-50">
              <button 
                onClick={startCamera}
                className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-white rounded-full font-bold text-2xl shadow-[0_0_20px_rgba(250,204,21,0.5)] hover:scale-105 transition-all cursor-pointer pointer-events-auto"
              >
                👉 开始试炼
              </button>
            </div>
          )}

          {/* Video Feed (Mirrored) */}
          <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror the video
            playsInline
            muted
          />
          
          {/* Canvas for Skeleton (Mirrored) */}
          <canvas 
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ transform: 'scaleX(-1)' }}
          />

          {/* Status Overlay */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-4 py-3 rounded-xl text-white font-bold text-sm z-20 flex flex-col gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full transition-all ${leftHandRaised ? 'bg-blue-400 shadow-[0_0_15px_#60a5fa] scale-125' : 'bg-slate-600'}`}></div>
              <span className="text-lg">左手: {leftHandRaised ? '已举起 ✨' : '未举起'}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full transition-all ${rightHandRaised ? 'bg-yellow-400 shadow-[0_0_15px_#facc15] scale-125' : 'bg-slate-600'}`}></div>
              <span className="text-lg">右手: {rightHandRaised ? '已举起 ✨' : '未举起'}</span>
            </div>
          </div>

          {/* Hand Glow Overlays */}
          {/* We can't easily position DOM elements exactly on hands without complex coordinate mapping, 
              so we use full-screen overlays with gradients or rely on the magic circles below.
              For a simpler approach, we show a glowing border on the video container. */}
          <div className={`absolute inset-0 pointer-events-none transition-all duration-300 border-8 rounded-2xl
            ${leftHandRaised && rightHandRaised ? 'border-green-400 shadow-[inset_0_0_50px_rgba(74,222,128,0.5)]' :
              leftHandRaised ? 'border-blue-400 shadow-[inset_0_0_50px_rgba(96,165,250,0.5)]' :
              rightHandRaised ? 'border-yellow-400 shadow-[inset_0_0_50px_rgba(250,204,21,0.5)]' :
              'border-transparent'}
          `}></div>

          {/* Reaction Challenge UI */}
          {stage === 4 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 px-6 py-2 rounded-full font-bold text-xl shadow-lg z-20">
              倒计时: <span className={reactionTimer <= 1 ? 'text-red-500' : 'text-slate-800'}>{reactionTimer}s</span>
            </div>
          )}

          {/* Stars */}
          {(stage === 4 || stage === 5) && (
            <div className="absolute top-4 right-4 flex gap-2 z-20">
              {[...Array(stars)].map((_, i) => (
                <span key={i} className="text-3xl animate-bounce">⭐</span>
              ))}
            </div>
          )}

          {/* Piano Overlay for Stage 5 */}
          {stage === 5 && (
            <div className="absolute bottom-0 left-0 w-full h-1/4 bg-white/80 backdrop-blur-sm flex border-t-4 border-slate-300 z-20">
              <div className={`flex-1 border-r-2 border-slate-300 flex items-center justify-center transition-colors ${leftHandRaised ? 'bg-blue-200' : ''}`}>
                <span className="text-2xl font-bold text-blue-600 opacity-50">低音区</span>
              </div>
              <div className={`flex-1 flex items-center justify-center transition-colors ${rightHandRaised ? 'bg-yellow-200' : ''}`}>
                <span className="text-2xl font-bold text-yellow-600 opacity-50">高音区</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Outro Step */}
      {stage === 6 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40 animate-slide-up-fade-in pointer-events-none">
          <div className="relative mb-32 mt-12">
            <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-50 rounded-full animate-pulse"></div>
            <div className="flex gap-4 mb-4 justify-center">
              <div className="text-6xl filter drop-shadow-[0_0_20px_rgba(96,165,250,0.8)] animate-bounce" style={{ animationDelay: '0s' }}>🖐️</div>
              <div className="text-6xl filter drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-bounce" style={{ animationDelay: '0.2s' }}>✋</div>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 whitespace-nowrap">
              <h2 className="text-4xl font-black text-yellow-500 drop-shadow-md tracking-wider">左右手大师</h2>
            </div>
          </div>
          <button 
            onClick={finish}
            className="mt-12 px-10 py-4 bg-green-500 hover:bg-green-400 text-white rounded-full font-bold text-2xl shadow-xl hover:scale-105 transition-all pointer-events-auto"
          >
            完成关卡
          </button>
        </div>
      )}

    </div>
  );
};
