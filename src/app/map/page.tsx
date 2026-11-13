'use client';
// ============================================================
// Map page — Interactive map of hematology centers,
// blood stations and 24/7 emergency points in Kazakhstan
// Uses OpenStreetMap iframe — zero npm packages needed
// ============================================================

import { useState } from 'react';
import { MapPin, Phone, Navigation, Filter, X } from 'lucide-react';

type CenterType = 'hematology' | 'blood' | 'emergency';

interface MedCenter {
  id: string;
  name: string;
  address: string;
  city: string;
  type: CenterType;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
}

const CENTERS: MedCenter[] = [
  // === АССОЦИАЦИЯ И ОРГАНИЗАЦИИ ===
  {
    id: 'assoc-main', city: 'Алматы', type: 'hematology',
    name: 'ОО «Казахстанская Ассоциация больных гемофилией» (hemophilya.kz)',
    address: 'ул. Яблочкова, 1 (Ауэзовский р-н)',
    phone: '+7 747 342-31-54', hours: 'Пн–Пт 09:00–18:00 (Горячая линия защиты прав)',
    lat: 43.2389, lng: 76.8521,
  },
  {
    id: 'sk-pharm', city: 'Астана', type: 'blood',
    name: 'ТОО «СК-Фармация» (Единый дистрибьютор ГОБМП)',
    address: 'ул. Достык, 18',
    phone: '1439', hours: 'Пн–Пт 09:00–18:30 (Справка по поставкам факторов)',
    lat: 51.1283, lng: 71.4305,
  },
  // === АСТАНА ===
  {
    id: 'b1', city: 'Астана', type: 'hematology',
    name: 'ННОЦ — Центр онкогематологии и ТКМ (д-р Кемайкин В. М.)',
    address: 'пр. Туран, 57',
    phone: '+7 7172 70-25-00', hours: 'Пн–Пт 08:00–17:00 (Республиканский центр)',
    lat: 51.1605, lng: 71.4704,
  },
  {
    id: 'b2', city: 'Астана', type: 'blood',
    name: 'Научно-производственный центр трансфузиологии',
    address: 'ул. Керей, Жанибек хандар, 10',
    phone: '+7 7172 54-33-00', hours: 'Пн–Сб 08:00–16:00',
    lat: 51.1091, lng: 71.4172,
  },
  {
    id: 'b3', city: 'Астана', type: 'emergency',
    name: 'Скорая медицинская помощь 103 (Астана)',
    address: 'Диспетчерская Астана',
    phone: '103', hours: '24/7 (Предупредите о гемофилии!)',
    lat: 51.1694, lng: 71.4491,
  },
  // === ALMATY ===
  {
    id: 'a1', city: 'Алматы', type: 'hematology',
    name: 'ГКБ №7 — Гематологическое отделение',
    address: 'мкр. Калкаман-2, 20',
    phone: '+7 727 270-87-00', hours: '24/7 (Экстренная и плановая помощь)',
    lat: 43.2201, lng: 76.8152,
  },
  {
    id: 'a2', city: 'Алматы', type: 'hematology',
    name: 'КазНИИ онкологии и радиологии (КазНИИОиР)',
    address: 'пр. Абая, 91',
    phone: '+7 727 349-44-99', hours: 'Пн–Пт 08:30–17:00',
    lat: 43.2392, lng: 76.9189,
  },
  {
    id: 'a3', city: 'Алматы', type: 'blood',
    name: 'Республиканский центр крови г. Алматы',
    address: 'ул. Утепова, 1',
    phone: '+7 727 299-80-60', hours: 'Пн–Пт 08:00–15:30',
    lat: 43.2104, lng: 76.8971,
  },
  // === ШЫМКЕНТ ===
  {
    id: 'c1', city: 'Шымкент', type: 'hematology',
    name: 'ООКБ — Гематологическое отд.',
    address: 'ул. Тауке хана, 32',
    phone: '+7 725 221-34-56', hours: 'Пн–Пт 08:00–17:00',
    lat: 42.3417, lng: 69.5901,
  },
  {
    id: 'c2', city: 'Шымкент', type: 'blood',
    name: 'Станция переливания крови г. Шымкент',
    address: 'ул. Байтурсынова, 5',
    phone: '+7 725 253-21-08', hours: 'Пн–Пт 07:30–14:30',
    lat: 42.3197, lng: 69.5861,
  },
  // === КАРАГАНДА ===
  {
    id: 'd1', city: 'Караганда', type: 'hematology',
    name: 'КГМКА — Гематологический центр',
    address: 'ул. Гоголя, 40',
    phone: '+7 721 256-83-20', hours: 'Пн–Пт 08:00–16:00',
    lat: 49.8068, lng: 73.0856,
  },
  {
    id: 'd2', city: 'Караганда', type: 'blood',
    name: 'Областной центр крови Карагандинской обл.',
    address: 'ул. Ерубаева, 47',
    phone: '+7 721 244-57-90', hours: 'Пн–Пт 07:00–15:00',
    lat: 49.8248, lng: 73.1032,
  },
  // === АКТОБЕ ===
  {
    id: 'e1', city: 'Актобе', type: 'hematology',
    name: 'ЗКООКБ — Гематология',
    address: 'ул. Маресьева, 68',
    phone: '+7 713 256-52-72', hours: 'Пн–Пт 08:00–17:00',
    lat: 50.2839, lng: 57.1670,
  },
];

