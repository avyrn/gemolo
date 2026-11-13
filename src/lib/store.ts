// ============================================================
// store.ts — Zustand global state for HaemoHelp KZ
// Extended with Caregiver/Patient roles & Kazakhstan Official Data
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export type UserRole = 'patient' | 'caregiver';

export interface PatientProfile {
  role?: UserRole;         // 'patient' (adult) or 'caregiver' (parent/guardian)
  caregiverName?: string;  // Name of parent/guardian if role is caregiver
  fullName: string;        // Name of patient (or child)
  dob: string;
  bloodType: string;
  hemophiliaType: 'A' | 'B';
  severity: 'mild' | 'moderate' | 'severe';
  inhibitor: boolean;
  workingDose: string;
  factorProduct: string;
  doctor: string;
  hospital: string;
  weight: number;
  contacts: EmergencyContact[];
  socialNickname?: string;
  avatar?: string;
}

// ==== Forum / Community Types ====
export interface ForumComment {
  id: string;
  authorId: string;
  authorNickname: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export type ForumCategoryType = 'doctors' | 'meds' | 'psych' | 'association';

export interface ForumPost {
  id: string;
  authorId: string;
  authorNickname: string;
  authorAvatar: string;
  authorRole?: UserRole;
  category: ForumCategoryType | string;
  title?: string;
  content: string;
  attachment?: string;
  reactions: Record<string, string[]>;
  comments: ForumComment[];
  pinned?: boolean;
  createdAt: string;
}

export type CalendarEventType = 'injection' | 'test' | 'appointment' | 'pharmacy';

export interface CalendarEvent {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  type: CalendarEventType;
  time?: string;
  notes?: string;
}

export interface AppStore {
  // --- Calendar ---
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  removeEvent: (id: string) => void;

  // --- SOS state ---
  sosOpen: boolean;
  setSosOpen: (open: boolean) => void;

