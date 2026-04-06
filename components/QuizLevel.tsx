import React, { useState, useMemo } from 'react';
import { LevelConfig, Question } from '../types';
import { Button } from './Button';

interface QuizLevelProps {
  level: LevelConfig;
  onComplete: (success: boolean) => void;
  onExit: () => void;
}

type Phase = 'TEACHING' | 'QUIZ' | 'RESULT';

export const QuizLevel: React.FC<QuizLevelProps> = ({ level, onComplete, onExit }) => {
  const [phase, setPhase] = useState<Phase>('TEACHING');
  const [slideIndex, setSlideIndex] = useState(0);
  
  // Quiz State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{isCorrect: boolean, text: string} | null>(null);

  // Initialize Quiz questions (random 5) on mount
  React.useEffect(() => {
    if (level.questions) {
      const shuffled = [...level.questions].sort(() => 0.5 - Math.random());
      setQuestions(shuffled.slice(0, 5));
    }
  }, [level]);

  // --- Handlers ---

  const nextSlide = () => {
    if (level.teachingSlides && slideIndex < level.teachingSlides.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      setPhase('QUIZ');
    }
  };

  const handleAnswer = (userSaysTrue: boolean) => {
    const q = questions[currentQIndex];
    const isCorrect = userSaysTrue === q.isTrue;

    setFeedback({
      isCorrect,
      text: isCorrect ? 'Awesome! Correct! 🎉' : `Oops! ${q.explanation}`,
    });

    if (isCorrect) setScore(s => s + 1);

    // Wait 2 seconds then move on
    setTimeout(() => {
      setFeedback(null);
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(currentQIndex + 1);
      } else {
        setPhase('RESULT');
      }
    }, 2500);
  };

  // --- Renders ---

  const renderTeaching = () => {
    if (!level.teachingSlides) return null;
    const slide = level.teachingSlides[slideIndex];

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-blue-200 w-full max-w-2xl">
           <img 
             src={slide.image} 
             alt={slide.title} 
             className="w-full h-48 object-cover rounded-xl mb-6 bg-gray-100" 
           />
           <h2 className="text-3xl font-black text-blue-600 mb-4">{slide.title}</h2>
           <p className="text-xl text-gray-700 font-medium mb-8 leading-relaxed">
             {slide.content}
           </p>
           
           <div className="flex justify-between items-center mt-4">
              <span className="text-sm font-bold text-gray-400">
                Step {slideIndex + 1} of {level.teachingSlides.length}
              </span>
              <Button onClick={nextSlide} size="lg">
                {slideIndex === level.teachingSlides.length - 1 ? 'Start Mission! ⚔️' : 'Next ➡'}
              </Button>
           </div>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    const q = questions[currentQIndex];
    if (!q) return <div>Loading...</div>;

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="w-full bg-gray-300 rounded-full h-4 mb-6 border-2 border-gray-400">
          <div 
            className="bg-yellow-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${((currentQIndex) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Card */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-indigo-200 w-full relative overflow-hidden">
          
          {/* Feedback Overlay */}
          {feedback && (
             <div className={`absolute inset-0 flex items-center justify-center z-10 bg-opacity-95 ${feedback.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className="text-center p-4">
                  <div className="text-6xl mb-4">{feedback.isCorrect ? '🌟' : '🙈'}</div>
                  <h3 className={`text-2xl font-black mb-2 ${feedback.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {feedback.isCorrect ? 'Correct!' : 'Try again next time!'}
                  </h3>
                  <p className="text-lg font-bold text-gray-700">{feedback.text}</p>
                </div>
             </div>
          )}

          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            {q.text}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => !feedback && handleAnswer(true)} 
              variant="secondary" 
              className="h-32 text-3xl"
              disabled={!!feedback}
            >
              TRUE ✅
            </Button>
            <Button 
              onClick={() => !feedback && handleAnswer(false)} 
              variant="danger" 
              className="h-32 text-3xl"
              disabled={!!feedback}
            >
              FALSE ❌
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    const percent = (score / questions.length) * 100;
    const passed = percent >= level.passingScorePercent;
    
    // Auto trigger completion handler after user sees result
    const handleFinish = () => {
      onComplete(passed);
    };

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-b-8 border-yellow-500 w-full max-w-lg">
           <div className="text-8xl mb-4 animate-bounce">
             {passed ? '🏆' : '🛡️'}
           </div>
           
           <h2 className="text-4xl font-black text-gray-800 mb-2">
             {passed ? 'Victory!' : 'Mission Failed'}
           </h2>
           
           <p className="text-xl font-bold text-gray-500 mb-6">
             {passed 
               ? `You scored ${score}/${questions.length}! You mastered the Staff!` 
               : `Score: ${score}/${questions.length}. Don't give up, hero!`}
           </p>

           {passed && level.reward && (
             <div className="bg-yellow-100 p-4 rounded-xl border-2 border-yellow-300 mb-6 flex items-center gap-4">
                <div className="text-4xl">{level.reward.icon}</div>
                <div className="text-left">
                  <div className="text-xs font-bold text-yellow-700 uppercase">Loot Acquired</div>
                  <div className="font-black text-yellow-900">{level.reward.name}</div>
                </div>
             </div>
           )}

           <div className="flex gap-4 justify-center">
              {!passed && (
                <Button onClick={() => window.location.reload()} variant="primary">
                  Try Again 🔄
                </Button>
              )}
              <Button onClick={handleFinish} variant={passed ? 'primary' : 'secondary'}>
                {passed ? 'Continue ➡' : 'Return to Map 🗺️'}
              </Button>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-indigo-50 flex flex-col">
       <div className="p-4 flex justify-between items-center">
         <Button size="sm" variant="locked" onClick={onExit}>Exit Mission 🏳️</Button>
         <div className="font-bold text-gray-400">Level 1-1</div>
       </div>
       
       {phase === 'TEACHING' && renderTeaching()}
       {phase === 'QUIZ' && renderQuiz()}
       {phase === 'RESULT' && renderResult()}
    </div>
  );
};