import React from 'react';
import { GiftItem, GiftCategory } from '../types';
import { Utensils, Bed, Bath, Coffee, Shirt, Zap, Home, Gift, Lock } from 'lucide-react';

interface GiftCardProps {
  gift: GiftItem;
  onSelect: (gift: GiftItem) => void;
}

export const getCategoryIcon = (category: GiftCategory) => {
  switch (category) {
    case 'Utensílios de cozinha':
      return Utensils;
    case 'Cama':
      return Bed;
    case 'Banho':
      return Bath;
    case 'Mesa':
      return Coffee;
    case 'Lavanderia':
      return Shirt;
    case 'Eletroportáteis':
      return Zap;
    case 'Outros itens para casa':
    default:
      return Home;
  }
};

export const GiftCard: React.FC<GiftCardProps> = ({ gift, onSelect }) => {
  const isUnavailable = gift.reservations.length > 0;
  const CategoryIcon = getCategoryIcon(gift.category);

  return (
    <div
      className={`vintage-card p-5 flex flex-col justify-between transition-all duration-200 ${
        isUnavailable
          ? 'bg-[#E5EEF6]/60 border-[#B9D0E6] opacity-75'
          : 'hover:border-[#17365D] hover:shadow-md'
      }`}
    >
      <div>
        {/* Header Tag */}
        <div className="flex items-center justify-between gap-2 mb-3 text-xs font-sans-clean font-medium text-[#7399C2]">
          <span className="flex items-center gap-1.5 bg-[#E5EEF6] text-[#17365D] px-2.5 py-1 rounded-md truncate">
            <CategoryIcon className="w-3.5 h-3.5 text-[#315C8C] shrink-0" />
            <span className="truncate">{gift.category}</span>
          </span>
          <span
            className={`font-sans-clean text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-sm shrink-0 ${
              isUnavailable
                ? 'bg-slate-200 text-slate-600'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {isUnavailable ? 'Indisponível' : 'Disponível'}
          </span>
        </div>

        {/* Item Title */}
        <h3
          className={`font-serif-vintage text-xl font-bold mb-2 leading-snug ${
            isUnavailable ? 'text-[#315C8C] line-through decoration-[#7399C2]' : 'text-[#17365D]'
          }`}
        >
          {gift.name}
        </h3>

        {/* Display Reserved By summary if any */}
        {isUnavailable && (
          <div className="mt-2 mb-3 text-xs font-serif-vintage text-[#315C8C] italic">
            Já escolhido por {gift.reservations.map((r) => r.guestName).join(', ')}
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="mt-4 pt-3 border-t border-[#B9D0E6]/60">
        {isUnavailable ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="w-full bg-[#B9D0E6]/40 text-[#315C8C] cursor-not-allowed py-2.5 px-3 rounded-md text-xs font-sans-clean font-semibold uppercase flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5 text-[#7399C2]" />
            Presente Indisponível
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelect(gift)}
            className="w-full bg-[#17365D] hover:bg-[#315C8C] text-white py-2.5 px-3 rounded-md text-xs font-sans-clean font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Gift className="w-3.5 h-3.5 text-[#B9D0E6]" />
            Escolher Presente
          </button>
        )}
      </div>
    </div>
  );
};
