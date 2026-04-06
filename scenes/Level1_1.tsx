import React, { useState, useEffect } from 'react';

interface Level1_1Props {
  onComplete: () => void;
}

export const Level1_1: React.FC<Level1_1Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [spriteMessage, setSpriteMessage] = useState("欢迎来到坐姿训练营！先来看看正确的姿势吧！");
  const [wrongOptionId, setWrongOptionId] = useState<string | null>(null);
  const [correctOptionId, setCorrectOptionId] = useState<string | null>(null);
  const [multiSelect, setMultiSelect] = useState<string[]>([]);
  const [isSpriteFlying, setIsSpriteFlying] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Video plays first, no intro sequence needed here

  const playSound = (type: 'ding' | 'prompt' | 'win') => {
    // Mock sound playing - in a real app, use Audio API
    console.log(`Playing sound: ${type}`);
  };

  const nextStep = (nextMessage: string) => {
    setTimeout(() => {
      setStep(s => s + 1);
      setSpriteMessage(nextMessage);
      setWrongOptionId(null);
      setCorrectOptionId(null);
      setMultiSelect([]);
    }, 1500);
  };

  const handleQ1 = (id: string) => {
    if (correctOptionId) return; // Prevent multiple clicks
    if (id === 'C') {
      setCorrectOptionId(id);
      setSpriteMessage("没错！坐在前半部分最灵活！");
      playSound('ding');
      nextStep("看看手臂，哪个姿势更轻松？");
    } else {
      setWrongOptionId(id);
      setSpriteMessage("再想一想～坐太后会变僵硬哦。");
      setTimeout(() => setWrongOptionId(null), 500);
    }
  };

  const handleQ2 = (id: string) => {
    if (correctOptionId) return;
    if (id === '1') {
      setCorrectOptionId(id);
      setSpriteMessage("对啦！身体更靠近键盘。");
      playSound('ding');
      nextStep("如果双脚够不到地面怎么办？");
    } else {
      setWrongOptionId(id);
      setSpriteMessage("看看手臂，是不是在用力伸呢？");
      setTimeout(() => setWrongOptionId(null), 500);
    }
  };

  const handleQ3 = (id: string) => {
    if (correctOptionId) return;
    if (id === 'B') {
      setCorrectOptionId(id);
      setSpriteMessage("对！脚要稳稳踩着。");
      playSound('ding');
      nextStep("哪只手更像抱着小气球？");
    } else {
      setWrongOptionId(id);
      setSpriteMessage("再想想，脚悬空会不稳哦。");
      setTimeout(() => setWrongOptionId(null), 500);
    }
  };

  const handleQ4 = (id: string) => {
    if (correctOptionId) return;
    if (id === '2') {
      setCorrectOptionId(id);
      setSpriteMessage("太棒了！手指要圆圆的。");
      playSound('ding');
      nextStep("好的坐姿需要做到哪几件事？");
    } else {
      setWrongOptionId(id);
      setSpriteMessage("手指太平了，像小气球一样圆圆的才对哦。");
      setTimeout(() => setWrongOptionId(null), 500);
    }
  };

  const toggleMultiSelect = (id: string) => {
    if (correctOptionId) return;
    setMultiSelect(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const checkQ5 = () => {
    const correct = ['1', '2', '3'];
    const isAllCorrect = correct.every(c => multiSelect.includes(c)) && !multiSelect.includes('4');
    
    if (isAllCorrect) {
      setCorrectOptionId('all');
      setSpriteMessage("恭喜！坐姿训练完成！");
      playSound('win');
      setIsSpriteFlying(true);
      setTimeout(() => {
        setIsSpriteFlying(false);
        setStep(6);
        setSpriteMessage("现在，你已经准备好真正弹琴啦！");
        setShowContent(false);
      }, 2500);
    } else {
      setWrongOptionId('submit');
      setSpriteMessage("好像还有没选对的哦，再检查一下！");
      setTimeout(() => setWrongOptionId(null), 500);
    }
  };

  const finish = () => {
    setIsFadingOut(true);
    setTimeout(onComplete, 1000);
  };

  return (
    <div className={`w-full h-full bg-[#fdf6e3] overflow-y-auto overflow-x-hidden text-slate-800 transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="min-h-full w-full flex flex-col items-center justify-start md:justify-center p-4 pt-20 md:p-8 relative">
      
      {/* Quiz Phase Background Music */}
      {step >= 1 && (
        <audio 
          src="/第一关.mp3" 
          autoPlay 
          loop 
          ref={(el) => { if (el) el.volume = 0.3; }} /* 默认 30% 音量 */
        />
      )}

      {/* Fullscreen Video Step */}
      {step === 0 && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fade-in">
          <video 
            src="https://firebasestorage.googleapis.com/v0/b/pianoherovideo.firebasestorage.app/o/%E5%9D%90%E5%A7%BF%E8%AE%AD%E7%BB%83%E8%90%A5.mp4?alt=media&token=4ca5540c-e413-41cf-8263-43f2380b7595" 
            autoPlay 
            controls 
            playsInline
            preload="auto"
            className="w-full h-full object-contain"
            onEnded={() => {
              setStep(1);
              setShowContent(true);
              setSpriteMessage("想一想，我们刚刚学了什么？");
            }}
          />
          <button 
            onClick={() => {
              setStep(1);
              setShowContent(true);
              setSpriteMessage("想一想，我们刚刚学了什么？");
            }}
            className="absolute top-6 right-6 px-6 py-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full font-bold transition-all z-50"
          >
            跳过视频 ⏭
          </button>
        </div>
      )}

      {/* Sprite Area */}
      <div 
        className={`absolute z-50 flex flex-col items-center transition-all duration-1000 ease-in-out
          ${step === 0 ? 'opacity-0 pointer-events-none scale-50' : 'opacity-100'}
          ${step === 6
            ? 'left-1/2 bottom-8 -translate-x-1/2 scale-110'
            : 'left-4 md:left-12 bottom-8 md:bottom-12 scale-100'
          }
        `}
      >
        {/* Sprite Message Bubble */}
        <div className="bg-white p-3 md:p-4 rounded-2xl shadow-lg border-2 border-yellow-300 mb-4 max-w-[200px] md:max-w-xs text-center relative animate-slide-up-fade-in">
          <p className="text-sm md:text-lg font-bold text-slate-700">{spriteMessage}</p>
          {/* Triangle pointer */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-yellow-300 transform rotate-45"></div>
        </div>
        
        <div className={`relative w-24 h-24 md:w-32 md:h-32 ${isSpriteFlying ? 'animate-fly-circle' : 'animate-float'}`}>
          <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-40 rounded-full animate-pulse"></div>
          <img src="/Jinlin.jpg" alt="Sprite" className="w-full h-full object-contain relative z-10 rounded-full drop-shadow-md" />
        </div>
      </div>

      {/* Content Area */}
      <div 
        className={`w-full max-w-3xl bg-white/90 backdrop-blur-md p-6 md:p-10 rounded-3xl shadow-xl border-4 border-white transition-all duration-700 transform
          ${showContent && step > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
          ${step > 0 && step < 6 ? 'ml-0 md:ml-48' : ''}
        `}
      >
        {step === 1 && (
          <div className="flex flex-col items-center text-center animate-slide-up-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8">坐在钢琴凳的哪个位置最合适？</h2>
            <div className="flex flex-col gap-4 w-full max-w-md">
              {[
                { id: 'A', text: 'A. 正中间' },
                { id: 'B', text: 'B. 靠后面' },
                { id: 'C', text: 'C. 前二分之一' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleQ1(opt.id)}
                  className={`p-4 rounded-2xl text-lg font-bold transition-all duration-300 border-4
                    ${correctOptionId === opt.id ? 'bg-green-100 border-green-400 scale-105 shadow-[0_0_20px_rgba(74,222,128,0.5)]' : 
                      wrongOptionId === opt.id ? 'bg-red-50 border-red-300 animate-shake' : 
                      'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:-translate-y-1'}
                  `}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center text-center animate-slide-up-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8">哪一个姿势更轻松？</h2>
            <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-center">
              {[
                { id: '1', img: '/坐姿第二题1.png' },
                { id: '2', img: '/坐姿第二题2.png' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleQ2(opt.id)}
                  className={`relative rounded-2xl overflow-hidden transition-all duration-300 border-4
                    ${correctOptionId === opt.id ? 'border-green-400 scale-105 shadow-[0_0_20px_rgba(74,222,128,0.5)]' : 
                      wrongOptionId === opt.id ? 'border-red-300 animate-shake' : 
                      'border-slate-200 hover:border-blue-300 hover:-translate-y-1'}
                  `}
                >
                  <img src={opt.img} alt={`Option ${opt.id}`} className="w-48 h-48 md:w-64 md:h-64 object-cover bg-white" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center text-center animate-slide-up-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8">如果双脚够不到地面怎么办？</h2>
            <div className="flex flex-col gap-4 w-full max-w-md">
              {[
                { id: 'A', text: 'A. 悬空' },
                { id: 'B', text: 'B. 加小脚凳' },
                { id: 'C', text: 'C. 坐得更后' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleQ3(opt.id)}
                  className={`p-4 rounded-2xl text-lg font-bold transition-all duration-300 border-4
                    ${correctOptionId === opt.id ? 'bg-green-100 border-green-400 scale-105 shadow-[0_0_20px_rgba(74,222,128,0.5)]' : 
                      wrongOptionId === opt.id ? 'bg-red-50 border-red-300 animate-shake' : 
                      'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:-translate-y-1'}
                  `}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center text-center animate-slide-up-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8">哪只手更像抱着小气球？</h2>
            <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-center">
              {[
                { id: '1', img: '/坐姿第四题1.png' },
                { id: '2', img: '/坐姿第四题2.png' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleQ4(opt.id)}
                  className={`relative rounded-2xl overflow-hidden transition-all duration-300 border-4
                    ${correctOptionId === opt.id ? 'border-green-400 scale-105 shadow-[0_0_20px_rgba(74,222,128,0.5)]' : 
                      wrongOptionId === opt.id ? 'border-red-300 animate-shake' : 
                      'border-slate-200 hover:border-blue-300 hover:-translate-y-1'}
                  `}
                >
                  <img src={opt.img} alt={`Option ${opt.id}`} className="w-48 h-48 md:w-64 md:h-64 object-cover bg-white" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col items-center text-center animate-slide-up-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8">好的坐姿需要做到哪几件事？(多选)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mb-8">
              {[
                { id: '1', text: '坐前半' },
                { id: '2', text: '双脚踩稳' },
                { id: '3', text: '肩膀放松' },
                { id: '4', text: '弯腰驼背' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => toggleMultiSelect(opt.id)}
                  className={`p-4 rounded-2xl text-lg font-bold transition-all duration-300 border-4 flex items-center gap-3
                    ${multiSelect.includes(opt.id) ? 'bg-blue-100 border-blue-400' : 'bg-slate-50 border-slate-200 hover:border-blue-300'}
                    ${correctOptionId === 'all' && ['1','2','3'].includes(opt.id) ? 'bg-green-100 border-green-400' : ''}
                  `}
                >
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center
                    ${multiSelect.includes(opt.id) ? 'bg-blue-500 border-blue-500' : 'border-slate-400'}
                  `}>
                    {multiSelect.includes(opt.id) && <span className="text-white text-sm">✓</span>}
                  </div>
                  {opt.text}
                </button>
              ))}
            </div>
            <button 
              onClick={checkQ5}
              className={`px-8 py-3 rounded-full text-white font-bold text-xl transition-all
                ${correctOptionId === 'all' ? 'bg-green-500 scale-0 opacity-0' : 'bg-yellow-500 hover:bg-yellow-400 hover:scale-105 shadow-lg'}
                ${wrongOptionId === 'submit' ? 'animate-shake bg-red-500' : ''}
              `}
            >
              提交答案
            </button>
          </div>
        )}
      </div>

      {/* Outro Step */}
      {step === 6 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40 animate-slide-up-fade-in pointer-events-none">
          <div className="relative mb-32 mt-12">
            <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-50 rounded-full animate-pulse"></div>
            <div className="text-9xl filter drop-shadow-[0_0_30px_rgba(250,204,21,0.8)] animate-bounce">⭐</div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 whitespace-nowrap">
              <h2 className="text-4xl font-black text-yellow-500 drop-shadow-md tracking-wider">坐姿守护者</h2>
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
    </div>
  );
};