  // --- Forum ---
  forumPosts: ForumPost[];
  addForumPost: (post: ForumPost) => void;
  updateForumPost: (id: string, updates: Partial<ForumPost>) => void;
  deleteForumPost: (id: string) => void;
  addComment: (postId: string, comment: ForumComment) => void;
}

// Sample calendar events for demo
const today = new Date();
const fmtDate = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

const defaultEvents: CalendarEvent[] = [
  { id: '1', date: fmtDate(today), type: 'injection', time: '08:00', notes: 'Профилактическая инъекция фактора VIII (Октанат 2000 МЕ)' },
  { id: '2', date: fmtDate(addDays(today, 2)), type: 'injection', time: '08:00', notes: 'Плановая профилактическая инъекция' },
  { id: '3', date: fmtDate(addDays(today, 4)), type: 'appointment', time: '10:30', notes: 'Приём в ННОЦ: гематолог Кемайкин В. М.' },
  { id: '4', date: fmtDate(addDays(today, 7)), type: 'test', time: '09:00', notes: 'Контроль коагулограммы и титра ингибитора' },
  { id: '5', date: fmtDate(addDays(today, 10)), type: 'pharmacy', time: '11:00', notes: 'Получение препаратов фактора по ГОБМП в СК-Фармация' },
  { id: '6', date: fmtDate(addDays(today, -1)), type: 'injection', time: '08:00', notes: 'Профилактическая инъекция выполнена успешно' },
];

// Seed forum posts from official Kazakhstan research (hemophilya.kz, KazTAG, MoH RK, @kazakhstan.hemofiliya)
const defaultForumPosts: ForumPost[] = [
  {
    id: 'assoc-1',
    category: 'association',
    authorId: 'kz-hemo-official',
    authorNickname: 'Казахстанская Ассоциация Гемофилии (hemophilya.kz)',
    authorAvatar: '🩸',
    authorRole: 'caregiver',
    title: 'Горячая линия защиты прав пациентов и опекунов в РК',
    createdAt: new Date(today.getTime() - 3 * 3600000).toISOString(),
    content: `Уважаемые пациенты и опекуны детей с гемофилией! 

ОО «Казахстанская Ассоциация инвалидов-больных гемофилией» (основана в 2003 г., член WFH) защищает права каждого пациента в Республике Казахстан.

🚨 Если в вашей поликлинике задерживают выдачу факторов VIII или IX, или предлагают необоснованную замену препарата:
• Горячая линия: +7 (747) 342-31-54, +7 (777) 303-36-33
• Email: kazgemo@mail.ru
• Адрес: г. Алматы, ул. Яблочкова, 1
• Instagram: @kazakhstan.hemofiliya
• Официальный сайт: https://hemophilya.kz/

Помните: 17 апреля — Всемирный день гемофилии. Мы регулярно проводим школы пациентов для взрослых и родителей детей!`,
    reactions: { '❤️': ['u1', 'u2', 'u3', 'u4', 'u5'], '👍': ['u6', 'u7', 'u8'] },
    comments: [
      {
        id: 'c-assoc-1',
        authorId: 'u2',
        authorNickname: 'Айжан (Опекун)',
        authorAvatar: '👩‍👦',
        content: 'Спасибо Ассоциации! В прошлом месяце помогли решить вопрос с выдачей фактора в поликлинике №4.',
        createdAt: new Date(today.getTime() - 1 * 3600000).toISOString(),
      }
    ],
    pinned: true,
  },
  {
    id: 'med-sk-1',
    category: 'meds',
    authorId: 'sk-official',
    authorNickname: 'Мониторинг ГОБМП и СК-Фармация',
    authorAvatar: '💊',
    authorRole: 'patient',
    title: 'Бесплатное лекарственное обеспечение: 1 559 пациентов в РК',
    createdAt: new Date(today.getTime() - 12 * 3600000).toISOString(),
    content: `По данным Министерства здравоохранения РК и ТОО «СК-Фармация», в Казахстане состоят на диспансерном учете 1 559 пациентов с гемофилией (из них порядка 500 детей). 

Все пациенты обеспечиваются бесплатными концентратами факторов свертывания крови за счет республиканского бюджета в рамках ГОБМП (независимо от статуса ОСМС). 
В перечень закупаемых препаратов входят 18 наименований:
• Факторы VIII (Октоког альфа, Мороктоког альфа, Октанат)
• Фактор IX (для гемофилии B)
• Обходные препараты при ингибиторах: Эптаког альфа (NovoSeven), FEIBA
• Инновационная подкожная терапия: Эмицизумаб

Единый контакт-центр СК-Фармация: 1439 (звонок бесплатный).`,
    reactions: { '👍': ['u1', 'u3', 'u9'], '🙏': ['u2', 'u4'] },
    comments: [],
    pinned: true,
  },
  {
    id: 'doc-kem-1',
    category: 'doctors',
    authorId: 'doc-kem',
    authorNickname: 'Д-р Кемайкин В. М. (Гл. внештатный гематолог МЗ РК)',
    authorAvatar: '👨‍⚕️',
    authorRole: 'patient',
    title: 'Рекомендации по профилактике гемартрозов и лечению в ННОЦ',
    createdAt: new Date(today.getTime() - 24 * 3600000).toISOString(),
    content: `Коллеги, пациенты и родители! 
В Центре онкогематологии и ТКМ Национального научного онкологического центра (г. Астана) мы постоянно подчеркиваем: 

1. Профилактическое введение фактора (2-3 раза в неделю) — золотой стандарт для сохранения суставов. Не допускайте спонтанных кровоизлияний.
2. При остром гемартрозе используйте правило RICES: Rest (покой), Ice (лед через ткань), Compression (мягкая повязка), Elevation (поднятие конечности), Seek medical help (введение фактора и связь с врачом).
3. Каждые 6 месяцев обязательно сдавайте коагулограмму и проверяйте титр ингибиторов к факторам свертывания.`,
    reactions: { '❤️': ['u1', 'u2', 'u10', 'u11'], '👍': ['u3', 'u5'] },
    comments: [],
    pinned: true,
  },
  {
    id: 'caregiver-story-1',
    category: 'psych',
    authorId: 'mom-batyr',
    authorNickname: 'Динара (Мама мальчика с гемофилией А, 8 лет)',
    authorAvatar: '👩‍👧',
    authorRole: 'caregiver',
    title: 'Наш путь: от страха первого кровотечения до школьных побед',
    createdAt: new Date(today.getTime() - 48 * 3600000).toISOString(),
    content: `Когда сыну в год поставили тяжелую форму гемофилии А, мы с мужем были в панике. Боялись любого синяка. 

Сейчас Батыру 8 лет. Мы научились делать инъекции дома через венозный порт, он плавает в бассейне и отлично учится во 2 классе. Учителя в школе предупреждены, у сына всегда с собой карточка и QR-код цифрового паспорта HaemoHelp. 

Дорогие мамы и папы, у которых только что подтвердился диагноз у малыша: жизнь продолжается! При современной профилактике дети живут полноценной, счастливой жизнью ❤️`,
    reactions: { '❤️': ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'], '🎉': ['u8', 'u9'] },
    comments: [],
    pinned: false,
  },
];

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      // --- Calendar ---
      events: defaultEvents,
      addEvent: (event) =>
        set((state) => ({ events: [...state.events, event] })),
      removeEvent: (id) =>
        set((state) => ({ events: state.events.filter((e) => e.id !== id) })),

      // --- SOS ---
      sosOpen: false,
      setSosOpen: (open) => set({ sosOpen: open }),

      // --- Forum ---
      forumPosts: defaultForumPosts,
      addForumPost: (post) =>
        set((state) => ({ forumPosts: [post, ...state.forumPosts] })),
      updateForumPost: (id, updates) =>
        set((state) => ({
          forumPosts: state.forumPosts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deleteForumPost: (id) =>
        set((state) => ({ forumPosts: state.forumPosts.filter((p) => p.id !== id) })),
      addComment: (postId, comment) =>
        set((state) => ({
          forumPosts: state.forumPosts.map((p) => {
            if (p.id === postId) {
              return { ...p, comments: [...p.comments, comment] };
            }
            return p;
          }),
        })),
    }),
    {
      name: 'haemohelp-store-v2',
      partialize: (state) => ({ events: state.events, forumPosts: state.forumPosts }),
    }
  )
);
