
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SpeedDialProps {
  title: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const SpeedDial = ({
  title,
  value,
  max,
  unit,
  color,
  size = 'md',
  isLoading = false
}: SpeedDialProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setDisplayValue(0);
      return;
    }

    // Animate the value
    const duration = 1000; // ms
    const start = displayValue;
    const end = value;
    const increment = (end - start) / (duration / 16); // 60fps
    let currentTime = 0;

    const timer = setInterval(() => {
      currentTime += 16;
      const newValue = start + increment * currentTime;
      
      if ((increment > 0 && newValue >= end) || (increment < 0 && newValue <= end)) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(newValue);
      }
    }, 16);

    return () => {
      clearInterval(timer);
    };
  }, [value, isLoading]);

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  const progressPercentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <div className="relative flex items-center justify-center mb-2">
        <div 
          className={cn(
            "font-bold",
            sizeClasses[size],
            isLoading ? 'opacity-50' : ''
          )}
          style={{ color }}
        >
          {isLoading ? '...' : displayValue.toFixed(1)}
        </div>
        <span className="text-sm ml-1 mt-1 text-muted-foreground">{unit}</span>
      </div>
      <div className="w-full">
        <Progress 
          value={isLoading ? 0 : progressPercentage}
          className={cn("h-2", isLoading ? "animate-pulse" : "")}
          style={{ 
            backgroundColor: color + '40',
            '--progress-foreground': color 
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
};

export default SpeedDial;
