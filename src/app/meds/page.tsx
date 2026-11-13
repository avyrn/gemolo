'use client';
// ============================================================
// Meds page — Factor concentrate inventory + calculator
// ============================================================

import { useState } from 'react';
import { Plus, Trash2, AlertTriangle, CheckCircle, Clock, Calculator, Package } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth/AuthContext';

interface StockItem {
  id: string;
  productName: string;
  iuPerVial: number;
  vials: number;
  expiryDate: string;
}

function useLocalStorage<T>(key: string, init: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(() => {
    if (typeof window === 'undefined') return init;
    try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return init; }
  });
  const set = (v: T) => { setVal(v); localStorage.setItem(key, JSON.stringify(v)); };
  return [val, set];
}

export default function MedsPage() {
  const { events } = useStore();
  const { account } = useAuth();
  const patient = account?.patient;

  const [stocks, setStocks] = useLocalStorage<StockItem[]>('haemo-stocks', []);
  const [showAdd, setShowAdd] = useState(false);
  const [weight, setWeight] = useState(patient?.weight?.toString() || '70');
  const [dosePerKg, setDosePerKg] = useState('20');
  const [freqPerWeek, setFreqPerWeek] = useState(3);
  const [form, setForm] = useState({ productName: '', iuPerVial: '', vials: '', expiryDate: '' });

  const today = new Date();
  const totalIU = stocks.reduce((sum, s) => sum + s.iuPerVial * s.vials, 0);

  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 30);
  const injections30 = events.filter(e => e.type === 'injection' && new Date(e.date) >= weekAgo).length;

  const calcDose = Math.round(parseFloat(weight || '0') * parseFloat(dosePerKg || '0')) || 0;
  const daysOfStock = freqPerWeek > 0 && calcDose > 0
    ? Math.floor((totalIU / calcDose) / freqPerWeek * 7)
    : 999;

  const stockStatus: 'ok' | 'low' | 'critical' =
    totalIU === 0 ? 'critical' : daysOfStock < 7 ? 'critical' : daysOfStock < 14 ? 'low' : 'ok';

  const STATUS = {
    ok:       { color: 'var(--color-success)', bg: 'var(--color-success-light)', Icon: CheckCircle, label: 'Запас в норме' },
    low:      { color: 'var(--color-warning)', bg: 'var(--color-warning-light)', Icon: AlertTriangle, label: 'Пополните запас' },
    critical: { color: 'var(--color-sos)',     bg: 'var(--color-sos-light)',     Icon: AlertTriangle, label: 'Критически мало!' },
  };
  const st = STATUS[stockStatus];
  const StatusIcon = st.Icon;

  const handleAdd = () => {
    if (!form.productName || !form.iuPerVial || !form.vials || !form.expiryDate) return;
    setStocks([...stocks, { id: Date.now().toString(), productName: form.productName, iuPerVial: parseFloat(form.iuPerVial), vials: parseInt(form.vials), expiryDate: form.expiryDate }]);
    setForm({ productName: '', iuPerVial: '', vials: '', expiryDate: '' });
    setShowAdd(false);
  };

  const getExpiryStatus = (d: string) => {
    const days = Math.ceil((new Date(d).getTime() - today.getTime()) / 86400000);
    if (days < 0) return { label: 'Просрочено!', color: 'var(--color-sos)', bg: 'var(--color-sos-light)' };
    if (days < 30) return { label: `${days} дн. до истечения`, color: 'var(--color-warning)', bg: 'var(--color-warning-light)' };
    return { label: `${days} дн.`, color: 'var(--color-success)', bg: 'var(--color-success-light)' };
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <h1 className="page-title">💊 Учёт препаратов</h1>
      <p className="page-subtitle">Запасы концентрата фактора, калькулятор дозы и уведомления</p>

      {/* Status banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 14, background: st.bg, border: `2px solid ${st.color}33`, marginBottom: 20 }}>
        <StatusIcon size={28} color={st.color} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, color: st.color, fontSize: '1.05rem' }}>{st.label}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
            Запас: <strong>{totalIU.toLocaleString()} МЕ</strong>
            {totalIU > 0 && <> · Примерно на <strong>{daysOfStock}</strong> дн. профилактики</>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: st.color, lineHeight: 1 }}>{stocks.reduce((s, x) => s + x.vials, 0)}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>флаконов</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* Stock list */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={18} color="var(--color-primary)" /> Мои запасы
            </h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
              <Plus size={14} /> Добавить партию
            </button>
          </div>

          {showAdd && (
            <div className="card" style={{ marginBottom: 16, border: '2px solid var(--color-primary)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14 }}>Новая партия</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label">Название препарата</label>
                  <input className="input" placeholder="Октанат 500, Новоэйт..." value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} />
                </div>
                <div>
                  <label className="label">МЕ в 1 флаконе</label>
                  <input className="input" type="number" placeholder="500" value={form.iuPerVial} onChange={e => setForm({ ...form, iuPerVial: e.target.value })} />
                </div>
                <div>
                  <label className="label">Кол-во флаконов</label>
                  <input className="input" type="number" placeholder="10" value={form.vials} onChange={e => setForm({ ...form, vials: e.target.value })} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label className="label">Срок годности</label>
                  <input className="input" type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Отмена</button>
                <button className="btn btn-primary btn-sm" onClick={handleAdd}>Сохранить</button>
              </div>
            </div>
          )}

          {stocks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📦</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Запасы не добавлены</div>
              <div style={{ fontSize: '0.875rem' }}>Нажмите «Добавить партию»</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stocks.map(s => {
                const exp = getExpiryStatus(s.expiryDate);
                return (
                  <div key={s.id} className="card card-sm" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.3rem' }}>💉</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.productName}</div>
                      <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {s.vials} фл. × {s.iuPerVial.toLocaleString()} МЕ = <strong>{(s.iuPerVial * s.vials).toLocaleString()} МЕ</strong>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: '0.75rem', padding: '3px 8px', borderRadius: 20, background: exp.bg, color: exp.color, fontWeight: 600 }}>
                        <Clock size={10} /> {exp.label} · до {new Date(s.expiryDate).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <button onClick={() => setStocks(stocks.filter(x => x.id !== s.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-subtle)', padding: 4 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right col: calculator + forecast */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calculator size={18} color="var(--color-primary)" /> Калькулятор дозы
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="label">Вес (кг)</label>
                <input className="input" type="number" value={weight} onChange={e => setWeight(e.target.value)} />
              </div>
              <div>
                <label className="label">Доза (МЕ/кг)</label>
                <select className="input" value={dosePerKg} onChange={e => setDosePerKg(e.target.value)}>
                  <option value="10">10 МЕ/кг — лёгкое</option>
                  <option value="20">20 МЕ/кг — профилактика</option>
                  <option value="30">30 МЕ/кг — тяжёлое</option>
                  <option value="50">50 МЕ/кг — жизнеугрожающее</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: '16px', borderRadius: 12, background: 'linear-gradient(135deg, var(--color-primary-muted), #e0eeff)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Необходимая доза</div>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>{calcDose.toLocaleString()}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 2 }}>МЕ</div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14 }}>📊 Прогноз запасов</h3>
            <div>
              <label className="label">Частота профилактики (раз/нед)</label>
              <input className="input" type="number" min="1" max="7" value={freqPerWeek} onChange={e => setFreqPerWeek(parseInt(e.target.value) || 1)} />
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Инъекций за 30 дн.', injections30],
                ['Запас продержится', totalIU > 0 ? `${daysOfStock} дн.` : '—'],
              ].map(([label, value]) => (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                  <strong style={{ color: label === 'Запас продержится' ? st.color : 'inherit' }}>{value}</strong>
                </div>
              ))}
            </div>
            {stockStatus !== 'ok' && (
              <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: st.bg, color: st.color, fontSize: '0.825rem', fontWeight: 600 }}>
                ⚠️ Свяжитесь с гематологом для пополнения запаса
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
