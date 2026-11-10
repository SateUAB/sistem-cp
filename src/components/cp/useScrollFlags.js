import { useEffect, useState } from 'react';

const readFlags = (lastY, previous) => {
    const y = window.scrollY || 0;
    const down = y > lastY + 2 && y > 280;
    const up = y < lastY - 2;
    return {
        y,
        // header shrinks and gets a shadow
        scrolled: y > 24,
        // "back to top" button
        far: y > 700,
        // chatbot label folds while going down, comes back when going up
        folded: down ? true : up ? false : previous.folded
    };
};

// Scroll state shared by the header, the chatbot and the "back to top" button (one update per frame)
export const useScrollFlags = () => {
    const [flags, setFlags] = useState(() => {
        const y = typeof window === 'undefined' ? 0 : window.scrollY || 0;
        return { scrolled: y > 24, far: y > 700, folded: false };
    });

    useEffect(() => {
        let lastY = window.scrollY || 0;
        let ticking = false;
        let current = { scrolled: lastY > 24, far: lastY > 700, folded: false };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                ticking = false;
                const next = readFlags(lastY, current);
                lastY = next.y;
                if (next.scrolled !== current.scrolled || next.far !== current.far || next.folded !== current.folded) {
                    current = { scrolled: next.scrolled, far: next.far, folded: next.folded };
                    setFlags(current);
                }
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return flags;
};
