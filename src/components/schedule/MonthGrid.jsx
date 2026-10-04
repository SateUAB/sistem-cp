import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { WEEKDAY_ABBR, scheduleCategories, formatDate, formatMonth, getMonthCells, isItemOnDay, shiftMonth } from '../../utils/schedule';

// The month slides in from the side the candidate is moving to
const slide = {
    enter: (direction) => ({ opacity: 0, x: direction * 24 }),
    center: { opacity: 1, x: 0 },
    exit: (direction) => ({ opacity: 0, x: direction * -24 })
};

// The tooltip of a day opens towards the inside of the calendar
const tooltipPosition = (column) => {
    if (column <= 1) return 'left-0';
    if (column >= 5) return 'right-0';
    return 'left-1/2 -translate-x-1/2';
};

// Month calendar with one dot per activity. `compact` is the sidebar size.
const MonthGrid = ({ items, month, firstMonth, lastMonth, onMonthChange, selectedDay, onSelectDay, today, compact = false }) => {
    const [direction, setDirection] = useState(0);
    const [hoveredDay, setHoveredDay] = useState(null);

    const changeMonth = (delta) => {
        setDirection(delta);
        setHoveredDay(null);
        onMonthChange(shiftMonth(month, delta));
    };

    const arrowClass = 'group p-1.5 rounded-full text-gray-600 hover:bg-green-50 hover:text-uece-green active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-all';

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => changeMonth(-1)} disabled={month <= firstMonth} aria-label="Mês anterior" className={arrowClass}>
                    <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5 group-disabled:translate-x-0" />
                </button>
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.p
                        key={month}
                        custom={direction}
                        variants={slide}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.15 }}
                        className={`font-bold text-gray-900 ${compact ? 'text-sm' : 'text-lg'}`}
                    >
                        {formatMonth(month)}
                    </motion.p>
                </AnimatePresence>
                <button type="button" onClick={() => changeMonth(1)} disabled={month >= lastMonth} aria-label="Próximo mês" className={arrowClass}>
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-disabled:translate-x-0" />
                </button>
            </div>

            <div className={`grid grid-cols-7 text-center ${compact ? 'gap-1' : 'gap-1.5'}`}>
                {WEEKDAY_ABBR.map(weekday => (
                    <span key={weekday} className={`py-1 font-semibold text-gray-400 uppercase ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
                        {compact ? weekday.charAt(0) : weekday}
                    </span>
                ))}
            </div>

            <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                    key={month}
                    custom={direction}
                    variants={slide}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.15 }}
                    className={`grid grid-cols-7 text-center ${compact ? 'gap-1' : 'gap-1.5'}`}
                >
                    {getMonthCells(month).map((day, index) => {
                        if (!day) return <span key={`blank-${index}`} className="aspect-square" />;

                        const dayItems = items.filter(item => isItemOnDay(item, day));
                        const hasItems = dayItems.length > 0;
                        const isSelected = day === selectedDay;
                        const isToday = day === today;
                        const hasPublication = dayItems.some(item => item.publication);

                        return (
                            <motion.button
                                key={day}
                                type="button"
                                disabled={!hasItems}
                                onClick={() => onSelectDay(isSelected ? null : day)}
                                onPointerEnter={(event) => event.pointerType === 'mouse' && setHoveredDay(day)}
                                onPointerLeave={() => setHoveredDay(null)}
                                whileHover={hasItems ? { scale: 1.1 } : undefined}
                                whileTap={hasItems ? { scale: 0.94 } : undefined}
                                aria-pressed={isSelected}
                                aria-label={`${formatDate(day)}: ${dayItems.length} ${dayItems.length === 1 ? 'atividade' : 'atividades'}`}
                                className={`relative aspect-square flex flex-col items-center justify-center transition-[background-color,box-shadow,color] duration-200 hover:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uece-green focus-visible:ring-offset-1 ${compact ? 'rounded-lg gap-0.5 text-xs' : 'rounded-xl gap-1 text-sm sm:text-base'} ${isSelected
                                    ? 'bg-uece-green text-white font-bold shadow-lg'
                                    : !hasItems
                                    ? 'text-gray-400'
                                    : day < today
                                    ? 'bg-gray-100 text-gray-500 font-semibold hover:bg-gray-200 hover:shadow-md'
                                    : 'bg-green-50 text-gray-900 font-semibold hover:bg-green-100 hover:shadow-md'
                                    } ${isToday && !isSelected ? 'ring-2 ring-inset ring-uece-green' : ''}`}
                            >
                                {/* Halo that keeps drawing the eye to today */}
                                {isToday && !isSelected && (
                                    <motion.span
                                        aria-hidden="true"
                                        className={`absolute inset-0 ring-2 ring-uece-green ${compact ? 'rounded-lg' : 'rounded-xl'}`}
                                        animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                                    />
                                )}

                                {/* There is a published document to open on this day */}
                                {hasPublication && (
                                    <span className={`absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-uece-green text-white ring-2 ring-white ${compact ? 'w-3 h-3' : 'w-4 h-4'}`}>
                                        <Check className={compact ? 'w-2 h-2' : 'w-2.5 h-2.5'} strokeWidth={4} />
                                    </span>
                                )}

                                <span>{Number(day.slice(8))}</span>
                                <span className={`flex gap-0.5 ${compact ? 'h-1' : 'h-1.5'}`}>
                                    {dayItems.slice(0, 4).map(item => (
                                        <span
                                            key={item.key}
                                            className={`rounded-full ${compact ? 'w-1 h-1' : 'w-1.5 h-1.5'} ${isSelected ? 'bg-white' : scheduleCategories[item.category]?.dot || 'bg-gray-400'}`}
                                        />
                                    ))}
                                </span>

                                {/* What happens on the day, without having to click */}
                                <AnimatePresence>
                                    {hoveredDay === day && hasItems && (
                                        <span className={`pointer-events-none absolute bottom-full z-30 pb-2 ${tooltipPosition(index % 7)}`}>
                                            <motion.span
                                                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                                transition={{ duration: 0.12 }}
                                                className="block w-max max-w-[220px] px-3 py-2 rounded-lg bg-gray-900 text-left text-xs font-medium leading-snug text-white shadow-xl"
                                            >
                                                <span className="block mb-1 text-[11px] font-bold text-green-300">{formatDate(day)}</span>
                                                {dayItems.slice(0, 3).map(item => (
                                                    <span key={item.key} className="flex items-start gap-1.5 py-0.5">
                                                        {item.publication
                                                            ? <Check className="shrink-0 mt-0.5 w-3 h-3 text-green-300" strokeWidth={4} />
                                                            : <span className={`shrink-0 mt-1 w-1.5 h-1.5 rounded-full ring-1 ring-white/60 ${scheduleCategories[item.category]?.dot || 'bg-gray-400'}`} />}
                                                        {item.title}
                                                    </span>
                                                ))}
                                                {dayItems.length > 3 && (
                                                    <span className="block mt-0.5 text-gray-300">+{dayItems.length - 3} atividades</span>
                                                )}
                                            </motion.span>
                                        </span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        );
                    })}
                </motion.div>
            </AnimatePresence>

            {/* Legend */}
            <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-500 ${compact ? 'mt-3 text-[11px]' : 'mt-4 text-xs'}`}>
                {Object.entries(scheduleCategories).map(([id, category]) => (
                    <span key={id} className="inline-flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${category.dot}`} />
                        {category.label}
                    </span>
                ))}
                <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm ring-2 ring-inset ring-uece-green" />
                    Hoje
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="flex items-center justify-center w-3 h-3 rounded-full bg-uece-green text-white">
                        <Check className="w-2 h-2" strokeWidth={4} />
                    </span>
                    Publicado
                </span>
            </div>
        </div>
    );
};

export default MonthGrid;
