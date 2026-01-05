
import React from 'react';

interface PrivacyPolicyProps {
  content: any;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ content }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold text-brand-lime">{content.title}</h3>
      <ul className="list-disc pl-5 space-y-1">
        {content.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
};
