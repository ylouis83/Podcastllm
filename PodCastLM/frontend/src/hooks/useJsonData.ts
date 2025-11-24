import { useState, useCallback } from 'react';

interface JsonData {
  content: string;
  // 可以根据需要添加更多字段
}

export function useJsonData() {
  const [data, setData] = useState<JsonData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchJsonData = useCallback(async (url: string, formData: FormData) => {
    setIsLoading(true);
    setData(null);
    setError(null);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      setError('获取数据时发生错误: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, error, isLoading, fetchJsonData };
}
