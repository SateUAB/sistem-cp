// @ts-check
// A call as the public site shows it, built from the Sanity document.
// The situation comes from the dates and today's date, never from the `status` field, which goes stale.
import { MES, brToIso, isIso, isoToBr, shortDate } from './dates.js';
import { KIND_ORDER, extractSummary, normalizeTitle, publicationKind, shortenTitle } from './text.js';

/**
 * Call as returned by the GROQ query in DataContext.
 * @typedef {Object} RawCall
 * @property {string} id                         editalNumber, "79/2026"
 * @property {string} [title]
 * @property {string} [shortTitle]               optional field: name for cards and the page title
 * @property {string} [summary]                  optional field: text of "Sobre a chamada"
 * @property {string} [description]
 * @property {string} [type]                     function: Professor, Tutor…
 * @property {string} [courseType]
 * @property {string} [status]                   only a fallback when the call has no end date
 * @property {string} [subscriptionLink]
 * @property {string} [appealLink]
 * @property {string} [publicationDate]          aaaa-mm-dd
 * @property {string} [startDate]                dd/mm/aaaa
 * @property {string} [subscriptionEndDate]      dd/mm/aaaa
 * @property {string} [endDate]                  dd/mm/aaaa
 * @property {RawScheduleItem[] | null} [schedule]
 * @property {RawPost[] | null} [timeline]
 */

/**
 * @typedef {Object} RawScheduleItem
 * @property {string} [_key]
 * @property {string} [title]
 * @property {string} [category]                 publicacao | prazo | etapa
 * @property {string} [startDate]                aaaa-mm-dd
 * @property {string | null} [endDate]           aaaa-mm-dd
 * @property {string | null} [linkedPostKey]     optional field: _key of the post published for this item
 */

/**
 * @typedef {Object} RawPost
 * @property {string} [_key]
 * @property {string} [date]                     dd/mm/aaaa
 * @property {string} [title]
 * @property {string} [url]
 * @property {boolean} [changesSchedule]
 */

/** @typedef {import('./text.js').PubKind} PubKind */
/** @typedef {'aberta' | 'andamento' | 'encerrada'} StatusKey */
/** @typedef {'publicacao' | 'prazo' | 'etapa'} Category */

/**
 * @typedef {Object} Doc
 * @property {string} key
 * @property {string | null} sanityKey
 * @property {string} iso         '' when the post has no valid date
 * @property {string} data        dd/mm/aaaa
 * @property {string} dia         '19'
 * @property {string} mes         'out'
 * @property {string} titulo      normalized title
 * @property {string} rawTitle
 * @property {string | null} url
 * @property {PubKind} tipo
 * @property {boolean} muda       changes the schedule
 * @property {boolean} retificado
 * @property {'PDF' | 'Link'} ext
 */

/**
 * @typedef {Object} Activity
 * @property {string} key
 * @property {string} iso
 * @property {string} fimIso      same as iso for a single day
 * @property {boolean} periodo
 * @property {string} titulo
 * @property {string} rawTitle
 * @property {Category} cat
 * @property {string | null} linkedPostKey
 * @property {'passou' | 'hoje' | 'futuro'} estado
 * @property {boolean} hoje       today is inside the activity
 */

/**
 * @typedef {Object} CallView
 * @property {RawCall} raw
 * @property {string} id
 * @property {string} num
 * @property {string} ano
 * @property {string} slug        "79-2026", used by the calendar feed
 * @property {string} titulo      official title, normalized
 * @property {string} nome        short name (shortTitle or the official title)
 * @property {string} resumo
 * @property {string} descricao   full official text
 * @property {string} funcao
 * @property {string} curso
 * @property {StatusKey} statusKey
 * @property {string} status
 * @property {boolean} aberta
 * @property {boolean} andamento
 * @property {boolean} encerrada
 * @property {string | null} pubIso
 * @property {string} pub
 * @property {string} inicio
 * @property {string} fimInsc
 * @property {string} fim
 * @property {string | null} fimIso
 * @property {string} inscricao   "20 out – 29 out"
 * @property {string | null} insc
 * @property {string | null} rec
 * @property {Doc[]} docs         oldest first
 * @property {Doc[]} docsRev      most recent first
 * @property {number} nDocs
 * @property {number} mudancas    adendos and posts that changed the schedule
 * @property {Doc | null} ultimo
 * @property {Doc | null} edital
 * @property {Doc[]} adendos      most recent first
 * @property {Doc | null} resultadoFinal
 * @property {Activity[]} agenda  sorted by date
 * @property {boolean} temAgenda
 * @property {Activity | null} atual
 * @property {Activity | null} proxima
 * @property {number} progresso   % of schedule dates already started (100 when closed)
 * @property {string} busca       lower case, no accents: what the search box looks into
 */

