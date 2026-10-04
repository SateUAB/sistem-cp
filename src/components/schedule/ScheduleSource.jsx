import React from 'react';
import { AlertTriangle } from 'lucide-react';

// Tells the candidate which document the dates follow: the edital or the adendo that changed them
const ScheduleSource = ({ source }) => {
    if (!source) {
        return <p className="text-xs text-gray-500">Datas conforme o edital.</p>;
    }

    return (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
                Datas atualizadas conforme{' '}
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-amber-700">
                    {source.title}
                </a>
                , publicado em {source.date}. Elas substituem as datas do edital.
            </p>
        </div>
    );
};

export default ScheduleSource;
