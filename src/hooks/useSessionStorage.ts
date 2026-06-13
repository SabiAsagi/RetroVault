import { useState, useEffect, useCallback } from 'react';

export function useSessionStorage<T>(key: string, initialValue: T) {
  // 서버 사이드 렌더링(SSR)과의 Hydration 불일치를 막기 위해
  // 초기 렌더링 시에는 무조건 initialValue를 사용합니다.
  const [state, setState] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      if (item) {
        setState(JSON.parse(item));
      }
    } catch (error) {
      console.warn('Error reading sessionStorage', error);
    }
  }, [key]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setState((prevState) => {
      const valueToStore = value instanceof Function ? value(prevState) : value;
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn('Error setting sessionStorage', error);
      }
      return valueToStore;
    });
  }, [key]);

  return [state, setValue] as const;
}
