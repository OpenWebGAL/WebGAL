import { render, screen } from '@testing-library/react';
import App from './App';

test('testTitle', () => {
  render(<App />);
  const linkElement = screen.getByText(/START/i);
  expect(linkElement).toBeInTheDocument();
});
