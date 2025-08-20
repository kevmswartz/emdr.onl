import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MainMenuScreen } from '../../screens/MainMenuScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  dispatch: jest.fn(),
  setParams: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  canGoBack: jest.fn(),
  isFocused: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  setOptions: jest.fn(),
  reset: jest.fn(),
  getParent: jest.fn(),
  getId: jest.fn(),
  getState: jest.fn(),
};

describe('MainMenuScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders main menu elements', () => {
    const { getByText, getByLabelText } = render(
      <MainMenuScreen navigation={mockNavigation} route={{} as any} />
    );

    expect(getByText('EMDR')).toBeTruthy();
    expect(getByText('Bilateral Stimulation')).toBeTruthy();
    expect(getByText('Guided EMDR Session')).toBeTruthy();
    expect(getByText('Bilateral Stimulation Tool')).toBeTruthy();
    expect(getByLabelText('Open Settings')).toBeTruthy();
  });

  it('navigates to SessionSetup when Guided EMDR Session is pressed', () => {
    const { getByText } = render(
      <MainMenuScreen navigation={mockNavigation} route={{} as any} />
    );

    fireEvent.press(getByText('Guided EMDR Session'));
    expect(mockNavigate).toHaveBeenCalledWith('SessionSetup');
  });

  it('navigates to BLSTool when Bilateral Stimulation Tool is pressed', () => {
    const { getByText } = render(
      <MainMenuScreen navigation={mockNavigation} route={{} as any} />
    );

    fireEvent.press(getByText('Bilateral Stimulation Tool'));
    expect(mockNavigate).toHaveBeenCalledWith('BLSTool');
  });

  it('navigates to GlobalSettings when settings button is pressed', () => {
    const { getByLabelText } = render(
      <MainMenuScreen navigation={mockNavigation} route={{} as any} />
    );

    fireEvent.press(getByLabelText('Open Settings'));
    expect(mockNavigate).toHaveBeenCalledWith('GlobalSettings');
  });

  it('has proper accessibility labels', () => {
    const { getByLabelText } = render(
      <MainMenuScreen navigation={mockNavigation} route={{} as any} />
    );

    expect(getByLabelText('EMDR Bilateral Stimulation App')).toBeTruthy();
    expect(getByLabelText('Start Guided EMDR Session')).toBeTruthy();
    expect(getByLabelText('Open Bilateral Stimulation Tool')).toBeTruthy();
    expect(getByLabelText('Open Settings')).toBeTruthy();
  });
});