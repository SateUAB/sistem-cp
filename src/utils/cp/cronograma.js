// @ts-check
// Schedule of a call ("Cronograma"): same structure as the previous site, with the new look.
// Each publication of the schedule is linked to the post published for it, so the calendar can
// take the candidate straight to the document.
import { getMatchKey } from '../schedule.js';
import { CATEGORY_LABEL } from './call.js';
import { MES, SEM, dayMonth, ddmm, diffDays, eachDay, isoToBr, monthLabel, shortDate, weekday } from './dates.js';
import { normalizeTitle } from './text.js';

/** @typedef {import('./call.js').CallView} CallView */
/** @typedef {import('./call.js').Activity} Activity */
/** @typedef {import('./call.js').Doc} Doc */

/**
 * @typedef {Activity & {
 *   dia: string, mes: string, catLbl: string, bd: 'pb' | 'pz' | 'et',
 *   quando: string, rel: string, passou: boolean, futuro: boolean,
 *   doc: Doc | null, publicado: boolean
 * }} CronoItem
 */

/**
 * @typedef {Object} DayCell
 * @property {string} key
 * @property {boolean} vazio
 * @property {string} iso
 * @property {string} n
 * @property {boolean} tem
 * @property {{ key: string, cls: string }[]} dots
 * @property {boolean} publicado   every publication of the day is out
 * @property {boolean} hoje
 * @property {string} cls
 * @property {string} aria
 * @property {{ key: string, titulo: string, cls: string }[]} tip
 * @property {string} dataBr
 * @property {string} delay
 * @property {boolean} tipLeft     tooltip opens to the left (right half of the week)
 */

/** @typedef {{ key: string, label: string, cells: DayCell[], temHoje: boolean }} Month */

/**
 * @typedef {Object} Cronograma
 * @property {CronoItem[]} itens
 * @property {Record<string, CronoItem[]>} porDia
 * @property {Month[]} meses
 * @property {number} mesInicial
 * @property {number} hojeQtd
 * @property {string} sub
 * @property {boolean} todasPassaram
 * @property {CronoItem[]} proximas
 * @property {{ nome: string, data: string, url: string | null, doc: Doc } | null} adendo
 * @property {string} ics
 * @property {string} gcal
 */

/** Calendar feeds always point to the published site: calendar apps fetch them from the internet */
export const FEED_HOST = 'sistem-cp.vercel.app';
/** @param {string} slug */
export const icsUrl = (slug) => `webcal://${FEED_HOST}/api/cronograma/${slug}.ics`;
/** @param {string} slug */
export const googleCalendarUrl = (slug) => `https://calendar.google.com/calendar/r?cid=${icsUrl(slug)}`;

// --- Link between a schedule item and its post --------------------------------------------------

