import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MatchingEnneagram from '../MatchingEnneagram';

// ✅ Correctly mock UserContext.Provider
const mockUser = { id: 123 };

jest.mock('../../context/UserContext', () => {
  const actual = jest.requireActual('react');
  return {
    UserContext: {
      ...actual.createContext(),
      Provider: ({ children, value }) => (
        <div data-testid="mock-user-provider">{children}</div>
      ),
    },
    useUser: () => ({ user: mockUser }),
  };
});

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/api/form-status')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, submitted: false }),
      });
    }
    if (url.includes('/api/latest-survey')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { enneagram: { answers: { 1: 3, 2: 3 } } },
        }),
      });
    }
    if (url.includes('/api/save-enneagram')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }
    if (url.includes('/api/mark-submitted')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }
    if (url.includes('/api/match-mentee')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ matches: [] }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

test('renders sliders and submits when confirmed', async () => {
  render(
    <BrowserRouter>
      <MatchingEnneagram />
    </BrowserRouter>
  );

  await screen.findByText(/Enneagram Questionnaire/i);

  // Move to second batch
  fireEvent.click(screen.getByText(/Next ➔/i));

  // Confirm checkbox
  const checkbox = screen.getByRole('checkbox');
  fireEvent.click(checkbox);

  // Submit button
  const submitBtn = screen.getByRole('button', { name: /submit/i });
  fireEvent.click(submitBtn);

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/save-enneagram'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});
