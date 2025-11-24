import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Audio from './audio';

// Mock the AudioPlayer component as it's an external dependency
vi.mock('react-modern-audio-player', () => ({
  default: () => <div data-testid="audio-player">Audio Player</div>,
}));

// Mock the lucide-react icons
vi.mock('lucide-react', () => ({
  Download: () => <div />,
  MoreVertical: () => <div />,
  Loader2: () => <div />,
  AlertCircle: () => <div />,
  Headphones: () => <div />,
}));

describe('Audio component', () => {
  it('should render the loading state', () => {
    render(<Audio audioUrl={null} isAudioLoading={true} audioError={null} />);
    expect(screen.getByText(/Generating conversation.../i)).toBeInTheDocument();
  });

  it('should render the error state', () => {
    render(<Audio audioUrl={null} isAudioLoading={false} audioError="Test error" />);
    expect(screen.getByText(/音频生成失败: Test error/i)).toBeInTheDocument();
  });

  it('should render the initial empty state', () => {
    render(<Audio audioUrl={null} isAudioLoading={false} audioError={null} />);
    expect(screen.getByText(/音频无/i)).toBeInTheDocument();
  });

  it('should render the audio player when an audioUrl is provided', () => {
    render(<Audio audioUrl="/test.mp3" isAudioLoading={false} audioError={null} />);
    expect(screen.getByTestId('audio-player')).toBeInTheDocument();
  });

  it('should trigger a download when the download button is clicked', async () => {
    const user = userEvent.setup();
    const mockUrl = '/test-audio.mp3';

    // Spy on document.createElement and the click method of the anchor element
    const link = {
      href: '',
      download: '',
      target: '',
      click: vi.fn(),
    };
    const spyCreateElement = vi.spyOn(document, 'createElement').mockReturnValue(link as unknown as HTMLElement);
    const spyAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    const spyRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});

    render(<Audio audioUrl={mockUrl} isAudioLoading={false} audioError={null} />);

    // Open the dropdown menu
    const menuTrigger = screen.getByRole('button', { name: /more options/i });
    await user.click(menuTrigger);

    // Click the download item
    const downloadButton = screen.getByRole('menuitem', { name: /Download/i });
    await user.click(downloadButton);

    // Assertions
    expect(spyCreateElement).toHaveBeenCalledWith('a');
    expect(link.href).toContain(mockUrl);
    expect(link.download).toBe('audio.mp3');
    expect(link.target).toBe('_blank');
    expect(link.click).toHaveBeenCalledOnce();

    // Cleanup spies
    spyCreateElement.mockRestore();
    spyAppendChild.mockRestore();
    spyRemoveChild.mockRestore();
  });
});
