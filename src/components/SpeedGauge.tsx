
import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SpeedGaugeProps {
  value: number;
  maxValue: number;
  label: string;
  unit: string;
  color: string;
  isLoading?: boolean;
}

const SpeedGauge = ({
  value,
  maxValue,
  label,
  unit,
  color,
  isLoading = false,
}: SpeedGaugeProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw gauge on canvas for smoother animation and better visual quality
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions with device pixel ratio for retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI * 0.75, Math.PI * 2.25, false);
    ctx.lineWidth = 16;
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.stroke();
    
    if (isLoading) {
      // Draw animated loading indicator
      const time = Date.now() / 1000;
      const startAngle = (time * 2) % (Math.PI * 2);
      const endAngle = startAngle + Math.PI * 0.75;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.strokeStyle = color;
      ctx.stroke();
      
      // Request animation frame for loading animation
      requestAnimationFrame(() => {
        if (isLoading) setRotation(prev => prev + 1); // Just to trigger a re-render
      });
    } else {
      // Draw value arc
      const percentage = Math.min(animatedValue / maxValue, 1);
      const angle = percentage * Math.PI * 1.5 + Math.PI * 0.75;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, Math.PI * 0.75, angle, false);
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.strokeStyle = color;
      ctx.stroke();
      
      // Draw tick marks
      for (let i = 0; i <= 270; i += 45) {
        const tickAngle = (i * Math.PI / 180) + Math.PI * 0.75;
        const innerRadius = radius - 20;
        const outerRadius = radius - 8;
        
        const x1 = centerX + innerRadius * Math.cos(tickAngle);
        const y1 = centerY + innerRadius * Math.sin(tickAngle);
        const x2 = centerX + outerRadius * Math.cos(tickAngle);
        const y2 = centerY + outerRadius * Math.sin(tickAngle);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.stroke();
      }
    }
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 30, 0, Math.PI * 2, false);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }, [animatedValue, color, isLoading, maxValue, rotation]);

  useEffect(() => {
    if (isLoading) {
      setAnimatedValue(0);
      return;
    }

    // Animate the value with spring physics for more natural movement
    const animateValue = () => {
      const target = value;
      const current = animatedValue;
      const spring = 0.2; // Spring tension (0-1)
      const damping = 0.7; // Damping factor to prevent overshooting
      
      // Calculate spring physics
      const diff = target - current;
      const velocity = diff * spring * damping;
      
      if (Math.abs(diff) < 0.1) {
        setAnimatedValue(target);
        return;
      }
      
      setAnimatedValue(current + velocity);
      requestAnimationFrame(animateValue);
    };
    
    requestAnimationFrame(animateValue);
  }, [value, isLoading]);
  
  const percentage = Math.min((value / maxValue) * 100, 100);
  const gaugeClassNames = cn(
    'w-48 h-48 relative',
    isLoading ? 'opacity-90' : ''
  );

  return (
    <div className="flex flex-col items-center">
      <div className={gaugeClassNames}>
        {/* Canvas for drawing the gauge */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Center value display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-inner">
            <div className="text-3xl font-bold transition-all duration-300">
              {isLoading ? (
                <span className="inline-flex space-x-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce animation-delay-100">.</span>
                  <span className="animate-bounce animation-delay-200">.</span>
                </span>
              ) : (
                animatedValue.toFixed(1)
              )}
            </div>
            <div className="text-sm text-muted-foreground">{unit}</div>
          </div>
        </div>
        
        {/* Gauge label */}
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <span className="text-sm font-medium">{label}</span>
        </div>
        
        {/* Add subtle glow effect on good values */}
        {percentage > 70 && !isLoading && (
          <div 
            className="absolute inset-0 rounded-full opacity-20 animate-pulse-slow"
            style={{ 
              boxShadow: `0 0 20px 5px ${color}`,
              animation: 'pulse 2s infinite'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SpeedGauge;
