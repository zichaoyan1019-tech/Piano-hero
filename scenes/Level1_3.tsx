import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Level1_3Props {
  onComplete: () => void;
}

type HandType = 'left' | 'right';
type HandSide = 'back' | 'palm';

interface Question {
  id: number;
  side: HandSide;
  hand: HandType;
  image: string;
}

const generateQuestions = (): Question[] => {
  const q1Hand = Math.random() > 0.5 ? 'left' : 'right';
  const q2Hand = q1Hand === 'left' ? 'right' : 'left';
  const q3Hand = Math.random() > 0.5 ? 'left' : 'right';

  return [
    { id: 1, side: 'back', hand: q1Hand, image: `/${q1Hand === 'left' ? '左手' : '右手'}手背.webp` },
    { id: 2, side: 'back', hand: q2Hand, image: `/${q2Hand === 'left' ? '左手' : '右手'}手背.webp` },
    { id: 3, side: 'palm', hand: q3Hand, image: `/${q3Hand === 'left' ? '左手' : '右手'}手心.webp` },
  ];
};

const getExpectedNumbers = (side: HandSide, hand: HandType) => {
  if (side === 'back') {
    if (hand === 'left') return [5, 4, 3, 2, 1];
    if (hand === 'right') return [1, 2, 3, 4, 5];
  } else {
    if (hand === 'left') return [1, 2, 3, 4, 5];
    if (hand === 'right') return [5, 4, 3, 2, 1];
  }
  return [1, 2, 3, 4, 5];
};

// ==========================================
// 🎨 排版设置区 (在这里手动调整大小和位置)
// ==========================================

// 1. 图片缩放比例 (100 为原始大小，150 为放大 1.5 倍)
const IMAGE_SCALE = 150; 

// 2. 图片位置微调 (单位：像素 px，正数向右/向下，负数向左/向上)
const IMAGE_OFFSET_X = 0;
const IMAGE_OFFSET_Y = 0;

// 3. 目标圆圈大小 (单位：像素 px，默认 80)
const SLOT_SIZE = 50;

// 4. 圆圈位置设置 (left: 左右位置百分比, top: 上下位置百分比)
const defaultSlotPositions = {
  // 当大拇指在左边时 (右手手背 / 左手手心)
  thumbLeft: [
    { left: 25, top: 45 }, // 1指 (大拇指)
    { left: 35, top: 25 }, // 2指 (食指)
    { left: 50, top: 20 }, // 3指 (中指)
    { left: 65, top: 25 }, // 4指 (无名指)
    { left: 75, top: 40 }, // 5指 (小指)
  ],
  // 当大拇指在右边时 (左手手背 / 右手手心)
  thumbRight: [
    { left: 28, top: 35 }, // 5指 (小指)
    { left: 39, top: 25 }, // 4指 (无名指)
    { left: 50, top: 22 }, // 3指 (中指)
    { left: 60, top: 28 }, // 2指 (食指)
    { left: 70, top: 43 }, // 1指 (大拇指)
  ]
};
// ==========================================

const getSlotPositions = (side: HandSide, hand: HandType) => {
  const isThumbLeft = (side === 'back' && hand === 'right') || (side === 'palm' && hand === 'left');
  return isThumbLeft ? defaultSlotPositions.thumbLeft : defaultSlotPositions.thumbRight;
};

