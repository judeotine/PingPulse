
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  // Add color property for visual customization
  color?: string;
  // Add animation type for different celebrations
  animationType?: 'confetti' | 'sparkle' | 'fireworks';
}

// List of possible achievements with enhanced visual properties
export const achievements: Achievement[] = [
  {
    id: 'first_test',
    title: 'First Steps',
    description: 'Run your first speed test',
    icon: '🚀',
    unlocked: false,
    color: '#6E59A5', // Purple
    animationType: 'sparkle'
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Record a download speed over 100 Mbps',
    icon: '⚡',
    unlocked: false,
    color: '#F97316', // Orange
    animationType: 'confetti'
  },
  {
    id: 'consistent',
    title: 'Consistency is Key',
    description: 'Run tests for 3 consecutive days',
    icon: '📅',
    unlocked: false,
    color: '#0EA5E9', // Blue
    animationType: 'fireworks'
  },
  {
    id: 'data_hoarder',
    title: 'Data Hoarder',
    description: 'Collect 10 speed test records',
    icon: '📊',
    unlocked: false,
    color: '#10B981', // Green
    animationType: 'confetti'
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Run a test between midnight and 4am',
    icon: '🦉',
    unlocked: false,
    color: '#8B5CF6', // Purple
    animationType: 'sparkle'
  },
];

// Load achievements from localStorage
export const loadAchievements = (): Achievement[] => {
  try {
    const savedAchievements = localStorage.getItem('achievements');
    if (savedAchievements) {
      return JSON.parse(savedAchievements);
    }
  } catch (error) {
    console.error('Error loading achievements:', error);
  }
  
  return achievements;
};

// Save achievements to localStorage
export const saveAchievements = (achievements: Achievement[]): void => {
  try {
    localStorage.setItem('achievements', JSON.stringify(achievements));
  } catch (error) {
    console.error('Error saving achievements:', error);
  }
};

// Track consecutive days
export const updateConsecutiveDays = (): number => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastTestDate = localStorage.getItem('lastTestDate');
    const consecutiveDays = parseInt(localStorage.getItem('consecutiveDays') || '0', 10);
    
    if (!lastTestDate) {
      // First test ever
      localStorage.setItem('lastTestDate', today);
      localStorage.setItem('consecutiveDays', '1');
      return 1;
    }
    
    const lastDate = new Date(lastTestDate);
    const currentDate = new Date(today);
    
    // Calculate the difference in days
    const timeDiff = currentDate.getTime() - lastDate.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    if (dayDiff === 1) {
      // Consecutive day
      const newConsecutiveDays = consecutiveDays + 1;
      localStorage.setItem('lastTestDate', today);
      localStorage.setItem('consecutiveDays', newConsecutiveDays.toString());
      return newConsecutiveDays;
    } else if (dayDiff === 0) {
      // Same day, no change
      return consecutiveDays;
    } else {
      // Streak broken
      localStorage.setItem('lastTestDate', today);
      localStorage.setItem('consecutiveDays', '1');
      return 1;
    }
  } catch (error) {
    console.error('Error updating consecutive days:', error);
    return 0;
  }
};

// Check for new achievements based on the latest test
export const checkAchievements = (
  currentAchievements: Achievement[],
  downloadSpeed: number,
  testCount: number
): Achievement[] => {
  const updatedAchievements = [...currentAchievements];
  const now = new Date();
  
  // First test achievement
  const firstTestAchievement = updatedAchievements.find(a => a.id === 'first_test');
  if (firstTestAchievement && !firstTestAchievement.unlocked) {
    firstTestAchievement.unlocked = true;
    firstTestAchievement.unlockedAt = now.toISOString();
  }
  
  // Speed demon achievement
  const speedDemonAchievement = updatedAchievements.find(a => a.id === 'speed_demon');
  if (speedDemonAchievement && !speedDemonAchievement.unlocked && downloadSpeed >= 100) {
    speedDemonAchievement.unlocked = true;
    speedDemonAchievement.unlockedAt = now.toISOString();
  }
  
  // Data hoarder achievement
  const dataHoarderAchievement = updatedAchievements.find(a => a.id === 'data_hoarder');
  if (dataHoarderAchievement && !dataHoarderAchievement.unlocked && testCount >= 10) {
    dataHoarderAchievement.unlocked = true;
    dataHoarderAchievement.unlockedAt = now.toISOString();
  }
  
  // Night owl achievement
  const nightOwlAchievement = updatedAchievements.find(a => a.id === 'night_owl');
  if (nightOwlAchievement && !nightOwlAchievement.unlocked) {
    const hour = now.getHours();
    if (hour >= 0 && hour < 4) {
      nightOwlAchievement.unlocked = true;
      nightOwlAchievement.unlockedAt = now.toISOString();
    }
  }
  
  // Check for consecutive day testing
  const consecutiveDays = updateConsecutiveDays();
  const consistentAchievement = updatedAchievements.find(a => a.id === 'consistent');
  if (consistentAchievement && !consistentAchievement.unlocked && consecutiveDays >= 3) {
    consistentAchievement.unlocked = true;
    consistentAchievement.unlockedAt = now.toISOString();
  }
  
  // Save the updated achievements
  saveAchievements(updatedAchievements);
  
  return updatedAchievements;
};

// Get newly unlocked achievements
export const getNewlyUnlockedAchievements = (
  previousAchievements: Achievement[],
  currentAchievements: Achievement[]
): Achievement[] => {
  return currentAchievements.filter(current => {
    const previous = previousAchievements.find(prev => prev.id === current.id);
    return current.unlocked && (!previous || !previous.unlocked);
  });
};

// Helper function to create confetti animation
export const createConfettiAnimation = (
  canvas: HTMLCanvasElement, 
  colors: string[] = ['#6E59A5', '#0EA5E9', '#F97316', '#10B981', '#EC4899']
) => {
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
    shape: 'circle' | 'square' | 'triangle' | 'star';
  }> = [];
  
  // Particle shapes
  const shapes = ['circle', 'square', 'triangle', 'star'];
  
  // Generate particles
  for (let i = 0; i < 200; i++) {
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
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: shapes[Math.floor(Math.random() * shapes.length)] as any
    });
  }
  
  // Draw different shapes
  const drawShape = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, shape: string) => {
    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(-size / 2, -size / 2, size, size);
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(size / 2, size / 2);
        ctx.lineTo(-size / 2, size / 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'star':
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(
            Math.cos((i * 2 * Math.PI) / 5 - Math.PI / 2) * size / 2,
            Math.sin((i * 2 * Math.PI) / 5 - Math.PI / 2) * size / 2
          );
          ctx.lineTo(
            Math.cos(((i * 2 + 1) * Math.PI) / 5 - Math.PI / 2) * size / 4,
            Math.sin(((i * 2 + 1) * Math.PI) / 5 - Math.PI / 2) * size / 4
          );
        }
        ctx.closePath();
        ctx.fill();
        break;
    }
  };
  
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
      drawShape(ctx, 0, 0, p.size, p.shape);
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
