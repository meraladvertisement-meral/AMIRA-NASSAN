
import React from 'react';

interface BusinessContactProps {
  content: any;
}

export const BusinessContact: React.FC<BusinessContactProps> = ({ content }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-brand-lime">{content.title}</h3>
      <p className="italic">{content.subtitle}</p>
      <p className="font-bold underline">{content.contact}</p>
      <p>{content.subject}</p>
    </div>
  );
};
