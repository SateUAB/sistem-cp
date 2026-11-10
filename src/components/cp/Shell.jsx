import React, { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from './icons';
import { prefersReducedMotion, useNav } from './navigation';
import { useScrollFlags } from './useScrollFlags';

export const ARCHIVE_URL = 'https://www.uece.br/sate/home/servicos-e-informativos/chamadas-publicas/';

const smoothTop = () => {
    try {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
    } catch {
        window.scrollTo(0, 0);
    }
};

// Thin green bar at the top that fills while the page scrolls (CSS scroll-timeline only)
export const ScrollProgress = () => <div className="sprog" aria-hidden="true" />;

export const SiteHeader = () => {
    const { scrolled } = useScrollFlags();
    const { pathname } = useLocation();
    const nav = useNav();
    const onCall = pathname.startsWith('/details/');

    const onBrand = (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        if (onCall) nav.goHome();
        else smoothTop();
    };

    return (
        <header className={`hdr${scrolled ? ' sc' : ''}`}>
            <div className="wrap">
                <a className="brand" href="/" onClick={onBrand} aria-label="Chamadas Públicas SATE, UECE · UAB: página inicial">
                    <i aria-hidden="true">SATE</i>
                    <b>Chamadas Públicas</b>
                    <span>UECE · UAB</span>
                </a>
                <nav className="hnav" aria-label="Principal">
                    <a href={ARCHIVE_URL} target="_blank" rel="noopener noreferrer">Chamadas anteriores</a>
                </nav>
            </div>
        </header>
    );
};

export const BackToTop = () => {
    const { far } = useScrollFlags();
    if (!far) return null;
    return (
        <button className="totop glass" type="button" aria-label="Voltar ao topo" onClick={smoothTop}>
            <ArrowUp />
        </button>
    );
};

// The chatbot ("Tire suas dúvidas") is a web component of its own. Its label folds while scrolling down.
// The markup only changes with the call, so the widget is not recreated on every scroll.
export const ChatWidget = () => {
    const { folded } = useScrollFlags();
    const { pathname } = useLocation();
    const holder = useRef(null);
    const editalId = pathname.startsWith('/details/')
        ? decodeURIComponent(pathname.replace('/details/', ''))
        : '';

    const markup = useMemo(() => ({
        __html: `<chamadas-publicas-widget
            api-base="https://chatbot-cp-alpha.vercel.app/api/v1"
            edital="${editalId.replace(/"/g, '&quot;')}"
          >
            <span slot="rotulo-botao" style="position: relative; top: 2px;">Tire suas dúvidas</span>
          </chamadas-publicas-widget>`
    }), [editalId]);

    useEffect(() => {
        holder.current?.classList.toggle('min', folded);
    }, [folded]);

    return <div ref={holder} className="cp-chat" dangerouslySetInnerHTML={markup} />;
};
