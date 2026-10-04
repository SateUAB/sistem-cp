import React, { useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import {
    getHighlightedKeys, getInitialMonth, getItemStatus, getMonthRange, getRelativeLabel, getScheduleSource, getToday,
    isItemOnDay, linkPublications, normalizeSchedule
} from '../../utils/schedule';
import ActivityList from './ActivityList';
import MonthGrid from './MonthGrid';
import ScheduleModal from './ScheduleModal';
import ScheduleSource from './ScheduleSource';
import SubscribeActions from './SubscribeActions';

const PREVIEW_SIZE = 2;

// Schedule of the call as a month calendar. `today` and `source` are only passed to simulate them.
const ScheduleCard = ({ call, schedule, today = getToday(), source = getScheduleSource(call.timeline) }) => {
    // Each activity gets the document published for it, when there is one
    const items = linkPublications(normalizeSchedule(schedule), call.timeline);

    const [month, setMonth] = useState(() => getInitialMonth(items, today));
    const [selectedDay, setSelectedDay] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openButtonRef = useRef(null);

    if (items.length === 0) return null;

    const { first, last } = getMonthRange(items);
    const highlightedKeys = getHighlightedKeys(items, today);
    const openItems = items.filter(item => getItemStatus(item, today) !== 'past');
    // Below the calendar: the day the candidate clicked or, by default, what is happening now and what comes next
    const listedItems = selectedDay ? items.filter(item => isItemOnDay(item, selectedDay)) : openItems.slice(0, PREVIEW_SIZE);

    const todayCount = openItems.filter(item => getItemStatus(item, today) === 'current').length;
    const headline = todayCount > 0
        ? `Hoje: ${todayCount} ${todayCount === 1 ? 'atividade' : 'atividades'}`
        : openItems.length > 0
        ? `Próxima data: ${getRelativeLabel(openItems[0], today).toLowerCase()}`
        : 'Todas as datas já passaram';

    const changeMonth = (nextMonth) => {
        setMonth(nextMonth);
        setSelectedDay(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        openButtonRef.current?.focus();
    };

    return (
        <MotionConfig reducedMotion="user">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="group/card bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-uece-green/40 transition-[box-shadow,border-color] duration-300"
            >
                {/* Header */}
                <div className="relative px-6 py-4 rounded-t-xl bg-gradient-to-br from-uece-green to-green-700 text-white overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-white/10 transition-transform duration-500 group-hover/card:scale-125"></div>
                    <div className="relative flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/15">
                            <CalendarDays className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold leading-tight">Cronograma</h3>
                            <p className="text-xs text-green-100">{headline}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <ScheduleSource source={source} />
                    </div>

                    <MonthGrid
                        compact
                        items={items}
                        month={month}
                        firstMonth={first}
                        lastMonth={last}
                        onMonthChange={changeMonth}
                        selectedDay={selectedDay}
                        onSelectDay={setSelectedDay}
                        today={today}
                    />

                    <div className="mt-5">
                        <ActivityList
                            compact
                            items={listedItems}
                            selectedDay={selectedDay}
                            onClearDay={() => setSelectedDay(null)}
                            today={today}
                            highlightedKeys={highlightedKeys}
                        />
                    </div>

                    <div className="flex flex-col gap-3 pt-5">
                        <button
                            ref={openButtonRef}
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="group/button w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-uece-green shadow-md hover:bg-green-800 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
                        >
                            <CalendarDays className="w-5 h-5 transition-transform group-hover/button:scale-110 group-hover/button:-rotate-6" />
                            Ver calendário completo
                        </button>
                        <SubscribeActions call={call} />
                    </div>
                </div>

                <AnimatePresence>
                    {isModalOpen && (
                        <ScheduleModal call={call} items={items} today={today} source={source} highlightedKeys={highlightedKeys} onClose={closeModal} />
                    )}
                </AnimatePresence>
            </motion.div>
        </MotionConfig>
    );
};

export default ScheduleCard;
