import React from 'react';
import { KeyIllustration, HouseIllustration, BotanicalCorner, VintageFlourishDivider } from './VintageOrnaments';
import { EventConfig } from '../types';
import { Calendar, Clock, MapPin, CheckCircle2, Gift, ExternalLink } from 'lucide-react';

interface VintageInvitationProps {
  eventConfig: EventConfig;
  onNavigate: (sectionId: string) => void;
}

export const VintageInvitation: React.FC<VintageInvitationProps> = ({ eventConfig, onNavigate }) => {
  return (
    <section id="invitation" className="relative py-12 px-4 max-w-4xl mx-auto">
      {/* Outer Invitation Container */}
      <div className="vintage-card p-6 md:p-12 text-center overflow-hidden border-2 border-[#B9D0E6] bg-[#FCFAF5] shadow-lg">
        {/* Botanical corner ornaments */}
        <div className="absolute top-2 left-2 pointer-events-none">
          <BotanicalCorner className="w-10 h-10 text-[#7399C2]" />
        </div>
        <div className="absolute top-2 right-2 rotate-90 pointer-events-none">
          <BotanicalCorner className="w-10 h-10 text-[#7399C2]" />
        </div>
        <div className="absolute bottom-2 left-2 -rotate-90 pointer-events-none">
          <BotanicalCorner className="w-10 h-10 text-[#7399C2]" />
        </div>
        <div className="absolute bottom-2 right-2 rotate-180 pointer-events-none">
          <BotanicalCorner className="w-10 h-10 text-[#7399C2]" />
        </div>

        {/* Vintage Keys Hero Illustration */}
        <div className="flex justify-center mb-4">
          <KeyIllustration className="w-28 h-28 text-[#17365D] filter drop-shadow-xs" />
        </div>

        {/* Host Names Banner */}
        <div className="text-[#315C8C] font-serif-vintage italic text-lg md:text-xl tracking-widest uppercase mb-2">
          {eventConfig.hosts}
        </div>

        {/* Main Title */}
        <h1 className="font-cursive text-5xl sm:text-6xl md:text-7xl font-bold text-[#17365D] mb-3 leading-tight">
          Open House da Karine
        </h1>

        {/* Subtitle */}
        <p className="font-serif-vintage text-xl md:text-2xl text-[#315C8C] italic max-w-xl mx-auto mb-6">
          "Um novo lar, novos sonhos e muitos motivos para celebrar."
        </p>

        <VintageFlourishDivider />

        {/* Invitation Message */}
        <p className="font-serif-vintage text-base md:text-lg text-[#17365D] max-w-2xl mx-auto mb-8 leading-relaxed">
          Você está convidado(a) para conhecer meu novo lar! Será uma alegria gigantesca compartilhar esse momento especial, dar boas risadas e inaugurar esta nova fase comigo.
        </p>

        {/* Editorial Event Details Block */}
        <div className="my-8 max-w-2xl mx-auto bg-[#E5EEF6]/60 border border-[#B9D0E6] rounded-lg p-6 md:p-8 backdrop-blur-xs relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#17365D] shrink-0 mt-1" />
              <div>
                <span className="block text-xs font-sans-clean font-semibold uppercase tracking-wider text-[#315C8C]">
                  Data do Evento
                </span>
                <span className="font-serif-vintage text-lg font-semibold text-[#17365D]">
                  {eventConfig.date}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#17365D] shrink-0 mt-1" />
              <div>
                <span className="block text-xs font-sans-clean font-semibold uppercase tracking-wider text-[#315C8C]">
                  Horário
                </span>
                <span className="font-serif-vintage text-lg font-semibold text-[#17365D]">
                  {eventConfig.time}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 md:col-span-2">
              <MapPin className="w-5 h-5 text-[#17365D] shrink-0 mt-1" />
              <div>
                <span className="block text-xs font-sans-clean font-semibold uppercase tracking-wider text-[#315C8C]">
                  Endereço do Meu Novo Lar
                </span>
                <span className="font-serif-vintage text-base font-medium text-[#17365D] block">
                  {eventConfig.address}
                </span>
                <span className="font-serif-vintage text-sm text-[#315C8C]">
                  {eventConfig.cityState}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={() => onNavigate('rsvp')}
            className="w-full sm:w-auto bg-[#17365D] hover:bg-[#315C8C] text-white px-6 py-3.5 rounded-md font-sans-clean font-semibold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#B9D0E6]" />
            Confirmar Presença
          </button>

          <button
            onClick={() => onNavigate('gifts')}
            className="w-full sm:w-auto bg-[#E5EEF6] hover:bg-[#B9D0E6] text-[#17365D] border border-[#315C8C] px-6 py-3.5 rounded-md font-sans-clean font-semibold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Gift className="w-4 h-4 text-[#315C8C]" />
            Ver Lista de Presentes
          </button>

          <a
            href={eventConfig.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-[#FCFAF5] hover:bg-[#E5EEF6] text-[#315C8C] border border-[#B9D0E6] px-6 py-3.5 rounded-md font-sans-clean font-semibold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4 text-[#7399C2]" />
            Como Chegar
          </a>
        </div>

        {/* Decorative House Footer */}
        <div className="flex justify-center mt-10 opacity-80">
          <HouseIllustration className="w-16 h-16 text-[#315C8C]" />
        </div>
      </div>
    </section>
  );
};