export const STATUS_LABEL = { aberta: 'Inscrições abertas', andamento: 'Em andamento', encerrada: 'Encerrada' };
export const CATEGORY_LABEL = { publicacao: 'Publicação', prazo: 'Prazo do candidato', etapa: 'Etapa' };
const CATEGORIES = ['publicacao', 'prazo', 'etapa'];

/** @param {string} text */
export const searchable = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Sort that keeps the order of the CMS for equal keys.
 * @template T
 * @param {T[]} list
 * @param {(item: T) => string} key
 */
const stableSort = (list, key) => list
    .map((item, index) => ({ item, index }))
    .sort((a, b) => key(a.item).localeCompare(key(b.item)) || a.index - b.index)
    .map(({ item }) => item);

/** @param {string} callId @returns {(post: RawPost, index: number) => Doc} */
const toDoc = (callId) => (post, index) => {
    const iso = brToIso(post?.date) || '';
    const rawTitle = (post?.title || '').trim();
    const url = post?.url || null;
    return {
        key: `${callId}-d${index}`,
        sanityKey: post?._key || null,
        iso,
        data: iso ? isoToBr(iso) : (post?.date || '—'),
        dia: iso ? iso.slice(8, 10) : '—',
        mes: iso ? MES[Number(iso.slice(5, 7)) - 1] : '',
        titulo: normalizeTitle(rawTitle) || 'Publicação sem título',
        rawTitle,
        url,
        tipo: publicationKind(rawTitle),
        muda: Boolean(post?.changesSchedule),
        retificado: /retific/i.test(rawTitle),
        ext: url && /\.pdf(?:$|[?#])/i.test(url) ? 'PDF' : 'Link'
    };
};

/** @param {string} callId @param {string} today @returns {(item: RawScheduleItem, index: number) => Activity | null} */
const toActivity = (callId, today) => (item, index) => {
    const iso = item?.startDate;
    const rawTitle = (item?.title || '').trim();
    if (!isIso(iso) || !rawTitle) return null;
    const start = /** @type {string} */ (iso);
    const fimIso = isIso(item.endDate) && /** @type {string} */ (item.endDate) > start ? /** @type {string} */ (item.endDate) : start;
    const estado = fimIso < today ? 'passou' : start <= today ? 'hoje' : 'futuro';
    return {
        key: item._key || `${callId}-a${index}`,
        iso: start,
        fimIso,
        periodo: fimIso !== start,
        titulo: normalizeTitle(rawTitle),
        rawTitle,
        cat: /** @type {Category} */ (CATEGORIES.includes(item.category || '') ? item.category : 'publicacao'),
        linkedPostKey: item.linkedPostKey || null,
        estado,
        hoje: estado === 'hoje'
    };
};

/**
 * @param {RawCall} raw
 * @param {string} today aaaa-mm-dd
 * @returns {CallView}
 */
export const buildCall = (raw, today) => {
    const id = String(raw.id || '').trim();
    const [num = id, ano = ''] = id.split('/');

    const docs = stableSort((raw.timeline || []).filter(Boolean).map(toDoc(id)), doc => doc.iso);
    const docsRev = docs.slice().reverse();
    const agenda = stableSort(
        /** @type {Activity[]} */ ((raw.schedule || []).map(toActivity(id, today)).filter(Boolean)),
        item => item.iso
    );

    const pubIso = isIso(raw.publicationDate) ? /** @type {string} */ (raw.publicationDate) : null;
    const iniIso = brToIso(raw.startDate);
    const fimInscIso = brToIso(raw.subscriptionEndDate);
    const lastAgenda = agenda.reduce((last, item) => (item.fimIso > last ? item.fimIso : last), '');
    const fimIso = brToIso(raw.endDate) || lastAgenda || null;

    const inscStart = iniIso || pubIso;
    const aberta = Boolean(fimInscIso) && (!inscStart || today >= inscStart) && today <= /** @type {string} */ (fimInscIso);
    const andamento = !aberta && (fimIso ? today <= fimIso : raw.status !== 'Encerrado');
    /** @type {StatusKey} */
    const statusKey = aberta ? 'aberta' : andamento ? 'andamento' : 'encerrada';

    let atual = null;
    let proxima = null;
    agenda.forEach(item => {
        if (item.iso <= today) atual = item;
        else if (!proxima) proxima = item;
    });
    const started = agenda.filter(item => item.iso <= today).length;

    const titulo = normalizeTitle(raw.title) || `Chamada Pública ${id}`;
    const nome = (raw.shortTitle || '').trim() || shortenTitle(titulo);
    const funcao = (raw.type || '').trim();
    const curso = (raw.courseType || '').trim();
    const adendos = docsRev.filter(doc => doc.tipo === 'Adendo');

    let inscricao = '—';
    if (iniIso && fimInscIso) inscricao = `${shortDate(iniIso)} – ${shortDate(fimInscIso)}`;
    else if (iniIso) inscricao = `a partir de ${shortDate(iniIso)}`;
    else if (fimInscIso) inscricao = `até ${shortDate(fimInscIso)}`;

    return {
        raw,
        id,
        num,
        ano,
        slug: id.replace('/', '-'),
        titulo,
        nome,
        resumo: (raw.summary || '').trim() || extractSummary(raw.description),
        descricao: (raw.description || '').trim(),
        funcao,
        curso,
        statusKey,
        status: STATUS_LABEL[statusKey],
        aberta,
        andamento,
        encerrada: statusKey === 'encerrada',
        pubIso,
        pub: isoToBr(pubIso),
        inicio: isoToBr(iniIso),
        fimInsc: isoToBr(fimInscIso),
        fim: isoToBr(fimIso),
        fimIso,
        inscricao,
        insc: raw.subscriptionLink || null,
        rec: raw.appealLink || null,
        docs,
        docsRev,
        nDocs: docs.length,
        mudancas: docs.filter(doc => doc.tipo === 'Adendo' || doc.muda).length,
        ultimo: docs[docs.length - 1] || null,
        edital: docs.find(doc => doc.tipo === 'Edital') || null,
        adendos,
        resultadoFinal: docsRev.find(doc => /resultado final/i.test(doc.titulo) && !/preliminar/i.test(doc.titulo)) || null,
        agenda,
        temAgenda: agenda.length > 0,
        atual,
        proxima,
        progresso: statusKey === 'encerrada' ? 100 : agenda.length ? Math.round((started / agenda.length) * 100) : 50,
        busca: searchable([id, nome, titulo, funcao, curso].join(' '))
    };
};

/**
 * @param {RawCall[]} list
 * @param {string} today
 */
export const buildCalls = (list, today) => (list || []).filter(call => call?.id).map(call => buildCall(call, today));

/** @typedef {{ q: string, funcao: string, curso: string, status: string }} Filters */

export const ALL_FUNCOES = 'Todas';
export const ALL_CURSOS = 'Todos';
export const ALL_STATUS = 'Todas';
export const STATUS_FILTERS = [ALL_STATUS, 'Em andamento', 'Encerrada'];

/** @type {Filters} */
export const EMPTY_FILTERS = { q: '', funcao: ALL_FUNCOES, curso: ALL_CURSOS, status: ALL_STATUS };

const FUNCAO_ORDER = ['Professor', 'Tutor', 'Mediador Pedagógico', 'Coordenador', 'Assistente Pedagógico', 'Assistente à Docência', 'Apoio Administrativo', 'Aluno'];
const CURSO_ORDER = ['Graduação', 'Especialização', 'Extensão', 'Outros'];

/** @param {string[]} values @param {string[]} order */
const ordered = (values, order) => [...new Set(values.filter(Boolean))].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia >= 0 || ib >= 0) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    return a.localeCompare(b, 'pt-BR');
});

/** Filter options that exist in the data @param {CallView[]} calls */
export const filterOptions = (calls) => ({
    funcoes: [ALL_FUNCOES, ...ordered(calls.map(call => call.funcao), FUNCAO_ORDER)],
    cursos: [ALL_CURSOS, ...ordered(calls.map(call => call.curso), CURSO_ORDER)],
    status: STATUS_FILTERS
});

/**
 * @param {CallView[]} calls
 * @param {Filters} filters
 */
export const filterCalls = (calls, { q, funcao, curso, status }) => {
    const words = searchable(q || '').trim().split(/\s+/).filter(Boolean);
    return calls.filter(call => {
        if (funcao && funcao !== ALL_FUNCOES && call.funcao !== funcao) return false;
        if (curso && curso !== ALL_CURSOS && call.curso !== curso) return false;
        if (status === 'Em andamento' && call.encerrada) return false;
        if (status === 'Encerrada' && !call.encerrada) return false;
        return words.every(word => call.busca.includes(word));
    });
};

/** Types present in the posts, in the order of the filters @param {Doc[]} docs */
export const docKinds = (docs) => KIND_ORDER.filter(kind => docs.some(doc => doc.tipo === kind));
