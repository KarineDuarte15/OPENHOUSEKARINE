import React, { useState, useMemo } from 'react';
import { EventConfig, GiftItem, RSVP } from '../types';
import { getCategoryIcon } from './GiftCard';
import {
  Lock,
  Unlock,
  Users,
  Gift,
  Settings,
  Trash2,
  Save,
  X,
  CheckCircle2,
  ShieldAlert,
  Search,
  Printer,
  Heart,
  Calendar,
  MessageCircle,
  FileText
} from 'lucide-react';

interface AdminDashboardProps {
  eventConfig: EventConfig;
  gifts: GiftItem[];
  rsvps: RSVP[];
  isAdmin: boolean;
  onLogin: (pin: string) => Promise<boolean>;
  onLogout: () => void;
  onUpdateEventConfig: (newConfig: Partial<EventConfig>) => Promise<boolean>;
  onCancelReservation: (giftId: string, reservationId: string) => Promise<boolean>;
  onDeleteRSVP: (rsvpId: string) => Promise<boolean>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  eventConfig,
  gifts,
  rsvps,
  isAdmin,
  onLogin,
  onLogout,
  onUpdateEventConfig,
  onCancelReservation,
  onDeleteRSVP,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'received_gifts' | 'all_gifts' | 'rsvps' | 'config'>('received_gifts');
  const [searchQuery, setSearchQuery] = useState('');

  // Form edit states
  const [formData, setFormData] = useState<EventConfig>(eventConfig);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = await onLogin(pinInput);
    if (!success) {
      setLoginError('PIN administrativo incorreto. Tente novamente (padrão: 1234).');
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);

