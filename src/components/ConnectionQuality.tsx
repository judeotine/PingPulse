
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Signal, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';

const getQualityDetails = (
  quality: ConnectionQuality
): { label: string; color: string; icon: React.ReactNode; description: string } => {
  switch (quality) {
    case 'excellent':
      return {
        label: 'Excellent',
        color: 'bg-green-500/15 text-green-600',
        icon: <Signal className="h-5 w-5 text-green-500" />,
        description: 'Your connection is very stable and fast.',
      };
    case 'good':
      return {
        label: 'Good',
        color: 'bg-blue-500/15 text-blue-600',
        icon: <Wifi className="h-5 w-5 text-blue-500" />,
        description: 'Your connection is stable with good speed.',
      };
    case 'fair':
      return {
        label: 'Fair',
        color: 'bg-yellow-500/15 text-yellow-600',
        icon: <Wifi className="h-5 w-5 text-yellow-500" />,
        description: 'Your connection is usable but could be better.',
      };
    case 'poor':
      return {
        label: 'Poor',
        color: 'bg-orange-500/15 text-orange-600',
        icon: <Activity className="h-5 w-5 text-orange-500" />,
        description: 'Your connection is unstable or slow.',
      };
    case 'offline':
      return {
        label: 'Offline',
        color: 'bg-red-500/15 text-red-600',
        icon: <WifiOff className="h-5 w-5 text-red-500" />,
        description: 'You are currently disconnected.',
      };
  }
};

interface ConnectionQualityProps {
  quality: ConnectionQuality;
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
  packetLoss: number;
  isLoading?: boolean;
}

const ConnectionQuality = ({
  quality,
  downloadSpeed,
  uploadSpeed,
  ping,
  jitter,
  packetLoss,
  isLoading = false,
}: ConnectionQualityProps) => {
  const details = getQualityDetails(quality);

  return (
    <Card className={cn('w-full', isLoading ? 'opacity-80' : '')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Connection Quality</CardTitle>
          <Badge 
            variant="secondary" 
            className={cn(details.color, 'flex items-center gap-1')}
          >
            {details.icon}
            {details.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{details.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Download</span>
            <span className="font-medium">{isLoading ? '...' : `${downloadSpeed.toFixed(1)} Mbps`}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Upload</span>
            <span className="font-medium">{isLoading ? '...' : `${uploadSpeed.toFixed(1)} Mbps`}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Ping</span>
            <span className="font-medium">{isLoading ? '...' : `${ping.toFixed(0)} ms`}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Jitter</span>
            <span className="font-medium">{isLoading ? '...' : `${jitter.toFixed(1)} ms`}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Packet Loss</span>
            <span className="font-medium">{isLoading ? '...' : `${packetLoss.toFixed(1)}%`}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionQuality;
