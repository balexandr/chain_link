import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(initialSeconds = 0, running = true) {
  const [elapsed, setElapsed] = useState(initialSeconds);
  const intervalRef = useRef(null);
  const runningRef = useRef(running);
  runningRef.current = running;

  useEffect(() => {
    setElapsed(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const reset = useCallback((s = 0) => {
    clearInterval(intervalRef.current);
    setElapsed(s);
  }, []);

  return { elapsed, reset };
}
