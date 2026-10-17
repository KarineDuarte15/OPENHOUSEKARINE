import React, { useState, useEffect } from 'react';
import { HeartHandshake, Copy, Check, QrCode, X, Smartphone, Sparkles, AlertCircle } from 'lucide-react';
import { generatePixPayload } from '../utils/pixPayload';
import QRCode from 'qrcode';
import { EventConfig } from '../types';

interface PixGiftSectionProps {
  eventConfig: EventConfig;
}

export const PixGiftSection: React.FC<PixGiftSectionProps> = ({ eventConfig }) => {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [pixPayloadString, setPixPayloadString] = useState<string>('');

  const pixKey = eventConfig.pixKey || '62357104376';
  const pixName = eventConfig.pixName || 'Karine';
  const pixCity = eventConfig.pixCity || 'FORTALEZA';

  useEffect(() => {
    // Generate valid Pix payload string
    const payload = generatePixPayload(pixKey, pixName, pixCity);
    setPixPayloadString(payload);

    // Render QR code image data URL
    QRCode.toDataURL(
      payload,
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#17365D',
          light: '#FCFAF5',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrCodeDataUrl(url);
        }
      }
    );
  }, [pixKey, pixName, pixCity]);

  const handleCopyKey = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pixKey).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }).catch(() => fallbackCopy(pixKey));
    } else {
      fallbackCopy(pixKey);
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error('Fallback copy failed', e);
    }
    document.body.removeChild(textArea);
  };

  return (
    <section id="pix" className="py-12 px-4 max-w-4xl mx-auto">
      {/* Container in Mist Blue #E5EEF6 */}
      <div className="vintage-card p-6 md:p-10 bg-[#E5EEF6] border-2 border-[#B9D0E6] text-center shadow-md">
        <div className="inline-flex p-3 bg-[#FCFAF5] border border-[#B9D0E6] rounded-full text-[#17365D] mb-4">
          <HeartHandshake className="w-8 h-8 text-[#315C8C]" />
        </div>

        <span className="block text-xs font-sans-clean font-semibold uppercase tracking-widest text-[#315C8C]">
          Contribuição Voluntária
        </span>
        <h2 className="font-cursive text-4xl sm:text-5xl font-bold text-[#17365D] mt-1 mb-3">
          Quer nos presentear via Pix?
        </h2>

        <p className="font-serif-vintage text-base sm:text-lg text-[#17365D] max-w-xl mx-auto mb-8 leading-relaxed">
          Se preferir, você também pode contribuir para essa nova etapa da nossa vida com um presente via Pix. Qualquer contribuição será recebida com muito carinho e gratidão!
        </p>

        {/* Pix Key Display Box */}
        <div className="bg-[#FCFAF5] border border-[#B9D0E6] rounded-lg p-6 max-w-md mx-auto shadow-xs mb-6">
          <div className="text-xs font-sans-clean font-semibold uppercase text-[#7399C2] mb-1 flex items-center justify-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#315C8C]" />
            Chave Pix (Telefone)
          </div>

          <div className="font-mono text-2xl md:text-3xl font-bold text-[#17365D] tracking-wider my-2 select-all">
            {pixKey}
          </div>

          <div className="text-xs font-serif-vintage italic text-[#315C8C] mb-2">
            Favorecido: {pixName}
          </div>

          <div className="inline-block bg-[#E5EEF6] border border-[#315C8C]/40 text-[#17365D] text-xs font-sans-clean font-semibold px-3 py-1 rounded-full mb-4">
            Valor mínimo de contribuição: R$ 50,00
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleCopyKey}
              className="bg-[#17365D] hover:bg-[#315C8C] text-white px-5 py-3 rounded-md text-xs font-sans-clean font-semibold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  Chave Pix Copiada!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#B9D0E6]" />
                  Copiar Chave Pix
                </>
              )}
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="bg-[#FCFAF5] hover:bg-[#E5EEF6] text-[#17365D] border border-[#315C8C] px-5 py-3 rounded-md text-xs font-sans-clean font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#315C8C]" />
              Ver QR Code Pix
            </button>
          </div>

          {/* Success Toast Notification */}
          {copied && (
            <div className="mt-3 p-2 bg-[#17365D] text-white rounded text-xs font-sans-clean flex items-center justify-center gap-2 animate-fadeIn">
              <Sparkles className="w-3.5 h-3.5 text-[#B9D0E6]" />
              <span>Chave Pix copiada com sucesso! Cole no seu aplicativo bancário.</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="max-w-md mx-auto text-left bg-[#FCFAF5]/60 border border-[#B9D0E6]/80 rounded-md p-4 text-xs font-sans-clean text-[#315C8C] space-y-1.5">
          <p className="font-semibold text-[#17365D] mb-1">Como pagar:</p>
          <p>1. Abra o aplicativo do seu banco no celular.</p>
          <p>2. Escolha a opção <strong>Pix</strong> e selecione <strong>Chave Telefone</strong> ou <strong>Pix Copia e Cola</strong>.</p>
          <p>3. Insira a chave <strong>{pixKey}</strong>, confirme os dados de {pixName} e digite o valor desejado (mínimo R$ 50,00).</p>
        </div>
      </div>

      {/* QR Code Modal Popup */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17365D]/60 backdrop-blur-xs animate-fadeIn">
          <div className="vintage-card max-w-sm w-full p-6 bg-[#FCFAF5] border-2 border-[#17365D] shadow-2xl text-center relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-3 right-3 text-[#315C8C] hover:text-[#17365D] p-1 rounded-full hover:bg-[#E5EEF6]"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-sans-clean font-semibold uppercase tracking-wider text-[#315C8C]">
              QR Code Pix Padrão BR Code
            </span>
            <h3 className="font-serif-vintage text-2xl font-bold text-[#17365D] mt-1 mb-3">
              {pixName}
            </h3>

            {qrCodeDataUrl ? (
              <div className="p-3 bg-white border border-[#B9D0E6] rounded-lg inline-block my-2 shadow-xs">
                <img src={qrCodeDataUrl} alt="QR Code Pix" className="w-56 h-56 mx-auto" />
              </div>
            ) : (
              <div className="w-56 h-56 mx-auto flex items-center justify-center bg-[#E5EEF6] border border-[#B9D0E6] rounded-lg my-2 text-xs font-sans-clean text-[#7399C2]">
                Gerando QR Code...
              </div>
            )}

            <p className="text-xs font-sans-clean text-[#315C8C] mt-2">
              Escaneie o código com o aplicativo do seu banco para transferir.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full mt-4 bg-[#17365D] hover:bg-[#315C8C] text-white py-2 rounded-md text-xs font-sans-clean font-semibold uppercase"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
