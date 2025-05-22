// src/components/Survey/__tests__/MatchingPreferences.test.js
import { render, screen } from '@testing-library/react';
import { useSearchParams } from 'react-router-dom';
import MatchingPreferences from '../MatchingPreferences'; // Adjusted path if needed

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useSearchParams: jest.fn(),
}));

// Mock react-select
jest.mock('react-select', () => {
  const MockSelect = ({ options, value, onChange, isMulti, isDisabled }) => (
    <select
      multiple={isMulti}
      value={value.map((opt) => opt.value)}
      disabled={isDisabled}
      onChange={(e) => {
        const selectedValues = Array.from(e.target.selectedOptions).map(
          (opt) => opt.value,
        );
        const selectedOptions = options.filter((opt) =>
          selectedValues.includes(opt.value),
        );
        onChange(isMulti ? selectedOptions : selectedOptions[0] || null);
      }}
      data-testid='mock-select'
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
  return MockSelect;
});

// Mock global fetch
global.fetch = jest.fn();

describe('MatchingPreferences Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSearchParams.mockReturnValue([
      new URLSearchParams({
        sessionId: '1234',
        role: 'mentee',
      }),
    ]);
    jest.spyOn(Storage.prototype, 'setItem');
    global.fetch.mockImplementation((url) => {
      if (url === '/api/form-status') {
        return Promise.resolve({
          json: () => Promise.resolve({ success: true, submitted: false }),
        });
      }
      if (url === '/api/latest-survey') {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                preferences: {
                  session_role: 'Recipient',
                  transplant_type: JSON.stringify(['Kidney']),
                  transplant_year: '2020',
                  goals: JSON.stringify(['Peer Support']),
                  meeting_preference: 'Online',
                  sports_activities: JSON.stringify(['Running']),
                },
              },
            }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
  });

  it('renders without crashing', async () => {
    render(<MatchingPreferences />);
    expect(screen.getByText('Confirm Your Preferences')).toBeInTheDocument();
  });
});