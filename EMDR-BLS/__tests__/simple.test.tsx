import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

// Simple test to verify Jest setup
describe('Jest Setup', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <Text>Hello Jest</Text>;
    const { getByText } = render(<TestComponent />);
    expect(getByText('Hello Jest')).toBeTruthy();
  });

  it('should run basic assertions', () => {
    expect(1 + 1).toBe(2);
    expect('hello').toBeTruthy();
    expect([1, 2, 3]).toHaveLength(3);
  });
});