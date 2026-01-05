
import React from 'react';

interface ImpressumProps {
  content: {
    title: string;
    name: string;
    owner: string;
    address: string;
    email: string;
    registry: string;
    tax: string;
    country: string;
  };
}

export const Impressum: React.FC<ImpressumProps> = ({ content }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-brand-lime">{content.title}</h3>
      <p className="font-black text-lg">{content.name}</p>
      <p>{content.owner}</p>
      <p className="font-bold">Address:</p>
      <p>{content.address}</p>
      <p className="underline">{content.email}</p>
      <p>{content.registry}</p>
      <p>{content.tax}</p>
      <p>{content.country}</p>
    </div>
  );
};
