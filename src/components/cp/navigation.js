import { createContext, useContext } from 'react';

// Shared by the "Expandir card" transition (NavProvider) and the pages
export const NavContext = createContext(null);
export const useNav = () => useContext(NavContext);

export const prefersReducedMotion = () => typeof window !== 'undefined'
    && Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

// Jump without the smooth scrolling of the page
export const scrollInstant = (top) => {
    try {
        window.scrollTo({ top, left: 0, behavior: 'instant' });
    } catch {
        window.scrollTo(0, top);
    }
};

export const callPath = (id) => `/details/${encodeURIComponent(id)}`;
