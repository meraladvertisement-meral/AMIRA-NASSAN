
import React from 'react';

interface PlansAndPricingProps {
  content: any;
}

export const PlansAndPricing: React.FC<PlansAndPricingProps> = ({ content }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-brand-lime">{content.title}</h3>
      <div className="space-y-2">
        <p className="font-bold underline">{content.free.name}:</p>
        <ul className="list-disc pl-5 space-y-1">
          {content.free.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
        </ul>
      </div>
      <div className="space-y-2">
        <p className="font-bold underline">{content.premium.name}:</p>
        <ul className="list-disc pl-5 space-y-1">
          {content.premium.items.map((item: string, i: number) => <li key={i}>{item}</li>)}
        </ul>
        <p className="font-bold text-brand-gold">Price:</p>
        <p>- {content.premium.priceMonthly}</p>
        <p>- {content.premium.priceYearly}</p>
      </div>
    </div>
  );
};
