import { useState, useEffect, useCallback } from 'react';

export const useEcho = (text: string) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    setSpeechSynthesis(window.speechSynthesis);
  }, []);

  const play = useCallback(() => {
    if (!speechSynthesis) return;

    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };
    speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [text, speechSynthesis, isPaused]);

  const pause = useCallback(() => {
    if (!speechSynthesis) return;
    speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, [speechSynthesis]);

  const stop = useCallback(() => {
    if (!speechSynthesis) return;
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, [speechSynthesis]);

  return { isPlaying, isPaused, play, pause, stop };
};
