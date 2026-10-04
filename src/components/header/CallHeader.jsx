import React from 'react';
import { Link } from 'react-router-dom';
import { MotionConfig, motion } from 'framer-motion';
import { Activity, ArrowLeft, Briefcase, Calendar, Download, FileText, Hash, Link2, ScrollText } from 'lucide-react';
import ActionButton from './ActionButton';
import { STEPS, getActions, getHeaderData } from './headerData';

// Same colors as the status of the cards in the Dashboard
const STATUS_COLORS = {
    'Publicado': 'bg-blue-100 text-blue-700 border-blue-200',
    'Período de Inscrição': 'bg-green-100 text-green-700 border-green-200',
    'Em Processo': 'bg-amber-100 text-amber-700 border-amber-200',
    'Encerrado': 'bg-gray-100 text-gray-700 border-gray-200'
};

// Every block has the same shell, icon and label, so the eye learns the pattern once
const TILE = 'group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-5 transition-[background-color,border-color,box-shadow] duration-300 hover:bg-white hover:border-uece-green/40 hover:shadow-lg';
const TILE_ICON = 'relative p-2 rounded-lg bg-white text-uece-green shadow-sm transition-colors duration-300 group-hover:bg-uece-green group-hover:text-white';
const TILE_LABEL = 'text-xs font-semibold uppercase tracking-wide text-gray-500';

// The blocks come in one after the other
const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const RISE = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } };
// The progress only starts filling once its block is on screen
const PROGRESS_DELAY = 0.6;

// Same corner as the cards of the Dashboard
const TileCorner = () => (
    <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-bl-full bg-uece-green/5 transition-transform duration-500 group-hover:scale-125"></div>
);

const TileHeading = ({ icon, children }) => (
    <div className="relative flex items-center gap-2.5">
        <div className={TILE_ICON}>{icon}</div>
        <h2 className={TILE_LABEL}>{children}</h2>
    </div>
);

const StatTile = ({ icon, label, children }) => (
    <motion.div variants={RISE} whileHover={{ y: -4 }} className={`${TILE} flex sm:flex-col items-center sm:items-start gap-3`}>
        <TileCorner />
        <div className={TILE_ICON}>{icon}</div>
        <div className="relative">
            <dt className={TILE_LABEL}>{label}</dt>
            <dd className="mt-0.5 font-semibold text-gray-900">{children}</dd>
        </div>
    </motion.div>
);

// Where the call is: one bar per step, filled up to the current one
const StatusSteps = ({ stepIndex, isOngoing }) => (
    <ol className="relative mt-4 grid grid-cols-4 gap-1.5">
        {STEPS.map((step, index) => {
            const isReached = index <= stepIndex;
            const isCurrent = index === stepIndex;

            return (
                <li key={step} aria-current={isCurrent ? 'step' : undefined}>
                    <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        {isReached && (
                            <motion.div
                                className={`h-full rounded-full bg-uece-green origin-left ${isCurrent && isOngoing ? 'motion-safe:animate-pulse' : ''}`}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: PROGRESS_DELAY + index * 0.18, duration: 0.4, ease: 'easeOut' }}
                            />
                        )}
                    </div>
                    <span className={`block mt-2 text-xs leading-tight ${isCurrent ? 'font-bold text-gray-900' : isReached ? 'font-medium text-gray-500' : 'font-medium text-gray-400'}`}>
                        {step}
                    </span>
                </li>
            );
        })}
    </ol>
);

