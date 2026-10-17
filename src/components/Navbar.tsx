import React, { useState } from 'react';
import { Home, Gift, HeartHandshake, MapPin, Lock, Menu, X, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAdmin, isAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'invitation', label: 'Convite', icon: Home },
    { id: 'gifts', label: 'Lista de Presentes', icon: Gift },
    { id: 'pix', label: 'Presente Pix', icon: HeartHandshake },
    { id: 'rsvp', label: 'Confirmar Presença', icon: CheckCircle2 },
    { id: 'details', label: 'Como Chegar', icon: MapPin },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FCFAF5]/90 backdrop-blur-md border-b border-[#B9D0E6] shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNavClick('invitation')}
          className="text-left whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <span className="font-cursive text-2xl md:text-3xl font-bold text-[#17365D] group-hover:text-[#315C8C] transition-colors">
            Open House da Karine
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs font-serif-vintage italic text-[#7399C2]">
            — Meu Novo Lar
          </span>
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-sans-clean font-medium text-[#17365D]">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`transition-colors py-1 whitespace-nowrap shrink-0 relative ${
                activeTab === link.id
                  ? 'text-[#17365D] font-semibold border-b-2 border-[#17365D]'
                  : 'text-[#315C8C] hover:text-[#17365D]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Action & Admin Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('rsvp')}
            className="hidden sm:inline-flex items-center gap-2 bg-[#17365D] hover:bg-[#315C8C] text-white px-4 py-2 rounded-md text-xs font-sans-clean font-semibold tracking-wide uppercase transition-all shadow-xs shrink-0"
          >
            <CheckCircle2 className="w-4 h-4 text-[#B9D0E6]" />
            Confirmar Presença
          </button>

          <button
            onClick={onOpenAdmin}
            title={isAdmin ? 'Painel do Anfitrião (Ativo)' : 'Área do Anfitrião'}
            className={`p-2 rounded-md transition-colors border ${
              isAdmin
                ? 'bg-[#E5EEF6] border-[#315C8C] text-[#17365D]'
                : 'bg-[#FCFAF5] border-[#B9D0E6] text-[#315C8C] hover:bg-[#E5EEF6]'
            }`}
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#17365D] hover:bg-[#E5EEF6] rounded-md transition-colors"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FCFAF5] border-b border-[#B9D0E6] px-4 pt-2 pb-4 space-y-2 animate-fadeIn">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-sans-clean font-medium transition-colors text-left ${
                  activeTab === link.id
                    ? 'bg-[#E5EEF6] text-[#17365D] font-bold border-l-4 border-[#17365D]'
                    : 'text-[#315C8C] hover:bg-[#E5EEF6]/50'
                }`}
              >
                <Icon className="w-4 h-4 text-[#315C8C]" />
                {link.label}
              </button>
            );
          })}
          <button
            onClick={() => handleNavClick('rsvp')}
            className="w-full flex items-center justify-center gap-2 bg-[#17365D] text-white py-2.5 rounded-md text-xs font-sans-clean font-semibold uppercase mt-2 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-[#B9D0E6]" />
            Confirmar Presença
          </button>
        </div>
      )}
    </header>
  );
};
