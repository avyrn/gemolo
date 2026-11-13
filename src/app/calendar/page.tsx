'use client';
// ============================================================
// Calendar page — Visual tracker with react-calendar
// Supports logging: injections, blood tests, appointments,
// pharmacy pickups
// ============================================================

import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useStore, CalendarEvent, CalendarEventType } from '@/lib/store';
import { Plus, X, Trash2 } from 'lucide-react';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const EVENT_CONFIG: Record<CalendarEventType, { label: string; emoji: string; dot: string }> = {
  injection:   { label: '',   emoji: '💉', dot: 'dot-injection' },
  test:        { label: '',   emoji: '🩸', dot: 'dot-test' },
  appointment: { label: '',   emoji: '👨‍⚕️', dot: 'dot-appointment' },
  pharmacy:    { label: '',   emoji: '💊', dot: 'dot-pharmacy' },
};

export default function CalendarPage() {
  const { t } = useLanguage();
  const { events, addEvent, removeEvent } = useStore();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [newEventType, setNewEventType] = useState<CalendarEventType>('injection');
  const [newEventTime, setNewEventTime] = useState('08:00');
  const [newEventNotes, setNewEventNotes] = useState('');

  const fmtDate = (d: Date) => d.toISOString().split('T')[0];

  const selectedDateStr = fmtDate(selectedDate);
  const dayEvents = events.filter((e) => e.date === selectedDateStr);

  // Dates that have events (for dot indicators)
  const eventDates = new Set(events.map((e) => e.date));

  const handleSave = () => {
    addEvent({
      id: Date.now().toString(),
      date: selectedDateStr,
      type: newEventType,
      time: newEventTime,
      notes: newEventNotes,
    });
    setShowModal(false);
    setNewEventNotes('');
  };

  const EVENT_TYPES: CalendarEventType[] = ['injection', 'test', 'appointment', 'pharmacy'];
  const EVENT_LABELS: Record<CalendarEventType, string> = {
    injection:   t('calendar_event_injection'),
    test:        t('calendar_event_test'),
    appointment: t('calendar_event_appointment'),
    pharmacy:    t('calendar_event_pharmacy'),
  };
  const BADGE_CLASSES: Record<CalendarEventType, string> = {
    injection:   'badge badge-injection',
    test:        'badge badge-test',
    appointment: 'badge badge-appointment',
    pharmacy:    'badge badge-pharmacy',
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <h1 className="page-title">{t('calendar_title')}</h1>
      <p className="page-subtitle">
        {selectedDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
        {/* Calendar widget */}
        <div className="card" style={{ padding: 16 }}>
          <Calendar
            onChange={(val: Value) => {
              if (val instanceof Date) setSelectedDate(val);
            }}
            value={selectedDate}
            locale="ru-RU"
            // Mark dates that have events with emoji-like tile content
            tileContent={({ date }) => {
              const ds = fmtDate(date);
              const dayEvts = events.filter((e) => e.date === ds);
              if (dayEvts.length === 0) return null;
              const types = [...new Set(dayEvts.map((e) => e.type))];
              return (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
                  {types.slice(0, 3).map((type) => (
                    <span key={type} className={`dot ${EVENT_CONFIG[type].dot}`} style={{ width: 5, height: 5 }} />
                  ))}
                </div>
              );
            }}
          />

          {/* Legend */}
          <div style={{ marginTop: 16, borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>
              {t('calendar_legend')}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {EVENT_TYPES.map((type) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span className={`dot ${EVENT_CONFIG[type].dot}`} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {EVENT_CONFIG[type].emoji} {EVENT_LABELS[type].replace(/\s*\(.*\)/, '')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Day events panel */}
        <div style={{ width: 280 }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{t('calendar_events_for')}</h3>
              <button
                id="btn-add-event"
                className="btn btn-primary btn-sm"
                onClick={() => setShowModal(true)}
              >
                <Plus size={14} />
                {t('calendar_add_event')}
              </button>
            </div>

            {dayEvents.length === 0 ? (
              <p style={{ color: 'var(--color-text-subtle)', fontSize: '0.875rem', padding: '8px 0' }}>
                {t('calendar_no_events')}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      padding: '12px', borderRadius: 10,
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span className={BADGE_CLASSES[event.type]}>
                        {EVENT_CONFIG[event.type].emoji} {EVENT_LABELS[event.type].replace(/\(.*\)/, '').trim()}
                      </span>
                      <button
                        onClick={() => removeEvent(event.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-subtle)', padding: 2 }}
                        aria-label={t('calendar_delete')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {event.time && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', marginBottom: 2 }}>⏰ {event.time}</div>
                    )}
                    {event.notes && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{event.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- Add Event Modal ---- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{t('calendar_add_event')}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--color-text-muted)" />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label" htmlFor="event-type">{t('calendar_event_type')}</label>
                <select
                  id="event-type"
                  className="input"
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as CalendarEventType)}
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type}>{EVENT_LABELS[type]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="event-time">{t('calendar_event_time')}</label>
                <input
                  id="event-time"
                  type="time"
                  className="input"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="event-notes">{t('calendar_event_notes')}</label>
                <textarea
                  id="event-notes"
                  className="input"
                  rows={3}
                  placeholder={t('community_post_placeholder')}
                  value={newEventNotes}
                  onChange={(e) => setNewEventNotes(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>{t('calendar_cancel')}</button>
              <button id="btn-save-event" className="btn btn-primary" onClick={handleSave}>{t('calendar_save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
