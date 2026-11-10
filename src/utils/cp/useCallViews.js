import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { buildCalls } from './call';
import { getToday } from './dates';

// Calls from Sanity, ready for the screens, with the situation computed for today
export const useCallViews = () => {
    const { calls, loading, error, reload } = useData();
    const today = useMemo(() => getToday(), []);
    const views = useMemo(() => buildCalls(calls, today), [calls, today]);
    return { calls: views, loading, error, reload, today };
};
