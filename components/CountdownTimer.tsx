import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  
  function calculateTimeLeft() {
    const difference = targetDate.getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }
    
    return {
      hours: Math.floor(difference / (1000 * 60 * 60)),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatNumber = (num: number) => String(num).padStart(2, '0');
  
  // Return if expired
  if (targetDate.getTime() < new Date().getTime()) {
    return <p className="text-green-400 text-sm mt-2">Cooldown period completed! Ready for next check.</p>;
  }
  
  // Calculate progress percentage
  const now = new Date().getTime();
  const start = new Date(targetDate).getTime() - (24 * 60 * 60 * 1000); // Assuming 24h cooldown
  const elapsed = now - start;
  const total = targetDate.getTime() - start;
  const progressPercent = Math.min(100, Math.round((elapsed / total) * 100));
  
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>Cooldown Progress</span>
        <span>{progressPercent}%</span>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
        <div 
          className="bg-yellow-600 h-2.5 rounded-full transition-all duration-1000 ease-linear" 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      
      <p className="text-yellow-400 text-sm">
        Time remaining: {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
      </p>
    </div>
  );
}
