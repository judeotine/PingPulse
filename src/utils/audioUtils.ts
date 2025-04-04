
// Audio feedback system for interactive elements

let audioContext: AudioContext | null = null;

export const initializeAudio = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Play a click sound when buttons are pressed
export const playClickSound = (pitch: number = 440): void => {
  try {
    const context = initializeAudio();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    // Configure sound
    oscillator.type = 'sine';
    oscillator.frequency.value = pitch;
    gainNode.gain.value = 0.1;
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Play brief sound
    oscillator.start();
    
    // Quick fade out
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1);
    
    // Stop the oscillator after the fade out
    setTimeout(() => oscillator.stop(), 100);
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

// Play a success sound
export const playSuccessSound = (): void => {
  try {
    const context = initializeAudio();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    // Configure sound
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Play ascending notes
    oscillator.frequency.value = 523.25; // C5
    oscillator.start();
    
    // Create pitch sequence
    setTimeout(() => { oscillator.frequency.value = 659.25; }, 100); // E5
    setTimeout(() => { oscillator.frequency.value = 783.99; }, 200); // G5
    
    // Quick fade out
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.4);
    
    // Stop the oscillator after the fade out
    setTimeout(() => oscillator.stop(), 400);
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};
