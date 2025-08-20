import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions, Platform } from 'react-native';
import { audioManager } from './AudioManager';
import { hapticManager } from './HapticManager';
import { useReducedMotion, useAccessibilityAnnouncement } from '../hooks/useAccessibility';

interface BilateralStimulationProps {
  isActive: boolean;
  speed: number; // Hz (1.0 - 2.5)
  shape: 'circle' | 'triangle' | 'square';
  size: 'small' | 'medium' | 'large';
  backgroundColor?: string;
  shapeColor?: string;
  autoSlow?: boolean;
  autoSlowAmount?: number; // percentage reduction
  duration?: number; // session duration in minutes
  audioSettings?: {
    enabled: boolean;
    volume: number;
    leftFreq: number;
    rightFreq: number;
  };
  onCycleComplete?: () => void;
  onSpeedChange?: (newSpeed: number) => void;
}

const SHAPE_SIZES = {
  small: 32,
  medium: 48,
  large: 72,
};

export function BilateralStimulation({
  isActive,
  speed,
  shape,
  size,
  backgroundColor = '#000000',
  shapeColor = '#ffffff',
  autoSlow = false,
  autoSlowAmount = 20,
  duration = 20,
  audioSettings,
  onCycleComplete,
  onSpeedChange,
}: BilateralStimulationProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isMovingRight, setIsMovingRight] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  
  // Accessibility hooks
  const isReducedMotionEnabled = useReducedMotion();
  const announceForAccessibility = useAccessibilityAnnouncement();
  
  // Convert Hz to duration (milliseconds per full cycle)
  const cycleDuration = 1000 / currentSpeed;
  
  // Use native driver only on mobile platforms (not web)
  const useNativeDriver = Platform.OS !== 'web';
  
  // Get screen dimensions and calculate movement range
  const screenWidth = Dimensions.get('window').width;
  const shapeSize = SHAPE_SIZES[size];
  // Move to 90% of screen width, minus half the shape size to keep it visible
  const maxDistance = (screenWidth * 0.45) - (shapeSize / 2);

  // Auto-slow calculation
  const calculateAutoSlowSpeed = () => {
    if (!autoSlow || !sessionStartTime) return speed;
    
    const elapsedMinutes = (Date.now() - sessionStartTime) / (1000 * 60);
    const sessionProgress = Math.min(elapsedMinutes / duration, 1);
    
    // Gradually reduce speed by the specified amount over the session duration
    const reductionFactor = (autoSlowAmount / 100) * sessionProgress;
    const newSpeed = speed * (1 - reductionFactor);
    
    return Math.max(newSpeed, 0.2); // Don't go below 0.2 Hz
  };

  useEffect(() => {
    // Initialize audio manager only once
    audioManager.initialize();
    
    return () => {
      // Cleanup only when component unmounts
      audioManager.cleanup();
    };
  }, []);

  // Auto-slow timer effect - much more frequent updates for smooth transitions
  useEffect(() => {
    let autoSlowTimer: NodeJS.Timeout | null = null;
    
    if (isActive && autoSlow) {
      if (!sessionStartTime) {
        setSessionStartTime(Date.now());
      }
      
      // Update speed every 100ms for smooth transitions
      autoSlowTimer = setInterval(() => {
        const newSpeed = calculateAutoSlowSpeed();
        // Use callback form to avoid dependency on currentSpeed
        setCurrentSpeed(prevSpeed => {
          if (Math.abs(prevSpeed - newSpeed) > 0.01) {
            if (onSpeedChange) {
              onSpeedChange(newSpeed);
            }
            return newSpeed;
          }
          return prevSpeed;
        });
      }, 100);
    } else if (!isActive) {
      // Reset when stopped
      setSessionStartTime(null);
      setCurrentSpeed(speed);
    }
    
    return () => {
      if (autoSlowTimer) {
        clearInterval(autoSlowTimer);
      }
    };
  }, [isActive, autoSlow, sessionStartTime, speed, duration, autoSlowAmount, onSpeedChange]);

  // Reset current speed when base speed changes
  useEffect(() => {
    if (!isActive) {
      setCurrentSpeed(speed);
    }
  }, [speed, isActive]);

  useEffect(() => {
    let animationRef: any = null;
    let isRunning = true;
    let currentCycleDuration = cycleDuration;

    if (isActive) {
      // Update audio manager settings if provided
      if (audioSettings) {
        audioManager.updateSettings(audioSettings);
      }

      // Announce session start for screen readers
      if (isActive) {
        announceForAccessibility(`Bilateral stimulation started at ${currentSpeed.toFixed(1)} Hz`);
      }

      const runAnimation = () => {
        if (!isRunning) return;
        
        // Update cycle duration in real-time for smooth auto-slow
        currentCycleDuration = 1000 / currentSpeed;
        
        // For reduced motion: use static positions instead of animation
        if (isReducedMotionEnabled) {
          // Just trigger audio/haptic without visual movement
          setTimeout(() => {
            if (!isRunning) return;
            audioManager.playRight();
            hapticManager.triggerSide();
            setIsMovingRight(false);
            
            setTimeout(() => {
              if (!isRunning) return;
              audioManager.playLeft();
              hapticManager.triggerSide();
              setIsMovingRight(true);
              
              if (onCycleComplete) {
                onCycleComplete();
              }
              
              if (isRunning) {
                setTimeout(() => {
                  if (isRunning) {
                    runAnimation();
                  }
                }, 50);
              }
            }, currentCycleDuration / 2);
          }, currentCycleDuration / 2);
          return;
        }
        
        // Normal animation for users without reduced motion
        animationRef = Animated.timing(translateX, {
          toValue: maxDistance,
          duration: currentCycleDuration / 2,
          useNativeDriver,
        }).start((finished) => {
          if (!finished || !isRunning) return;
          
          audioManager.playRight();
          hapticManager.triggerSide();
          setIsMovingRight(false);
          
          // Update cycle duration again for the return trip
          currentCycleDuration = 1000 / currentSpeed;
          
          // Animate to left
          animationRef = Animated.timing(translateX, {
            toValue: -maxDistance,
            duration: currentCycleDuration / 2,
            useNativeDriver,
          }).start((finished) => {
            if (!finished || !isRunning) return;
            
            audioManager.playLeft();
            hapticManager.triggerSide();
            setIsMovingRight(true);
            
            if (onCycleComplete) {
              onCycleComplete();
            }
            
            // Continue the loop with updated timing
            if (isRunning) {
              // Small delay to allow speed updates to take effect
              setTimeout(() => {
                if (isRunning) {
                  runAnimation();
                }
              }, 50);
            }
          });
        });
      };

      runAnimation();
      
      return () => {
        isRunning = false;
        if (animationRef) {
          animationRef.stop();
        }
      };
    } else {
      // Announce session stop for screen readers
      announceForAccessibility('Bilateral stimulation stopped');
      
      // Reset to center when stopped (respect reduced motion)
      if (!isReducedMotionEnabled) {
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver,
        }).start();
      }
    }
  }, [isActive, isReducedMotionEnabled, currentSpeed, maxDistance, useNativeDriver, cycleDuration]);

  const getShapeStyle = () => {
    const baseStyle = {
      width: shapeSize,
      height: shapeSize,
      backgroundColor: shapeColor,
    };

    switch (shape) {
      case 'circle':
        return {
          ...baseStyle,
          borderRadius: shapeSize / 2,
        };
      case 'square':
        return {
          ...baseStyle,
          borderRadius: 2,
        };
      case 'triangle':
        // Triangle using border trick
        return {
          width: 0,
          height: 0,
          backgroundColor: 'transparent',
          borderLeftWidth: shapeSize / 2,
          borderRightWidth: shapeSize / 2,
          borderBottomWidth: shapeSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: shapeColor,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <View 
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor 
      }}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={`Bilateral stimulation ${shape} moving ${isMovingRight ? 'right' : 'left'} at ${currentSpeed.toFixed(1)} Hz`}
      accessibilityHint="Visual bilateral stimulation for EMDR therapy. The shape moves left and right to help with eye movement processing."
      accessibilityLiveRegion="polite"
    >
      {/* Movement track indicator (subtle) */}
      <View 
        style={{ 
          position: 'absolute', 
          width: '80%', // Use percentage for responsive width
          height: 1, 
          backgroundColor: '#374151', 
          opacity: 0.2 
        }}
        accessible={false} // Hide decorative element from screen readers
      />
      
      {/* Animated shape */}
      <Animated.View 
        style={[
          { transform: [{ translateX }] }
        ]}
        accessible={false} // Handled by parent container
      >
        <View style={getShapeStyle()} />
      </Animated.View>
    </View>
  );
}