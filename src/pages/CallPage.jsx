import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft } from '../components/cp/icons';
import { prefersReducedMotion, scrollInstant, useNav } from '../components/cp/navigation';
import CallHeader from '../components/cp/call/CallHeader';
import ResumoTab from '../components/cp/call/ResumoTab';
import CronogramaTab from '../components/cp/call/CronogramaTab';
import PublicacoesTab from '../components/cp/call/PublicacoesTab';
import AjudaTab from '../components/cp/call/AjudaTab';
import { buildCronograma, describeSituation } from '../utils/cp/cronograma';
import { useCallViews } from '../utils/cp/useCallViews';

const TAB_NAMES = ['Resumo', 'Cronograma', 'Publicações', 'Ajuda'];
const HEADER_HEIGHT = 57;

const safeDecode = (value) => {
    try {
        return decodeURIComponent(value || '');
    } catch {
        return value || '';
    }
};

const BackLink = () => {
    const nav = useNav();
    const onClick = (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        nav.goHome();
    };
    return (
        <a className="bk" href="/" onClick={onClick}>
            <ArrowLeft />Todas as chamadas
        </a>
    );
};

// Menus fixed under the site header; a green indicator slides to the active one
const CallTabs = ({ call, crono, today }) => {
    const [tab, setTab] = useState(0);
    const [direction, setDirection] = useState('fr');
    const anchor = useRef(null);
    const navEl = useRef(null);
    const indicator = useRef(null);
    const buttons = useRef([]);

    const situation = useMemo(() => describeSituation(call, crono, today), [call, crono, today]);
    const counts = [null, call.temAgenda && crono ? crono.itens.length : null, call.nDocs, null];

    const place = useCallback(() => {
        const button = buttons.current[tab];
        if (!button || !indicator.current) return;
        indicator.current.style.width = `${button.offsetWidth}px`;
        indicator.current.style.transform = `translateX(${button.offsetLeft}px)`;
    }, [tab]);

    useLayoutEffect(() => {
        // First placement after the fonts settle, so the indicator slides in from the left
        const id = setTimeout(place, 60);
        return () => clearTimeout(id);
    }, [place]);

    useEffect(() => {
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(place);
        if (observer && navEl.current) observer.observe(navEl.current);
        document.fonts?.ready?.then(place);
        window.addEventListener('resize', place);
        return () => {
            observer?.disconnect();
            window.removeEventListener('resize', place);
        };
    }, [place]);

    const go = (next, focus = false) => {
        if (next === tab) return;
        setDirection(next > tab ? 'fr' : 'fl');
        setTab(next);
        if (focus) buttons.current[next]?.focus();
        // Below the menus: go back to the top of the content
        const top = anchor.current ? anchor.current.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT : 0;
        if (window.scrollY > top + 1) {
            try {
                window.scrollTo({ top, behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
            } catch {
                window.scrollTo(0, top);
            }
        }
    };

    const onKeyDown = (event) => {
        const last = TAB_NAMES.length - 1;
        const moves = { ArrowRight: tab === last ? 0 : tab + 1, ArrowLeft: tab === 0 ? last : tab - 1, Home: 0, End: last };
        if (!(event.key in moves)) return;
        event.preventDefault();
        go(moves[event.key], true);
    };

    return (
        <div>
            <div ref={anchor} aria-hidden="true" />
            <nav className="tabs2" role="tablist" aria-label="Seções da chamada" ref={navEl} onKeyDown={onKeyDown}>
                <span className="tind" ref={indicator} aria-hidden="true" />
                {TAB_NAMES.map((name, i) => (
                    <button
                        key={name}
                        ref={(el) => { buttons.current[i] = el; }}
                        className={tab === i ? 'on' : ''}
                        type="button"
                        role="tab"
                        id={`aba-${i}`}
                        aria-selected={tab === i}
                        aria-controls={`painel-${i}`}
                        tabIndex={tab === i ? 0 : -1}
                        onClick={() => go(i)}
                    >
                        {name}
                        {counts[i] !== null && <span>{counts[i]}</span>}
                    </button>
                ))}
            </nav>

            <div className={`pane2 ${direction}`} role="tabpanel" id={`painel-${tab}`} aria-labelledby={`aba-${tab}`} key={tab}>
                {tab === 0 && <ResumoTab call={call} situation={situation} onGo={(i) => go(i)} />}
                {tab === 1 && <CronogramaTab call={call} crono={crono} onGo={(i) => go(i)} />}
                {tab === 2 && <PublicacoesTab call={call} />}
                {tab === 3 && <AjudaTab call={call} />}
            </div>
        </div>
    );
};

const LoadingHeader = () => (
    <div className="hx hx5" aria-hidden="true">
        <div className="hx5-l">
            <span className="ld" style={{ width: 140, height: 14 }} />
            <span className="ld" style={{ width: 220, height: 120, borderRadius: 18 }} />
            <span className="ld" style={{ width: 120, height: 26, borderRadius: 999 }} />
        </div>
        <div className="hx5-r">
            <span className="ld" style={{ display: 'block', width: '70%', height: 52 }} />
            <span className="ld" style={{ display: 'block', width: '50%', height: 16, marginTop: 18 }} />
            <span className="ld" style={{ display: 'block', width: 180, height: 44, marginTop: 28, borderRadius: 999 }} />
        </div>
    </div>
);

const CallPage = () => {
    const { id } = useParams();
    const callId = safeDecode(id);
    const { calls, loading, error, reload, today } = useCallViews();
    const nav = useNav();
    const call = calls.find(item => item.id === callId) || null;
    const crono = useMemo(() => (call?.temAgenda ? buildCronograma(call, today) : null), [call, today]);

    // A call always opens at the top (the list keeps its own position)
    useLayoutEffect(() => { scrollInstant(0); }, [callId]);

    useEffect(() => {
        document.title = call ? `Chamada Pública ${call.id} · SATE/UECE` : 'Chamada Pública · SATE/UECE';
    }, [call]);

    if (!call && loading) {
        return (
            <div className="wrap dv ab s-colunas">
                <BackLink />
                <LoadingHeader />
                <p className="sr-only" role="status">Carregando a chamada…</p>
            </div>
        );
    }

    if (!call) {
        return (
            <div className="wrap dv ab s-colunas">
                <BackLink />
                <div className="msg" role={error ? 'alert' : undefined}>
                    <span className="eyb">Chamada pública {callId}</span>
                    <h1>{error ? 'Não foi possível carregar esta chamada' : 'Chamada pública não encontrada'}</h1>
                    <p>{error ? 'Verifique sua conexão e tente de novo.' : 'O endereço pode estar incompleto ou a chamada ainda não foi publicada neste site.'}</p>
                    {error
                        ? <button className="btn btn-p" type="button" onClick={reload}>Tentar de novo</button>
                        : <button className="btn btn-p" type="button" onClick={() => nav.goHome()}>Ver todas as chamadas</button>}
                </div>
            </div>
        );
    }

    return (
        <div className={`wrap dv ab s-colunas ${nav.enterClass}`.trim()} key={call.id}>
            <BackLink />
            <CallHeader call={call} />
            <CallTabs call={call} crono={crono} today={today} />
        </div>
    );
};

export default CallPage;
