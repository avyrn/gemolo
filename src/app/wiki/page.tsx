'use client';
// ============================================================
// Wiki page — Knowledge Base with accordion sections
// Sourced from: Ministry of Health RK, SK-Pharmacy, hemophilya.kz,
// @kazakhstan.hemofiliya, NNOC Astana, and Kazakhstan Hemophilia Association
// ============================================================

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Search, Scale, FileText, Heart, Shield, Building2, ChevronDown, ChevronUp } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  minutes: number;
}

interface Category {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  articles: Article[];
}

const WIKI_DATA: Category[] = [
  {
    id: 'association-kz',
    title: '🩸 Казахстанская Ассоциация Гемофилии и Защита Прав',
    icon: <Building2 size={20} />,
    color: '#E63946',
    bg: '#FFE8EA',
    articles: [
      {
        id: 'assoc-info',
        title: 'Общественное объединение «Казахстанская Ассоциация инвалидов-больных гемофилией»',
        summary: 'Официальный представитель интересов пациентов и опекунов в РК с 2003 года.',
        minutes: 4,
        content: `**ОО «Казахстанская Ассоциация инвалидов-больных гемофилией»** — республиканское общественное объединение, защищающее социальные, медицинские и правовые интересы пациентов.

**Ключевые факты:**
• **Год основания:** 18 августа 2003 года
• **Международный статус:** Официальный член Всемирной Федерации Гемофилии (**WFH**)
• **Президент ассоциации:** Акжан Ериккызы
• **Официальный сайт:** https://hemophilya.kz/
• **Instagram:** @kazakhstan.hemofiliya

**Контакты для обращений:**
• 📞 **Телефоны:** +7 (747) 342-31-54, +7 (777) 303-36-33
• ✉️ **Email:** kazgemo@mail.ru
• 📍 **Адрес штаб-квартиры:** г. Алматы, Ауэзовский район, ул. Яблочкова, 1 (с филиалами в регионах РК)

**Чем помогает ассоциация:**
1. Защита при задержках или перебоях с выдачей факторов свертывания в поликлиниках.
2. Бесплатные консультации юристов по оформлению инвалидности и социальных пособий.
3. Проведение «Школ гемофилии» для родителей, опекунов и взрослых пациентов.
4. Организация мероприятий к **17 апреля — Всемирному дню гемофилии**.`,
      },
      {
        id: 'delay-complaint',
        title: 'Что делать, если в поликлинике или аптеке нет фактора свертывания?',
        summary: 'Пошаговый юридический алгоритм действий при угрозе дефицита препарата.',
        minutes: 5,
        content: `По законам Республики Казахстан гемофилия является социально значимым заболеванием, и лекарства выдаются **БЕСПЛАТНО и БЕСПЕРЕБОЙНО**.

**Алгоритм действий при задержке:**
1. **Письменное обращение к главному врачу поликлиники:** потребуйте официальную справку о причинах отсутствия препарата в аптечном пункте.
2. **Звонок в Единый дистрибьютор «СК-Фармация»:** горячая линия **1439** (звонок бесплатный). Назовите свой регион, номер поликлиники и препарат.
3. **Обращение в Комитет медицинского и фармацевтического контроля МЗ РК:** территориальный департамент по вашей области обязан провести внеплановую проверку.
4. **Свяжитесь с Казахстанской Ассоциацией гемофилии:** (+7 747 342-31-54). Юристы ассоциации направляют запросы напрямую в Минздрав и руководство региональных управлений здравоохранения.`,
      },
    ],
  },
  {
    id: 'caregiver-guide',
    title: '🛡️ Руководство для опекунов и родителей детей',
    icon: <Shield size={20} />,
    color: '#7B5EA7',
    bg: '#F0EBFF',
    articles: [
      {
        id: 'childhood-hemo',
        title: 'Ребенок с гемофилией: первые шаги и домашнее введение фактора',
        summary: 'В Казахстане около 500-600 детей с наследственными коагулопатиями. Как организовать безопасный быт.',
        minutes: 5,
        content: `По данным детских гематологов РК, под диспансерным наблюдением находится около полутысячи детей с гемофилией A и B.

**Главные правила для родителей:**
• **Венозный доступ:** для малышей с тонкими венами врачи (например, в ННОЦ Астаны или детских центрах Алматы) рекомендуют установку подкожного венозного порта (порт-а-кат). Это делает инъекции практически безболезненными.
• **Обучение инъекциям:** родители проходят курс в Школе гемофилии и могут вводить фактор дома, не дожидаясь приезда скорой.
• **Сроки:** при ушибе, падении или подозрении на гемартроз фактор необходимо ввести в течение **первых двух часов**.
• **Хранение препарата дома:** современные препараты стабильны при температуре до 25°C, но лучше держать их в дверце холодильника (+2...+8°C), защищая от прямого света. Не замораживать!`,
      },
      {
        id: 'school-kindergarten',
        title: 'Памятка для учителей, воспитателей и тренеров',
        summary: 'Что должен знать персонал детсада или школы, где учится ребенок с гемофилией.',
        minutes: 4,
        content: `Дети с гемофилией, получающие регулярную профилактику, могут учиться в общеобразовательных школах наравне со сверстниками.

**Памятка для учителя:**
1. **Гемофилия НЕ заразна.** Это генетическая особенность свертываемости крови.
2. Небольшие порезы или ссадины останавливаются обычным пластырем или повязкой.
3. **Опасность представляют глубокие внутренние травмы:** удары головой, падения на колени или локти, удары в живот.
4. **При любой серьезной травме:**
   • Обеспечить ребенку полный покой (сесть/лечь).
   • Приложить холод через салфетку.
   • **НЕМЕДЛЕННО позвонить родителю/опекуну.**
   • Ребенок всегда носит с собой браслет или QR-код цифрового паспорта HaemoHelp.`,
      },
    ],
  },
  {
    id: 'rights',
    title: '🏛️ Права и государственное обеспечение (ГОБМП / СК-Фармация)',
    icon: <Scale size={20} />,
    color: '#2D7DD2',
    bg: '#EBF4FF',
    articles: [
      {
        id: 'gobmp-kz',
        title: 'ГОБМП в Казахстане: 18 препаратов и 100% бесплатное лечение',
        summary: 'Государство гарантирует бесплатные факторы свертывания всем гражданам РК.',
        minutes: 4,
        content: `В Республике Казахстан лечение гемофилии финансируется напрямую из республиканского бюджета в рамках **ГОБМП** (Гарантированного объема бесплатной медицинской помощи).

**Что предоставляется бесплатно:**
• Концентраты факторов VIII и IX (рекомбинантные: Октоког альфа, Мороктоког альфа, а также плазматические: Октанат, Иммунин и др.).
• Препараты обходного пути для ингибиторных пациентов: Эптаког альфа (NovoSeven), Антиингибиторный коагулянтный комплекс (FEIBA).
• Инновационный препарат моноклональных антител: **Эмицизумаб** (подкожное введение для профилактики).
• Консультации республиканских и городских гематологов, мониторинг коагулограммы и уровня ингибиторов.

**Нужно ли платить взносы ОСМС?**
Нет, ГОБМП предоставляется независимо от статуса в ОСМС. Но наличие страховки ОСМС расширяет доступ к сопутствующим обследованиям (МРТ суставов, реабилитация).`,
      },
      {
        id: 'registration-steps',
        title: 'Как встать в Республиканский регистр пациентов с гемофилией',
        summary: 'Пошаговый процесс постановки на диспансерный учет для получения лекарств.',
        minutes: 3,
        content: `Чтобы получать бесплатные препараты, пациент должен быть внесен в электронный регистр диспансерных больных (ЭРДБ).

**Шаги:**
1. Обратиться к участковому терапевту/педиатру в поликлинику по месту прикрепления.
2. Получить направление к профильному врачу-гематологу (в Астане — ННОЦ/горбольницы, в Алматы — ГКБ №7/КазНИИОиР, в регионах — областные больницы).
3. Пройти расширенную коагулограмму (определение дефицита фактора VIII или IX, тест на ингибитор).
4. Гематолог оформляет клинический протокол и вносит данные в Республиканский регистр.
5. На основании регистра поликлиника формирует годовую заявку в ТОО «СК-Фармация».`,
      },
    ],
  },
  {
    id: 'mse',
    title: '📋 Оформление инвалидности (МСЭ) в Казахстане',
    icon: <FileText size={20} />,
    color: '#7B5EA7',
    bg: '#F0EBFF',
    articles: [
      {
        id: 'mse-procedure',
        title: 'Как оформить статус инвалидности взрослому и ребенку',
        summary: 'Медико-социальная экспертиза: группы, критерии и необходимые документы.',
        minutes: 5,
        content: `**Инвалидность при гемофилии дает право на государственные социальные пособия, санаторно-курортное лечение и трудовые льготы.**

**Критерии:**
• **Детям до 18 лет:** устанавливается категория «ребенок-инвалид» (при тяжелой и средней форме с частыми гемартрозами).
• **Взрослым (с 18 лет):**
  - **I группа:** резко выраженные контрактуры суставов, инвалидная коляска, ингибиторная форма.
  - **II группа:** выраженные ограничения движений в крупных суставах (коленные, локтевые), необходимость постоянного сопровождения.
  - **III группа:** умеренные ограничения функций передвижения и самообслуживания.

**Документы для МСЭ (форма 088/у):**
1. Удостоверение личности / Свидетельство о рождении ребенка.
2. Заключение главного гематолога региона с указанием формы, частоты кровотечений и вида терапии.
3. Рентгенограммы суставов, МРТ или УЗИ (при артропатиях).
4. Выписки из стационаров за последние 1-2 года.`,
      },
    ],
  },
  {
    id: 'life',
    title: '🏃 Спорт, активность и образ жизни',
    icon: <Heart size={20} />,
    color: '#059669',
    bg: '#E8F9EE',
    articles: [
      {
        id: 'sports-kz',
        title: 'Безопасный спорт: укрепляем мышцы без риска гемартроза',
        summary: 'Сильный мышечный корсет защищает суставы от спонтанных кровоизлияний.',
        minutes: 4,
        content: `Главный гематолог МЗ РК д-р Кемайкин В.М. подчеркивает: гиподинамия (малоподвижность) опасна для суставов!

**Идеальные виды спорта:**
• **Плавание** — лучший выбор. Снимает нагрузку на суставы, развивает все группы мышц.
• **Спортивная ходьба и ЛФК** под контролем реабилитолога.
• **Настольный теннис, бадминтон** (без резких падений).
• **Велосипед** — на ровных дорожках в защитной экипировке (шлем, наколенники).

**Запрещенные виды спорта:**
Категорически запрещены контактные единоборства (бокс, борьба, дзюдо), хоккей, регби, тяжелая атлетика.`,
      },
    ],
  },
];

