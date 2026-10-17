import React from 'react';

export const KeyIllustration: React.FC<{ className?: string }> = ({ className = "w-24 h-24" }) => (
  <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Decorative ring */}
    <circle cx="40" cy="40" r="22" stroke="#17365D" strokeWidth="3.5" fill="none" />
    <circle cx="40" cy="40" r="14" stroke="#315C8C" strokeWidth="2" strokeDasharray="3 3" fill="none" />
    <circle cx="40" cy="40" r="6" fill="#17365D" />
    
    {/* Key Stem */}
    <path d="M56 40 L102 40" stroke="#17365D" strokeWidth="4" strokeLinecap="round" />
    
    {/* Key Teeth */}
    <path d="M86 40 L86 54 M96 40 L96 52 M96 46 L91 46" stroke="#17365D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Vintage Flourishes */}
    <path d="M22 22 Q12 12 28 8 Q40 8 36 20" stroke="#7399C2" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M58 58 Q70 70 82 58" stroke="#7399C2" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const HouseIllustration: React.FC<{ className?: string }> = ({ className = "w-20 h-20" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Roof */}
    <path d="M15 50 L50 18 L85 50" stroke="#17365D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 43 L50 18 L78 43" stroke="#315C8C" strokeWidth="1.5" fill="none" />
    
    {/* Walls */}
    <path d="M25 50 V82 H75 V50" stroke="#17365D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    
    {/* Door */}
    <path d="M42 82 V60 C42 56 58 56 58 60 V82" stroke="#17365D" strokeWidth="2.5" fill="#E5EEF6" />
    <circle cx="54" cy="70" r="1.5" fill="#17365D" />
    
    {/* Window */}
    <rect x="30" y="55" width="8" height="10" rx="1" stroke="#315C8C" strokeWidth="1.5" fill="#FCFAF5" />
    <rect x="62" y="55" width="8" height="10" rx="1" stroke="#315C8C" strokeWidth="1.5" fill="#FCFAF5" />
    
    {/* Chimney Smoke Heart */}
    <path d="M68 28 V20 H74 V32" stroke="#17365D" strokeWidth="2" />
    <path d="M72 14 C70 10 65 12 68 16 C71 12 76 10 74 14 C72 18 70 18 70 18" stroke="#7399C2" strokeWidth="1.5" fill="none" />
  </svg>
);

export const LocationPinIllustration: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Pin Body */}
    <path
      d="M50 10 C30 10 16 25 16 45 C16 68 45 92 50 96 C55 92 84 68 84 45 C84 25 70 10 50 10 Z"
      stroke="#17365D"
      strokeWidth="3.5"
      fill="#E5EEF6"
      strokeLinejoin="round"
    />
    {/* Inner House */}
    <path d="M36 48 L50 34 L64 48 V62 H36 V48 Z" stroke="#17365D" strokeWidth="2.5" fill="#FCFAF5" strokeLinejoin="round" />
    <path d="M45 62 V53 H55 V62" stroke="#315C8C" strokeWidth="2" fill="none" />
  </svg>
);

export const VintageFlourishDivider: React.FC<{ title?: string }> = ({ title }) => (
  <div className="flex items-center justify-center gap-3 my-6 text-[#315C8C]">
    <svg className="w-12 h-6" viewBox="0 0 60 20" fill="none">
      <path d="M0 10 Q20 0 30 10 Q40 20 60 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="30" cy="10" r="3" fill="#17365D" />
    </svg>
    {title && <span className="font-cursive text-2xl px-2 text-[#17365D]">{title}</span>}
    <svg className="w-12 h-6" viewBox="0 0 60 20" fill="none">
      <path d="M0 10 Q20 0 30 10 Q40 20 60 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="30" cy="10" r="3" fill="#17365D" />
    </svg>
  </div>
);

export const BotanicalCorner: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2 Q 20 2 38 38" stroke="#7399C2" strokeWidth="1.5" fill="none" />
    <path d="M2 2 Q 2 20 38 38" stroke="#7399C2" strokeWidth="1.5" fill="none" />
    <circle cx="6" cy="6" r="2" fill="#315C8C" />
    <circle cx="14" cy="10" r="2.5" fill="#17365D" />
    <circle cx="10" cy="14" r="2.5" fill="#17365D" />
  </svg>
);
