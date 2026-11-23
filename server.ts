import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initialEventConfig, initialGiftsList } from './src/data/initialGifts';
import { AppState, GiftItem, RSVP } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const DATA_FILE = path.join(__dirname, 'store.json');

// Active Server-Sent Events clients for real-time dashboard & gift updates
const sseClients = new Set<express.Response>();

function broadcastState(state: AppState) {
  const payload = `data: ${JSON.stringify(state)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Helper to load or initialize state
function loadState(): AppState {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);

      // Ensure all gifts from initial list exist in store (merge existing reservations)
      const existingGiftsMap = new Map<string, GiftItem>(
        (parsed.gifts || []).map((g: GiftItem) => [g.id, g])
      );

      const mergedGifts: GiftItem[] = initialGiftsList.map((init) => {
        const existing = existingGiftsMap.get(init.id);
        if (existing) {
          return {
            ...init,
            ...existing,
            totalQuantity: 1, // Each gift becomes unavailable once chosen by a guest
            reservations: existing.reservations || [],
          };
        }
        return {
          ...init,
          totalQuantity: 1,
          reservations: [],
        };
      });

      const parsedConfig = parsed.eventConfig || {};
      const timeValue =
        !parsedConfig.time || parsedConfig.time === '12:00'
          ? initialEventConfig.time
          : parsedConfig.time;

      const loadedState: AppState = {
        eventConfig: {
          ...initialEventConfig,
          ...parsedConfig,
          time: timeValue,
          whatsappNumber: parsedConfig.whatsappNumber || initialEventConfig.whatsappNumber,
          adminPin: '281463',
          date: '28 de Novembro de 2026',
          notes: initialEventConfig.notes,
          hosts: 'Karine',
          address: 'R. B do Lot. Res. Célio Gurgel, 184 - Barroso',
          cityState: 'Fortaleza - CE, 60863-362',
          mapsUrl:
            'https://maps.google.com/?q=R.+B+do+Lot.+Res.+Célio+Gurgel,+184+-+Barroso,+Fortaleza+-+CE,+60863-362',
        },
        gifts: mergedGifts,
        rsvps: parsed.rsvps || [],
      };

      saveState(loadedState);
      return loadedState;
    }
  } catch (err) {
    console.error('Error reading store.json, creating initial state:', err);
  }

  // Initial State Creation
  const initialGifts: GiftItem[] = initialGiftsList.map((g) => ({
    ...g,
    totalQuantity: 1,
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

// Real-time SSE stream for instant updates across guests and Admin Dashboard
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Send immediate snapshot
  res.write(`data: ${JSON.stringify(appState)}\n\n`);
  sseClients.add(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// GET full state (always uncached)
app.get('/api/state', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json(appState);
});

// Reserve gift (locks item so no other guest can select it)
app.post('/api/gifts/:id/reserve', (req, res) => {
  const { id } = req.params;
  const { guestName, note } = req.body;

  if (!guestName || !String(guestName).trim()) {
    return res.status(400).json({ error: 'Por favor, informe seu nome.' });
  }

  const giftIndex = appState.gifts.findIndex((g) => g.id === id);

  if (giftIndex === -1) {
    return res.status(404).json({ error: 'Item não encontrado na lista.' });
  }

  const gift = appState.gifts[giftIndex];
  const alreadyReserved = gift.reservations.length > 0;

  if (alreadyReserved) {
    return res.status(409).json({
      error: 'Este presente já foi escolhido por outro convidado e agora está indisponível.',
      state: appState,
    });
  }

  const newReservation = {
    id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    guestName: String(guestName).trim(),
    reservedCount: 1,
    reservedAt: new Date().toISOString(),
    note: note ? String(note).trim() : undefined,
  };

  gift.reservations.push(newReservation);
  saveState(appState);
  broadcastState(appState);

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
  broadcastState(appState);

  res.json({ message: 'Reserva removida com sucesso.', gift, state: appState });
});

// RSVP Submission
app.post('/api/rsvp', (req, res) => {
  const { fullName, guestCount, companions, phone, message } = req.body;

  if (!fullName || !String(fullName).trim()) {
    return res.status(400).json({ error: 'O nome completo é obrigatório.' });
  }

  const count = Math.max(1, parseInt(guestCount, 10) || 1);

  const newRsvp: RSVP = {
    id: `rsvp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fullName: String(fullName).trim(),
    guestCount: count,
    companions: companions ? String(companions).trim() : '',
    phone: phone ? String(phone).trim() : '',
    message: message ? String(message).trim() : '',
    createdAt: new Date().toISOString(),
  };

  appState.rsvps.unshift(newRsvp);
  saveState(appState);
  broadcastState(appState);

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
  broadcastState(appState);

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
  broadcastState(appState);
  res.json({
    message: 'Dados do evento atualizados com sucesso.',
    eventConfig: appState.eventConfig,
    state: appState,
  });
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
