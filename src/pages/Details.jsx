import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';
import CallHeader from '../components/header/CallHeader';
import { isEdital } from '../components/header/headerData';
import ScheduleCard from '../components/schedule/ScheduleCard';
import ScheduleSamplePreview from '../components/schedule/ScheduleSamplePreview';
import { useMediaQuery } from '../utils/useMediaQuery';
import { trackDocumentDownload } from '../utils/analytics';

const Details = () => {
    const { id } = useParams();
    const { calls } = useData();
    // Same breakpoint as the two-column layout (Tailwind `lg`)
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const decodedId = decodeURIComponent(id);
    const call = calls.find(c => c.id === decodedId);

    if (!call) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900">Chamada Pública não encontrada</h2>
                <Link to="/" className="mt-4 text-uece-green hover:underline">Voltar para a Dashboard</Link>
            </div>
        );
    }

    // The `schedule` field does not exist in Sanity yet: in dev, a sample stands in so the UI can be tested
    const scheduleCard = call.schedule?.length
        ? <ScheduleCard call={call} schedule={call.schedule} />
        : import.meta.env.DEV && <ScheduleSamplePreview call={call} />;

    return (
        <div className="min-h-screen bg-gray-50 pb-4">
            <CallHeader call={call} />

            {/* Main Grid Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Main Content */}
                <div className="lg:col-span-2">

                    {/* Schedule: on small screens there is no right column, so it comes before the results */}
                    {!isDesktop && scheduleCard && (
                        <div className="mb-10 space-y-4">{scheduleCard}</div>
                    )}

                    {/* Warning Box */}


                    {/* Description */}


                    {/* Timeline */}
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-uece-green" />
                            Resultados e Fases
                        </h2>

                        <div className="relative border-l border-gray-200 ml-3 space-y-8 pl-10 pb-4">
                            {call.timeline.filter(t => !isEdital(t)).map((item, index) => (
                                <motion.div
                                    key={`timeline-${index}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative group"
                                >
                                    {/* Modern Dot Indicator */}
                                    <div className="absolute -left-[45px] top-3 h-3 w-3 rounded-full bg-uece-green shadow-[0_0_0_4px_rgba(230,248,235,1)] group-hover:shadow-[0_0_0_6px_rgba(230,248,235,1)] transition-all duration-300"></div>

                                    {/* Minimalist Card */}
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackDocumentDownload({ editalId: call.id, docTitle: item.title, fileUrl: item.url })}
                                        className="block bg-white p-5 rounded-xl border border-transparent hover:border-gray-100 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <span className="block text-xs font-bold text-uece-green uppercase tracking-wide mb-1.5">
                                                    {item.date}
                                                </span>
                                                {/* Uppercase keeps old, manual and standard posts looking the same, however they were typed */}
                                                <h3 className="text-base font-bold text-gray-900 uppercase group-hover:text-uece-green transition-colors">
                                                    {item.title}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-400 group-hover:text-uece-green transition-colors text-sm font-medium shrink-0">
                                                <span>Baixar PDF</span>
                                                <div className="p-2 rounded-full bg-gray-50 group-hover:bg-green-50 transition-colors">
                                                    <Download className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </motion.div>
                            ))}
                        </div>
                    </div>


                </div>

                {/* RIGHT COLUMN: Sidebar */}
                <div className="lg:col-span-1">
                    {/* With the schedule the sidebar is taller than the screen: sticking it would cut off its bottom */}
                    <div className={`space-y-6 ${scheduleCard ? '' : 'lg:sticky lg:top-6'}`}>
                        {/* Schedule */}
                        {isDesktop && scheduleCard}

                        {/* Help Box */}
                        {/* Help & Warning Box merged */}
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-900 mb-1">Atenção & Ajuda</h4>
                                    <p className="text-sm text-blue-700 leading-relaxed">
                                        Para evitar erros na inscrição:
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-blue-800 font-medium mt-1 mb-3 space-y-1">
                                        <li>Use email <strong>Gmail</strong></li>
                                        <li>Arquivos em <strong>PDF</strong></li>
                                        <li>Máximo <strong>1MB</strong> por arquivo</li>
                                    </ul>
                                    <p className="text-sm text-blue-700">
                                        Dúvidas? Contate o suporte:
                                    </p>
                                    <a href={`mailto:${call.id === '35/2026' ? 'cp.graduacao@uece.br' : 'cp.sate@uece.br'}`} className="text-sm font-bold text-blue-800 hover:text-blue-900 hover:underline flex items-center gap-1 mt-1">
                                        {call.id === '35/2026' ? 'cp.graduacao@uece.br' : 'cp.sate@uece.br'} <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Official Footer - Now outside the grid to stay at the bottom on mobile */}
            <div className="w-full mt-16 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-gray-500 mb-8 italic text-base md:text-lg">
                        Fortaleza, {call.publicationDate ? new Date(call.publicationDate).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : 'Data não informada'}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="font-bold text-gray-900 text-base md:text-xl">
                                {call.publicationDate && call.publicationDate >= '2026-05-05' ? 'Pâmela Felix Freitas' : 'Francisco Fábio Castelo Branco'}
                            </p>
                            <p className="text-gray-500 text-sm md:text-base">
                                {call.publicationDate && call.publicationDate >= '2026-05-05' ? 'Coordenadora da UAB' : 'Coordenador da UAB'}
                            </p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-base md:text-xl">João Rameres Regis</p>
                            <p className="text-gray-500 text-sm md:text-base">Coordenador da SATE</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Details;
