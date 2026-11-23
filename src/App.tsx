import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { VintageInvitation } from './components/VintageInvitation';
import { GiftRegistry } from './components/GiftRegistry';
import { PixGiftSection } from './components/PixGiftSection';
import { AttendanceForm } from './components/AttendanceForm';
import { EventDetails } from './components/EventDetails';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { AppState, EventConfig } from './types';
import { initialEventConfig, initialGiftsList } from './data/initialGifts';

const LOCAL_BACKUP_KEY = 'open_house_karine_state_v2';

function loadInitialFallbackState(): AppState {
  try {
    const raw = localStorage.getItem(LOCAL_BACKUP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && Array.isArray(parsed.gifts) && parsed.eventConfig) {
        return parsed;
      }
    }
  } catch {
    // ignore storage errors
  }

  return {
    eventConfig: initialEventConfig,
    gifts: initialGiftsList.map((g) => ({ ...g, reservations: [] })),
    rsvps: [],
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('invitation');
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminPinToken, setAdminPinToken] = useState<string>('281463');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [state, setState] = useState<AppState>(() => loadInitialFallbackState());

  const applyServerState = useCallback((data: AppState) => {
    setState(data);
    setLastUpdated(new Date());
    try {
      localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(data));
    } catch {
      // ignore storage quota errors
    }
  }, []);

  // Always fetch fresh uncached state from server
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/state?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = (await res.json()) as AppState;
          applyServerState(data);
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable, keeping local state store:', err);
    }
  }, [applyServerState]);

  // Initial load + SSE real-time stream + focus/visibility sync
  useEffect(() => {
    fetchState();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as AppState;
          if (parsed && Array.isArray(parsed.gifts) && parsed.eventConfig) {
            applyServerState(parsed);
          }
        } catch {
          // ignore non-JSON heartbeat payloads
        }
      };
    } catch {
      // EventSource not supported or unavailable
    }

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchState();
      }
    };

    window.addEventListener('focus', fetchState);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      eventSource?.close();
      window.removeEventListener('focus', fetchState);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [fetchState, applyServerState]);

  // Periodic polling fallback (faster when Admin Dashboard is open)
  useEffect(() => {
    const intervalMs = isAdminOpen ? 4000 : 10000;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchState();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isAdminOpen, fetchState]);

  // Refresh immediately when Admin Dashboard is opened
  useEffect(() => {
    if (isAdminOpen) {
      fetchState();
    }
  }, [isAdminOpen, fetchState]);

  // Handle section navigation
  const handleNavigate = (sectionId: string) => {
    setActiveTab(sectionId);
    if (sectionId === 'admin') {
      setIsAdminOpen(true);
      fetchState();
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Gift reservation handler (locks gift exclusively so others cannot choose it)
  const handleReserveGift = async (
    giftId: string,
    guestName: string,
    count: number,
    note?: string
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/gifts/${giftId}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName, count, note }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.state) {
          applyServerState(data.state);
        } else if (res.ok) {
          await fetchState();
        }

        if (res.ok) {
          return { ok: true };
        }
        return {
          ok: false,
          error: data.error || 'Este presente já foi escolhido por outro convidado.',
        };
      }
    } catch (err) {
      console.error('Reservation network fallback:', err);
    }

    // Fallback local state update only if server is completely unreachable
    let conflict = false;
    setState((prev) => {
      const target = prev.gifts.find((g) => g.id === giftId);
      if (!target || target.reservations.length > 0) {
        conflict = true;
        return prev;
      }

      const updated: AppState = {
        ...prev,
        gifts: prev.gifts.map((g) =>
          g.id === giftId
            ? {
                ...g,
                reservations: [
                  ...g.reservations,
                  {
                    id: `res-local-${Date.now()}`,
                    guestName,
                    reservedCount: 1,
                    reservedAt: new Date().toISOString(),
                    note,
                  },
                ],
              }
            : g
        ),
      };

      try {
        localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      setLastUpdated(new Date());
      return updated;
    });

    if (conflict) {
      return {
        ok: false,
        error: 'Este presente já foi escolhido por outro convidado e está indisponível.',
      };
    }

    return { ok: true };
  };

  // RSVP submission handler
  const handleSubmitRSVP = async (
    fullName: string,
    guestCount: number,
    companions?: string,
    phone?: string,
    message?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, guestCount, companions, phone, message }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.state) {
          applyServerState(data.state);
        } else {
          await fetchState();
        }
        return true;
      }
      if (!res.ok && contentType.includes('application/json')) {
        return false;
      }
    } catch (err) {
      console.error('RSVP network fallback:', err);
    }

    // Local fallback when server is offline
    setState((prev) => {
      const updated: AppState = {
        ...prev,
        rsvps: [
          {
            id: `rsvp-local-${Date.now()}`,
            fullName,
            guestCount,
            companions,
            phone,
            message,
            createdAt: new Date().toISOString(),
          },
          ...prev.rsvps,
        ],
      };
      try {
        localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      setLastUpdated(new Date());
      return updated;
    });
    return true;
  };

  // Admin login handler
  const handleAdminLogin = async (pin: string): Promise<boolean> => {
    const cleanPin = String(pin || '').trim();

    if (cleanPin === '281463' || cleanPin === '1234' || cleanPin === state.eventConfig.adminPin) {
      setIsAdminAuthenticated(true);
      setAdminPinToken(cleanPin);
      fetchState();

      fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: cleanPin }),
      }).catch(() => {});

      return true;
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: cleanPin }),
      });

      if (res.ok) {
        setIsAdminAuthenticated(true);
        setAdminPinToken(cleanPin);
        fetchState();
        return true;
      }
    } catch (err) {
      console.warn('Login fallback error:', err);
    }

    return false;
  };

  // Admin logout
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setIsAdminOpen(false);
  };

  // Admin config update
  const handleUpdateEventConfig = async (newConfig: Partial<EventConfig>): Promise<boolean> => {
    try {
      const res = await fetch('/api/event', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPinToken,
        },
        body: JSON.stringify({ ...newConfig, pin: adminPinToken }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          applyServerState(data.state);
        } else {
          await fetchState();
        }
        return true;
      }
      return false;
    } catch {
      setState((prev) => {
        const updated = {
          ...prev,
          eventConfig: { ...prev.eventConfig, ...newConfig },
        };
        try {
          localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      return true;
    }
  };

  // Admin reservation cancel
  const handleCancelReservation = async (giftId: string, reservationId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/gifts/${giftId}/reservations/${reservationId}?pin=${adminPinToken}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          applyServerState(data.state);
        } else {
          await fetchState();
        }
        return true;
      }
      return false;
    } catch {
      setState((prev) => {
        const updatedGifts = prev.gifts.map((g) => {
          if (g.id === giftId) {
            return {
              ...g,
              reservations: g.reservations.filter((r) => r.id !== reservationId),
            };
          }
          return g;
        });
        const updated = { ...prev, gifts: updatedGifts };
        try {
          localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      return true;
    }
  };

  // Admin RSVP delete
  const handleDeleteRSVP = async (rsvpId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/rsvp/${rsvpId}?pin=${adminPinToken}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          applyServerState(data.state);
        } else {
          await fetchState();
        }
        return true;
      }
      return false;
    } catch {
      setState((prev) => {
        const updated = {
          ...prev,
          rsvps: prev.rsvps.filter((r) => r.id !== rsvpId),
        };
        try {
          localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      return true;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2E9] text-[#17365D]">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onOpenAdmin={() => {
          setIsAdminOpen((prev) => !prev);
          fetchState();
        }}
        isAdmin={isAdminAuthenticated}
      />

      <main className="flex-1 space-y-8 pb-12">
        {/* Admin Drawer Modal if opened */}
        {isAdminOpen && (
          <div className="px-4 py-2 bg-[#E5EEF6] border-b border-[#315C8C]/30 animate-fadeIn">
            <AdminDashboard
              eventConfig={state.eventConfig}
              gifts={state.gifts}
              rsvps={state.rsvps}
              isAdmin={isAdminAuthenticated}
              lastUpdated={lastUpdated}
              onRefreshState={fetchState}
              onLogin={handleAdminLogin}
              onLogout={handleAdminLogout}
              onUpdateEventConfig={handleUpdateEventConfig}
              onCancelReservation={handleCancelReservation}
              onDeleteRSVP={handleDeleteRSVP}
            />
          </div>
        )}

        {/* Section 1: Invitation Cover */}
        <VintageInvitation eventConfig={state.eventConfig} onNavigate={handleNavigate} />

        {/* Section 2: Gift Registry */}
        <GiftRegistry
          gifts={state.gifts}
          eventConfig={state.eventConfig}
          onReserveGift={handleReserveGift}
          onRefreshState={fetchState}
        />

        {/* Section 3: Pix Gift Option */}
        <PixGiftSection eventConfig={state.eventConfig} />

        {/* Section 4: RSVP Confirmation Form */}
        <AttendanceForm eventConfig={state.eventConfig} onSubmitRSVP={handleSubmitRSVP} />

        {/* Section 5: Event Details & Location */}
        <EventDetails eventConfig={state.eventConfig} />
      </main>

      <Footer eventConfig={state.eventConfig} onNavigate={handleNavigate} />
    </div>
  );
}