/** @param {string} text */
const noAccents = (text) => (text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const STOP = new Set(['resultado', 'referente', 'para', 'chamada', 'publica', 'reesultado', 'retificado', 'segunda', 'retificacao']);
/** @type {Record<string, string>} */
const SYNONYMS = { final: 'definitivo', titulos: 'curriculo', curriculos: 'curriculo', incricoes: 'inscricoes' };

/** @param {string} text */
const tokens = (text) => {
    const out = new Set();
    noAccents(text).split(/[^a-z0-9]+/).forEach(word => {
        if (word.length >= 4 && !STOP.has(word)) out.add(SYNONYMS[word] || word);
    });
    return out;
};

/**
 * Post with a similar title, published from 2 days before to 12 days after the scheduled date.
 * "Preliminar" and "definitivo" never mix.
 * @param {Activity} activity
 * @param {Doc[]} docs
 */
const similarDoc = (activity, docs) => {
    const wanted = tokens(activity.rawTitle);
    if (!wanted.size) return null;
    let best = null;
    let bestScore = 0;
    docs.forEach(doc => {
        if (!doc.iso || !doc.url) return;
        const gap = diffDays(activity.iso, doc.iso);
        if (gap < -2 || gap > 12) return;
        const found = tokens(doc.rawTitle);
        if (wanted.has('preliminar') !== found.has('preliminar')) return;
        let hits = 0;
        wanted.forEach(word => { if (found.has(word)) hits += 1; });
        const score = hits / wanted.size;
        if (score > bestScore) {
            bestScore = score;
            best = doc;
        }
    });
    return bestScore >= 0.6 ? best : null;
};

/**
 * Finds the post of each publication, in this order:
 *   1. the post chosen in the item (`linkedPostKey`, optional field);
 *   2. the post with the same standard name (most recent wins, so a rectified version replaces the first);
 *   3. a post with a similar title and a close date, for posts typed by hand.
 * @param {Doc[]} docs
 * @returns {(activity: Activity) => Doc | null}
 */
export const docFinder = (docs) => {
    const byKey = new Map(docs.filter(doc => doc.sanityKey).map(doc => [doc.sanityKey, doc]));
    /** @type {Map<string, Doc>} */
    const byName = new Map();
    docs.forEach(doc => {
        const key = getMatchKey(doc.rawTitle);
        if (!key || !doc.url) return;
        const previous = byName.get(key);
        if (!previous || doc.iso >= previous.iso) byName.set(key, doc);
    });
    return (activity) => {
        if (activity.cat !== 'publicacao') return null;
        if (activity.linkedPostKey && byKey.has(activity.linkedPostKey)) return byKey.get(activity.linkedPostKey) || null;
        return byName.get(getMatchKey(activity.rawTitle)) || similarDoc(activity, docs);
    };
};

// --- Relative labels ----------------------------------------------------------------------------

/** @param {Activity} item @param {Doc | null} doc @param {string} today */
const relativeLabel = (item, doc, today) => {
    const untilStart = diffDays(today, item.iso);
    const untilEnd = diffDays(today, item.fimIso);
    if (untilEnd < 0) {
        if (item.cat === 'prazo') return 'ENCERRADO';
        if (item.cat === 'etapa') return 'CONCLUÍDA';
        return doc ? 'PUBLICADO' : 'PREVISTO';
    }
    if (untilStart < 0) {
        if (untilEnd === 0) return 'TERMINA HOJE';
        return untilEnd === 1 ? 'TERMINA AMANHÃ' : `TERMINA EM ${untilEnd} DIAS`;
    }
    if (untilStart === 0) return 'HOJE';
    return untilStart === 1 ? 'AMANHÃ' : `EM ${untilStart} DIAS`;
};

const BADGE = { publicacao: 'pb', prazo: 'pz', etapa: 'et' };

/**
 * @param {CallView} call
 * @param {string} today
 * @returns {Cronograma}
 */
export const buildCronograma = (call, today) => {
    const findDoc = docFinder(call.docs);

    /** @type {CronoItem[]} */
    const itens = call.agenda.map(item => {
        const doc = findDoc(item);
        return {
            ...item,
            dia: item.iso.slice(8, 10),
            mes: MES[Number(item.iso.slice(5, 7)) - 1].toUpperCase(),
            catLbl: CATEGORY_LABEL[item.cat],
            bd: /** @type {'pb' | 'pz' | 'et'} */ (BADGE[item.cat]),
            quando: item.periodo ? `${ddmm(item.iso)} a ${isoToBr(item.fimIso)}` : `${SEM[weekday(item.iso)]}, ${isoToBr(item.iso)}`,
            rel: relativeLabel(item, doc, today),
            passou: item.estado === 'passou',
            futuro: item.estado === 'futuro',
            doc,
            publicado: Boolean(doc)
        };
    });

    /** @type {Record<string, CronoItem[]>} */
    const porDia = {};
    itens.forEach(item => {
        eachDay(item.iso, item.fimIso).forEach(day => { (porDia[day] = porDia[day] || []).push(item); });
    });

    const hojeItens = porDia[today] || [];
    const proximas = itens.filter(item => !item.passou);
    const todasPassaram = itens.length > 0 && proximas.length === 0;

    /** @type {Month[]} */
    const meses = [];
    const days = Object.keys(porDia).sort();
    if (days.length) {
        let year = Number(days[0].slice(0, 4));
        let month = Number(days[0].slice(5, 7)) - 1;
        const lastKey = days[days.length - 1].slice(0, 7);
        for (let guard = 0; guard < 36; guard++) {
            const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
            if (monthKey > lastKey) break;
            const blanks = new Date(Date.UTC(year, month, 1)).getUTCDay();
            const total = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
            /** @type {DayCell[]} */
            const cells = [];
            for (let i = 0; i < blanks; i++) {
                cells.push({ key: `${monthKey}-v${i}`, vazio: true, iso: '', n: '', tem: false, dots: [], publicado: false, hoje: false, cls: 'vz', aria: '', tip: [], dataBr: '', delay: '0ms', tipLeft: false });
            }
            for (let day = 1; day <= total; day++) {
                const iso = `${monthKey}-${String(day).padStart(2, '0')}`;
                const items = porDia[iso] || [];
                const position = blanks + day - 1;
                const pubs = items.filter(item => item.cat === 'publicacao');
                const done = pubs.length > 0 && pubs.every(item => item.publicado);
                /** @type {Record<string, number>} */
                const perCategory = {};
                items.forEach(item => { perCategory[item.cat] = (perCategory[item.cat] || 0) + 1; });
                const dots = [];
                Object.keys(perCategory).forEach(cat => {
                    for (let q = 0; q < Math.min(perCategory[cat], 2); q++) dots.push({ key: `${iso}${cat}${q}`, cls: cat });
                });
                cells.push({
                    key: iso,
                    vazio: false,
                    iso,
                    n: String(day),
                    tem: items.length > 0,
                    dots: dots.slice(0, 3),
                    publicado: done,
                    hoje: iso === today,
                    cls: [items.length ? 'ev' : '', iso === today ? 'hj' : '', iso < today ? 'pa' : '', done ? 'ok' : ''].filter(Boolean).join(' '),
                    aria: `${dayMonth(iso)}: ${items.length ? `${items.length} ${items.length === 1 ? 'atividade' : 'atividades'}` : 'sem atividades'}${iso === today ? ', hoje' : ''}`,
                    tip: items.map(item => ({ key: `${iso}${item.key}`, titulo: item.titulo, cls: item.cat })),
                    dataBr: isoToBr(iso),
                    delay: `${(Math.floor(position / 7) + (position % 7)) * 22}ms`,
                    tipLeft: position % 7 > 3
                });
            }
            meses.push({ key: monthKey, label: monthLabel(year, month), cells, temHoje: today.slice(0, 7) === monthKey });
            month += 1;
            if (month > 11) { month = 0; year += 1; }
        }
    }

    let mesInicial = meses.findIndex(month => month.temHoje);
    if (mesInicial < 0) mesInicial = todasPassaram ? meses.length - 1 : 0;

    const adendoDoc = call.docsRev.find(doc => doc.muda) || null;
    const nome = adendoDoc ? normalizeTitle(adendoDoc.rawTitle).replace(/nº/i, 'Nº').replace(/^adendo/i, 'Adendo') : '';

    return {
        itens,
        porDia,
        meses,
        mesInicial: Math.max(0, mesInicial),
        hojeQtd: hojeItens.length,
        sub: todasPassaram ? 'Todas as datas já passaram' : `Hoje: ${hojeItens.length} ${hojeItens.length === 1 ? 'atividade' : 'atividades'}`,
        todasPassaram,
        proximas,
        adendo: adendoDoc ? { nome, data: adendoDoc.data, url: adendoDoc.url, doc: adendoDoc } : null,
        ics: icsUrl(call.slug),
        gcal: googleCalendarUrl(call.slug)
    };
};

/**
 * @typedef {Object} Situation
 * @property {string} eyb
 * @property {string} titulo
 * @property {string} sub
 * @property {{ label: string, doc: Doc } | null} link
 * @property {CronoItem | null} proxima
 * @property {number | null} dias   days until the next step
 */

/**
 * What the "Situação" block says.
 * @param {CallView} call
 * @param {Cronograma | null} crono
 * @param {string} today
 * @returns {Situation}
 */
export const describeSituation = (call, crono, today) => {
    if (call.encerrada) {
        const eyb = call.fimIso ? `Encerrada em ${call.fim}` : 'Chamada encerrada';
        const final = call.resultadoFinal;
        if (final) {
            return { eyb, titulo: 'Resultado final publicado', sub: `${final.titulo} · ${final.data}`, link: final.url ? { label: 'Abrir o resultado final', doc: final } : null, proxima: null, dias: null };
        }
        const last = call.ultimo;
        return {
            eyb,
            titulo: 'Chamada encerrada',
            sub: last ? `Última publicação: ${last.titulo} · ${last.data}` : '',
            link: last?.url ? { label: 'Abrir a última publicação', doc: last } : null,
            proxima: null,
            dias: null
        };
    }

    const eyb = `Hoje · ${dayMonth(today)}`;
    const proxima = crono && call.proxima ? crono.itens.find(item => item.key === call.proxima?.key) || null : null;
    const dias = proxima ? diffDays(today, proxima.iso) : null;
    const atual = crono && call.atual ? crono.itens.find(item => item.key === call.atual?.key) || null : null;

    if (atual) {
        let sub;
        if (atual.hoje) {
            if (atual.cat === 'publicacao') sub = atual.doc ? 'Publicado hoje' : 'Previsto para hoje no cronograma · aguardando publicação';
            else if (atual.cat === 'prazo') sub = atual.periodo ? `Prazo do candidato · até ${shortDate(atual.fimIso)}` : 'Prazo do candidato · hoje';
            else sub = atual.periodo ? `Etapa em andamento · até ${shortDate(atual.fimIso)}` : 'Etapa prevista para hoje';
        } else if (atual.cat === 'publicacao') {
            sub = atual.doc ? `Publicado em ${atual.doc.data}` : `Previsto para ${shortDate(atual.iso)} no cronograma · aguardando publicação`;
        } else if (atual.cat === 'prazo') {
            sub = `Prazo do candidato · encerrado em ${shortDate(atual.fimIso)}`;
        } else {
            sub = `Etapa concluída em ${shortDate(atual.fimIso)}`;
        }
        return { eyb, titulo: atual.titulo, sub, link: atual.doc?.url ? { label: 'Abrir o documento', doc: atual.doc } : null, proxima, dias };
    }

    if (call.aberta) {
        return { eyb, titulo: 'Inscrições abertas', sub: `Até ${call.fimInsc}`, link: null, proxima, dias };
    }

    if (crono && crono.itens.length) {
        return { eyb, titulo: 'Chamada publicada', sub: `O cronograma começa em ${shortDate(crono.itens[0].iso)}`, link: null, proxima, dias };
    }

    const last = call.ultimo;
    return {
        eyb,
        titulo: call.status,
        sub: last ? `Última publicação: ${last.titulo} · ${last.data}` : 'Nenhuma publicação ainda.',
        link: last?.url ? { label: 'Abrir a última publicação', doc: last } : null,
        proxima: null,
        dias: null
    };
};

/** "10 de novembro" style label of today, for the "Hoje" eyebrow @param {string} today */
export const todayLabel = (today) => `${SEM[weekday(today)]}, ${dayMonth(today)} de ${today.slice(0, 4)}`;

