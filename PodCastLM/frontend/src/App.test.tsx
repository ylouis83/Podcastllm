import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { useJsonData } from './hooks/useJsonData';
import { useStreamText } from './hooks/useStreamText';

// Define mocks at the module level so they can be accessed in tests
const fetchJsonData = vi.fn();
const fetchStreamText = vi.fn();

// Mock the hooks
vi.mock('./hooks/useJsonData', () => ({
  useJsonData: vi.fn(() => ({
    data: null,
    error: null,
    isLoading: false,
    fetchJsonData,
  })),
}));

vi.mock('./hooks/useStreamText', () => ({
  useStreamText: vi.fn(() => ({
    textChunks: [],
    finalResult: null,
    error: null,
    isLoading: false,
    isDone: false,
    fetchStreamText,
  })),
}));

// Mock the child components
vi.mock('./components/content', () => ({
    default: (props) => {
        return <div data-testid="content-component">{JSON.stringify(props)}</div>;
    },
}));
vi.mock('./components/menu', () => ({
    default: ({ handleGenerate, isGenerating }) => (
        <div data-testid="menu-component">
            <button disabled={isGenerating} onClick={() => handleGenerate(new FormData())}>
                Generate
            </button>
        </div>
    ),
}));

vi.mock('./components/musk-compensation', () => ({
    default: () => <div data-testid="musk-component">Musk View</div>,
}));

describe('App component', () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
    });

  it('should render the MuskCompensation view by default', () => {
    render(<App />);
    expect(screen.getByTestId('musk-component')).toBeInTheDocument();
  });

  it('should switch to the Podcast view when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const podcastButton = screen.getByRole('button', { name: /播客应用/i });
    await user.click(podcastButton);

    expect(screen.queryByTestId('musk-component')).not.toBeInTheDocument();
    expect(screen.getByTestId('menu-component')).toBeInTheDocument();
    expect(screen.getByTestId('content-component')).toBeInTheDocument();
  });

  it('should call fetch functions and disable button on generate', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Switch to podcast view
    const podcastButton = screen.getByRole('button', { name: /播客应用/i });
    await user.click(podcastButton);
    
    // Find the generate button from the mocked Menu
    const generateButton = screen.getByRole('button', { name: /Generate/i });
    expect(generateButton).not.toBeDisabled();
    
    // Click the button
    await act(async () => {
        await user.click(generateButton);
    });

    // Assert that the fetch functions were called
    expect(fetchJsonData).toHaveBeenCalledOnce();
    expect(fetchStreamText).toHaveBeenCalledOnce();

    // Assert that the button is now disabled
    expect(generateButton).toBeDisabled();
  });
});
