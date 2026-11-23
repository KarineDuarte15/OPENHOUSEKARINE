import React, { useState, useMemo } from 'react';
import { GiftItem, GiftCategory, EventConfig } from '../types';
import { GiftCard } from './GiftCard';
import { VintageFlourishDivider } from './VintageOrnaments';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { Search, Gift, X, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';

interface GiftRegistryProps {
  gifts: GiftItem[];
  eventConfig: EventConfig;
  onReserveGift: (giftId: string, guestName: string, count: number, note?: string) => Promise<{ ok: boolean; error?: string }>;
  onRefreshState?: () => Promise<void>;
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

export const GiftRegistry: React.FC<GiftRegistryProps> = ({
  gifts,
  eventConfig,
  onReserveGift,
  onRefreshState,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GiftCategory | 'Todas'>('Todas');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [activeGift, setActiveGift] = useState<GiftItem | null>(null);
  const [guestName, setGuestName] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedGiftDetails, setConfirmedGiftDetails] = useState<{
    giftName: string;
    guestName: string;
    note?: string;
  } | null>(null);

  const availableTotal = useMemo(
    () => gifts.filter((g) => g.reservations.length === 0).length,
    [gifts]
  );
  const chosenTotal = gifts.length - availableTotal;

  const filteredGifts = useMemo(() => {
    return gifts.filter((gift) => {
      if (selectedCategory !== 'Todas' && gift.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = gift.name.toLowerCase().includes(query);
        const matchesCat = gift.category.toLowerCase().includes(query);
        if (!matchesName && !matchesCat) return false;
      }

      const isAvailable = gift.reservations.length === 0;
      if (statusFilter === 'disponiveis' && !isAvailable) return false;
      if (statusFilter === 'escolhidos' && isAvailable) return false;

      return true;
    });
  }, [gifts, selectedCategory, searchQuery, statusFilter]);

  const handleOpenModal = (gift: GiftItem) => {
    if (gift.reservations.length > 0) return;
    setActiveGift(gift);
    setGuestName('');
    setNote('');
    setErrorMsg('');
    setConfirmedGiftDetails(null);
    onRefreshState?.();
  };

  const handleCloseModal = () => {
    setActiveGift(null);
    setErrorMsg('');
    setConfirmedGiftDetails(null);
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

    const result = await onReserveGift(activeGift.id, guestName.trim(), 1, note.trim() || undefined);
    setIsSubmitting(false);

    if (result.ok) {
      setConfirmedGiftDetails({
        giftName: activeGift.name,
        guestName: guestName.trim(),
        note: note.trim() || undefined,
      });
    } else {
      setErrorMsg(
        result.error ||
          'Ops! Este presente já foi escolhido por outro convidado e agora está indisponível.'
      );
    }
  };

  const giftWhatsAppUrl = confirmedGiftDetails
    ? buildWhatsAppUrl(
        eventConfig.whatsappNumber,
        [
          `Olá ${eventConfig.hosts}! Escolhi um presente na sua lista do Open House! 🎁`,
          `*Convidado:* ${confirmedGiftDetails.guestName}`,
          `*Presente escolhido:* ${confirmedGiftDetails.giftName}`,
          confirmedGiftDetails.note ? `*Recadinho:* ${confirmedGiftDetails.note}` : null,
          `Entregarei até o dia 27 de Novembro!`,
        ]
          .filter(Boolean)
          .join('\n')
      )
    : '';

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
          Preparei esta lista com muito carinho. Escolha um presente que combine com você — assim que você confirmar, ele fica automaticamente indisponível para outros convidados. Sua presença também é um presente!
        </p>

        {/* Delivery Deadline Notice Box */}
        <div className="mt-4 inline-flex items-center gap-2 bg-[#E5EEF6] border border-[#315C8C]/50 rounded-lg p-3 text-xs font-sans-clean font-semibold text-[#17365D] text-left">
          <span className="text-base">📦</span>
          <div>
            <strong className="text-[#315C8C]">Prazo de Entrega:</strong> Entregar o presente{' '}
            <strong>até o dia 27 de Novembro</strong> no endereço:{' '}
            <em>
              {eventConfig.address}, {eventConfig.cityState}
            </em>
            .
          </div>
        </div>
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
              type="button"
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
            type="button"
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-1.5 text-xs font-sans-clean font-medium rounded-md transition-colors shrink-0 cursor-pointer ${
              statusFilter === 'todos'
                ? 'bg-[#17365D] text-white'
                : 'bg-[#E5EEF6] text-[#315C8C] hover:bg-[#B9D0E6]'
            }`}
          >
            Todos ({gifts.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('disponiveis')}
            className={`px-3 py-1.5 text-xs font-sans-clean font-medium rounded-md transition-colors shrink-0 cursor-pointer ${
              statusFilter === 'disponiveis'
                ? 'bg-[#17365D] text-white'
                : 'bg-[#E5EEF6] text-[#315C8C] hover:bg-[#B9D0E6]'
            }`}
          >
            Disponíveis ({availableTotal})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('escolhidos')}
            className={`px-3 py-1.5 text-xs font-sans-clean font-medium rounded-md transition-colors shrink-0 cursor-pointer ${
              statusFilter === 'escolhidos'
                ? 'bg-[#17365D] text-white'
                : 'bg-[#E5EEF6] text-[#315C8C] hover:bg-[#B9D0E6]'
            }`}
          >
            Já escolhidos ({chosenTotal})
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar scroll-smooth">
        {ALL_CATEGORIES.map((cat) => (
          <button
            type="button"
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
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-[#315C8C] hover:text-[#17365D] p-1 rounded-full hover:bg-[#E5EEF6] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <span className="text-xs font-sans-clean font-semibold uppercase tracking-wider text-[#315C8C]">
                Confirmar Presente
              </span>
              <h3 className="font-serif-vintage text-2xl font-bold text-[#17365D] mt-1">
                {activeGift.name}
              </h3>
              <p className="text-xs font-sans-clean text-[#7399C2] mt-0.5">
                Categoria: {activeGift.category}
              </p>

              {/* Delivery Deadline Info Box in Modal */}
              <div className="mt-3 bg-[#E5EEF6] border border-[#B9D0E6] p-2.5 rounded text-left text-xs font-sans-clean text-[#17365D]">
                <strong>📍 Endereço para entrega (Até o dia 27 de Novembro):</strong>
                <br />
                {eventConfig.address}, {eventConfig.cityState}
              </div>
            </div>

            {confirmedGiftDetails ? (
              <div className="bg-[#E5EEF6] border border-[#315C8C] rounded-md p-6 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#17365D] mx-auto" />
                <div>
                  <p className="font-serif-vintage text-xl font-bold text-[#17365D] mb-1">
                    Presente Reservado com Sucesso!
                  </p>
                  <p className="font-serif-vintage text-sm text-[#315C8C]">
                    Obrigado, <strong>{confirmedGiftDetails.guestName}</strong>! O item{' '}
                    <strong>{confirmedGiftDetails.giftName}</strong> já está indisponível para outros convidados.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 pt-2">
                  <a
                    href={giftWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white py-3 px-4 rounded-md text-xs font-sans-clean font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Confirmar escolha no WhatsApp da Karine
                  </a>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full bg-white hover:bg-[#FCFAF5] text-[#17365D] border border-[#B9D0E6] py-2.5 rounded-md text-xs font-sans-clean font-semibold uppercase cursor-pointer"
                  >
                    Voltar para a lista
                  </button>
                </div>
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
                    className="w-1/2 bg-[#E5EEF6] hover:bg-[#B9D0E6] text-[#17365D] py-2.5 rounded-md text-xs font-sans-clean font-semibold uppercase cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 bg-[#17365D] hover:bg-[#315C8C] text-white py-2.5 rounded-md text-xs font-sans-clean font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
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
