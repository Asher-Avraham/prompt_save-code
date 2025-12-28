import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the fetch API
global.fetch = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders the App header', () => {
    // Mock successful status check
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ dbConnected: true }),
      })
    );
    // Mock successful prompts fetch (empty list)
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    render(<App />);
    const headerElement = screen.getByText(/Prompt Save/i);
    expect(headerElement).toBeInTheDocument();
  });

  test('displays DB Connected when status API returns true', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ dbConnected: true }),
        });
      }
      if (url.includes('/prompts')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<App />);

    await waitFor(() => {
      const statusElement = screen.getByText('DB Connected');
      expect(statusElement).toBeInTheDocument();
    });
  });

  test('allows entering text in the textarea', () => {
     fetch.mockImplementation((url) => {
      if (url.includes('/status')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ dbConnected: true }),
        });
      }
      if (url.includes('/prompts')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<App />);
    const textarea = screen.getByPlaceholderText(/Enter your new prompt here.../i);
    fireEvent.change(textarea, { target: { value: 'Test Prompt' } });
    expect(textarea.value).toBe('Test Prompt');
  });
});