function ArticleAccordion({ article }: { article: Article; color?: string }) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="accordion-item" style={{ marginBottom: 8 }}>
      <button
        className="accordion-header"
        onClick={() => setOpen((o) => !o)}
        id={`wiki-article-${article.id}`}
        aria-expanded={open}
      >
        <div>
          <div style={{ fontWeight: 700, marginBottom: 2, fontSize: '0.975rem' }}>{article.title}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>
            {article.summary}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', whiteSpace: 'nowrap' }}>
            {article.minutes} {t('wiki_minutes')}
          </span>
          {open ? <ChevronUp size={18} color="var(--color-text-muted)" /> : <ChevronDown size={18} color="var(--color-text-muted)" />}
        </div>
      </button>
      {open && (
        <div className="accordion-body" style={{ lineHeight: 1.65, fontSize: '0.9125rem' }}>
          {article.content.split('\n').map((line, i) => {
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
              <p key={i} style={{ marginBottom: line === '' ? 10 : 4 }}>
                {parts.map((part, j) =>
                  j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                )}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function WikiPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(['association-kz', 'caregiver-guide']));

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredData = search
    ? WIKI_DATA.map((cat) => ({
        ...cat,
        articles: cat.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.summary.toLowerCase().includes(search.toLowerCase()) ||
            a.content.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((cat) => cat.articles.length > 0)
    : WIKI_DATA;

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">{t('wiki_title')}</h1>
        <p className="page-subtitle">
          База знаний по гемофилии в Республике Казахстан (данные Минздрава РК, СК-Фармация и Ассоциации)
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
          <Search size={18} color="var(--color-text-subtle)" />
        </div>
        <input
          id="wiki-search"
          type="text"
          className="input"
          placeholder="Поиск по статьям, правам, лекарствам и законам РК..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 44, borderRadius: 14 }}
        />
      </div>

      {/* Categories */}
      {filteredData.map((category) => (
        <div key={category.id} style={{ marginBottom: 20 }}>
          <button
            onClick={() => toggleCategory(category.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: openCategories.has(category.id) ? category.bg : 'var(--color-surface)',
              borderBottom: openCategories.has(category.id) ? 'none' : '1px solid var(--color-border)',
              marginBottom: openCategories.has(category.id) ? 8 : 0,
              transition: 'all 0.2s ease', textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ color: category.color }}>{category.icon}</div>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)' }}>
                {category.title}
              </span>
              <span className="badge" style={{ background: category.bg, color: category.color, fontSize: '0.8rem' }}>
                {category.articles.length}
              </span>
            </div>
            {openCategories.has(category.id)
              ? <ChevronUp size={18} color={category.color} />
              : <ChevronDown size={18} color="var(--color-text-muted)" />
            }
          </button>

          {openCategories.has(category.id) && (
            <div style={{ animation: 'fade-in 0.2s ease' }}>
              {category.articles.map((article) => (
                <ArticleAccordion key={article.id} article={article} color={category.color} />
              ))}
            </div>
          )}
        </div>
      ))}

      {filteredData.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
          <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p>Ничего не найдено по запросу «{search}»</p>
        </div>
      )}
    </div>
  );
}
