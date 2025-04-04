
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import SpeedDial from './SpeedDial';
import SpeedGauge from './SpeedGauge';
import { useIsMobile } from '@/hooks/use-mobile';

interface SpeedDisplayProps {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  isLoading?: boolean;
}

const SpeedDisplay = ({
  downloadSpeed,
  uploadSpeed,
  ping,
  isLoading = false,
}: SpeedDisplayProps) => {
  const isMobile = useIsMobile();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Current Speed</h3>
        </div>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <div className="grid grid-cols-1 gap-8">
            <SpeedDial
              title="Download"
              value={downloadSpeed}
              max={100}
              unit="Mbps"
              color="#6E59A5"
              size="lg"
              isLoading={isLoading}
            />
            <SpeedDial
              title="Upload"
              value={uploadSpeed}
              max={50}
              unit="Mbps"
              color="#0EA5E9"
              size="lg"
              isLoading={isLoading}
            />
            <SpeedDial
              title="Ping"
              value={ping}
              max={100}
              unit="ms"
              color="#F97316"
              size="lg"
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="flex flex-wrap justify-evenly items-center gap-4">
            <SpeedGauge
              value={downloadSpeed}
              maxValue={100}
              label="Download"
              unit="Mbps"
              color="#6E59A5"
              isLoading={isLoading}
            />
            <SpeedGauge
              value={uploadSpeed}
              maxValue={50}
              label="Upload"
              unit="Mbps"
              color="#0EA5E9"
              isLoading={isLoading}
            />
            <SpeedGauge
              value={ping}
              maxValue={100}
              label="Ping"
              unit="ms"
              color="#F97316"
              isLoading={isLoading}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpeedDisplay;
