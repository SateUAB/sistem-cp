import { useCallback, useSyncExternalStore } from 'react';

// Tracks a CSS media query, e.g. useMediaQuery('(min-width: 1024px)')
export const useMediaQuery = (query) => {
    const subscribe = useCallback((onChange) => {
        const mediaQuery = window.matchMedia(query);
        mediaQuery.addEventListener('change', onChange);
        return () => mediaQuery.removeEventListener('change', onChange);
    }, [query]);

    return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
};
