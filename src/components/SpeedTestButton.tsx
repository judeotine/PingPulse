
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Activity, Gauge, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpeedTestButtonProps {
  onTest: () => void;
  isLoading: boolean;
  className?: string;
}

const SpeedTestButton = ({ onTest, isLoading, className }: SpeedTestButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Create ripple effect
    if (buttonRef.current) {
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.style.position = 'absolute';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.transform = 'translate(-50%, -50%)';
      ripple.style.width = '0px';
      ripple.style.height = '0px';
      ripple.style.borderRadius = '50%';
      ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
      ripple.style.transition = 'all 0.6s cubic-bezier(0.2, 0, 0, 1)';
      
      button.appendChild(ripple);
      
      setTimeout(() => {
        ripple.style.width = '300px';
        ripple.style.height = '300px';
        ripple.style.opacity = '0';
      }, 10);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
      
      // Add haptic feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    }
    
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);

    // Call the onTest function
    onTest();
  };
  
  return (
    <Button 
      ref={buttonRef}
      onClick={handleClick} 
      disabled={isLoading}
      className={cn(
        'gap-2 relative overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
        isLoading ? 'bg-pulse-purple/70' : 'bg-pulse-purple hover:bg-pulse-purple-dark',
        isLoading ? 'animate-pulse' : '',
        isPressed ? 'scale-95' : '',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {isLoading ? (
        <>
          <Activity className="h-4 w-4 animate-spin-slow" />
          <div className="flex items-center">
            <span className="mr-2">Testing</span>
            <span className="inline-flex">
              <span className="animate-bounce mr-[2px]">.</span>
              <span className="animate-bounce animation-delay-100 mr-[2px]">.</span>
              <span className="animate-bounce animation-delay-200">.</span>
            </span>
          </div>
        </>
      ) : (
        <>
          <Gauge className="h-4 w-4" />
          <span>Run Speed Test</span>
        </>
      )}
      
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
      )}
    </Button>
  );
};

export default SpeedTestButton;
