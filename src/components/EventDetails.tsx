import React from 'react';
import { EventConfig } from '../types';
import { LocationPinIllustration, VintageFlourishDivider, HouseIllustration } from './VintageOrnaments';
import { Calendar, Clock, MapPin, Navigation, Info, Heart } from 'lucide-react';

interface EventDetailsProps {
  eventConfig: EventConfig;
}

export const EventDetails: React.FC<EventDetailsProps> = ({ eventConfig }) => {
  return (
    <section id="details" className="py-12 px-4 max-w-4xl mx-auto">
      <div className="vintage-card p-6 md:p-12 bg-[#FCFAF5] border-2 border-[#B9D0E6] text-center shadow-md">
        {/* Header Pin Illustration */}
        <div className="flex justify-center mb-4">
          <LocationPinIllustration className="w-20 h-20 filter drop-shadow-xs" />
        </div>

        <span className="text-xs font-sans-clean font-semibold uppercase tracking-widest text-[#315C8C]">
          Localização e Detalhes
        </span>
        <h2 className="font-cursive text-5xl font-bold text-[#17365D] mt-1 mb-2">
          Como Chegar & Informações
        </h2>
        <p className="font-serif-vintage text-base md:text-lg text-[#315C8C] max-w-lg mx-auto">
          Confira abaixo todos os dados do nosso evento e planeje seu caminho até o nosso novo lar.
        </p>

        <VintageFlourishDivider />

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8 text-left">
          {/* Data */}
          <div className="bg-[#E5EEF6]/60 border border-[#B9D0E6] p-5 rounded-lg flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-[#17365D]">
              <Calendar className="w-5 h-5 text-[#315C8C]" />
              <span className="text-xs font-sans-clean font-semibold uppercase tracking-wider text-[#315C8C]">
                Data
              </span>
            </div>
            <p className="font-serif-vintage text-xl font-bold text-[#17365D]">
              {eventConfig.date}
            </p>
          </div>

          {/* Horário */}
          <div className="bg-[#E5EEF6]/60 border border-[#B9D0E6] p-5 rounded-lg flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-[#17365D]">
              <Clock className="w-5 h-5 text-[#315C8C]" />
              <span className="text-xs font-sans-clean font-semibold uppercase tracking-wider text-[#315C8C]">
                Horário
              </span>
            </div>
            <p className="font-serif-vintage text-xl font-bold text-[#17365D]">
              {eventConfig.time}
            </p>
          </div>

          {/* Endereço */}
          <div className="bg-[#E5EEF6]/60 border border-[#B9D0E6] p-5 rounded-lg flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-[#17365D]">
              <MapPin className="w-5 h-5 text-[#315C8C]" />
              <span className="text-xs font-sans-clean font-semibold uppercase tracking-wider text-[#315C8C]">
                Endereço
              </span>
            </div>
            <div>
              <p className="font-serif-vintage text-base font-bold text-[#17365D] leading-tight">
                {eventConfig.address}
              </p>
              <p className="font-serif-vintage text-sm text-[#315C8C]">
                {eventConfig.cityState}
              </p>
            </div>
          </div>
        </div>

        {/* Google Maps Button */}
        <div className="mb-8">
          <a
            href={eventConfig.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#17365D] hover:bg-[#315C8C] text-white px-8 py-3.5 rounded-md font-sans-clean font-semibold text-xs uppercase tracking-widest transition-all shadow-md"
          >
            <Navigation className="w-4 h-4 text-[#B9D0E6]" />
            Abrir Localização no Google Maps
          </a>
        </div>

        {/* Additional Orientations */}
        {eventConfig.notes && (
          <div className="max-w-2xl mx-auto bg-[#E5EEF6] border border-[#B9D0E6] p-6 rounded-lg text-left my-8">
            <h4 className="font-sans-clean text-xs font-bold uppercase tracking-wider text-[#17365D] mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#315C8C]" />
              Orientações dos Anfitriões
            </h4>
            <p className="font-serif-vintage text-base text-[#17365D] leading-relaxed whitespace-pre-line">
              {eventConfig.notes}
            </p>
          </div>
        )}

        {/* Final Warm Message */}
        <div className="mt-10 pt-6 border-t border-[#B9D0E6]/80 max-w-xl mx-auto">
          <p className="font-serif-vintage text-xl font-bold text-[#17365D] italic mb-3">
            "Mal podemos esperar para abrir as portas do nosso novo lar e celebrar com você!"
          </p>

          <div className="flex items-center justify-center gap-2 text-[#315C8C] font-serif-vintage italic text-lg font-semibold mt-4">
            <Heart className="w-4 h-4 text-[#7399C2] fill-[#7399C2]" />
            <span>Com carinho, {eventConfig.hosts}</span>
          </div>
        </div>

        {/* Bottom Decorative House */}
        <div className="flex justify-center mt-8">
          <HouseIllustration className="w-16 h-16 text-[#315C8C] opacity-70" />
        </div>
      </div>
    </section>
  );
};