// Top of the call page: each piece of information in its own labeled block
const CallHeader = ({ call }) => {
    const { category, period, editais, stepIndex } = getHeaderData(call);
    const actions = getActions(call);
    const status = call.status || STEPS[stepIndex];
    // The last step has nothing left to happen
    const isOngoing = stepIndex < STEPS.length - 1;
    const hasSideColumn = editais.length > 0 || actions.length > 0;

    return (
        <MotionConfig reducedMotion="user">
            <div className="relative overflow-hidden bg-white border-b border-gray-200 py-10">
                {/* Backdrop: two circles drifting slowly */}
                <motion.div
                    className="absolute -top-44 -right-36 w-[30rem] h-[30rem] rounded-full bg-uece-green/5"
                    animate={{ y: [0, 14, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute top-10 right-[22rem] w-20 h-20 rounded-full bg-uece-green/5"
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                />

                <motion.div variants={STAGGER} initial="hidden" animate="show" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div variants={RISE}>
                        <Link to="/" className="group inline-flex items-center text-gray-500 hover:text-uece-green transition-colors mb-6">
                            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                            Voltar para Editais
                        </Link>
                    </motion.div>

                    <motion.div variants={RISE} className="relative pl-5">
                        <motion.span
                            className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-uece-green origin-top"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' }}
                        />
                        <div className="flex items-center gap-3 mb-3">
                            <span className="bg-uece-green text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                                Chamada Pública {call.id}
                            </span>
                            <span className="text-gray-500 text-sm font-medium">{call.type}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 max-w-5xl text-balance">{call.title}</h1>
                    </motion.div>

                    {/* The right column is as wide as the one of the page below (cronograma), so the edges line up */}
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_calc((100%_-_4rem)/3)] gap-4">
                        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatTile icon={<Hash className="w-5 h-5" />} label="Número do Edital">{call.id}</StatTile>
                            <StatTile icon={<Briefcase className="w-5 h-5" />} label="Categoria">{category}</StatTile>
                            <StatTile icon={<Calendar className="w-5 h-5" />} label="Período de Inscrição">{period}</StatTile>
                        </dl>

                        {/* Status */}
                        <motion.section variants={RISE} whileHover={{ y: -4 }} className={TILE}>
                            <TileCorner />
                            <div className="relative flex items-center justify-between gap-3">
                                <TileHeading icon={<Activity className="w-5 h-5" />}>Situação</TileHeading>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status] || STATUS_COLORS['Encerrado']}`}>
                                    <span className="relative flex w-2 h-2">
                                        {isOngoing && <span className="absolute inline-flex w-full h-full rounded-full bg-current opacity-60 motion-safe:animate-ping"></span>}
                                        <span className="relative inline-flex w-2 h-2 rounded-full bg-current"></span>
                                    </span>
                                    {status}
                                </span>
                            </div>
                            <StatusSteps stepIndex={stepIndex} isOngoing={isOngoing} />
                        </motion.section>

                        {/* Text of the call: last on small screens, so the edital and the links come before the long reading */}
                        <motion.section variants={RISE} className={`${TILE} order-last lg:order-none ${hasSideColumn ? '' : 'lg:col-span-2'}`}>
                            <TileHeading icon={<ScrollText className="w-5 h-5" />}>Sobre a chamada</TileHeading>
                            <p className="relative mt-4 text-base text-gray-600 whitespace-pre-wrap leading-relaxed text-justify">{call.description}</p>
                        </motion.section>

                        {hasSideColumn && (
                            <div className="flex flex-col gap-4">
                                {/* Edital */}
                                {editais.map((item, index) => (
                                    <motion.a
                                        key={`edital-${index}`}
                                        variants={RISE}
                                        whileHover={{ y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative overflow-hidden flex flex-col gap-4 p-5 rounded-2xl bg-gradient-to-br from-uece-green to-green-700 text-white shadow-md hover:shadow-xl transition-shadow duration-300"
                                    >
                                        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125"></div>
                                        {/* Light that crosses the block on hover */}
                                        <div className="absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-white/10 transition-transform duration-700 ease-out group-hover:translate-x-[600%]"></div>

                                        <div className="relative flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-white/15 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="font-bold uppercase leading-tight">{item.title}</h2>
                                                <p className="text-xs text-green-100">Publicado em: {item.date}</p>
                                            </div>
                                        </div>
                                        <span className="relative inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-uece-green text-sm font-bold shadow-sm">
                                            <motion.span
                                                className="inline-flex"
                                                animate={{ y: [0, 3, 0] }}
                                                transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
                                            >
                                                <Download className="w-4 h-4" />
                                            </motion.span>
                                            Baixar Edital
                                        </span>
                                    </motion.a>
                                ))}

                                {actions.length > 0 && (
                                    <motion.section variants={RISE} className={`${TILE} flex-1`}>
                                        <TileHeading icon={<Link2 className="w-5 h-5" />}>Links</TileHeading>
                                        <div className="relative mt-4 flex flex-col gap-3">
                                            {actions.map(action => <ActionButton key={action.key} action={action} />)}
                                        </div>
                                    </motion.section>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </MotionConfig>
    );
};

export default CallHeader;
