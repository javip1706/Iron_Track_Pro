import React, { useEffect, useState, useRef } from 'react';
import { X, Play, Pause, SkipForward } from 'lucide-react';

interface RestTimerProps {
  seconds: number;
  isOpen: boolean;
  onClose: (actualTimeSpent: number) => void;
  onComplete: (actualTimeSpent: number) => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ seconds, isOpen, onClose, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isActive, setIsActive] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(seconds);
      setTimeSpent(0);
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [isOpen, seconds]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    } else if (timeLeft <= 0 && isActive) {
      setIsActive(false);
      playBeep();
      setTimeout(() => onComplete(timeSpent), 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete, timeSpent]);

  const playBeep = () => {
    try {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.error("Audio play failed", e);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  const addTime = (sec: number) => setTimeLeft(t => t + sec);
  
  const handleClose = () => {
      onClose(timeSpent);
  };

  const handleSkip = () => {
      playBeep();
      onComplete(timeSpent);
  }

  if (!isOpen) return null;

  // Visual calculation
  // Container is w-32 (128px). Center is 64.
  // Radius 54 + Stroke 5 (half of 10) = 59. Fits in 64.
  const radius = 54; 
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, timeLeft / (seconds + (timeSpent - (seconds - timeLeft)))); 
  const visualProgress = timeLeft / seconds; 
  const dashOffset = circumference - visualProgress * circumference;

  let colorClass = 'stroke-primary';
  if (visualProgress < 0.3) colorClass = 'stroke-red-500';
  else if (visualProgress < 0.6) colorClass = 'stroke-yellow-500';

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col justify-end pointer-events-none h-screen">
      <div className="bg-gray-900 border-t-2 border-primary w-full h-[50vh] pointer-events-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-4 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-start mb-4 shrink-0">
             <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">Descanso</h3>
             <button onClick={handleClose} className="p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700">
                <X size={20} />
             </button>
          </div>

          <div className="flex-1 flex items-center justify-center gap-6">
              {/* Timer Circle */}
              <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
                <svg className="absolute transform -rotate-90 w-full h-full" viewBox="0 0 128 128">
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="#1e293b" 
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    className={`${colorClass} transition-all duration-1000 ease-linear`}
                  />
                </svg>
                <div className="relative z-10 text-3xl font-bold font-mono tracking-tighter text-white">
                  {timeLeft}<span className="text-sm">s</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-4">
                  <div className="flex gap-4 justify-center">
                    <button onClick={toggleTimer} className="p-4 rounded-full bg-gray-800 border-2 border-gray-700 hover:bg-gray-700 active:scale-95 transition shadow-lg">
                      {isActive ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button onClick={handleSkip} className="p-4 rounded-full bg-primary/10 border-2 border-primary text-primary hover:bg-primary/20 active:scale-95 transition shadow-lg shadow-primary/20">
                      <SkipForward size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => addTime(10)} className="py-2 px-3 rounded bg-gray-800 hover:bg-gray-700 font-bold border border-gray-700 transition text-xs">+10s</button>
                    <button onClick={() => addTime(30)} className="py-2 px-3 rounded bg-gray-800 hover:bg-gray-700 font-bold border border-gray-700 transition text-xs">+30s</button>
                    <button onClick={() => addTime(60)} className="py-2 px-3 rounded bg-gray-800 hover:bg-gray-700 font-bold border border-gray-700 transition text-xs">+60s</button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};