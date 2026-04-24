import React from 'react';

interface TheVeilProps {
  children: string | undefined;
  userLevel: number;
}

/**
 * TheVeil - The redaction UI component for NorthStar V2.0.
 * 
 * Behavior:
 * - If userLevel < 2 OR children is undefined/empty: Render a black redaction bar + CTA.
 * - If userLevel >= 2 AND children has content: Render revealed text with animation.
 * 
 * SECURITY RULE: Redacted text MUST NOT be in the DOM for Level 1 users.
 */
export const TheVeil: React.FC<TheVeilProps> = ({ children, userLevel }) => {
  const isRevealed = userLevel >= 2 && !!children;
  
  // Calculate bar length capped at 40. Default to 24 if children is undefined/empty.
  const barLength = Math.min(children?.length || 24, 40);
  const redactionChars = '█'.repeat(barLength);

  return (
    <span className="veil-wrapper">
      {isRevealed ? (
        <span className="veil-revealed">
          {children}
        </span>
      ) : (
        <span 
          className="veil-bar group" 
          aria-label="Redacted — publish an entry to reveal"
        >
          <span className="px-1 py-0.5 rounded-sm transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(124,58,237,0.5)]">
            {redactionChars}
          </span>
          <span className="veil-cta group-hover:text-mint">Decrypt Data</span>
        </span>
      )}
    </span>
  );
};

export default TheVeil;
