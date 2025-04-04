
import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Timer } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface TestSchedulerProps {
  onScheduleChange: (isActive: boolean, intervalHours: number) => void;
  defaultInterval?: number;
  defaultActive?: boolean;
}

const TestScheduler = ({ 
  onScheduleChange, 
  defaultInterval = 4, 
  defaultActive = false 
}: TestSchedulerProps) => {
  const [isActive, setIsActive] = useState(defaultActive);
  const [intervalHours, setIntervalHours] = useState(defaultInterval);
  const [nextTestTime, setNextTestTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(100);

  useEffect(() => {
    if (isActive) {
      const nextTime = new Date();
      nextTime.setHours(nextTime.getHours() + intervalHours);
      setNextTestTime(nextTime);
      
      // Notify parent component
      onScheduleChange(isActive, intervalHours);
      
      // Show toast notification
      toast.success('Scheduled tests activated', {
        description: `Tests will run every ${intervalHours} hours`
      });
    } else {
      setNextTestTime(null);
      onScheduleChange(false, intervalHours);
    }
  }, [isActive, intervalHours, onScheduleChange]);

  // Update countdown timer
  useEffect(() => {
    if (!isActive || !nextTestTime) return;

    const updateProgress = () => {
      const now = new Date();
      const totalMs = intervalHours * 60 * 60 * 1000;
      const elapsedMs = now.getTime() - (nextTestTime.getTime() - totalMs);
      const percentRemaining = 100 - Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
      setTimeRemaining(percentRemaining);
    };

    // Initial update
    updateProgress();
    
    // Set interval for updates
    const timer = setInterval(updateProgress, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [isActive, nextTestTime, intervalHours]);

  const formatNextTestTime = () => {
    if (!nextTestTime) return 'Not scheduled';
    return nextTestTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 1 && value <= 24) {
      setIntervalHours(value);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Schedule Tests
        </CardTitle>
        <CardDescription>
          Automatically run speed tests at regular intervals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-test-toggle" className="flex-1">
            Enable scheduled tests
          </Label>
          <Switch 
            id="auto-test-toggle" 
            checked={isActive} 
            onCheckedChange={setIsActive}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="interval-hours">Test interval (hours)</Label>
          <Input 
            id="interval-hours"
            type="number"
            min={1}
            max={24}
            value={intervalHours}
            onChange={handleIntervalChange}
            disabled={!isActive}
          />
        </div>
      </CardContent>
      {isActive && (
        <CardFooter className="flex flex-col items-stretch space-y-2">
          <p className="text-sm text-muted-foreground">
            Next test at: <span className="font-medium">{formatNextTestTime()}</span>
          </p>
          <Progress value={timeRemaining} indicatorColor="var(--pulse-purple)" className="h-1.5" />
        </CardFooter>
      )}
    </Card>
  );
};

export default TestScheduler;
