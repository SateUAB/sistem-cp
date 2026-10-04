import React from 'react';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { MONTH_ABBR, scheduleCategories, formatPeriod, getItemStatus, getRelativeLabel } from '../../utils/schedule';

// One activity of the schedule. `compact` is the sidebar size: the category becomes a dot and everything fits in a few lines.
// When the document of the activity has been published (`item.publication`), the whole row is the link to it.
const ScheduleItem = ({ item, today, isHighlighted = false, compact = false }) => {
    const { publication } = item;
    const status = getItemStatus(item, today);
    const isCurrent = status === 'current';
    // A date that has passed fades away, unless there is a document to open
    const isMuted = status === 'past' && !publication;
    const category = scheduleCategories[item.category];
    const relativeLabel = getRelativeLabel(item, today);
    const [, month, day] = item.startDate.split('-');

    const Row = publication ? 'a' : 'div';
    const linkProps = publication
        ? { href: publication.url, target: '_blank', rel: 'noopener noreferrer', 'aria-label': `Abrir a publicação: ${item.title}` }
        : {};

    const relativeLabelClass = `inline-flex items-center gap-1.5 font-bold uppercase tracking-wide ${isCurrent ? 'text-uece-green' : 'text-gray-500'}`;

    // Blinking dot on what is happening right now
    const liveDot = isCurrent && (
        <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-uece-green opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-uece-green" />
        </span>
    );

    return (
        <Row
            {...linkProps}
            className={`group flex items-center rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${compact ? 'gap-3 p-2.5' : 'gap-4 p-4'} ${isHighlighted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:border-green-200'}`}
        >
            {/* Date Chip */}
            <div className={`shrink-0 rounded-lg text-center transition-transform duration-200 group-hover:scale-105 ${compact ? 'w-10 py-1.5' : 'w-14 py-2'} ${isHighlighted
                ? 'bg-uece-green text-white'
                : isMuted ? 'bg-gray-100 text-gray-400' : 'bg-green-50 text-uece-green'
                }`}>
                <span className={`block font-bold leading-none ${compact ? 'text-base' : 'text-xl'}`}>{day}</span>
                <span className={`block font-semibold uppercase tracking-wide mt-1 ${compact ? 'text-[10px]' : 'text-[11px]'}`}>{MONTH_ABBR[Number(month) - 1]}</span>
            </div>

            {compact ? (
                <div className="min-w-0 flex-grow">
                    <h4 className={`text-sm font-bold leading-snug ${isMuted ? 'text-gray-500' : 'text-gray-900'}`}>{item.title}</h4>
                    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[11px] text-gray-500">
                        {!isCurrent && <span className={`w-1.5 h-1.5 rounded-full ${isMuted ? 'bg-gray-300' : category?.dot || 'bg-gray-400'}`} />}
                        {relativeLabel && <span className={relativeLabelClass}>{liveDot}{relativeLabel}</span>}
                        <span>{formatPeriod(item)}</span>
                    </p>
                    {publication && (
                        <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-uece-green group-hover:underline">
                            <CheckCircle className="w-3 h-3" />
                            Abrir publicação
                            <ExternalLink className="w-3 h-3" />
                        </p>
                    )}
                </div>
            ) : (
                <div className="min-w-0 flex-grow">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                        {category && (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${isMuted ? 'bg-gray-100 text-gray-500 border border-gray-200' : category.badge}`}>
                                {category.label}
                            </span>
                        )}
                        {relativeLabel && <span className={`text-[11px] ${relativeLabelClass}`}>{liveDot}{relativeLabel}</span>}
                    </div>
                    <h4 className={`text-sm sm:text-base font-bold ${isMuted ? 'text-gray-500' : 'text-gray-900'} ${publication ? 'group-hover:text-uece-green transition-colors' : ''}`}>{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{formatPeriod(item)}</p>
                    {publication && (
                        <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-uece-green">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Publicado em {publication.date}
                        </p>
                    )}
                </div>
            )}

            {publication && !compact && (
                <div className="shrink-0 p-2 rounded-full bg-green-50 text-uece-green group-hover:bg-uece-green group-hover:text-white transition-colors" title="Abrir publicação">
                    <ExternalLink className="w-5 h-5" />
                </div>
            )}
        </Row>
    );
};

export default ScheduleItem;
