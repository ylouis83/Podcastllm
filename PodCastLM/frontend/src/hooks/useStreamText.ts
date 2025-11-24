import { useState, useCallback } from 'react';

interface StreamData {
  type: string;
  content?: string;
}

interface FinalResult {
  content: string;
}

export function useStreamText() {
  const [textChunks, setTextChunks] = useState<string[]>([]);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);  // 新增的状态

  const handleStreamData = useCallback((data: StreamData) => {
    switch (data.type) {
      case 'text_chunk':
      case 'chunk':
        setTextChunks(chunks => [...chunks, data.content!]);
        break;
      case 'final':
        setFinalResult(data as FinalResult);
        setIsDone(true);  // 设置 isDone 为 true
        break;
      case 'error':
        setError(data.content || 'Unknown error');
        setIsDone(true);  // 错误时也设置 isDone 为 true
        break;
      default:
        console.log('Unknown data type:', data);
    }
  }, []);

  const fetchStreamText = useCallback(async (url: string, formData: FormData) => {
    setIsLoading(true);
    setTextChunks([]);
    setFinalResult(null);
    setError(null);
    setIsDone(false);  // 重置 isDone 状态

    if (!formData) {
      setError('FormData is null');
      setIsDone(true);
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          setIsDone(true);  // 流结束时设置 isDone 为 true
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          try {
            const data = JSON.parse(line)
            handleStreamData(data);
            setIsLoading(false);
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      }

      // Handle any remaining data in the buffer
      if (buffer.trim() !== '') {
        try {
          const data = JSON.parse(buffer);
          handleStreamData(data);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      }

    } catch (error) {
      setError('获取数据时发生错误: ' + (error as Error).message);
      setIsDone(true);  // 发生错误时也设置 isDone 为 true
    } finally {
      setIsLoading(false);
    }
  }, [handleStreamData]);

  return { textChunks, finalResult, error, isLoading, isDone, fetchStreamText };
}
