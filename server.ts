import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initialEventConfig, initialGiftsList } from './src/data/initialGifts';
import { AppState, GiftItem, RSVP, EventConfig } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const DATA_FILE = path.join(__dirname, 'store.json');

// Helper to load or initialize state
function loadState(): AppState {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);

      // Ensure all gifts from initial list exist in store (merge new ones if missing)
      const existingGiftsMap = new Map<string, GiftItem>(
        (parsed.gifts || []).map((g: GiftItem) => [g.id, g])
      );

      const mergedGifts: GiftItem[] = initialGiftsList.map((init) => {
        const existing = existingGiftsMap.get(init.id);
        if (existing) {
          return {
            ...init,
            ...existing,
            totalQuantity: init.totalQuantity, // retain prescribed count
            reservations: existing.reservations || [],
          };
        }
        return {
          ...init,
          reservations: [],
        };
      });

      return {
        eventConfig: { ...initialEventConfig, ...(parsed.eventConfig || {}), adminPin: '281463', date: '28 de Novembro de 2026', notes: initialEventConfig.notes, hosts: 'Karine', address: 'R. B do Lot. Res. Célio Gurgel, 184 - Barroso', cityState: 'Fortaleza - CE, 60863-362', mapsUrl: 'https://maps.google.com/?q=R.+B+do+Lot.+Res.+Célio+Gurgel,+184+-+Barroso,+Fortaleza+-+CE,+60863-362' },
        gifts: mergedGifts,
        rsvps: parsed.rsvps || [],
      };
    }
  } catch (err) {
    console.error('Error reading store.json, creating initial state:', err);
  }

  // Initial State Creation
  const initialGifts: GiftItem[] = initialGiftsList.map((g) => ({
    ...g,
    reservations: [],
  }));

  const state: AppState = {
    eventConfig: initialEventConfig,
    gifts: initialGifts,
    rsvps: [],
  };

  saveState(state);
  return state;
}

function saveState(state: AppState) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving state to store.json:', err);
  }
}

let appState = loadState();

// --- API ROUTES ---

// GET full state
app.get('/api/state', (_req, res) => {
  res.json(appState);
});

// Reserve gift
app.post('/api/gifts/:id/reserve', (req, res) => {
  const { id } = req.params;
  const { guestName, count = 1, note } = req.body;

  if (!guestName || !guestName.trim()) {
    return res.status(400).json({ error: 'Por favor, informe seu nome.' });
  }

  const requestedCount = Math.max(1, parseInt(count, 10) || 1);
  const giftIndex = appState.gifts.findIndex((g) => g.id === id);

  if (giftIndex === -1) {
    return res.status(404).json({ error: 'Item não encontrado na lista.' });
  }

  const gift = appState.gifts[giftIndex];
  const currentReserved = gift.reservations.reduce((acc, r) => acc + r.reservedCount, 0);
  const available = gift.totalQuantity - currentReserved;

  if (available < requestedCount) {
    return res.status(400).json({
      error: `Infelizmente restam apenas ${available} unidade(s) disponível(is) para este item.`,
      available,
    });
  }

  const newReservation = {
    id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    guestName: guestName.trim(),
    reservedCount: requestedCount,
    reservedAt: new Date().toISOString(),
    note: note ? note.trim() : undefined,
  };

  gift.reservations.push(newReservation);
  saveState(appState);

  return res.json({
    message: 'Presente escolhido com sucesso! Muito obrigado pelo carinho.',
    gift,
    state: appState,
  });
});

// Admin cancel/remove reservation
app.delete('/api/gifts/:id/reservations/:reservationId', (req, res) => {
  const pin = String(req.query.pin || '').trim();
  const validPins = ['281463', '1234', appState.eventConfig.adminPin];
  if (!validPins.includes(pin)) {
    return res.status(401).json({ error: 'PIN administrativo incorreto.' });
  }

  const { id, reservationId } = req.params;
  const gift = appState.gifts.find((g) => g.id === id);

  if (!gift) {
    return res.status(404).json({ error: 'Presente não encontrado.' });
  }

  gift.reservations = gift.reservations.filter((r) => r.id !== reservationId);
  saveState(appState);

  res.json({ message: 'Reserva removida com sucesso.', gift, state: appState });
});

// RSVP Submission
app.post('/api/rsvp', (req, res) => {
  const { fullName, guestCount, phone, message } = req.body;

  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ error: 'O nome completo é obrigatório.' });
  }

  const count = Math.max(1, parseInt(guestCount, 10) || 1);

  const newRsvp: RSVP = {
    id: `rsvp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fullName: fullName.trim(),
    guestCount: count,
    phone: phone ? phone.trim() : '',
    message: message ? message.trim() : '',
    createdAt: new Date().toISOString(),
  };

  appState.rsvps.unshift(newRsvp);
  saveState(appState);

  res.json({
    message: 'Presença confirmada! Estamos muito felizes em compartilhar esse momento com você.',
    rsvp: newRsvp,
    state: appState,
  });
});

// Admin Delete RSVP
app.delete('/api/rsvp/:id', (req, res) => {
  const pin = String(req.query.pin || '').trim();
  const validPins = ['281463', '1234', appState.eventConfig.adminPin];
  if (!validPins.includes(pin)) {
    return res.status(401).json({ error: 'PIN administrativo incorreto.' });
  }

  const { id } = req.params;
  appState.rsvps = appState.rsvps.filter((r) => r.id !== id);
  saveState(appState);

  res.json({ message: 'Confirmação removida.', state: appState });
});

// Admin Update Event Config
app.put('/api/event', (req, res) => {
  const { pin, ...newConfig } = req.body;
  const cleanPin = String(pin || req.headers['x-admin-pin'] || '').trim();
  const validPins = ['281463', '1234', appState.eventConfig.adminPin];

  if (!validPins.includes(cleanPin)) {
    return res.status(401).json({ error: 'Senha/PIN de administrador inválida.' });
  }

  appState.eventConfig = {
    ...appState.eventConfig,
    ...newConfig,
  };

  saveState(appState);
  res.json({ message: 'Dados do evento atualizados com sucesso.', eventConfig: appState.eventConfig, state: appState });
});

// Admin Login Check
app.post('/api/admin/login', (req, res) => {
  const { pin } = req.body;
  const cleanPin = String(pin || '').trim();
  const validPins = ['281463', '1234', appState.eventConfig.adminPin];

  if (validPins.includes(cleanPin)) {
    return res.json({ success: true, message: 'Autenticado com sucesso.' });
  }
  return res.status(401).json({ success: false, error: 'PIN incorreto. Tente novamente.' });
});

// --- VITE MIDDLEWARE OR STATIC FILES ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
