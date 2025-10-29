import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { afterAll, beforeAll } from 'vitest';

beforeAll(() => {
  // Set up any global test dependencies
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
});

afterAll(() => {
  // Clean up any global test dependencies
  delete process.env.NEXT_PUBLIC_API_URL;
});

test('renders without crashing', () => {
  render(<div data-testid="test">Test</div>);
  const element = screen.getByTestId('test');
  expect(element).toBeInTheDocument();
});
