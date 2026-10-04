import React, { useState } from 'react';
import { sampleSchedule } from '../../data/sampleSchedule';
import ScheduleCard from './ScheduleCard';

// Moments of the sample schedule worth looking at
const PRESETS = [
    { label: 'Inscrições abertas', date: '2026-08-17' },
    { label: 'Entrevistas', date: '2026-09-15' },
    { label: '3 publicações no dia', date: '2026-09-22' },
    { label: 'Duas etapas juntas', date: '2026-09-24' },
    { label: 'Encerrado', date: '2026-10-10' }
];

// Development-only preview: sample data plus ways to simulate which day "today" is and a published adendo.
// Delete this component (and the sample data) once the schedule comes from Sanity.
const ScheduleSamplePreview = ({ call }) => {
    const [simulatedToday, setSimulatedToday] = useState('');
    const [hasAddendum, setHasAddendum] = useState(false);

    // An adendo of the call itself, when there is one, makes the simulated notice look real
    const addendum = call.timeline.find(doc => /^adendo/i.test(doc.title)) || { title: 'Adendo Nº 01', date: '03/09/2026', url: '#' };

    const presetClass = (isActive) => `px-2 py-1 rounded border font-medium transition-colors ${isActive ? 'bg-amber-600 border-amber-600 text-white' : 'bg-white border-amber-300 hover:bg-amber-100'}`;

    return (
        <>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <p className="font-bold mb-2">Cronograma de exemplo, exibido apenas no ambiente de desenvolvimento.</p>
                <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-2 font-medium">
                        Simular o dia:
                        <input
                            type="date"
                            value={simulatedToday}
                            onChange={(e) => setSimulatedToday(e.target.value)}
                            className="px-2 py-1 rounded border border-amber-300 bg-white text-gray-900"
                        />
                    </label>
                    {PRESETS.map(preset => (
                        <button key={preset.date} type="button" onClick={() => setSimulatedToday(preset.date)} className={presetClass(simulatedToday === preset.date)}>
                            {preset.label}
                        </button>
                    ))}
                    <button type="button" onClick={() => setSimulatedToday('')} className={presetClass(simulatedToday === '')}>
                        Hoje
                    </button>
                </div>
                <label className="mt-2 inline-flex items-center gap-2 font-medium">
                    <input type="checkbox" checked={hasAddendum} onChange={(e) => setHasAddendum(e.target.checked)} />
                    Simular adendo que altera as datas
                </label>
            </div>

            {/* Remounting on a new simulated day makes the calendar open on that month */}
            <ScheduleCard key={simulatedToday} call={call} schedule={sampleSchedule} today={simulatedToday || undefined} source={hasAddendum ? addendum : null} />
        </>
    );
};

export default ScheduleSamplePreview;
