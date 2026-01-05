
import React from 'react';

interface SupportContactProps {
  content: any;
}

export const SupportContact: React.FC<SupportContactProps> = ({ content }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-brand-lime">{content.title}</h3>
      <p>Email:</p>
      <p className="font-mono text-brand-gold underline">{content.email}</p>
    </div>
  );
};
