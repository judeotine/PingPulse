
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import SpeedDisplay from '@/components/SpeedDisplay';
import SpeedHistoryChart, { SpeedData } from '@/components/SpeedHistoryChart';
import ConnectionQuality, { ConnectionQuality as ConnectionQualityType } from '@/components/ConnectionQuality';
import SpeedTestButton from '@/components/SpeedTestButton';
import ServerSelector, { ServerOption } from '@/components/ServerSelector';
import TestScheduler from '@/components/TestScheduler';
import { runSpeedTest, determineConnectionQuality } from '@/utils/speedTestUtils';
import { playClickSound, playSuccessSound } from '@/utils/audioUtils';
import { 
  loadAchievements, 
  checkAchievements, 
  getNewlyUnlockedAchievements,
  Achievement 
} from '@/utils/achievementUtils';
import { Activity, Download, Share2, Trophy } from 'lucide-react';

const MAX_HISTORY_ITEMS = 100;

// Example server options
const TEST_SERVERS: ServerOption[] = [
  { id: 'auto', name: 'Automatic Selection', location: 'Closest Server', distance: 0 },
  { id: 'ny', name: 'New York', location: 'USA East', distance: 350 },
  { id: 'sf', name: 'San Francisco', location: 'USA West', distance: 2800 },
  { id: 'ams', name: 'Amsterdam', location: 'Europe', distance: 6000 },
  { id: 'tok', name: 'Tokyo', location: 'Asia', distance: 11000 },
];

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [ping, setPing] = useState(0);
  const [jitter, setJitter] = useState(0);
  const [packetLoss, setPacketLoss] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQualityType>('offline');
  const [speedHistory, setSpeedHistory] = useState<SpeedData[]>([]);
  const [selectedServer, setSelectedServer] = useState('auto');
  const [autoTestActive, setAutoTestActive] = useState(false);
  const [autoTestInterval, setAutoTestInterval] = useState(4);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockStreak, setUnlockStreak] = useState(0);
  const autoTestTimerRef = useRef<number | null>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Load data from localStorage on mount
  useEffect(() => {
    loadPreviousData();
    setAchievements(loadAchievements());
    
    return () => {
      if (autoTestTimerRef.current) {
        window.clearTimeout(autoTestTimerRef.current);
      }
    };
  }, []);

  // Set up auto testing interval
  useEffect(() => {
    if (autoTestActive) {
      if (autoTestTimerRef.current) {
        window.clearTimeout(autoTestTimerRef.current);
      }
      
      // Convert hours to milliseconds
      const intervalMs = autoTestInterval * 60 * 60 * 1000;
      
      autoTestTimerRef.current = window.setTimeout(() => {
        handleSpeedTest();
      }, intervalMs);
      
      console.log(`Auto test scheduled in ${autoTestInterval} hours`);
    } else if (autoTestTimerRef.current) {
      window.clearTimeout(autoTestTimerRef.current);
      autoTestTimerRef.current = null;
    }
  }, [autoTestActive, autoTestInterval]);

  const loadPreviousData = () => {
    const savedHistory = localStorage.getItem('speedHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          setSpeedHistory(parsedHistory);
          
          // Set the last test results
          const lastTest = parsedHistory[parsedHistory.length - 1];
          setDownloadSpeed(lastTest.download);
          setUploadSpeed(lastTest.upload);
          setPing(lastTest.ping);
          setJitter(lastTest.jitter || 0);
          setPacketLoss(lastTest.packetLoss || 0);
          
          // Determine connection quality
          setConnectionQuality(
            determineConnectionQuality(lastTest.download, lastTest.upload, lastTest.ping, lastTest.packetLoss || 0)
          );
          
          console.log('Loaded previous speed test data from localStorage');
        }
      } catch (error) {
        console.error('Error loading speed history:', error);
      }
    }
  };

  const handleScheduleChange = useCallback((isActive: boolean, intervalHours: number) => {
    setAutoTestActive(isActive);
    setAutoTestInterval(intervalHours);
  }, []);

  const handleServerChange = useCallback((serverId: string) => {
    playClickSound(880); // Higher pitch for server selection
    setSelectedServer(serverId);
  }, []);

  const handleShareResults = useCallback(() => {
    playClickSound();
    
    // Create share text
    const shareText = `My internet speed: ⚡ Download: ${downloadSpeed.toFixed(1)} Mbps | ⬆️ Upload: ${uploadSpeed.toFixed(1)} Mbps | 📡 Ping: ${ping} ms | Tested with PulseDash`;
    
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: 'My Internet Speed Test Results',
        text: shareText,
        url: window.location.href,
      })
      .then(() => {
        toast.success('Results shared successfully');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Error sharing results:', error);
          copyToClipboard(shareText);
        }
      });
    } else {
      copyToClipboard(shareText);
    }
  }, [downloadSpeed, uploadSpeed, ping]);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Results copied to clipboard');
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error);
        toast.error('Failed to copy results');
      });
  };

  const handleExportCSV = useCallback(() => {
    playClickSound(660); // Slightly lower pitch for export
    
    if (speedHistory.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    // Create CSV header
    const headers = ['Timestamp', 'Download (Mbps)', 'Upload (Mbps)', 'Ping (ms)', 'Jitter (ms)', 'Packet Loss (%)'];
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...speedHistory.map(record => [
        new Date(record.timestamp).toLocaleString(),
        record.download,
        record.upload,
        record.ping,
        record.jitter,
        record.packetLoss
      ].join(','))
    ].join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `speed-test-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [speedHistory]);

  // Display confetti animation when beating personal record
  const showConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Confetti particles
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      velocity: { x: number; y: number };
      rotation: number;
      rotationSpeed: number;
    }> = [];
    
    // Generate particles
    for (let i = 0; i < 200; i++) {
      const colors = ['#6E59A5', '#0EA5E9', '#F97316', '#10B981', '#EC4899'];
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity: {
          x: (Math.random() - 0.5) * 15,
          y: (Math.random() - 0.5) * 15
        },
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }
    
    // Animation
    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.velocity.x;
        p.y += p.velocity.y;
        p.velocity.y += 0.1; // gravity
        p.rotation += p.rotationSpeed;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      
      if (particles.some(p => p.y < canvas.height)) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        canvas.style.display = 'none';
      }
    };
    
    canvas.style.display = 'block';
    animationFrame = requestAnimationFrame(animate);
    
    // Clean up after 4 seconds
    setTimeout(() => {
      cancelAnimationFrame(animationFrame);
      canvas.style.display = 'none';
    }, 4000);
  };

  const handleSpeedTest = async () => {
    // Start the speed test
    setIsLoading(true);
    
    try {
      // Record previous best download speed for comparison
      const previousBestDownload = Math.max(...speedHistory.map(item => item.download), 0);
      
      // Run the speed test
      const selectedServerObj = TEST_SERVERS.find(s => s.id === selectedServer) || TEST_SERVERS[0];
      const result = await runSpeedTest(selectedServerObj);
      
      // Update state with results
      setDownloadSpeed(result.downloadSpeed);
      setUploadSpeed(result.uploadSpeed);
      setPing(result.ping);
      setJitter(result.jitter);
      setPacketLoss(result.packetLoss);
      
      // Determine connection quality
      const quality = determineConnectionQuality(
        result.downloadSpeed,
        result.uploadSpeed,
        result.ping,
        result.packetLoss
      );
      setConnectionQuality(quality);
      
      // Update history
      const newHistoryItem: SpeedData = {
        timestamp: result.timestamp,
        download: result.downloadSpeed,
        upload: result.uploadSpeed,
        ping: result.ping,
        jitter: result.jitter,
        packetLoss: result.packetLoss,
      };
      
      const updatedHistory = [...speedHistory, newHistoryItem].slice(-MAX_HISTORY_ITEMS);
      setSpeedHistory(updatedHistory);
      
      // Save to localStorage
      localStorage.setItem('speedHistory', JSON.stringify(updatedHistory));
      
      // Check for achievements
      const previousAchievements = [...achievements];
      const updatedAchievements = checkAchievements(
        previousAchievements,
        result.downloadSpeed,
        updatedHistory.length
      );
      
      // Get newly unlocked achievements
      const newlyUnlocked = getNewlyUnlockedAchievements(previousAchievements, updatedAchievements);
      
      if (newlyUnlocked.length > 0) {
        setAchievements(updatedAchievements);
        
        // Update streak and show notification
        setUnlockStreak(prev => prev + 1);
        
        // Show toast for each achievement
        newlyUnlocked.forEach(achievement => {
          toast.success(`Achievement Unlocked: ${achievement.title}`, {
            description: achievement.description,
            icon: achievement.icon,
          });
        });
        
        // Play success sound
        playSuccessSound();
      }
      
      // Check if we beat our best download speed
      if (result.downloadSpeed > previousBestDownload && previousBestDownload > 0) {
        // Show confetti animation
        showConfetti();
        
        // Play success sound
        playSuccessSound();
        
        toast.success('New speed record!', {
          description: `You beat your previous best download speed of ${previousBestDownload.toFixed(1)} Mbps`
        });
      }
      
      // Show success toast
      toast.success('Speed test completed', {
        description: `Download: ${result.downloadSpeed.toFixed(1)} Mbps, Upload: ${result.uploadSpeed.toFixed(1)} Mbps`,
      });
    } catch (error) {
      console.error('Speed test error:', error);
      toast.error('Speed test failed', {
        description: 'There was a problem running the speed test. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10 shadow-sm">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-pulse-purple" />
            <h1 className="text-xl font-semibold">PulseDash</h1>
          </div>
          <div className="ml-auto">
            <SpeedTestButton onTest={handleSpeedTest} isLoading={isLoading} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container py-6 space-y-6">
          {/* Test Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <h3 className="text-lg font-semibold">Test Server</h3>
              </CardHeader>
              <CardContent>
                <ServerSelector 
                  servers={TEST_SERVERS}
                  selectedServer={selectedServer}
                  onServerChange={handleServerChange}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Actions</h3>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleShareResults}
                  disabled={downloadSpeed === 0}
                >
                  <Share2 className="h-4 w-4 mr-2" /> Share Results
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleExportCSV}
                  disabled={speedHistory.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" /> Export CSV
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Speed Display Section */}
          <SpeedDisplay 
            downloadSpeed={downloadSpeed}
            uploadSpeed={uploadSpeed}
            ping={ping}
            isLoading={isLoading}
          />
          
          {/* Connection Quality Section */}
          <ConnectionQuality 
            quality={connectionQuality}
            downloadSpeed={downloadSpeed}
            uploadSpeed={uploadSpeed}
            ping={ping}
            jitter={jitter}
            packetLoss={packetLoss}
            isLoading={isLoading}
          />

          {/* Tabs for different content sections */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid grid-cols-2 md:w-[400px] mb-4">
              <TabsTrigger value="history">History & Trends</TabsTrigger>
              <TabsTrigger value="settings">Scheduling & Achievements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="history" className="space-y-4">
              {/* History Chart */}
              {speedHistory.length > 0 ? (
                <SpeedHistoryChart data={speedHistory} />
              ) : (
                <Card className="w-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground mb-4">No speed test history available</p>
                    <SpeedTestButton 
                      onTest={handleSpeedTest} 
                      isLoading={isLoading} 
                      className="mt-2"
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Test Scheduler */}
                <TestScheduler 
                  onScheduleChange={handleScheduleChange}
                  defaultInterval={autoTestInterval}
                  defaultActive={autoTestActive}
                />
                
                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Trophy className="h-5 w-5 mr-2" /> 
                        Achievements
                      </h3>
                      <div className="text-sm font-medium">
                        {achievements.filter(a => a.unlocked).length}/{achievements.length}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {achievements.map(achievement => (
                        <div 
                          key={achievement.id} 
                          className={`flex items-center p-2 rounded-md transition-colors ${achievement.unlocked ? 'bg-secondary/50' : 'bg-muted/30 opacity-70'}`}
                        >
                          <div className="text-2xl mr-2">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-medium">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                          {achievement.unlocked && (
                            <div className="text-xs text-muted-foreground">
                              {achievement.unlockedAt && new Date(achievement.unlockedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {unlockStreak > 0 && (
                        <div className="mt-4 text-sm font-medium text-center">
                          🔥 Achievement streak: {unlockStreak}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>
            Developed by <a href="https://judeotine.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline">Jude Otine</a>
          </p>
          <p>Internet Speed Monitor</p>
        </div>
      </footer>
      
      {/* Confetti canvas (hidden by default) */}
      <canvas 
        ref={confettiCanvasRef} 
        className="fixed inset-0 pointer-events-none z-50" 
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default Index;
