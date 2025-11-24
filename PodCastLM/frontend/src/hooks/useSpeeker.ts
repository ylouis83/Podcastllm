import { useCallback, useEffect, useState } from 'react'; 
import { BASE_URL } from '@/lib/constant';
type SPEEKERS = Record<string,Array<{id:string,name:string}>>

export function useSpeeker() {
    const [data, setData] = useState<SPEEKERS | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
  
    const load = useCallback(async () => {
      setIsLoading(true);
      setData(null);
      setError(null);
  
      try {
        const response = await fetch(BASE_URL + "/speekers" );
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

    useEffect(()=>{load()},[load])
  
    return { data, error, isLoading, load };
  }
