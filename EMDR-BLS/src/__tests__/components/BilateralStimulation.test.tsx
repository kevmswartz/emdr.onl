import React from 'react';
import { render } from '@testing-library/react-native';
import { BilateralStimulation } from '../../components/BilateralStimulation';

// Mock the audio and haptic managers
jest.mock('../../components/AudioManager', () => ({
  audioManager: {
    initialize: jest.fn(),
    cleanup: jest.fn(),
    updateSettings: jest.fn(),
    playLeft: jest.fn(),
    playRight: jest.fn(),
  },
}));

jest.mock('../../components/HapticManager', () => ({
  hapticManager: {
    triggerSide: jest.fn(),
  },
}));

// Mock the accessibility hooks
jest.mock('../../hooks/useAccessibility', () => ({
  useReducedMotion: () => false,
  useAccessibilityAnnouncement: () => jest.fn(),
}));

describe('BilateralStimulation', () => {
  const defaultProps = {
    isActive: false,
    speed: 1.5,
    shape: 'circle' as const,
    size: 'medium' as const,
    backgroundColor: '#000000',
    shapeColor: '#ffffff',
    autoSlow: false,
    autoSlowAmount: 20,
    duration: 20,
  };

  it('renders without crashing', () => {
    const { getByLabelText } = render(<BilateralStimulation {...defaultProps} />);
    expect(getByLabelText(/Bilateral stimulation/)).toBeTruthy();
  });

  it('displays correct accessibility information when inactive', () => {
    const { getByLabelText } = render(<BilateralStimulation {...defaultProps} />);
    const stimulationElement = getByLabelText(/Bilateral stimulation circle/);
    expect(stimulationElement).toBeTruthy();
    expect(stimulationElement.props.accessibilityLabel).toContain('1.5 Hz');
  });

  it('renders different shapes correctly', () => {
    const { rerender, getByLabelText } = render(
      <BilateralStimulation {...defaultProps} shape="square" />
    );
    expect(getByLabelText(/square/)).toBeTruthy();

    rerender(<BilateralStimulation {...defaultProps} shape="triangle" />);
    expect(getByLabelText(/triangle/)).toBeTruthy();
  });

  it('applies correct background color', () => {
    const { getByLabelText } = render(
      <BilateralStimulation {...defaultProps} backgroundColor="#ff0000" />
    );
    const container = getByLabelText(/Bilateral stimulation/);
    expect(container.props.style.backgroundColor).toBe('#ff0000');
  });
});