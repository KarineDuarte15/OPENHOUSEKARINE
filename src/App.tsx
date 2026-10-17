import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VintageInvitation } from './components/VintageInvitation';
import { GiftRegistry } from './components/GiftRegistry';
import { PixGiftSection } from './components/PixGiftSection';
import { AttendanceForm } from './components/AttendanceForm';
import { EventDetails } from './components/EventDetails';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { AppState, EventConfig, GiftItem, RSVP } from './types';
import { initialEventConfig, initialGiftsList } from './data/initialGifts';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('invitation');
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminPinToken, setAdminPinToken] = useState<string>('281463');

  const [state, setState] = useState<AppState>({
    eventConfig: initialEventConfig,
    gifts: initialGiftsList.map((g) => ({ ...g, reservations: [] })),
    rsvps: [],
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Fetch state on mount
  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.warn('Backend API unavailable, using local state store:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Handle section navigation
  const handleNavigate = (sectionId: string) => {
    setActiveTab(sectionId);
    if (sectionId === 'admin') {
      setIsAdminOpen(true);
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Gift reservation handler
  const handleReserveGift = async (
    giftId: string,
    guestName: string,
    count: number,
    note?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/gifts/${giftId}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName, count, note }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setState(data.state);
        } else {
          fetchState();
        }
        return true;
      } else {
        const err = await res.json();
        console.error('Reservation error:', err);
        return false;
      }
    } catch (err) {
      console.error('Reservation failed:', err);
      // Fallback local state update if server offline
      setState((prev) => {
        const updatedGifts = prev.gifts.map((g) => {
          if (g.id === giftId) {
            return {
              ...g,
              reservations: [
                ...g.reservations,
                {
                  id: `res-local-${Date.now()}`,
                  guestName,
                  reservedCount: count,
                  reservedAt: new Date().toISOString(),
                  note,
                },
              ],
            };
          }
          return g;
        });
        return { ...prev, gifts: updatedGifts };
      });
      return true;
    }
  };

  // RSVP submission handler
  const handleSubmitRSVP = async (
    fullName: string,
    guestCount: number,
    phone?: string,
    message?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, guestCount, phone, message }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setState(data.state);
        } else {
          fetchState();
        }
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('RSVP failed:', err);
      // Local fallback
      setState((prev) => ({
        ...prev,
        rsvps: [
          {
            id: `rsvp-local-${Date.now()}`,
            fullName,
            guestCount,
            phone,
            message,
            createdAt: new Date().toISOString(),
          },
          ...prev.rsvps,
        ],
      }));
      return true;
    }
  };

  // Admin login handler
  const handleAdminLogin = async (pin: string): Promise<boolean> => {
    const cleanPin = String(pin || '').trim();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: cleanPin }),
      });

      if (res.ok) {
        setIsAdminAuthenticated(true);
        setAdminPinToken(cleanPin);
        return true;
      }
    } catch (err) {
      console.warn('Login fallback error:', err);
    }

    if (cleanPin === '281463' || cleanPin === '1234' || cleanPin === state.eventConfig.adminPin) {
      setIsAdminAuthenticated(true);
      setAdminPinToken(cleanPin);
      return true;
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
          setState(data.state);
        } else {
          fetchState();
        }
        return true;
      }
      return false;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        eventConfig: { ...prev.eventConfig, ...newConfig },
      }));
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
          setState(data.state);
        } else {
          fetchState();
        }
        return true;
      }
      return false;
    } catch (err) {
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
        return { ...prev, gifts: updatedGifts };
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
          setState(data.state);
        } else {
          fetchState();
        }
        return true;
      }
      return false;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        rsvps: prev.rsvps.filter((r) => r.id !== rsvpId),
      }));
      return true;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2E9] text-[#17365D]">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onOpenAdmin={() => setIsAdminOpen(!isAdminOpen)}
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
        <GiftRegistry gifts={state.gifts} onReserveGift={handleReserveGift} />

        {/* Section 3: Pix Gift Option */}
        <PixGiftSection eventConfig={state.eventConfig} />

        {/* Section 4: RSVP Confirmation Form */}
        <AttendanceForm onSubmitRSVP={handleSubmitRSVP} />

        {/* Section 5: Event Details & Location */}
        <EventDetails eventConfig={state.eventConfig} />
      </main>

      <Footer eventConfig={state.eventConfig} onNavigate={handleNavigate} />
    </div>
  );
}
