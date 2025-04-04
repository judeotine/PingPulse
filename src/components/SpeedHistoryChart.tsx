
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

export interface SpeedData {
  timestamp: string;
  download: number;
  upload: number;
  ping: number;
  jitter: number;
  packetLoss: number;
}

interface SpeedHistoryChartProps {
  data: SpeedData[];
}

const SpeedHistoryChart = ({ data }: SpeedHistoryChartProps) => {
  const isMobile = useIsMobile();
  
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return isMobile 
      ? `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}` 
      : `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatSpeed = (speed: number) => {
    return `${speed.toFixed(1)} Mbps`;
  };

  const formatPing = (ping: number) => {
    return `${ping.toFixed(0)} ms`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Speed History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 20,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                style={{ fontSize: '12px' }}
              />
              <YAxis yAxisId="speed" tickFormatter={formatSpeed} />
              <YAxis yAxisId="ping" orientation="right" tickFormatter={formatPing} />
              <Tooltip 
                labelFormatter={formatDate}
                formatter={(value, name) => {
                  if (name === 'ping' || name === 'jitter') return [`${value} ms`, name];
                  if (name === 'packetLoss') return [`${value}%`, name];
                  return [`${value} Mbps`, name];
                }}
              />
              <Legend />
              <Line
                yAxisId="speed"
                type="monotone"
                dataKey="download"
                name="Download"
                stroke="#6E59A5"
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="speed"
                type="monotone"
                dataKey="upload"
                name="Upload"
                stroke="#0EA5E9"
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="ping"
                type="monotone"
                dataKey="ping"
                name="Ping"
                stroke="#F97316"
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpeedHistoryChart;
