import React from 'react';
import { CalendarPlus } from 'lucide-react';
import { canSubscribe, getGoogleSubscribeUrl, getScheduleFeedUrl, getWebcalUrl } from '../../utils/calendarLinks';

// Adds the whole schedule of the call to the candidate's own calendar, as a subscription that updates itself.
// `inline` puts button and text side by side on wide screens (modal footer).
const SubscribeActions = ({ call, inline = false }) => {
    const feedUrl = getScheduleFeedUrl(call);
    const isAvailable = canSubscribe();

    return (
        <div className={inline ? 'sm:flex sm:items-center sm:gap-4' : ''}>
            <a
                href={isAvailable ? getGoogleSubscribeUrl(feedUrl) : '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!isAvailable}
                onClick={(e) => !isAvailable && e.preventDefault()}
                className={`w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold whitespace-nowrap border-2 transition-all ${inline ? 'sm:w-auto sm:shrink-0 sm:px-5' : ''} ${isAvailable
                    ? 'text-uece-green border-uece-green bg-white hover:bg-green-50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                    : 'text-gray-400 border-gray-300 bg-gray-50 cursor-not-allowed'
                    }`}
            >
                <CalendarPlus className="w-5 h-5" />
                Adicionar ao Google Agenda
            </a>

            <div className={`text-xs leading-relaxed ${inline ? 'mt-2 sm:mt-0' : 'mt-2'}`}>
                <p className="text-gray-500">
                    Todas as datas desta chamada, com atualização automática quando o cronograma mudar.
                    {isAvailable && (
                        <>
                            {' '}
                            <a href={getWebcalUrl(feedUrl)} className="font-semibold text-uece-green hover:underline">
                                Outro calendário (iPhone, Outlook)
                            </a>
                        </>
                    )}
                </p>
                {!isAvailable && (
                    <p className="font-medium text-amber-700">Disponível apenas no site publicado.</p>
                )}
            </div>
        </div>
    );
};

export default SubscribeActions;
