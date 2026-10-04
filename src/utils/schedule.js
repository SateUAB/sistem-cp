// Schedule dates are ISO strings (YYYY-MM-DD), same as Sanity's `date` type.
// Comparing them as strings keeps everything independent of the visitor's timezone.

export const SCHEDULE_TIMEZONE = 'America/Fortaleza';

export const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
export const MONTH_ABBR = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const WEEKDAY_ABBR = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export const scheduleCategories = {
    'publicacao': { label: 'Publicação', badge: 'bg-green-100 text-green-800 border border-green-200', dot: 'bg-uece-green' },
    'prazo': { label: 'Prazo do candidato', badge: 'bg-amber-100 text-amber-800 border border-amber-200', dot: 'bg-amber-500' },
    'etapa': { label: 'Etapa', badge: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500' }
};

const DAY_MS = 24 * 60 * 60 * 1000;

const pad = (value) => String(value).padStart(2, '0');

const toUTC = (isoDate) => {
    const [year, month, day] = isoDate.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
};

// "Today" in Fortaleza, no matter where the visitor is
export const getToday = () => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: SCHEDULE_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const get = (type) => parts.find(part => part.type === type).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
};

export const addDays = (isoDate, days) => new Date(toUTC(isoDate) + days * DAY_MS).toISOString().slice(0, 10);

export const diffDays = (from, to) => Math.round((toUTC(to) - toUTC(from)) / DAY_MS);

export const formatDate = (isoDate) => isoDate.split('-').reverse().join('/');

// Sorted by start date (ties keep the order defined in the CMS); single-day items get endDate = startDate
export const normalizeSchedule = (items) => (items || [])
    .filter(item => item?.title && item?.startDate)
    .map((item, index) => ({
        ...item,
        key: item._key || `${item.startDate}-${index}`,
        endDate: item.endDate && item.endDate > item.startDate ? item.endDate : item.startDate
    }))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

export const getItemStatus = (item, today) => {
    if (item.endDate < today) return 'past';
    if (item.startDate <= today) return 'current';
    return 'upcoming';
};

// What deserves the spotlight: everything happening today or, failing that, whatever comes next
export const getHighlightedKeys = (items, today) => {
    const current = items.filter(item => getItemStatus(item, today) === 'current');
    if (current.length > 0) return current.map(item => item.key);

    const next = items.find(item => getItemStatus(item, today) === 'upcoming');
    return items.filter(item => item.startDate === next?.startDate).map(item => item.key);
};

export const getRelativeLabel = (item, today) => {
    const status = getItemStatus(item, today);
    if (status === 'past') return null;

    if (status === 'current') {
        if (item.startDate === item.endDate) return 'Hoje';
        const daysLeft = diffDays(today, item.endDate);
        if (daysLeft === 0) return 'Termina hoje';
        return daysLeft === 1 ? 'Termina amanhã' : `Termina em ${daysLeft} dias`;
    }

    const daysUntil = diffDays(today, item.startDate);
    return daysUntil === 1 ? 'Amanhã' : `Em ${daysUntil} dias`;
};

// "ter, 06/10/2026" for a single day, "04/10 a 05/10/2026" for a period
export const formatPeriod = (item) => {
    const [startYear, startMonth, startDay] = item.startDate.split('-');
    const [endYear] = item.endDate.split('-');

    if (item.startDate === item.endDate) {
        const weekday = WEEKDAY_ABBR[new Date(toUTC(item.startDate)).getUTCDay()];
        return `${weekday}, ${formatDate(item.startDate)}`;
    }

    const start = startYear === endYear ? `${startDay}/${startMonth}` : formatDate(item.startDate);
    return `${start} a ${formatDate(item.endDate)}`;
};

// Month keys are "YYYY-MM"
export const getMonthKey = (isoDate) => isoDate.slice(0, 7);

export const shiftMonth = (monthKey, delta) => {
    const [year, month] = monthKey.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1 + delta, 1)).toISOString().slice(0, 7);
};

export const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    return `${MONTH_NAMES[month - 1]} ${year}`;
};

// Cells of a month grid starting on Sunday; `null` fills the days outside the month.
// Always six weeks, so the calendar keeps its height when the month changes.
export const getMonthCells = (monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    const leadingBlanks = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    const cells = Array(leadingBlanks).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
        cells.push(`${monthKey}-${pad(day)}`);
    }
    while (cells.length < 42) cells.push(null);
    return cells;
};

export const isItemOnDay = (item, isoDate) => item.startDate <= isoDate && isoDate <= item.endDate;

// First and last months that have something scheduled
export const getMonthRange = (items) => ({
    first: getMonthKey(items[0].startDate),
    last: items.reduce((latest, item) => getMonthKey(item.endDate) > latest ? getMonthKey(item.endDate) : latest, '')
});

// Month a calendar should open on: the one of whatever is happening now or coming next
export const getInitialMonth = (items, today) => {
    const next = items.find(item => getItemStatus(item, today) !== 'past');
    if (next) return getMonthKey(next.startDate <= today ? today : next.startDate);
    return items.length > 0 ? getMonthRange(items).last : getMonthKey(today);
};

// Timeline documents store dates as "dd/mm/yyyy"
const toISODate = (date) => (date || '').split('/').reverse().join('-');

// Schedule items and posts are linked by name: both come from the same standard list in Sanity.
// Letter case, extra spaces, the "Retificado" mark and linking words make no difference, so posts typed
// by hand before the standard ("CRONOGRAMA DE ENTREVISTAS") still find their item ("Cronograma das entrevistas").
const LINKING_WORDS = new Set(['a', 'o', 'as', 'os', 'de', 'da', 'do', 'das', 'dos', 'em', 'para', '-']);

const getMatchKey = (name) => (name || '')
    .toLowerCase()
    .replace(/^\s*retificado\s*-\s*/, '')
    .replace(/\s*-\s*(retificado|corrigido)\s*$/, '')
    .split(/\s+/)
    .filter(word => word && !LINKING_WORDS.has(word))
    .join(' ');

// Gives each schedule item the document published for it (`publication`), or `null` while there is none.
// A rectified version is published later under the same name, so the most recent post wins.
export const linkPublications = (items, timeline) => {
    const latestByName = new Map();
    (timeline || []).forEach(post => {
        const key = getMatchKey(post?.title);
        if (!key || !post.url) return;
        const latest = latestByName.get(key);
        if (!latest || toISODate(post.date) >= toISODate(latest.date)) latestByName.set(key, post);
    });

    return items.map(item => ({ ...item, publication: latestByName.get(getMatchKey(item.title)) || null }));
};

// Latest published document flagged as changing the schedule (usually an adendo).
// `null` means the dates still follow the edital.
export const getScheduleSource = (timeline) => (timeline || [])
    .filter(doc => doc?.changesSchedule)
    .reduce((latest, doc) => !latest || toISODate(doc.date) >= toISODate(latest.date) ? doc : latest, null);
