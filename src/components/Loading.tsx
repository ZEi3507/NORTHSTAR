import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-void flex flex-col items-center justify-center z-[100]">
      <div className="pyramid-loader scale-150">
        <div className="pyramid-wrapper">
          <span className="side side1" />
          <span className="side side2" />
          <span className="side side3" />
          <span className="side side4" />
          <span className="shadow" />
        </div>
      </div>
      <div className="mt-24">
        <span className="text-mint font-mono text-sm tracking-[0.4em] uppercase animate-pulse">
          Synchronizing Neural Interface...
        </span>
      </div>
    </div>
  );
};

export default Loading;
