// @ts-check
// Dates of the public site. Sanity sends two formats:
//   dd/mm/aaaa — startDate, subscriptionEndDate, endDate and timeline[].date
//   aaaa-mm-dd — publicationDate and schedule[].startDate / endDate
// Everything here works on ISO strings (aaaa-mm-dd), compared as text, so the visitor's timezone never matters.
import { diffDays as diffIso, getToday as getFortalezaToday } from '../schedule.js';

export const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const MESL = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const DEV_TODAY_KEY = 'cp-hoje';

/**
 * Today in Fortaleza, as aaaa-mm-dd.
 * Only in development, `?hoje=aaaa-mm-dd` simulates another day for the rest of the tab session (`?hoje=` clears it).
 * @returns {string}
 */
export const getToday = () => {
    if (import.meta.env?.DEV && typeof window !== 'undefined') {
        try {
            const param = new URLSearchParams(window.location.search).get('hoje');
            if (param !== null) {
                if (ISO.test(param)) sessionStorage.setItem(DEV_TODAY_KEY, param);
                else sessionStorage.removeItem(DEV_TODAY_KEY);
            }
            const simulated = sessionStorage.getItem(DEV_TODAY_KEY);
            if (simulated) return simulated;
        } catch {
            // sessionStorage blocked: use the real date
        }
    }
    return getFortalezaToday();
};

/** @param {string | null | undefined} iso */
export const isIso = (iso) => typeof iso === 'string' && ISO.test(iso);

/**
 * "20/10/2026" -> "2026-10-20". `null` when the text is not a date.
 * @param {string | null | undefined} br
 * @returns {string | null}
 */
export const brToIso = (br) => {
    const match = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/.exec(br || '');
    if (!match) return null;
    return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
};

/**
 * "2026-10-20" -> "20/10/2026"; "—" without a date.
 * @param {string | null | undefined} iso
 */
export const isoToBr = (iso) => (isIso(iso) ? /** @type {string} */ (iso).split('-').reverse().join('/') : '—');

/**
 * Days from `from` to `to` (both ISO).
 * @param {string} from
 * @param {string} to
 */
export const diffDays = (from, to) => diffIso(from, to);

/** @param {string} iso */
const parts = (iso) => iso.split('-').map(Number);

/** "20 out" @param {string} iso */
export const shortDate = (iso) => {
    const [, month, day] = parts(iso);
    return `${day} ${MES[month - 1]}`;
};

/** "20 de outubro" @param {string} iso */
export const dayMonth = (iso) => {
    const [, month, day] = parts(iso);
    return `${day} de ${MESL[month - 1]}`;
};

/** "20 de outubro de 2026" @param {string} iso */
export const longDate = (iso) => `${dayMonth(iso)} de ${iso.slice(0, 4)}`;

/** "20/10" @param {string} iso */
export const ddmm = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** Day of the week, 0 = Sunday @param {string} iso */
export const weekday = (iso) => {
    const [year, month, day] = parts(iso);
    return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};

/** "Outubro 2026" @param {number} year @param {number} monthIndex 0–11 */
export const monthLabel = (year, monthIndex) => `${MESL[monthIndex].charAt(0).toUpperCase()}${MESL[monthIndex].slice(1)} ${year}`;

/**
 * Every ISO day from `start` to `end`, both included.
 * @param {string} start
 * @param {string} end
 */
export const eachDay = (start, end) => {
    const days = [];
    const [y, m, d] = parts(start);
    const cursor = new Date(Date.UTC(y, m - 1, d));
    for (let i = 0; i < 400; i++) {
        const iso = cursor.toISOString().slice(0, 10);
        if (iso > end) break;
        days.push(iso);
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return days;
};