const playTone = (type: 'ding' | 'boop' | 'tada') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'ding') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'boop') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'tada') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export const Level1_3: React.FC<Level1_3Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'video' | 'q1' | 'q2' | 'q3' | 'outro'>('video');
  const [qPhase, setQPhase] = useState<'select_hand' | 'drag_numbers' | 'completed'>('select_hand');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [placedNumbers, setPlacedNumbers] = useState<(number | null)[]>([null, null, null, null, null]);
  const [voiceover, setVoiceover] = useState("在开始之前，先来看一段小视频吧！");
  const [wrongShake, setWrongShake] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);

  const currentQ = questions[currentQIndex];

  const handleVideoEnd = () => {
    setPhase('q1');
    setQPhase('select_hand');
    setVoiceover("首先我会给你看一只手的手背～\n请你先告诉我：这是左手，还是右手呢？");
  };

  const handleSelectHand = (selected: HandType) => {
    if (!currentQ) return;
    if (selected === currentQ.hand) {
      playTone('ding');
      setQPhase('drag_numbers');
      if (currentQIndex === 0) {
        setVoiceover("对啦！你真聪明～现在我们来贴数字！\n记住：大拇指永远是1指哦～\n把数字拖到对应的手指上方圆圈里吧！");
      } else if (currentQIndex === 1) {
        setVoiceover("很好！现在把1到5放上去～\n别忘了：大拇指永远是1指！");
      } else {
        setVoiceover("选对啦～现在继续贴数字！\n1是大拇指，2是食指，3是中指，4是无名指，5是小指～");
      }
    } else {
      playTone('boop');
      setWrongShake(selected);
      setTimeout(() => setWrongShake(null), 500);
      setVoiceover("再看看拇指在哪一边哦～再试一次～");
    }
  };

  const handleDragEnd = (e: any, info: any, num: number) => {
    if (qPhase !== 'drag_numbers') return;
    
    const dropX = info.point.x;
    const dropY = info.point.y;
    
    const slots = document.querySelectorAll('[data-slot-index]');
    let closestSlotIndex = -1;
    let minDistance = Infinity;
    
    // 容错距离：圆圈大小的 1.5 倍，只要拖到这个范围内就会自动吸附
    const threshold = SLOT_SIZE * 1.5; 

    slots.forEach(slot => {
      const rect = slot.getBoundingClientRect();
      const slotCenterX = rect.left + rect.width / 2;
      const slotCenterY = rect.top + rect.height / 2;
      
      const distance = Math.sqrt(Math.pow(dropX - slotCenterX, 2) + Math.pow(dropY - slotCenterY, 2));
      
      if (distance < minDistance && distance < threshold) {
        minDistance = distance;
        closestSlotIndex = parseInt(slot.getAttribute('data-slot-index') || '-1');
      }
    });

    if (closestSlotIndex >= 0 && closestSlotIndex < 5) {
      const expected = getExpectedNumbers(currentQ.side, currentQ.hand)[closestSlotIndex];
      if (expected === num) {
        playTone('ding');
        setPlacedNumbers(prev => {
          const next = [...prev];
          next[closestSlotIndex] = num;
          return next;
        });
        const encouragements = ["漂亮！", "对啦！", "太棒啦！"];
        setVoiceover(encouragements[Math.floor(Math.random() * encouragements.length)]);
      } else {
        playTone('boop');
        setVoiceover("再想想～拇指是1，往后就是2、3、4、5～");
      }
    }
  };

  // Check completion
  useEffect(() => {
    if (qPhase === 'drag_numbers' && placedNumbers.every(n => n !== null)) {
      setQPhase('completed');
      playTone('tada');
      if (currentQIndex === 0) {
        setVoiceover("完成！你已经会给这只手编号啦！");
      } else if (currentQIndex === 1) {
        setVoiceover("太厉害了！两只手背你都搞定啦！");
      } else {
        setVoiceover("哇！手心也完成了！你真的记住五指编号啦～");
      }

      setTimeout(() => {
        if (currentQIndex < 2) {
          setCurrentQIndex(prev => prev + 1);
          setPhase(currentQIndex === 0 ? 'q2' : 'q3');
          setQPhase('select_hand');
          setPlacedNumbers([null, null, null, null, null]);
          if (currentQIndex === 0) {
            setVoiceover("现在换另一只手的手背咯～\n先说说看：这是左手还是右手？");
          } else {
            setVoiceover("接下来我们看看手心～\n这是一只手的手心哦！\n你能认出来：它是左手还是右手吗？");
          }
        } else {
          setPhase('outro');
          setVoiceover("现在我们来做几道小题～看看你是不是真的记住了！");
        }
      }, 3000);
    }
  }, [placedNumbers, qPhase, currentQIndex]);

  return (
    <div className="w-full h-full bg-[#fdf6e3] overflow-y-auto overflow-x-hidden font-sans text-slate-800">
      <div className="min-h-full w-full flex flex-col items-center justify-start md:justify-center relative p-4 pt-24 md:p-8">
      
      {/* Voiceover Box */}
      <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border-2 border-pink-200 z-50 text-center pointer-events-none">
        <p className="text-lg md:text-2xl font-bold text-slate-700 whitespace-pre-line">
          {voiceover}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'video' && (
          <motion.div 
            key="video"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="flex flex-col items-center justify-center w-full h-full z-40"
          >
            <video 
              src="https://firebasestorage.googleapis.com/v0/b/pianoherovideo.firebasestorage.app/o/%E6%89%8B%E6%8C%87.mp4?alt=media&token=d852ddd6-202c-4d1d-9dc9-cb307a4ddc97" 
              controls 
              autoPlay 
              preload="auto"
              playsInline
              className="w-[90%] max-w-4xl rounded-3xl shadow-2xl border-8 border-white"
              onEnded={handleVideoEnd}
            />
            <button 
              onClick={handleVideoEnd}
              className="mt-8 bg-white/50 text-slate-700 text-lg font-bold py-3 px-8 rounded-full shadow-md hover:bg-white transition-colors"
            >
              跳过视频 ➡
            </button>
          </motion.div>
        )}

        {(phase === 'q1' || phase === 'q2' || phase === 'q3') && currentQ && (
          <motion.div 
            key={`q-${currentQIndex}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="flex flex-col items-center w-full h-full pt-24 md:pt-32 pb-4 px-4"
          >
            {/* Hand Image Area */}
            <div 
              className="relative aspect-square flex-shrink-0 transition-transform duration-300"
              style={{ 
                width: '100%', 
                maxWidth: '32rem',
                transform: `translate(${IMAGE_OFFSET_X}px, ${IMAGE_OFFSET_Y}px) scale(${IMAGE_SCALE / 100})`,
                transformOrigin: 'center center'
              }}
            >
              <img 
                src={currentQ.image} 
                alt="Hand" 
                className="w-full h-full object-contain drop-shadow-2xl"
                draggable={false}
              />
              
              {/* Slots */}
              {getSlotPositions(currentQ.side, currentQ.hand).map((pos, i) => (
                <div 
                  key={i}
                  data-slot-index={i}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 flex items-center justify-center transition-colors duration-300 ${
                    placedNumbers[i] !== null 
                      ? 'bg-yellow-300 border-yellow-400 shadow-[0_0_15px_rgba(253,224,71,0.8)]' 
                      : 'bg-white/50 border-white/80 border-dashed'
                  }`}
                  style={{ 
                    left: `${pos.left}%`, 
                    top: `${pos.top}%`,
                    width: `${SLOT_SIZE}px`,
                    height: `${SLOT_SIZE}px`
                  }}
                >
                  {placedNumbers[i] !== null && (
                    <span className="text-3xl md:text-5xl font-black text-yellow-700">
                      {placedNumbers[i]}
                    </span>
                  )}
                </div>
              ))}

              {/* Completion Star */}
              <AnimatePresence>
                {qPhase === 'completed' && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, rotate: 360 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                  >
                    <span className="text-9xl drop-shadow-[0_0_30px_rgba(250,204,21,1)]">⭐</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Interaction Area */}
            <div className="flex-1 w-full flex items-center justify-center mt-4">
              {qPhase === 'select_hand' && (
                <div className="flex gap-8">
                  <motion.button
                    animate={wrongShake === 'left' ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    onClick={() => handleSelectHand('left')}
                    className="bg-blue-400 text-white text-2xl md:text-4xl font-bold py-4 px-8 md:px-12 rounded-3xl shadow-lg border-4 border-white hover:scale-105 active:scale-95"
                  >
                    左手
                  </motion.button>
                  <motion.button
                    animate={wrongShake === 'right' ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    onClick={() => handleSelectHand('right')}
                    className="bg-red-400 text-white text-2xl md:text-4xl font-bold py-4 px-8 md:px-12 rounded-3xl shadow-lg border-4 border-white hover:scale-105 active:scale-95"
                  >
                    右手
                  </motion.button>
                </div>
              )}

              {qPhase === 'drag_numbers' && (
                <div className="flex gap-2 md:gap-4 flex-wrap justify-center">
                  {[1, 2, 3, 4, 5].map(num => {
                    const isPlaced = placedNumbers.includes(num);
                    if (isPlaced) return <div key={num} className="w-20 h-20 md:w-24 md:h-24" />; // Placeholder
                    
                    return (
                      <motion.div
                        key={num}
                        drag
                        dragSnapToOrigin={true}
                        onDragEnd={(e, info) => handleDragEnd(e, info, num)}
                        whileDrag={{ scale: 1.2, zIndex: 100 }}
                        className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shadow-md border-4 border-pink-300 flex items-center justify-center cursor-grab active:cursor-grabbing"
                      >
                        <span className="text-4xl md:text-5xl font-black text-pink-500">{num}</span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {phase === 'outro' && (
          <motion.div 
            key="outro"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-4xl md:text-5xl font-black text-blue-500 mb-8 drop-shadow-md">太棒了！准备好测验了吗？</h1>
            <button 
              onClick={onComplete}
              className="bg-gradient-to-b from-yellow-300 to-yellow-500 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-transform border-4 border-white"
            >
              进入小测验 ➡
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};
