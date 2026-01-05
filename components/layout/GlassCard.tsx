
import React from 'react';

// Extending React.HTMLAttributes<HTMLDivElement> to support props like onClick, onKeyDown, etc.
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", ...props }) => {
  return (
    <div className={`glass rounded-3xl p-6 shadow-2xl ${className}`} {...props}>
      {children}
    </div>
  );
};
