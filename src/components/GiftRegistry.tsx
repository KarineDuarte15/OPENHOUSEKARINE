import React, { useState, useMemo } from 'react';
import { GiftItem, GiftCategory } from '../types';
import { GiftCard } from './GiftCard';
import { VintageFlourishDivider } from './VintageOrnaments';
import { Search, Filter, Gift, X, CheckCircle2, HeartHandshake, AlertCircle } from 'lucide-react';

interface GiftRegistryProps {
  gifts: GiftItem[];
  onReserveGift: (giftId: string, guestName: string, count: number, note?: string) => Promise<boolean>;
}

const ALL_CATEGORIES: (GiftCategory | 'Todas')[] = [
  'Todas',
  'Utensílios de cozinha',
  'Cama',
  'Banho',
  'Mesa',
  'Lavanderia',
  'Eletroportáteis',
  'Outros itens para casa',
];

type StatusFilter = 'todos' | 'disponiveis' | 'escolhidos';

export const GiftRegistry: React.FC<GiftRegistryProps> = ({ gifts, onReserveGift }) => {
  const [selectedCategory, setSelectedCategory] = useState<GiftCategory | 'Todas'>('Todas');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [activeGift, setActiveGift] = useState<GiftItem | null>(null);
  const [guestName, setGuestName] = useState('');
  const [count, setCount] = useState(1);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const filteredGifts = useMemo(() => {
    return gifts.filter((gift) => {
      // Category check
      if (selectedCategory !== 'Todas' && gift.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = gift.name.toLowerCase().includes(query);
        const matchesCat = gift.category.toLowerCase().includes(query);
        if (!matchesName && !matchesCat) return false;
      }

      // Status check
      const reservedCount = gift.reservations.reduce((acc, r) => acc + r.reservedCount, 0);
      const isAvailable = gift.totalQuantity - reservedCount > 0;

      if (statusFilter === 'disponiveis' && !isAvailable) return false;
      if (statusFilter === 'escolhidos' && isAvailable) return false;

      return true;
    });
  }, [gifts, selectedCategory, searchQuery, statusFilter]);

  const handleOpenModal = (gift: GiftItem) => {
    setActiveGift(gift);
    setGuestName('');
    setCount(1);
    setNote('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleCloseModal = () => {
    setActiveGift(null);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setErrorMsg('Por favor, digite seu nome completo para confirmar.');
      return;
    }

    if (!activeGift) return;

    setIsSubmitting(true);
    setErrorMsg('');

    const success = await onReserveGift(activeGift.id, guestName, count, note);
    setIsSubmitting(false);

    if (success) {
      setSuccessMsg(`Obrigado, ${guestName}! Seu presente foi registrado com muito carinho.`);
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } else {
      setErrorMsg('Ops! Não foi possível concluir a escolha. O item pode já ter sido reservado por outro convidado.');
    }
  };

  return (
    <section id="gifts" className="py-12 px-4 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <span className="text-xs font-sans-clean font-semibold uppercase tracking-widest text-[#315C8C]">
          Lista de Presentes — Chá de Casa Nova
        </span>
        <h2 className="font-cursive text-5xl md:text-6xl font-bold text-[#17365D] mt-1 mb-3">
          Um mimo para meu novo lar
        </h2>
        <p className="font-serif-vintage text-lg text-[#17365D] leading-relaxed">
          Preparei esta lista com muito carinho. Escolha um presente que combine com você e me ajude a transformar minha casa em um lar ainda mais especial. Sua presença também é um presente!
        </p>
        <VintageFlourishDivider />
      </div>

      {/* Controls Bar: Search & Status Filters */}
      <div className="bg-[#FCFAF5] border border-[#B9D0E6] rounded-lg p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#7399C2] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar presente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#B9D0E6] rounded-md pl-9 pr-4 py-2 text-sm text-[#17365D] placeholder-[#7399C2] focus:outline-none focus:border-[#17365D] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7399C2] hover:text-[#17365D]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Availability Status Filter */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-sans-clean font-medium text-[#315C8C] mr-2 shrink-0">
            Exibir:
          </span>
          <button
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-1.5 text-xs font-sans-clean font-medium rounded-md transition-colors shrink-0 ${
              statusFilter === 'todos'
                ? 'bg-[#17365D] text-white'
                : 'bg-[#E5EEF6] text-[#315C8C] hover:bg-[#B9D0E6]'
            }`}
          >
            Todos os presentes
          </button>
          <button
            onClick={() => setStatusFilter('disponiveis')}
            className={`px-3 py-1.5 text-xs font-sans-clean font-medium rounded-md transition-colors shrink-0 ${
              statusFilter === 'disponiveis'
                ? 'bg-[#17365D] text-white'
                : 'bg-[#E5EEF6] text-[#315C8C] hover:bg-[#B9D0E6]'
            }`}
          >
            Disponíveis
          </button>
          <button
            onClick={() => setStatusFilter('escolhidos')}
            className={`px-3 py-1.5 text-xs font-sans-clean font-medium rounded-md transition-colors shrink-0 ${
              statusFilter === 'escolhidos'
                ? 'bg-[#17365D] text-white'
                : 'bg-[#E5EEF6] text-[#315C8C] hover:bg-[#B9D0E6]'
            }`}
          >
            Já escolhidos
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar scroll-smooth">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-sans-clean font-semibold rounded-full whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#17365D] text-white shadow-xs'
                : 'bg-[#FCFAF5] border border-[#B9D0E6] text-[#315C8C] hover:bg-[#E5EEF6]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gift Cards Grid */}
      {filteredGifts.length === 0 ? (
        <div className="vintage-card p-12 text-center my-8">
          <Gift className="w-12 h-12 text-[#7399C2] mx-auto mb-3" />
          <h3 className="font-serif-vintage text-xl font-bold text-[#17365D] mb-1">
            Nenhum presente encontrado
          </h3>
          <p className="font-serif-vintage text-sm text-[#315C8C]">
            Tente mudar o termo de busca ou ajustar os filtros de categoria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGifts.map((gift) => (
            <GiftCard key={gift.id} gift={gift} onSelect={handleOpenModal} />
          ))}
        </div>
      )}

      {/* Reservation Modal Popup */}
      {activeGift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17365D]/60 backdrop-blur-xs animate-fadeIn">
          <div className="vintage-card max-w-lg w-full p-6 md:p-8 bg-[#FCFAF5] border-2 border-[#17365D] shadow-2xl relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-[#315C8C] hover:text-[#17365D] p-1 rounded-full hover:bg-[#E5EEF6]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <span className="text-xs font-sans-clean font-semibold uppercase tracking-wider text-[#315C8C]">
                Confirmar Presente
              </span>
              <h3 className="font-serif-vintage text-2xl font-bold text-[#17365D] mt-1">
                {activeGift.name}
              </h3>
              <p className="text-xs font-sans-clean text-[#7399C2] mt-0.5">
                Categoria: {activeGift.category}
              </p>
            </div>

            {successMsg ? (
              <div className="bg-[#E5EEF6] border border-[#315C8C] rounded-md p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-[#17365D] mx-auto mb-3" />
                <p className="font-serif-vintage text-lg font-bold text-[#17365D] mb-1">
                  Reserva Confirmada!
                </p>
                <p className="font-serif-vintage text-sm text-[#315C8C]">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReservation} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-xs font-sans-clean flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-sans-clean font-semibold text-[#17365D] uppercase mb-1">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria Silva"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-white border border-[#B9D0E6] rounded-md px-3 py-2 text-sm text-[#17365D] focus:outline-none focus:border-[#17365D]"
                  />
                </div>

                {/* Quantity selector if totalQuantity > 1 */}
                {activeGift.totalQuantity - activeGift.reservations.reduce((a, b) => a + b.reservedCount, 0) > 1 && (
                  <div>
                    <label className="block text-xs font-sans-clean font-semibold text-[#17365D] uppercase mb-1">
                      Quantidade a Presentear
                    </label>
                    <select
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value, 10))}
                      className="w-full bg-white border border-[#B9D0E6] rounded-md px-3 py-2 text-sm text-[#17365D] focus:outline-none focus:border-[#17365D]"
                    >
                      {Array.from(
                        {
                          length:
                            activeGift.totalQuantity -
                            activeGift.reservations.reduce((a, b) => a + b.reservedCount, 0),
                        },
                        (_, i) => i + 1
                      ).map((n) => (
                        <option key={n} value={n}>
                          {n} unidade{n > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-sans-clean font-semibold text-[#17365D] uppercase mb-1">
                    Recadinho carinhoso (opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escreva uma mensagem especial para a Karine..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-white border border-[#B9D0E6] rounded-md px-3 py-2 text-sm text-[#17365D] focus:outline-none focus:border-[#17365D]"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-1/2 bg-[#E5EEF6] hover:bg-[#B9D0E6] text-[#17365D] py-2.5 rounded-md text-xs font-sans-clean font-semibold uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 bg-[#17365D] hover:bg-[#315C8C] text-white py-2.5 rounded-md text-xs font-sans-clean font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? 'Gravando...' : 'Confirmar Escolha'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
