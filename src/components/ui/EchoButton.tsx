import React from 'react';
import { Volume2, Pause, Square } from 'lucide-react';
import { useEcho } from '../../hooks/useEcho';

interface EchoButtonProps {
  text: string;
}

export const EchoButton: React.FC<EchoButtonProps> = ({ text }) => {
  const { isPlaying, isPaused, play, pause, stop } = useEcho(text);

  return (
    <div className="flex gap-2">
      {!isPlaying && !isPaused && (
        <button
          onClick={play}
          className="liquid-glass p-3 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <Volume2 size={20} className="text-accent-light" />
        </button>
      )}
      {(isPlaying || isPaused) && (
        <>
          {isPlaying ? (
            <button
              onClick={pause}
              className="liquid-glass p-3 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              <Pause size={20} className="text-accent-light" />
            </button>
          ) : (
            <button
              onClick={play}
              className="liquid-glass p-3 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              <Volume2 size={20} className="text-accent-light" />
            </button>
          )}
          <button
            onClick={stop}
            className="liquid-glass p-3 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            <Square size={20} className="text-red-400" />
          </button>
        </>
      )}
    </div>
  );
};
