import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDate } from '../../utils/schedule';
import ScheduleItem from './ScheduleItem';

const list = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } }
};

const row = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 }
};

// Activities shown next to the calendar: the next ones by default, or those of the day the candidate clicked
const ActivityList = ({ items, selectedDay, onClearDay, today, highlightedKeys, compact = false }) => (
    <div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                {selectedDay ? `Atividades em ${formatDate(selectedDay)}` : 'Próximas atividades'}
            </p>
            {selectedDay && (
                <button type="button" onClick={onClearDay} className="text-xs font-semibold text-uece-green hover:underline">
                    Ver próximas
                </button>
            )}
        </div>

        <AnimatePresence mode="wait">
            <motion.div
                key={selectedDay || 'next'}
                variants={list}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                className={compact ? 'space-y-2' : 'space-y-3'}
            >
                {items.length > 0 ? items.map(item => (
                    <motion.div key={item.key} variants={row}>
                        <ScheduleItem compact={compact} item={item} today={today} isHighlighted={highlightedKeys.includes(item.key)} />
                    </motion.div>
                )) : (
                    <motion.p variants={row} className="text-sm text-gray-500 leading-relaxed">
                        Todas as datas do cronograma já passaram. Clique em um dia marcado no calendário para rever as atividades.
                    </motion.p>
                )}
            </motion.div>
        </AnimatePresence>
    </div>
);

export default ActivityList;
