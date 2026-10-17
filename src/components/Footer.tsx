import React from 'react';
import { KeyIllustration, BotanicalCorner } from './VintageOrnaments';
import { EventConfig } from '../types';
import { ArrowUp, Heart, MapPin, Copy, Check } from 'lucide-react';

interface FooterProps {
  eventConfig: EventConfig;
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ eventConfig, onNavigate }) => {
  const [copiedAddress, setCopiedAddress] = React.useState(false);

  const handleCopyAddress = () => {
    const fullText = `${eventConfig.address}, ${eventConfig.cityState}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2500);
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-16 bg-[#17365D] text-[#E5EEF6] border-t-4 border-[#315C8C] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          {/* Brand & Key */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-cursive text-3xl font-bold text-white">Open House da Karine</span>
            </div>
            <p className="font-serif-vintage italic text-sm text-[#B9D0E6] mb-3">
              "Um novo lar, novos sonhos e muitos motivos para celebrar."
            </p>
            <p className="text-xs font-sans-clean text-[#7399C2]">
              Anfitriã: <strong className="text-white">{eventConfig.hosts}</strong>
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-sans-clean font-bold uppercase tracking-widest text-[#B9D0E6] mb-3">
              Navegação Rápida
            </span>
            <div className="flex flex-wrap justify-center gap-4 text-xs font-sans-clean text-[#E5EEF6]">
              <button onClick={() => onNavigate('invitation')} className="hover:text-white transition-colors">
                Convite
              </button>
              <button onClick={() => onNavigate('gifts')} className="hover:text-white transition-colors">
                Presentes
              </button>
              <button onClick={() => onNavigate('pix')} className="hover:text-white transition-colors">
                Pix
              </button>
              <button onClick={() => onNavigate('rsvp')} className="hover:text-white transition-colors">
                Presença
              </button>
              <button onClick={() => onNavigate('details')} className="hover:text-white transition-colors">
                Localização
              </button>
            </div>
          </div>

          {/* Location & Copy */}
          <div className="flex flex-col items-center md:items-end">
            <span className="text-xs font-sans-clean font-bold uppercase tracking-widest text-[#B9D0E6] mb-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Meu Endereço
            </span>
            <p className="font-serif-vintage text-sm text-white mb-1">
              {eventConfig.address}
            </p>
            <p className="font-serif-vintage text-xs text-[#7399C2] mb-3">
              {eventConfig.cityState}
            </p>
            <button
              onClick={handleCopyAddress}
              className="bg-[#315C8C] hover:bg-[#7399C2] text-white px-3 py-1.5 rounded text-xs font-sans-clean flex items-center gap-1.5 transition-colors"
            >
              {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedAddress ? 'Endereço Copiado!' : 'Copiar Endereço'}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-[#315C8C]/50 flex justify-between items-center pt-6">
          <p className="text-xs font-serif-vintage text-[#7399C2]">
            © {new Date().getFullYear()} Open House da Karine — Meu Novo Lar. Feito com amor e carinho.
          </p>

          <button
            onClick={scrollToTop}
            className="bg-[#315C8C] hover:bg-[#7399C2] text-white p-2.5 rounded-full transition-all shadow-md"
            title="Voltar ao Topo"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
