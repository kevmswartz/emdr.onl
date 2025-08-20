// Global setup that runs before jest-expo preset
import { Dimensions } from 'react-native';

// Mock Dimensions globally before any modules are loaded
jest.mock('react-native/Libraries/Utilities/Dimensions', () => {
  const originalDimensions = jest.requireActual('react-native/Libraries/Utilities/Dimensions');
  return {
    ...originalDimensions,
    get: jest.fn(() => ({ width: 375, height: 667 })),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  };
});