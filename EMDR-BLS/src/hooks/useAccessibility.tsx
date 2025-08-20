import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion() {
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);

  useEffect(() => {
    // Check initial state
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReducedMotionEnabled);

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReducedMotionEnabled
    );

    return () => subscription?.remove();
  }, []);

  return isReducedMotionEnabled;
}

export function useScreenReader() {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  useEffect(() => {
    // Check initial state
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    return () => subscription?.remove();
  }, []);

  return isScreenReaderEnabled;
}

export function useAccessibilityAnnouncement() {
  const announceForAccessibility = (message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  };

  return announceForAccessibility;
}

export function useAccessibilityFocus() {
  const setAccessibilityFocus = (reactTag: number) => {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
  };

  return setAccessibilityFocus;
}