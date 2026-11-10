import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Archive, ArrowRight, ArrowUpRight, Calendar, Person, Search } from '../components/cp/icons';
import { callPath, prefersReducedMotion, scrollInstant, useNav } from '../components/cp/navigation';
import { ARCHIVE_URL } from '../components/cp/Shell';
import { EMPTY_FILTERS, filterCalls, filterOptions } from '../utils/cp/call';
import { useCallViews } from '../utils/cp/useCallViews';
import { trackCustomEvent } from '../utils/analytics';

// First cards come in after the title (760ms), then 70ms apart; later filter changes are quick
const FIRST_DELAY = 760;
const STEP = 70;

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Keeps the restored position while the site header settles (it shrinks once the page is scrolled, and the
// browser would compensate the 12px). Stops on its own, or as soon as the visitor scrolls or clicks.
const holdScroll = (y) => {
    if (!y) return;
    let stopped = false;
    const until = performance.now() + 500;
    const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
    const stop = () => {
        stopped = true;
        events.forEach(name => window.removeEventListener(name, stop));
    };
    events.forEach(name => window.addEventListener(name, stop, { passive: true }));
    const tick = () => {
        if (stopped) return;
        if (Math.abs(window.scrollY - y) > 1) scrollInstant(y);
        if (performance.now() < until) requestAnimationFrame(tick);
        else stop();
    };
    requestAnimationFrame(tick);
};

// Counter that climbs from 0 to the total once the data is in
const useCountUp = (target, skip) => {
    const [instant] = useState(() => skip || prefersReducedMotion());
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (instant || !target) return undefined;
        let frame;
        const start = performance.now();
        const step = (now) => {
            const k = Math.min(1, (now - start - 500) / 900);
            if (k > 0) setValue(Math.round(target * (1 - Math.pow(1 - k, 3))));
            if (k < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [target, instant]);
    return instant ? target : value;
};

const ChipGroup = ({ label, options, value, onPick, kind = 'chip' }) => (
    <div className={kind === 'chip' ? 'seg' : 'pills'} role="group" aria-label={label}>
        {options.map(option => (
            <button
                key={option}
                className={`${kind}${option === value ? ' on' : ''}`}
                type="button"
                aria-pressed={option === value}
                onClick={() => onPick(option)}
            >
                {option}
            </button>
        ))}
    </div>
);

const CallCard = ({ call, delay, onOpen }) => {
    const last = call.ultimo;
    const footer = call.nDocs
        ? `${plural(call.nDocs, 'publicação', 'publicações')}${last?.iso ? ` · última em ${last.data}` : ''}`
        : 'Nenhuma publicação ainda';

    return (
        <a
            className={`cc k1${call.encerrada ? '' : ' hot'}`}
            href={callPath(call.id)}
            onClick={(event) => onOpen(event, call)}
            style={{ animationDelay: `${delay}ms` }}
            aria-label={`Chamada pública ${call.id}: ${call.nome}. ${call.status}.`}
        >
            <div className="top">
                <span className={`st ${call.statusKey}`}><i />{call.status}</span>
                {call.curso && <span className="tag">{call.curso}</span>}
            </div>
            <div className="num mono">{call.num}{call.ano && <small>/{call.ano}</small>}</div>
            <h3>{call.nome}</h3>
            {call.atual?.hoje && (
                <div className="now"><b>Hoje</b>{call.atual.titulo}</div>
            )}
            <div className="meta">
                {call.funcao && <span><Person />{call.funcao}</span>}
                <span><Calendar />Inscrição {call.inscricao}</span>
            </div>
            <div className="ft">
                <span>{footer}</span>
                <span className="go" aria-hidden="true"><ArrowRight /></span>
            </div>
        </a>
    );
};

const LoadingCards = () => (
    <div className="grid" aria-hidden="true">
        {[0, 1, 2].map(i => (
            <div key={i} className="cc k1 ld-card" style={{ animationDelay: `${FIRST_DELAY + i * STEP}ms` }}>
                <span className="ld" style={{ width: '45%', height: 26 }} />
                <span className="ld" style={{ width: '38%', height: 44, marginTop: 8 }} />
                <span className="ld" style={{ width: '80%', height: 18 }} />
                <span className="ld" style={{ width: '60%', height: 14 }} />
            </div>
        ))}
    </div>
);

const HomePage = () => {
    const { calls, loading, error, reload } = useCallViews();
    const nav = useNav();
    const navigationType = useNavigationType();

    // Back from a call (link "Todas as chamadas", the brand or the browser's back button):
    // same filters, same scroll position, no entrance animation.
    const [back] = useState(() => {
        const info = nav.peekReturn();
        const returning = info.pending || (navigationType === 'POP' && info.hasOrigin);
        return { returning, y: returning ? info.y : 0 };
    });
    const returning = back.returning;
    const [filters, setFilters] = useState(() => nav.getFilters());
    // After the first entrance, cards that appear with a filter come in right away
    const [settled, setSettled] = useState(returning);
    const restored = useRef(false);

    useEffect(() => {
        if (settled || loading) return undefined;
        // once every card of the first cascade is in (each takes 800ms)
        const id = setTimeout(() => setSettled(true), FIRST_DELAY + calls.length * STEP + 900);
        return () => clearTimeout(id);
    }, [settled, loading, calls.length]);

    useLayoutEffect(() => {
        if (restored.current) return;
        restored.current = true;
        nav.clearReturn();
        scrollInstant(back.y);
        holdScroll(back.y);
    }, [nav, back]);

    useEffect(() => { document.title = 'Chamadas Públicas · SATE/UECE'; }, []);

    const update = (patch) => {
        const next = { ...filters, ...patch };
        setFilters(next);
        nav.saveFilters(next);
    };

    const options = useMemo(() => filterOptions(calls), [calls]);
    const list = useMemo(() => filterCalls(calls, filters), [calls, filters]);
    const ongoing = calls.filter(call => !call.encerrada).length;
    const total = useCountUp(calls.length, returning);

    const onOpen = (event, call) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        // Same event as the old "Inscreva-se" button of the card
        if (call.aberta) trackCustomEvent('clique_card_inscreva_se', { edital_id: String(call.id || '') });
        nav.openCall(call, event.currentTarget);
    };

    const delayFor = (index) => (settled ? Math.min(index, 8) * 40 : FIRST_DELAY + index * STEP);

    return (
        <main className={`wrap${returning ? ' volta' : ''}`} id="inicio">
            <section className="intro" aria-labelledby="cp-h1">
                <div>
                    <span className="who">SATE/UAB · Universidade Estadual do Ceará</span>
                    <h1 id="cp-h1">
                        <span className="ln"><span style={{ animationDelay: '120ms' }}>Chamadas</span></span>
                        <span className="ln"><span style={{ animationDelay: '240ms' }}>Públicas</span></span>
                    </h1>
                    <div className="bar" aria-hidden="true" />
                </div>
                <div className="intro-r">
                    <div className="counts" aria-live="polite">
                        <span><b className="mono">{loading ? '—' : total}</b> {calls.length === 1 ? 'chamada' : 'chamadas'}</span>
                        <span className="live"><i /><b className="mono">{loading ? '—' : ongoing}</b> em andamento</span>
                    </div>
                    <a className="arq" href={ARCHIVE_URL} target="_blank" rel="noopener noreferrer">
                        <span className="arq-i" aria-hidden="true"><Archive /></span>
                        <span className="arq-t">
                            <b>Chamadas anteriores</b>
                            <small>Seleções de 2025 e anos anteriores, no site da SATE</small>
                        </span>
                        <span className="arq-a" aria-hidden="true"><ArrowUpRight /></span>
                        <span className="sr-only">(abre em nova aba)</span>
                    </a>
                </div>
            </section>

            <div className="tools glass" role="search">
                <div className="trow">
                    <label className="search">
                        <Search />
                        <input
                            type="search"
                            placeholder="Buscar por número, cargo ou curso"
                            aria-label="Buscar chamadas"
                            value={filters.q}
                            onChange={(event) => update({ q: event.target.value })}
                        />
                    </label>
                    <ChipGroup label="Situação" options={options.status} value={filters.status} onPick={(status) => update({ status })} />
                    {options.cursos.length > 1 && (
                        <ChipGroup label="Tipo de curso" options={options.cursos} value={filters.curso} onPick={(curso) => update({ curso })} />
                    )}
                </div>
                {options.funcoes.length > 1 && (
                    <ChipGroup label="Função" kind="pill" options={options.funcoes} value={filters.funcao} onPick={(funcao) => update({ funcao })} />
                )}
            </div>

            {loading && <LoadingCards />}

            {!loading && error && calls.length === 0 && (
                <div className="empty glass" role="alert">
                    <p style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 600 }}>Não foi possível carregar as chamadas agora.</p>
                    <button className="btn btn-g" type="button" onClick={reload}>Tentar de novo</button>
                </div>
            )}

            {!loading && list.length > 0 && (
                <div className="grid">
                    {list.map((call, index) => (
                        <CallCard key={call.id} call={call} delay={delayFor(index)} onOpen={onOpen} />
                    ))}
                </div>
            )}

            {!loading && !error && list.length === 0 && (
                <div className="empty glass">
                    <p style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 600 }}>
                        {calls.length ? 'Nenhuma chamada com esses filtros.' : 'Nenhuma chamada publicada.'}
                    </p>
                    {calls.length > 0 && (
                        <button className="btn btn-g" type="button" onClick={() => update(EMPTY_FILTERS)}>Limpar filtros</button>
                    )}
                </div>
            )}

            <footer className="foot">
                <div><b>SATE · Secretaria de Apoio às Tecnologias Educacionais</b>Universidade Estadual do Ceará</div>
                <div><b>Dúvidas</b><a href="mailto:cp.sate@uece.br">cp.sate@uece.br</a></div>
            </footer>
        </main>
    );
};

export default HomePage;
