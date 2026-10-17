import React, { useState } from 'react';
import { CheckCircle2, User, Users, Phone, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';
import { VintageFlourishDivider } from './VintageOrnaments';

interface AttendanceFormProps {
  onSubmitRSVP: (fullName: string, guestCount: number, phone?: string, message?: string) => Promise<boolean>;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({ onSubmitRSVP }) => {
  const [fullName, setFullName] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Por favor, informe seu nome completo.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const success = await onSubmitRSVP(fullName, guestCount, phone, message);
    setIsSubmitting(false);

    if (success) {
      setSubmittedSuccess(true);
    } else {
      setErrorMsg('Não foi possível registrar sua confirmação. Tente novamente em instantes.');
    }
  };

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
            Por favor, confirme se você e seus acompanhantes poderão comemorar conosco.
          </p>
          <VintageFlourishDivider />
        </div>

        {submittedSuccess ? (
          <div className="bg-[#E5EEF6] border border-[#315C8C] rounded-lg p-8 text-center my-4 animate-fadeIn">
            <div className="w-16 h-16 bg-[#17365D] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-[#B9D0E6]" />
            </div>
            <h3 className="font-serif-vintage text-2xl font-bold text-[#17365D] mb-2">
              Presença Confirmada!
            </h3>
            <p className="font-serif-vintage text-lg text-[#315C8C] max-w-md mx-auto mb-6">
              Estamos muito felizes em compartilhar esse momento com você. Mal podemos esperar para nos encontrar em nosso novo lar!
            </p>
            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setFullName('');
                setGuestCount(1);
                setPhone('');
                setMessage('');
              }}
              className="bg-[#17365D] hover:bg-[#315C8C] text-white px-6 py-2.5 rounded-md text-xs font-sans-clean font-semibold uppercase tracking-wider"
            >
              Enviar outra confirmação
            </button>
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
                onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                className="w-full bg-white border border-[#B9D0E6] rounded-md px-3.5 py-2.5 text-sm text-[#17365D] focus:outline-none focus:border-[#17365D] transition-colors"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num} pessoa{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-xs font-sans-clean font-semibold uppercase text-[#17365D] mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#315C8C]" />
                Telefone / WhatsApp (Opcional)
              </label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-[#B9D0E6] rounded-md px-3.5 py-2.5 text-sm text-[#17365D] focus:outline-none focus:border-[#17365D] transition-colors"
              />
            </div>

            {/* Mensagem Opcional */}
            <div>
              <label className="block text-xs font-sans-clean font-semibold uppercase text-[#17365D] mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#315C8C]" />
                Mensagem para os Anfitriões (Opcional)
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
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#17365D] hover:bg-[#315C8C] text-white py-3.5 rounded-md text-xs font-sans-clean font-semibold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-[#B9D0E6]" />
              {isSubmitting ? 'Confirmando...' : 'CONFIRMAR PRESENÇA'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
