import React, { useState } from 'react';
import {
  CheckCircle2,
  User,
  Users,
  UserPlus,
  Phone,
  MessageSquare,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { VintageFlourishDivider } from './VintageOrnaments';
import { EventConfig } from '../types';
import { buildWhatsAppUrl, formatWhatsAppDisplay } from '../utils/whatsapp';

interface AttendanceFormProps {
  eventConfig: EventConfig;
  onSubmitRSVP: (
    fullName: string,
    guestCount: number,
    companions?: string,
    phone?: string,
    message?: string
  ) => Promise<boolean>;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({ eventConfig, onSubmitRSVP }) => {
  const [fullName, setFullName] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [companionNames, setCompanionNames] = useState<string[]>(['']);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    fullName: string;
    guestCount: number;
    companions: string;
    phone: string;
    message: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGuestCountChange = (newCount: number) => {
    setGuestCount(newCount);
    const neededSlots = Math.max(1, newCount - 1);
    setCompanionNames((prev) => {
      const next = [...prev];
      while (next.length < neededSlots) next.push('');
      return next.slice(0, neededSlots);
    });
  };

  const handleCompanionChange = (index: number, value: string) => {
    setCompanionNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const cleanedCompanionsList = companionNames.map((n) => n.trim()).filter(Boolean);
  const companionsJoined = cleanedCompanionsList.join(', ');

  // Effective guest count if user stayed on 1 but typed companion names
  const effectiveGuestCount =
    guestCount === 1 && cleanedCompanionsList.length > 0
      ? 1 + cleanedCompanionsList.length
      : guestCount;

  const buildConfirmationMessage = (data: {
    fullName: string;
    guestCount: number;
    companions: string;
    phone: string;
    message: string;
  }) => {
    return [
      `Olá ${eventConfig.hosts}! Confirmo minha presença no seu Open House! 🎉`,
      data.fullName ? `*Nome:* ${data.fullName}` : null,
      `*Quantidade de pessoas:* ${data.guestCount} ${data.guestCount > 1 ? 'pessoas' : 'pessoa'}`,
      data.companions ? `*Acompanhante(s):* ${data.companions}` : null,
      data.phone ? `*Telefone:* ${data.phone}` : null,
      data.message ? `*Mensagem:* ${data.message}` : null,
    ]
      .filter(Boolean)
      .join('\n');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Por favor, informe seu nome completo.');
      return;
    }

    if (guestCount > 1 && cleanedCompanionsList.length < guestCount - 1) {
      setErrorMsg('Por favor, informe o nome de todos os acompanhantes selecionados.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const payload = {
      fullName: fullName.trim(),
      guestCount: effectiveGuestCount,
      companions: companionsJoined,
      phone: phone.trim(),
      message: message.trim(),
    };

    const success = await onSubmitRSVP(
      payload.fullName,
      payload.guestCount,
      payload.companions || undefined,
      payload.phone || undefined,
      payload.message || undefined
    );
    setIsSubmitting(false);

    if (success) {
      setSubmittedData(payload);
    } else {
      setErrorMsg('Não foi possível registrar sua confirmação. Tente novamente em instantes.');
    }
  };

  const whatsappDisplay = formatWhatsAppDisplay(eventConfig.whatsappNumber);
  const submittedWhatsAppUrl = submittedData
    ? buildWhatsAppUrl(eventConfig.whatsappNumber, buildConfirmationMessage(submittedData))
    : '';
  const directWhatsAppUrl = buildWhatsAppUrl(
    eventConfig.whatsappNumber,
    fullName.trim()
      ? buildConfirmationMessage({
          fullName: fullName.trim(),
          guestCount: effectiveGuestCount,
          companions: companionsJoined,
          phone: phone.trim(),
          message: message.trim(),
        })
      : `Olá ${eventConfig.hosts}! Gostaria de confirmar minha presença no seu Open House! 🎉`
  );

  return (
    <section id="rsvp" className="py-12 px-4 max-w-3xl mx-auto">
      <div className="vintage-card p-6 md:p-10 bg-[#FCFAF5] border-2 border-[#B9D0E6] shadow-md">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-sans-clean font-semibold uppercase tracking-widest text-[#315C8C]">
            Confirmação de Presença (RSVP)
          </span>
          <h2 className="font-cursive text-5xl font-bold text-[#17365D] mt-1 mb-2">
            Sua presença é essencial!
          </h2>
          <p className="font-serif-vintage text-base md:text-lg text-[#17365D]">
            Por favor, confirme sua presença, informe se levará acompanhante(s) e envie a confirmação pelo WhatsApp.
          </p>
          <VintageFlourishDivider />
        </div>

        {submittedData ? (
          <div className="bg-[#E5EEF6] border border-[#315C8C] rounded-lg p-8 text-center my-4 animate-fadeIn">
            <div className="w-16 h-16 bg-[#17365D] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-[#B9D0E6]" />
            </div>
            <h3 className="font-serif-vintage text-2xl font-bold text-[#17365D] mb-2">
              Presença Registrada!
            </h3>
            <p className="font-serif-vintage text-base md:text-lg text-[#315C8C] max-w-md mx-auto mb-4">
              Obrigado, <strong>{submittedData.fullName}</strong>! Sua confirmação para{' '}
              <strong>
                {submittedData.guestCount} {submittedData.guestCount > 1 ? 'pessoas' : 'pessoa'}
              </strong>{' '}
              {submittedData.companions ? `(acompanhante(s): ${submittedData.companions}) ` : ''}
              já está na lista da Karine.
            </p>
            <p className="text-xs font-sans-clean text-[#17365D] mb-6">
              Agora clique no botão abaixo para enviar sua confirmação também no WhatsApp da Karine ({whatsappDisplay}):
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={submittedWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1ebe5d] text-white px-6 py-3 rounded-md text-xs font-sans-clean font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Confirmar pelo WhatsApp
              </a>

              <button
                type="button"
                onClick={() => {
                  setSubmittedData(null);
                  setFullName('');
                  setGuestCount(1);
                  setCompanionNames(['']);
                  setPhone('');
                  setMessage('');
                }}
                className="w-full sm:w-auto bg-[#17365D] hover:bg-[#315C8C] text-white px-6 py-3 rounded-md text-xs font-sans-clean font-semibold uppercase tracking-wider cursor-pointer"
              >
                Enviar outra confirmação
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 max-w-xl mx-auto">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-xs font-sans-clean flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-sans-clean font-semibold uppercase text-[#17365D] mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#315C8C]" />
                Nome Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Digite seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white border border-[#B9D0E6] rounded-md px-3.5 py-2.5 text-sm text-[#17365D] focus:outline-none focus:border-[#17365D] transition-colors"
              />
            </div>

            {/* Quantidade de pessoas */}
            <div>
              <label className="block text-xs font-sans-clean font-semibold uppercase text-[#17365D] mb-1.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#315C8C]" />
                Quantidade de Pessoas (Incluindo você) *
              </label>
              <select
                value={guestCount}
                onChange={(e) => handleGuestCountChange(parseInt(e.target.value, 10))}
                className="w-full bg-white border border-[#B9D0E6] rounded-md px-3.5 py-2.5 text-sm text-[#17365D] focus:outline-none focus:border-[#17365D] transition-colors"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num === 1
                      ? '1 pessoa (Somente eu)'
                      : `${num} pessoas (Eu + ${num - 1} acompanhante${num - 1 > 1 ? 's' : ''})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Acompanhante(s) */}
            <div className="bg-[#E5EEF6]/60 border border-[#B9D0E6] rounded-md p-4 space-y-3">
              <label className="block text-xs font-sans-clean font-semibold uppercase text-[#17365D] flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#315C8C]" />
                {guestCount > 1
                  ? `Nome do(s) Acompanhante(s) (${guestCount - 1}) *`
                  : 'Informar Acompanhante (Opcional)'}
              </label>

              {guestCount === 1 ? (
                <div>
                  <input
                    type="text"
                    placeholder="Se levar acompanhante, digite o nome aqui (ou selecione acima a quantidade)"
                    value={companionNames[0] || ''}
                    onChange={(e) => handleCompanionChange(0, e.target.value)}
                    className="w-full bg-white border border-[#B9D0E6] rounded-md px-3.5 py-2.5 text-sm text-[#17365D] focus:outline-none focus:border-[#17365D] transition-colors"
                  />
                </div>
              ) : (
                <div className="space-y-2.5">
                  {Array.from({ length: guestCount - 1 }, (_, idx) => (
                    <input
                      key={idx}
                      type="text"
                      required
                      placeholder={`Nome completo do acompanhante ${idx + 1}`}
                      value={companionNames[idx] || ''}
                      onChange={(e) => handleCompanionChange(idx, e.target.value)}
                      className="w-full bg-white border border-[#B9D0E6] rounded-md px-3.5 py-2.5 text-sm text-[#17365D] focus:outline-none focus:border-[#17365D] transition-colors"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-xs font-sans-clean font-semibold uppercase text-[#17365D] mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#315C8C]" />
                Seu Telefone / WhatsApp (Opcional)
              </label>
              <input
                type="tel"
                placeholder="(85) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-[#B9D0E6] rounded-md px-3.5 py-2.5 text-sm text-[#17365D] focus:outline-none focus:border-[#17365D] transition-colors"
              />
            </div>

            {/* Mensagem Opcional */}
            <div>
              <label className="block text-xs font-sans-clean font-semibold uppercase text-[#17365D] mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#315C8C]" />
                Mensagem para a Karine (Opcional)
              </label>
              <textarea
                rows={3}
                placeholder="Deixe um carinho ou aviso especial para Karine..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-white border border-[#B9D0E6] rounded-md px-3.5 py-2.5 text-sm text-[#17365D] focus:outline-none focus:border-[#17365D] transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="space-y-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#17365D] hover:bg-[#315C8C] text-white py-3.5 rounded-md text-xs font-sans-clean font-semibold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-[#B9D0E6]" />
                {isSubmitting ? 'Confirmando...' : 'CONFIRMAR PRESENÇA'}
              </button>

              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white py-3 rounded-md text-xs font-sans-clean font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Confirmar direto pelo WhatsApp ({whatsappDisplay})
              </a>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