const TYPE_CONFIG: Record<CenterType, { label: string; color: string; bg: string; emoji: string }> = {
  hematology: { label: 'Гематология',      color: 'var(--color-primary)',  bg: 'var(--color-primary-muted)', emoji: '🏥' },
  blood:      { label: 'Переливание крови', color: 'var(--color-sos)',      bg: 'var(--color-sos-light)',     emoji: '🩸' },
  emergency:  { label: 'Скорая помощь 24/7', color: 'var(--color-success)', bg: 'var(--color-success-light)', emoji: '🚑' },
};

const CITIES = ['Все города', 'Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе'];

export default function MapPage() {
  const [activeType, setActiveType] = useState<CenterType | 'all'>('all');
  const [activeCity, setActiveCity] = useState('Все города');
  const [selected, setSelected] = useState<MedCenter | null>(null);

  const filtered = CENTERS.filter((c) => {
    const typeOk = activeType === 'all' || c.type === activeType;
    const cityOk = activeCity === 'Все города' || c.city === activeCity;
    return typeOk && cityOk;
  });

  // Use first filtered center for iframe or default to KZ center
  const mapCenter = selected
    ? `${selected.lat},${selected.lng}`
    : activeCity === 'Все города' || activeCity === 'Алматы'
    ? '43.238949,76.889709'
    : activeCity === 'Астана' ? '51.180479,71.445960'
    : activeCity === 'Шымкент' ? '42.317596,69.586543'
    : activeCity === 'Караганда' ? '49.806008,73.085022'
    : '50.283891,57.166985';

  const mapZoom = selected ? 15 : 12;

  const openRoute = (c: MedCenter) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`,
      '_blank'
    );
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title">🗺️ Медицинская карта</h1>
        <p className="page-subtitle">
          Гематологические центры, станции переливания крови и пункты скорой помощи
        </p>
      </div>

      {/* Filters */}
      <div className="card card-sm" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
            <Filter size={15} /> Тип:
          </div>
          {(['all', 'hematology', 'blood', 'emergency'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              style={{
                padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                fontWeight: 600, fontSize: '0.8125rem', transition: 'all 0.15s',
                background: activeType === type
                  ? (type === 'all' ? 'var(--color-text)' : TYPE_CONFIG[type].color)
                  : 'var(--color-bg)',
                color: activeType === type ? 'white' : 'var(--color-text-muted)',
                border: `1.5px solid ${activeType === type ? 'transparent' : 'var(--color-border)'}`,
              }}
            >
              {type === 'all' ? '🗂 Все' : `${TYPE_CONFIG[type].emoji} ${TYPE_CONFIG[type].label}`}
            </button>
          ))}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Город:</span>
            <select
              className="input"
              style={{ padding: '6px 12px', fontSize: '0.875rem', width: 'auto' }}
              value={activeCity}
              onChange={(e) => { setActiveCity(e.target.value); setSelected(null); }}
            >
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Main layout: map + list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>
        {/* Map iframe */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
          <iframe
            key={`${mapCenter}-${mapZoom}`}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${(parseFloat(mapCenter.split(',')[1]) - 0.08)},${(parseFloat(mapCenter.split(',')[0]) - 0.06)},${(parseFloat(mapCenter.split(',')[1]) + 0.08)},${(parseFloat(mapCenter.split(',')[0]) + 0.06)}&layer=mapnik&marker=${mapCenter}`}
            style={{ width: '100%', height: 480, border: 'none', display: 'block' }}
            title="Медицинская карта"
            loading="lazy"
          />
          {/* Stats badge */}
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: 'rgba(255,255,255,0.95)', borderRadius: 10, padding: '8px 14px',
            backdropFilter: 'blur(8px)', boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
            fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)'
          }}>
            📍 {filtered.length} объект{filtered.length === 1 ? '' : filtered.length < 5 ? 'а' : 'ов'}
          </div>
        </div>

        {/* Centers list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 480, overflowY: 'auto', paddingRight: 2 }}>
          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 32 }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div>
              Нет результатов
            </div>
          ) : filtered.map((center) => {
            const cfg = TYPE_CONFIG[center.type];
            const isSelected = selected?.id === center.id;
            return (
              <div
                key={center.id}
                onClick={() => setSelected(isSelected ? null : center)}
                style={{
                  background: isSelected ? cfg.bg : 'var(--color-surface)',
                  border: `1.5px solid ${isSelected ? cfg.color : 'var(--color-border)'}`,
                  borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
                  transition: 'all 0.17s ease',
                  boxShadow: isSelected ? `0 0 0 3px ${cfg.color}22` : 'none',
                }}
              >
                {/* Type badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px',
                    borderRadius: 20, background: cfg.color, color: 'white',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    {cfg.emoji} {cfg.label}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>{center.city}</span>
                </div>

                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: 3 }}>
                  {center.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} /> {center.address}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', marginBottom: 10 }}>
                  🕐 {center.hours}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <a
                    href={`tel:${center.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '8px', borderRadius: 10, textDecoration: 'none',
                      background: cfg.bg, color: cfg.color,
                      fontSize: '0.8rem', fontWeight: 700, border: `1px solid ${cfg.color}33`,
                      transition: 'opacity 0.15s',
                    }}
                  >
                    <Phone size={13} /> {center.phone}
                  </a>
                  <button
                    onClick={(e) => { e.stopPropagation(); openRoute(center); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px',
                      borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: 'var(--color-primary)', color: 'white',
                      fontSize: '0.8rem', fontWeight: 700,
                    }}
                  >
                    <Navigation size={13} /> Маршрут
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected detail panel */}
      {selected && (
        <div className="card" style={{ marginTop: 16, borderLeft: `4px solid ${TYPE_CONFIG[selected.type].color}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 4 }}>{selected.name}</div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  📍 {selected.address}, {selected.city}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  🕐 {selected.hours}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <a
                href={`tel:${selected.phone}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', borderRadius: 10, textDecoration: 'none',
                  background: TYPE_CONFIG[selected.type].bg, color: TYPE_CONFIG[selected.type].color,
                  fontWeight: 700, fontSize: '0.9rem',
                }}
              >
                <Phone size={16} /> {selected.phone}
              </a>
              <button
                onClick={() => openRoute(selected)}
                className="btn btn-primary"
              >
                <Navigation size={16} /> Проложить маршрут
              </button>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--color-text-muted)" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
