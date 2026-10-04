import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MotionConfig, motion } from 'framer-motion';
import { CalendarDays, X } from 'lucide-react';
import { getInitialMonth, getItemStatus, getMonthRange, isItemOnDay } from '../../utils/schedule';
import ActivityList from './ActivityList';
import MonthGrid from './MonthGrid';
import ScheduleSource from './ScheduleSource';
import SubscribeActions from './SubscribeActions';

// Full calendar: the month on the left and, beside it, the activities
const ScheduleModal = ({ call, items, today, source, highlightedKeys, onClose }) => {
    const { first, last } = getMonthRange(items);

    const [month, setMonth] = useState(() => getInitialMonth(items, today));
    const [selectedDay, setSelectedDay] = useState(null);

    const panelRef = useRef(null);
    const closeButtonRef = useRef(null);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeButtonRef.current?.focus();
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
            if (event.key !== 'Tab') return;

            // Keep keyboard focus inside the dialog
            const focusable = panelRef.current.querySelectorAll('a[href], button:not([disabled])');
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const changeMonth = (nextMonth) => {
        setMonth(nextMonth);
        setSelectedDay(null);
    };

    // Beside the calendar: the day the candidate clicked or, by default, everything still to come
    const listedItems = selectedDay
        ? items.filter(item => isItemOnDay(item, selectedDay))
        : items.filter(item => getItemStatus(item, today) !== 'past');

    return createPortal(
        <MotionConfig reducedMotion="user">
            <div
                className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center sm:p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="schedule-modal-title"
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    ref={panelRef}
                    initial={{ opacity: 0, y: 40, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24, scale: 0.97 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                    className="relative w-full sm:max-w-4xl max-h-[92dvh] sm:max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="relative flex items-center justify-between gap-4 px-5 sm:px-6 py-4 bg-gradient-to-r from-uece-green to-green-700 text-white overflow-hidden">
                        <div className="absolute -top-12 right-16 w-36 h-36 rounded-full bg-white/10"></div>
                        <div className="relative flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-white/15">
                                <CalendarDays className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 id="schedule-modal-title" className="text-lg font-bold leading-tight">Cronograma</h2>
                                <p className="text-sm text-green-100">Chamada Pública {call.id}</p>
                            </div>
                        </div>
                        <button
                            ref={closeButtonRef}
                            type="button"
                            onClick={onClose}
                            aria-label="Fechar cronograma"
                            className="relative p-2 -mr-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 hover:rotate-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all duration-300"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Calendar and, beside it, the activities */}
                    <div className="flex-grow min-h-0 overflow-y-auto md:grid md:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]">
                        <div className="p-5 sm:p-6">
                            <div className="mb-4">
                                <ScheduleSource source={source} />
                            </div>
                            <MonthGrid
                                items={items}
                                month={month}
                                firstMonth={first}
                                lastMonth={last}
                                onMonthChange={changeMonth}
                                selectedDay={selectedDay}
                                onSelectDay={setSelectedDay}
                                today={today}
                            />
                        </div>

                        {/* On wide screens this column takes the height of the calendar and scrolls by itself */}
                        <div className="relative border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50">
                            <div className="p-5 sm:p-6 md:absolute md:inset-0 md:overflow-y-auto">
                                <ActivityList
                                    items={listedItems}
                                    selectedDay={selectedDay}
                                    onClearDay={() => setSelectedDay(null)}
                                    today={today}
                                    highlightedKeys={highlightedKeys}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 sm:px-6 py-4 border-t border-gray-100">
                        <SubscribeActions call={call} inline />
                    </div>
                </motion.div>
            </div>
        </MotionConfig>,
        document.body
    );
};

export default ScheduleModal;
