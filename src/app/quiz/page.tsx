'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, Trophy, XCircle, CheckCircle2 } from 'lucide-react';
import { QUIZ_DATA } from './data';

export default function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lives, setLives] = useState(3);
  const [quizState, setQuizState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  const question = QUIZ_DATA[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / QUIZ_DATA.length) * 100;

  const handleOptionClick = (index: number) => {
    if (isAnswerChecked) return;
    setSelectedOption(index);
  };

  const handleCheck = () => {
    if (selectedOption === null) return;
    
    setIsAnswerChecked(true);
    
    if (selectedOption !== question.correctIndex) {
      setLives(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === question.correctIndex;
    
    if (!isCorrect && lives === 1) {
      // Was 1, just subtracted 1 => 0 lives
      setQuizState('lost');
    } else if (currentQuestionIndex === QUIZ_DATA.length - 1) {
      setQuizState('won');
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setLives(3);
    setQuizState('playing');
    setSelectedOption(null);
    setIsAnswerChecked(false);
  };

  if (quizState === 'won') {
    const flawless = lives === 3;
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', padding: '40px 20px', animation: 'slide-up 0.4s ease' }}>
        <Trophy size={80} color={flawless ? '#F59E0B' : '#10B981'} style={{ margin: '0 auto 24px' }} />
        <h1 style={{ fontSize: '2rem', marginBottom: 16 }}>
          {flawless ? 'Безупречно!' : 'Квиз пройден!'}
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: 32 }}>
          {flawless 
            ? 'Типо без ошибок прошли! Вы настоящий эксперт по гемофилии.' 
            : `Вы успешно завершили квиз. У вас осталось жизней: ${lives}.`}
        </p>
        <Link href="/">
          <button className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            Вернуться на главную
          </button>
        </Link>
      </div>
    );
  }

  if (quizState === 'lost') {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', padding: '40px 20px', animation: 'slide-up 0.4s ease' }}>
        <XCircle size={80} color="var(--color-sos)" style={{ margin: '0 auto 24px' }} />
        <h1 style={{ fontSize: '2rem', marginBottom: 16 }}>Попробуйте еще раз</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: 32 }}>
          Вы потеряли все жизни. Ошибаться — это часть обучения.
        </p>
        <button onClick={handleRestart} className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem', marginBottom: 12, display: 'block', width: '100%' }}>
          Начать заново
        </button>
        <Link href="/">
          <button style={{ 
            width: '100%', padding: '16px', background: 'transparent', 
            border: '1px solid var(--color-border)', borderRadius: 12,
            fontWeight: 600, cursor: 'pointer', color: 'var(--color-text)'
          }}>
            Вернуться на главную
          </button>
        </Link>
      </div>
    );
  }

  const isCorrectChoice = isAnswerChecked && selectedOption === question.correctIndex;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '85vh' }}>
      {/* HEADER */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <Link href="/" style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft size={24} />
        </Link>
        <div style={{ flex: 1, height: 12, background: 'var(--color-border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--color-primary)', width: `${progress}%`, transition: 'width 0.3s ease' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-sos)', fontWeight: 700 }}>
          <Heart size={20} fill="var(--color-sos)" /> {lives}
        </div>
      </header>

      {/* QUESTION */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 32, lineHeight: 1.3 }}>
        {question.text}
      </h2>

      {/* OPTIONS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {question.options.map((option, index) => {
          let bg = 'var(--color-bg)';
          let borderColor = 'var(--color-border)';
          let color = 'var(--color-text)';

          if (isAnswerChecked) {
            if (index === question.correctIndex) {
              bg = 'var(--color-success-light)';
              borderColor = 'var(--color-success)';
              color = 'var(--color-success)';
            } else if (index === selectedOption) {
              bg = 'var(--color-sos-light)';
              borderColor = 'var(--color-sos)';
              color = 'var(--color-sos)';
            }
          } else if (selectedOption === index) {
            borderColor = 'var(--color-primary)';
            bg = 'var(--color-primary-muted)';
          }

          return (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              style={{
                textAlign: 'left',
                padding: '16px 20px',
                borderRadius: 16,
                border: `2px solid ${borderColor}`,
                background: bg,
                color,
                fontSize: '1.05rem',
                fontWeight: selectedOption === index ? 600 : 500,
                cursor: isAnswerChecked ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* FOOTER ACTIONS */}
      {isAnswerChecked && (
        <div style={{ 
          marginTop: 24, padding: 20, borderRadius: 16, 
          background: isCorrectChoice ? 'var(--color-success-light)' : 'var(--color-sos-light)',
          animation: 'slide-up 0.3s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ 
              fontWeight: 800, fontSize: '1.2rem', 
              color: isCorrectChoice ? 'var(--color-success)' : 'var(--color-sos)',
              display: 'flex', alignItems: 'center', gap: 8 
            }}>
              {isCorrectChoice ? <CheckCircle2 /> : <XCircle />} 
              {isCorrectChoice ? 'Верно!' : 'Неверно'}
            </div>
          </div>
          <button onClick={handleNext} className="btn" style={{ 
            background: isCorrectChoice ? 'var(--color-success)' : 'var(--color-sos)',
            color: 'white', fontWeight: 700, padding: '12px 24px',
            border: 'none', borderRadius: 12, cursor: 'pointer'
          }}>
            Продолжить
          </button>
        </div>
      )}

      {!isAnswerChecked && (
        <button
          onClick={handleCheck}
          disabled={selectedOption === null}
          className="btn btn-primary"
          style={{
            marginTop: 24, padding: '16px', fontSize: '1.1rem',
            opacity: selectedOption === null ? 0.5 : 1,
            pointerEvents: selectedOption === null ? 'none' : 'auto'
          }}
        >
          Проверить
        </button>
      )}
    </div>
  );
}
