import { useState, useCallback } from 'react';
import { BASE_URL } from "@/lib/constant";

interface AudioGenerationState {
  isLoading: boolean;
  error: string | null;
  audioUrl: string | null;
}

export function useAudioGeneration() {
  const [state, setState] = useState<AudioGenerationState>({
    isLoading: false,
    error: null,
    audioUrl: null,
  });

  const generateAudio = useCallback(async (formData: FormData) => {
    setState({ isLoading: true, error: null, audioUrl: null });

    try {
      const response = await fetch(`${BASE_URL}/generate_audio`, {
        method: 'POST',
        body: formData
      });

      const { task_id } = await response.json();

      while (true) {
        await new Promise(resolve => setTimeout(resolve, 10000));

        const statusResponse = await fetch(`${BASE_URL}/audio_status/${task_id}`);
        const status = await statusResponse.json();

        if (status.status === 'completed') {
          setState({ isLoading: false, error: null, audioUrl: status.audio_url });
          return;
        } else if (status.status === 'failed') {
          throw new Error(status.error);
        }
      }
    } catch (error) {
      setState({ isLoading: false, error: error instanceof Error ? error.message : '未知错误', audioUrl: null });
    }
  }, []);

  return {
    ...state,
    generateAudio,
  };
}
