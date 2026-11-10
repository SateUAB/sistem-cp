import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EMPTY_FILTERS } from '../../utils/cp/call';
import { NavContext, callPath, prefersReducedMotion, scrollInstant } from './navigation';

// "Expandir card": opening a call grows a panel from the clicked card to the whole screen; going back
// shrinks it to the same card, with the list scrolled where it was. Durations follow the approved prototype.
const OPEN_MS = 560;
const OPEN_FADE_MS = 560;
const COVER_MS = 200;
const SHRINK_MS = 540;
const OUT_MS = 380;

const GREEN = '#0A6A59';
const WHITE = '#FFFFFF';

const toBox = (rect, color) => ({
    t: `${rect.top}px`, l: `${rect.left}px`, w: `${rect.width}px`, h: `${rect.height}px`, c: color
});

const NavProvider = ({ children }) => {
    const navigate = useNavigate();
    const [panel, setPanel] = useState(null);
    const [enterClass, setEnterClass] = useState('');
    const timers = useRef([]);
    // Card the call was opened from, and where the list was scrolled
    const origin = useRef(null);
    // Set by "back": the list restores `y` and skips its entrance animation
    const homeReturn = useRef({ pending: false, y: 0 });
    // Filters of the list survive a visit to a call
    const filters = useRef(EMPTY_FILTERS);

    const clearTimers = () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    };
    const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };

    useEffect(() => {
        // The list restores its own scroll position
        if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
        return clearTimers;
    }, []);

    const openCall = useCallback((call, element) => {
        clearTimers();
        let rect = null;
        if (element?.getBoundingClientRect) {
            const box = element.getBoundingClientRect();
            rect = { top: box.top, left: box.left, width: box.width, height: box.height };
        }
        const color = call.encerrada ? WHITE : GREEN;
        origin.current = { rect, color, y: window.scrollY || 0 };
        const to = callPath(call.id);

        if (prefersReducedMotion() || !rect) {
            setPanel(null);
            setEnterClass('');
            navigate(to);
            scrollInstant(0);
            return;
        }

        const box = toBox(rect, color);
        setPanel({ phase: 't1', ...box });
        later(() => {
            navigate(to);
            scrollInstant(0);
            setEnterClass('en-1');
            setPanel({ phase: 't1 out', ...box });
            later(() => {
                setPanel(null);
                setEnterClass('');
            }, OPEN_FADE_MS);
        }, OPEN_MS);
    }, [navigate]);

    const goHome = useCallback(() => {
        clearTimers();
        const from = origin.current;
        homeReturn.current = { pending: Boolean(from), y: from?.y || 0 };

        if (prefersReducedMotion() || !from?.rect) {
            setPanel(null);
            setEnterClass('');
            navigate('/');
            return;
        }

        const box = toBox(from.rect, from.color);
        setPanel({ phase: 't1b', ...box });
        later(() => {
            navigate('/');
            setPanel({ phase: 't1b shrink', ...box });
            later(() => {
                setPanel({ phase: 't1b out', ...box });
                later(() => setPanel(null), OUT_MS);
            }, SHRINK_MS);
        }, COVER_MS);
    }, [navigate]);

    // The list asks, once, whether it is being returned to (and where it was scrolled)
    const peekReturn = useCallback(() => ({
        pending: homeReturn.current.pending,
        y: homeReturn.current.pending ? homeReturn.current.y : origin.current?.y || 0,
        hasOrigin: Boolean(origin.current)
    }), []);
    const clearReturn = useCallback(() => { homeReturn.current = { pending: false, y: 0 }; }, []);
    const getFilters = useCallback(() => filters.current, []);
    const saveFilters = useCallback((next) => { filters.current = next; }, []);

    const value = useMemo(
        () => ({ openCall, goHome, enterClass, peekReturn, clearReturn, getFilters, saveFilters }),
        [openCall, goHome, enterClass, peekReturn, clearReturn, getFilters, saveFilters]
    );

    const panelClass = panel
        ? `tr ${panel.phase}${panel.phase.startsWith('t1b') && panel.c === WHITE ? ' w' : ''}`
        : '';

    return (
        <NavContext.Provider value={value}>
            {children}
            {panel && (
                <div
                    className={panelClass}
                    style={{ '--t': panel.t, '--l': panel.l, '--w': panel.w, '--h': panel.h, '--c': panel.c }}
                    aria-hidden="true"
                />
            )}
        </NavContext.Provider>
    );
};

export default NavProvider;
