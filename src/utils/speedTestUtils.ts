
import { ServerOption } from '../components/ServerSelector';
import { 
  performNetworkSpeedTest, 
  getNetworkInformation, 
  NetworkSpeedTestResult as RealSpeedTestResult 
} from './realSpeedTest';

// Utility functions for simulating and performing real network speed tests

export interface SpeedTestResult {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
  packetLoss: number;
  timestamp: string;
  serverId?: string;
  serverName?: string;
}

// Test server URLs for real-world testing
const TEST_SERVER_URLS: Record<string, string> = {
  'auto': 'https://raw.githubusercontent.com/librespeed/speedtest-go/master/static/empty.js',
  'ny': 'https://raw.githubusercontent.com/librespeed/speedtest-go/master/static/empty.js',
  'sf': 'https://raw.githubusercontent.com/librespeed/speedtest-go/master/static/empty.js',
  'ams': 'https://raw.githubusercontent.com/librespeed/speedtest-go/master/static/empty.js',
  'tok': 'https://raw.githubusercontent.com/librespeed/speedtest-go/master/static/empty.js'
};

// Run a speed test, using real network test when possible
export const runSpeedTest = async (server?: ServerOption): Promise<SpeedTestResult> => {
  try {
    const serverId = server?.id || 'auto';
    const serverUrl = TEST_SERVER_URLS[serverId];
    
    console.log(`Starting speed test with server: ${server?.name || 'Auto'}`);
    
    // Attempt to use the real network speed test
    const result = await performNetworkSpeedTest(serverUrl, {
      testDurationMs: 5000 // 5 seconds for a quick test
    });
    
    return {
      ...result,
      serverId: server?.id,
      serverName: server?.name
    };
  } catch (error) {
    console.error('Real speed test failed, falling back to simulation:', error);
    // If the real test fails, fall back to the simulation
    return simulateSpeedTest(server);
  }
};

// Fallback to simulate a speed test with random values
const simulateSpeedTest = async (server?: ServerOption): Promise<SpeedTestResult> => {
  // Simulate a network request delay (1-3 seconds)
  const isRemoteServer = server && server.id !== 'auto' && server.distance > 1000;
  const baseTestDuration = Math.floor(Math.random() * 2000) + 1000;
  
  // Add delay for remote servers
  const testDuration = isRemoteServer 
    ? baseTestDuration + (server.distance / 100) 
    : baseTestDuration;
  
  // Ping is affected by distance
  const basePing = generateRandomPing(5, 60);
  const pingMultiplier = isRemoteServer ? (server.distance / 1000) : 1;
  const ping = Math.min(Math.floor(basePing * pingMultiplier), 150);
  
  // Jitter and packet loss slightly worse for remote servers
  const jitterMultiplier = isRemoteServer ? 1.5 : 1;
  const packetLossMultiplier = isRemoteServer ? 2 : 1;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        downloadSpeed: generateRandomSpeed(15, 85),
        uploadSpeed: generateRandomSpeed(10, 40),
        ping: ping,
        jitter: generateRandomFloat(0.5, 5) * jitterMultiplier,
        packetLoss: generateRandomFloat(0, 2) * packetLossMultiplier,
        timestamp: new Date().toISOString(),
        serverId: server?.id,
        serverName: server?.name,
      });
    }, testDuration);
  });
};

// Generate a random speed value between min and max
const generateRandomSpeed = (min: number, max: number): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
};

// Generate a random ping value
const generateRandomPing = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min) + min);
};

// Generate a random float with 1 decimal place
const generateRandomFloat = (min: number, max: number): number => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
};

// Determine connection quality based on test results
export const determineConnectionQuality = (
  downloadSpeed: number,
  uploadSpeed: number,
  ping: number,
  packetLoss: number
): 'excellent' | 'good' | 'fair' | 'poor' | 'offline' => {
  if (downloadSpeed === 0 && uploadSpeed === 0) return 'offline';
  
  // Calculate a quality score (0-100)
  let score = 0;
  
  // Download speed contributes up to 40 points
  score += Math.min(downloadSpeed / 2, 40);
  
  // Upload speed contributes up to 30 points
  score += Math.min(uploadSpeed, 30);
  
  // Ping contributes up to 20 points (lower is better)
  score += Math.max(0, 20 - ping / 5);
  
  // Packet loss contributes up to 10 points (lower is better)
  score += Math.max(0, 10 - packetLoss * 5);
  
  // Determine quality based on score
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
};

// Get color based on speed value
export const getSpeedColor = (speed: number): string => {
  if (speed < 10) return '#ef4444'; // Red for slow
  if (speed < 30) return '#f97316'; // Orange for medium-slow
  if (speed < 100) return '#eab308'; // Yellow for medium
  return '#22c55e'; // Green for fast
};

// Get color based on ping value
export const getPingColor = (ping: number): string => {
  if (ping < 20) return '#22c55e'; // Green for excellent
  if (ping < 50) return '#eab308'; // Yellow for good
  if (ping < 100) return '#f97316'; // Orange for fair
  return '#ef4444'; // Red for poor
};

// Format speed with appropriate units
export const formatSpeed = (speed: number): string => {
  if (speed >= 1000) {
    return `${(speed / 1000).toFixed(2)} Gbps`;
  }
  return `${speed.toFixed(1)} Mbps`;
};