    const success = await onUpdateEventConfig(formData);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError('Erro ao atualizar as configurações. Verifique o servidor.');
    }
  };

  // Flattened list of all gifts given ("Quem deu cada coisa")
  const giftsGivenList = useMemo(() => {
    const list: {
      giftId: string;
      giftName: string;
      category: GiftItem['category'];
      reservationId: string;
      guestName: string;
      count: number;
      date: string;
      note?: string;
    }[] = [];

    gifts.forEach((gift) => {
      gift.reservations.forEach((res) => {
        list.push({
          giftId: gift.id,
          giftName: gift.name,
          category: gift.category,
          reservationId: res.id,
          guestName: res.guestName,
          count: res.reservedCount,
          date: res.reservedAt,
          note: res.note,
        });
      });
    });

    // Filter by query if typed
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return list.filter(
        (item) =>
          item.guestName.toLowerCase().includes(q) ||
          item.giftName.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.note && item.note.toLowerCase().includes(q))
      );
    }

    return list;
  }, [gifts, searchQuery]);

  const totalConfirmedGuests = rsvps.reduce((acc, r) => acc + r.guestCount, 0);
  const reservedGiftsCount = gifts.reduce(
    (acc, g) => acc + g.reservations.reduce((rAcc, res) => rAcc + res.reservedCount, 0),
    0
  );
  const totalGiftsCount = gifts.reduce((acc, g) => acc + g.totalQuantity, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportGiftsCSV = () => {
    if (giftsGivenList.length === 0) {
      alert('Nenhum presente foi reservado ainda para exportar.');
      return;
    }

    const headers = [
      'Nome do Convidado',
      'Presente Escolhido',
      'Categoria',
      'Quantidade',
      'Data da Escolha',
      'Mensagem / Recadinho',
      'Prazo de Entrega',
      'Endereco de Entrega'
    ];

    const rows = giftsGivenList.map((item) => [
      `"${item.guestName.replace(/"/g, '""')}"`,
      `"${item.giftName.replace(/"/g, '""')}"`,
      `"${item.category.replace(/"/g, '""')}"`,
      item.count,
      `"${new Date(item.date).toLocaleString('pt-BR')}"`,
      `"${(item.note || '').replace(/"/g, '""')}"`,
      '"Até 15/11/2026"',
      `"${eventConfig.address.replace(/"/g, '""')}, ${eventConfig.cityState.replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Presentes_Open_House_Karine_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportRSVPsCSV = () => {
    if (rsvps.length === 0) {
      alert('Nenhuma confirmação registrada ainda para exportar.');
      return;
    }

    const headers = [
      'Nome Completo',
      'Quantidade de Pessoas',
      'Telefone',
      'Mensagem',
      'Data de Confirmacao'
    ];

    const rows = rsvps.map((rsvp) => [
      `"${rsvp.fullName.replace(/"/g, '""')}"`,
      rsvp.guestCount,
      `"${(rsvp.phone || '').replace(/"/g, '""')}"`,
      `"${(rsvp.message || '').replace(/"/g, '""')}"`,
      `"${new Date(rsvp.createdAt).toLocaleString('pt-BR')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Lista_Presenca_Open_House_Karine_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAdmin) {
    return (
      <div className="vintage-card max-w-md mx-auto my-12 p-8 bg-[#FCFAF5] border-2 border-[#17365D] text-center shadow-xl">
        <div className="w-12 h-12 bg-[#E5EEF6] border border-[#315C8C] rounded-full flex items-center justify-center mx-auto mb-4 text-[#17365D]">
          <Lock className="w-6 h-6" />
        </div>
        <span className="text-xs font-sans-clean font-semibold uppercase tracking-widest text-[#315C8C]">
          Área Privativa da Anfitriã
        </span>
        <h2 className="font-cursive text-4xl font-bold text-[#17365D] mt-1 mb-2">
          Painel da Karine
        </h2>
        <p className="font-serif-vintage text-sm text-[#315C8C] mb-6">
          Digite sua senha/PIN para ver quem escolheu cada presente e gerenciar os convidados.
        </p>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {loginError && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-xs font-sans-clean flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div>
            <input
              type="password"
              placeholder="Digite a Senha / PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full bg-white border border-[#B9D0E6] rounded-md px-3.5 py-2.5 text-center text-lg tracking-widest font-mono text-[#17365D] focus:outline-none focus:border-[#17365D]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#17365D] hover:bg-[#315C8C] text-white py-3 rounded-md text-xs font-sans-clean font-semibold uppercase tracking-widest transition-colors shadow-xs"
          >
            Acessar Painel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="vintage-card max-w-5xl mx-auto my-8 p-6 md:p-8 bg-[#FCFAF5] border-2 border-[#17365D] shadow-xl">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#B9D0E6] pb-4 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-sans-clean font-bold text-[#315C8C] uppercase tracking-wider">
            <Unlock className="w-4 h-4 text-emerald-600" />
            Painel da Karine (Anfitriã)
          </div>
          <h2 className="font-serif-vintage text-3xl font-bold text-[#17365D]">
            Relatório de Presentes & Convidados
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportGiftsCSV}
            className="bg-[#17365D] hover:bg-[#315C8C] text-white px-3.5 py-2 rounded-md text-xs font-sans-clean font-semibold uppercase transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Exportar tabela formatada para abrir no Google Planilhas"
          >
            <FileText className="w-4 h-4 text-[#B9D0E6]" />
            Exportar para Google Planilhas (.CSV)
          </button>

          <button
            onClick={handlePrint}
            className="bg-[#E5EEF6] hover:bg-[#B9D0E6] text-[#17365D] border border-[#315C8C] px-3.5 py-2 rounded-md text-xs font-sans-clean font-semibold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Imprimir relatório de presentes"
          >
            <Printer className="w-4 h-4 text-[#315C8C]" />
            Imprimir
          </button>

          <button
            onClick={onLogout}
            className="bg-[#FCFAF5] hover:bg-[#E5EEF6] text-[#315C8C] border border-[#B9D0E6] px-3.5 py-2 rounded-md text-xs font-sans-clean font-semibold uppercase transition-colors cursor-pointer"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Quick Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#17365D] text-white p-5 rounded-lg shadow-xs">
          <div className="flex items-center gap-2 text-xs font-sans-clean text-[#B9D0E6] uppercase font-semibold mb-1">
            <Gift className="w-4 h-4 text-[#B9D0E6]" />
            Presentes Escolhidos
          </div>
          <span className="font-serif-vintage text-3xl font-bold text-white">
            {reservedGiftsCount} <span className="text-sm font-normal text-[#B9D0E6]">itens dados</span>
          </span>
          <p className="text-xs text-[#B9D0E6] mt-1">
            {giftsGivenList.length} presenteador(es) até agora
          </p>
        </div>

        <div className="bg-[#E5EEF6] border border-[#B9D0E6] p-5 rounded-lg">
          <div className="flex items-center gap-2 text-xs font-sans-clean text-[#315C8C] uppercase font-semibold mb-1">
            <Users className="w-4 h-4 text-[#17365D]" />
            Confirmados para o Evento
          </div>
          <span className="font-serif-vintage text-3xl font-bold text-[#17365D]">
            {totalConfirmedGuests} <span className="text-sm font-normal">pessoa(s)</span>
          </span>
          <p className="text-xs text-[#7399C2] mt-1">{rsvps.length} resposta(s) RSVP</p>
        </div>

        <div className="bg-[#E5EEF6] border border-[#B9D0E6] p-5 rounded-lg">
          <div className="flex items-center gap-2 text-xs font-sans-clean text-[#315C8C] uppercase font-semibold mb-1">
            <Settings className="w-4 h-4 text-[#17365D]" />
            Endereço Configurado
          </div>
          <p className="font-serif-vintage text-sm font-bold text-[#17365D] line-clamp-2">
            {eventConfig.address}
          </p>
          <p className="text-xs text-[#7399C2] mt-0.5">{eventConfig.cityState}</p>
        </div>
      </div>

      {/* Main Admin Navigation Tabs */}
      <div className="flex flex-wrap border-b border-[#B9D0E6] mb-6 gap-2">
        <button
          onClick={() => setActiveTab('received_gifts')}
          className={`px-4 py-2.5 text-xs font-sans-clean font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'received_gifts'
              ? 'border-[#17365D] text-[#17365D] bg-[#E5EEF6]'
              : 'border-transparent text-[#315C8C] hover:text-[#17365D]'
          }`}
        >
          <Heart className="w-4 h-4 text-[#17365D]" />
          Quem Deu O Quê ({giftsGivenList.length})
        </button>

        <button
          onClick={() => setActiveTab('rsvps')}
          className={`px-4 py-2.5 text-xs font-sans-clean font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'rsvps'
              ? 'border-[#17365D] text-[#17365D] bg-[#E5EEF6]'
              : 'border-transparent text-[#315C8C] hover:text-[#17365D]'
          }`}
        >
          <Users className="w-4 h-4 text-[#17365D]" />
          Confirmações de Presença ({rsvps.length})
        </button>

        <button
          onClick={() => setActiveTab('all_gifts')}
          className={`px-4 py-2.5 text-xs font-sans-clean font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'all_gifts'
              ? 'border-[#17365D] text-[#17365D] bg-[#E5EEF6]'
              : 'border-transparent text-[#315C8C] hover:text-[#17365D]'
          }`}
        >
          <Gift className="w-4 h-4 text-[#17365D]" />
          Todos os Presentes ({gifts.length})
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2.5 text-xs font-sans-clean font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'config'
              ? 'border-[#17365D] text-[#17365D] bg-[#E5EEF6]'
              : 'border-transparent text-[#315C8C] hover:text-[#17365D]'
          }`}
        >
          <Settings className="w-4 h-4 text-[#17365D]" />
          Editar Evento & Endereço
        </button>
      </div>

      {/* TAB 1: QUEM DEU CADA COISA (Gifts Received Report) */}
      {activeTab === 'received_gifts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#E5EEF6] p-4 rounded-lg border border-[#B9D0E6]">
            <div>
              <h3 className="font-serif-vintage text-2xl font-bold text-[#17365D]">
                Relatório de Presentes Recebidos
              </h3>
              <p className="text-xs font-sans-clean text-[#315C8C]">
                Veja exatamente quem escolheu cada presente e a mensagem deixada por cada convidado.
              </p>
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#7399C2] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por convidado ou presente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#B9D0E6] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#17365D] placeholder-[#7399C2] focus:outline-none"
              />
            </div>
          </div>

          {giftsGivenList.length === 0 ? (
            <div className="text-center py-12 bg-white border border-[#B9D0E6] rounded-lg">
              <Gift className="w-12 h-12 text-[#7399C2] mx-auto mb-3" />
              <h4 className="font-serif-vintage text-xl font-bold text-[#17365D] mb-1">
                Nenhum presente foi escolhido ainda
              </h4>
              <p className="font-serif-vintage text-sm text-[#315C8C]">
                Assim que os convidados escolherem os presentes no site, os nomes e mensagens aparecerão nesta lista!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-sans-clean border-collapse bg-white rounded-lg overflow-hidden border border-[#B9D0E6]">
                <thead>
                  <tr className="bg-[#17365D] text-white">
                    <th className="p-3 font-semibold">Quem Deu (Convidado)</th>
                    <th className="p-3 font-semibold">Presente Escolhido</th>
                    <th className="p-3 font-semibold">Categoria</th>
                    <th className="p-3 font-semibold text-center">Qtd</th>
                    <th className="p-3 font-semibold">Mensagem / Recadinho</th>
                    <th className="p-3 font-semibold">Data da Escolha</th>
                    <th className="p-3 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B9D0E6]">
                  {giftsGivenList.map((item) => {
                    const CategoryIcon = getCategoryIcon(item.category);
                    return (
                      <tr key={item.reservationId} className="hover:bg-[#E5EEF6]/50 transition-colors">
                        <td className="p-3 font-bold text-[#17365D]">
                          {item.guestName}
                        </td>
                        <td className="p-3 font-serif-vintage text-base font-bold text-[#17365D]">
                          {item.giftName}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 bg-[#E5EEF6] text-[#17365D] px-2 py-0.5 rounded text-xs">
                            <CategoryIcon className="w-3 h-3 text-[#315C8C]" />
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-[#17365D]">
                          {item.count}
                        </td>
                        <td className="p-3 text-xs italic text-[#315C8C]">
                          {item.note ? `"${item.note}"` : '—'}
                        </td>
                        <td className="p-3 text-xs text-[#7399C2] font-mono">
                          {new Date(item.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => onCancelReservation(item.giftId, item.reservationId)}
                            className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 text-xs font-sans-clean font-semibold flex items-center gap-1 ml-auto"
                            title="Liberar este presente de volta para a lista"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Liberar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RSVPs List */}
      {activeTab === 'rsvps' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#E5EEF6] p-4 rounded-lg border border-[#B9D0E6]">
            <div>
              <h3 className="font-serif-vintage text-2xl font-bold text-[#17365D]">
                Lista de Presenças Confirmadas (RSVP)
              </h3>
              <p className="text-xs font-sans-clean text-[#315C8C]">
                Total de {totalConfirmedGuests} pessoas confirmadas em {rsvps.length} resposta(s).
              </p>
            </div>

            {rsvps.length > 0 && (
              <button
                onClick={handleExportRSVPsCSV}
                className="bg-[#17365D] hover:bg-[#315C8C] text-white px-3.5 py-2 rounded-md text-xs font-sans-clean font-semibold uppercase transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Exportar Lista de Presença para Google Planilhas"
              >
                <FileText className="w-4 h-4 text-[#B9D0E6]" />
                Exportar Presenças (.CSV)
              </button>
            )}
          </div>

          {rsvps.length === 0 ? (
            <p className="text-sm font-serif-vintage text-[#315C8C] italic">
              Nenhuma confirmação de presença registrada até o momento.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-sans-clean border-collapse bg-white rounded-lg overflow-hidden border border-[#B9D0E6]">
                <thead>
                  <tr className="bg-[#17365D] text-white">
                    <th className="p-3">Nome do Convidado</th>
                    <th className="p-3 text-center">Pessoas</th>
                    <th className="p-3">Telefone</th>
                    <th className="p-3">Mensagem</th>
                    <th className="p-3">Data de Confirmação</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B9D0E6]">
                  {rsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="hover:bg-[#E5EEF6]/40">
                      <td className="p-3 font-bold text-[#17365D]">{rsvp.fullName}</td>
                      <td className="p-3 text-center font-mono font-bold text-[#17365D]">{rsvp.guestCount}</td>
                      <td className="p-3 text-[#315C8C]">{rsvp.phone || '—'}</td>
                      <td className="p-3 text-xs italic text-[#17365D]">{rsvp.message || '—'}</td>
                      <td className="p-3 text-xs text-[#7399C2] font-mono">
                        {new Date(rsvp.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onDeleteRSVP(rsvp.id)}
                          className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50"
                          title="Excluir Confirmação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALL GIFTS LIST */}
      {activeTab === 'all_gifts' && (
        <div className="space-y-4">
          <h3 className="font-serif-vintage text-2xl font-bold text-[#17365D]">
            Visão Geral de Todos os Presentes
          </h3>

          <div className="space-y-3">
            {gifts.map((gift) => {
              const reserved = gift.reservations.reduce((a, b) => a + b.reservedCount, 0);
              const CategoryIcon = getCategoryIcon(gift.category);
              return (
                <div
                  key={gift.id}
                  className="p-4 bg-white border border-[#B9D0E6] rounded-lg flex flex-col md:flex-row justify-between md:items-center gap-3"
                >
                  <div>
                    <span className="text-xs font-sans-clean font-semibold uppercase text-[#7399C2] flex items-center gap-1">
                      <CategoryIcon className="w-3.5 h-3.5 text-[#315C8C]" />
                      {gift.category}
                    </span>
                    <h4 className="font-serif-vintage text-lg font-bold text-[#17365D]">
                      {gift.name}
                    </h4>
                    <p className="text-xs text-[#315C8C] font-mono">
                      {reserved} de {gift.totalQuantity} unidades reservadas
                    </p>
                  </div>

                  {/* Reservations detail */}
                  <div className="space-y-1">
                    {gift.reservations.length === 0 ? (
                      <span className="text-xs font-sans-clean text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                        Disponível
                      </span>
                    ) : (
                      gift.reservations.map((res) => (
                        <div
                          key={res.id}
                          className="flex items-center gap-2 bg-[#E5EEF6] px-3 py-1 rounded text-xs font-sans-clean"
                        >
                          <span className="font-semibold text-[#17365D]">
                            {res.guestName} ({res.reservedCount}x)
                          </span>
                          {res.note && (
                            <span className="italic text-[#7399C2] truncate max-w-xs">
                              "{res.note}"
                            </span>
                          )}
                          <button
                            onClick={() => onCancelReservation(gift.id, res.id)}
                            className="ml-auto text-red-600 hover:text-red-800 p-0.5"
                            title="Liberar/Cancelar esta escolha"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CONFIG FORM */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="space-y-4 max-w-2xl bg-white p-6 border border-[#B9D0E6] rounded-lg">
          <h3 className="font-serif-vintage text-2xl font-bold text-[#17365D] mb-2">
            Editar Dados do Evento e Endereço
          </h3>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-sans-clean flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Dados do evento atualizados com sucesso!</span>
            </div>
          )}

          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-xs font-sans-clean">
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans-clean font-semibold uppercase text-[#17365D] mb-1">
                Anfitriã (Seu Nome)
              </label>
              <input
                type="text"
                value={formData.hosts}
                onChange={(e) => setFormData({ ...formData, hosts: e.target.value })}
                className="w-full bg-white border border-[#B9D0E6] rounded px-3 py-2 text-sm text-[#17365D]"
              />
            </div>

            <div>
              <label className="block text-xs font-sans-clean font-semibold uppercase text-[#17365D] mb-1">
                Data do Evento
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-white border border-[#B9D0E6] rounded px-3 py-2 text-sm text-[#17365D]"
              />
            </div>

            <div>
              <label className="block text-xs font-sans-clean font-semibold uppercase text-[#17365D] mb-1">
                Horário
              </label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-white border border-[#B9D0E6] rounded px-3 py-2 text-sm text-[#17365D]"
              />
            </div>

            <div>
              <label className="block text-xs font-sans-clean font-semibold uppercase text-[#17365D] mb-1">
                Cidade / Estado / CEP
              </label>
              <input
                type="text"
                value={formData.cityState}
                onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
                className="w-full bg-white border border-[#B9D0E6] rounded px-3 py-2 text-sm text-[#17365D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans-clean font-semibold uppercase text-[#17365D] mb-1">
              Endereço Completo
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-white border border-[#B9D0E6] rounded px-3 py-2 text-sm text-[#17365D]"
            />
          </div>

          <div>
            <label className="block text-xs font-sans-clean font-semibold uppercase text-[#17365D] mb-1">
              Link do Google Maps
            </label>
            <input
              type="url"
              value={formData.mapsUrl}
              onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
              className="w-full bg-white border border-[#B9D0E6] rounded px-3 py-2 text-sm text-[#17365D]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-sans-clean font-semibold uppercase text-[#17365D] mb-1">
                Chave Pix (Telefone)
              </label>
              <input
                type="text"
                value={formData.pixKey}
                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                className="w-full bg-white border border-[#B9D0E6] rounded px-3 py-2 text-sm font-mono text-[#17365D]"
              />
            </div>

            <div>
              <label className="block text-xs font-sans-clean font-semibold uppercase text-[#17365D] mb-1">
                Titular Pix
              </label>
              <input
                type="text"
                value={formData.pixName}
                onChange={(e) => setFormData({ ...formData, pixName: e.target.value })}
                className="w-full bg-white border border-[#B9D0E6] rounded px-3 py-2 text-sm text-[#17365D]"
              />
            </div>

            <div>
              <label className="block text-xs font-sans-clean font-semibold uppercase text-[#17365D] mb-1">
                Cidade Pix
              </label>
              <input
                type="text"
                value={formData.pixCity}
                onChange={(e) => setFormData({ ...formData, pixCity: e.target.value })}
                className="w-full bg-white border border-[#B9D0E6] rounded px-3 py-2 text-sm text-[#17365D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans-clean font-semibold uppercase text-[#17365D] mb-1">
              Orientações Especiais
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-white border border-[#B9D0E6] rounded px-3 py-2 text-sm text-[#17365D]"
            />
          </div>

          <button
            type="submit"
            className="bg-[#17365D] hover:bg-[#315C8C] text-white px-6 py-3 rounded text-xs font-sans-clean font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4 text-[#B9D0E6]" />
            Salvar Alterações
          </button>
        </form>
      )}
    </div>
  );
};
