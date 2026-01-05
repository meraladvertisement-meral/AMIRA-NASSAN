
import React from 'react';

interface AffiliatePolicyProps {
  content: {
    title: string;
    items: string[];
  };
}

export const AffiliatePolicy: React.FC<AffiliatePolicyProps> = ({ content }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold text-brand-lime">{content.title}</h3>
      <ul className="list-disc pl-5 space-y-1">
        {content.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
};
