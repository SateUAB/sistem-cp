// @ts-check
// Texts of the public site: titles typed in CAPS become sentences, and every post gets a type.

/** Acronyms and words that keep their own spelling */
const KEEP = { uab: 'UAB', uece: 'UECE', ead: 'EaD', tcc: 'TCC', sate: 'SATE', capes: 'CAPES', funece: 'FUNECE', on: 'on' };

/** Proper names, matched after everything is lower case (longest first) */
const PROPER = [
    ['programa universidade aberta do brasil', 'Programa Universidade Aberta do Brasil'],
    ['universidade aberta do brasil', 'Universidade Aberta do Brasil'],
    ['universidade estadual do ceará', 'Universidade Estadual do Ceará'],
    ['administração pública', 'Administração Pública'],
    ['ciências contábeis', 'Ciências Contábeis'],
    ['turismo comunitário', 'Turismo Comunitário'],
    ['curso de formação em ead', 'Curso de Formação em EaD'],
    ['tecnólogo', 'Tecnólogo']
];

const WORD = /[a-zà-öø-ÿ]+/gi;

/** @param {string} text */
const applyProperNames = (text) => {
    let result = text;
    PROPER.forEach(([from, to]) => { result = result.split(from).join(to); });
    return result.replace(/curso de formação em EaD/gi, 'Curso de Formação em EaD');
};

/** @param {string} text */
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * "SELEÇÃO DE PROFESSORES REGENTES – ORIENTADOR DE TCC" -> "Seleção de professores regentes – orientador de TCC".
 * Keeps UAB, UECE, EaD, TCC, SATE, CAPES, nº and the proper names above.
 * @param {string | null | undefined} title
 */
export const normalizeTitle = (title) => {
    let text = (title || '').trim().toLowerCase().replace(/\s+/g, ' ').replace(/[\s,;:]+$/, '');
    text = text.replace(WORD, (word) => KEEP[/** @type {keyof typeof KEEP} */ (word)] || word);
    return capitalize(applyProperNames(text));
};

/**
 * Name for cards and the page title when the call has no `shortTitle`: the normalized official title without
 * the institutional ending ("… do sistema Universidade Aberta do Brasil (UAB) na UECE").
 * The full title stays on the page as "Título oficial".
 * @param {string} title normalized title
 */
export const shortenTitle = (title) => {
    const short = title
        .replace(/\s+(?:para (?:os )?cursos\s+)?(?:para atuar\s+)?(?:n|d)[oa]s?\s+(?:sistema\s+|programa\s+)?universidade aberta do brasil\b.*$/i, '')
        .replace(/^chamada pública para\s+/i, '')
        .trim();
    return short.length >= 12 ? capitalize(short) : title;
};

/**
 * For running text that mixes cases: only the words written in CAPS are lowered.
 * @param {string} text
 */
const lowerCapsWords = (text) => applyProperNames(
    text
        .replace(/\(A\)/g, '(a)')
        .replace(WORD, (word) => {
            const lower = word.toLowerCase();
            if (KEEP[/** @type {keyof typeof KEEP} */ (lower)]) return KEEP[/** @type {keyof typeof KEEP} */ (lower)];
            return word.length > 1 && word === word.toUpperCase() ? lower : word;
        })
);

const SUMMARY_MAX = 340;

/**
 * Short text for "Sobre a chamada", taken from the official description: what comes after "torna pública",
 * up to "de acordo com…" / "considerando…". Falls back to the first sentence.
 * @param {string | null | undefined} description
 */
export const extractSummary = (description) => {
    const text = (description || '').replace(/\s+/g, ' ').trim();
    if (!text) return '';

    const after = /torna\s+p[úu]blic[ao]s?\s+(.+)/i.exec(text);
    let summary = after ? after[1] : text.split(/(?<=\.)\s+(?=[A-ZÀ-Ý])/)[0];
    summary = summary
        .replace(/^(a|o|as|os)\s+/i, '')
        .split(/,\s*(?:,\s*)?(?:de acordo com|considerando|conforme)\b/i)[0]
        .replace(/[\s,;:.]+$/, '')
        .trim();
    summary = capitalize(lowerCapsWords(summary));

    if (summary.length > SUMMARY_MAX) {
        summary = `${summary.slice(0, summary.lastIndexOf(' ', SUMMARY_MAX - 10))}…`;
        return summary;
    }
    return summary ? `${summary}.` : '';
};

/** @typedef {'Edital' | 'Resultado' | 'Adendo' | 'Retificação' | 'Comunicado' | 'Convocação' | 'Cronograma' | 'Formulário' | 'Orientação'} PubKind */

/**
 * Type of a post, from its title.
 * @param {string | null | undefined} title
 * @returns {PubKind}
 */
export const publicationKind = (title) => {
    const text = (title || '').toLowerCase();
    if (/adendo/.test(text)) return 'Adendo';
    if (/retific/.test(text)) return 'Retificação';
    if (/comunicado/.test(text)) return 'Comunicado';
    if (/convoca/.test(text)) return 'Convocação';
    if (/edital/.test(text)) return 'Edital';
    if (/cronograma/.test(text)) return 'Cronograma';
    if (/resultado|lista|reesultado/.test(text)) return 'Resultado';
    if (/formulário|formulario/.test(text)) return 'Formulário';
    return 'Orientação';
};

/** Order of the type filters in "Publicações" */
export const KIND_ORDER = /** @type {PubKind[]} */ (['Edital', 'Resultado', 'Adendo', 'Retificação', 'Comunicado', 'Convocação', 'Cronograma', 'Orientação', 'Formulário']);
