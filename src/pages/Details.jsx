import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, DollarSign, FileText, Download, CheckCircle, Circle, Briefcase, ExternalLink, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';

const Details = () => {
    const { id } = useParams();
    const { calls } = useData();
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

    // Status Bar Logic
    const steps = ['Período de Inscrição', 'Em Processo', 'Encerrado'];
    const currentStepIndex = steps.indexOf(call.status) !== -1 ? steps.indexOf(call.status) : 0; // Simplified logic for demo

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="inline-flex items-center text-gray-500 hover:text-uece-green transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para Editais
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-uece-green text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                                    Chamada Pública {call.id}
                                </span>
                                <span className="text-gray-500 text-sm font-medium">{call.type}</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">{call.title}</h1>
                            <p className="text-base text-gray-600 max-w-3xl whitespace-pre-wrap leading-relaxed text-justify">{call.description}</p>
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="mt-10 overflow-x-auto pb-4">
                        <div className="flex items-center min-w-[600px] justify-between relative">
                            {/* Progress Line */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-uece-green -z-10 transition-all duration-500"
                                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                            ></div>

                            {steps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;

                                return (
                                    <div key={index} className="flex flex-col items-center gap-2 bg-white px-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted ? 'bg-uece-green border-uece-green text-white' : 'bg-white border-gray-300 text-gray-300'
                                            }`}>
                                            {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                        </div>
                                        <span className={`text-sm font-medium ${isCurrent ? 'text-uece-green' : 'text-gray-500'}`}>
                                            {step}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>


            {/* Main Grid Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Main Content */}
                <div className="lg:col-span-2">

                    {/* Featured Documents Section */}
                    {call.timeline.some(t => t.isFeatured) && (
                        <div className="mb-10">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-uece-green" />
                                Documentos em Destaque
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {call.timeline.filter(t => t.isFeatured).map((item, index) => (
                                    <motion.div
                                        key={`featured-${index}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-green-50 rounded-xl border border-green-100 p-5 shadow-sm hover:shadow-md transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="bg-white p-2 rounded-lg text-uece-green shadow-sm group-hover:scale-105 transition-transform">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-semibold text-uece-green bg-white px-2 py-1 rounded border border-green-100">
                                                Destaque
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900 mb-1">{item.title}</h3>
                                        <p className="text-xs text-gray-500 mb-4">Publicado em: {item.date}</p>
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-uece-green text-white rounded-lg hover:bg-green-800 transition-colors text-sm font-medium shadow-sm"
                                        >
                                            <Download className="w-4 h-4" />
                                            Baixar Documento
                                        </a>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Warning Box */}


                    {/* Description */}


                    {/* Timeline */}
                    <div className="pt-8 mb-12 border-t border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-uece-green" />
                            Resultados e Fases
                        </h2>

                        <div className="relative border-l border-gray-200 ml-3 space-y-8 pl-10 pb-4">
                            {call.timeline.filter(t => !t.isFeatured).map((item, index) => (
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
                                        className="block bg-white p-5 rounded-xl border border-transparent hover:border-gray-100 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <span className="text-xs font-bold text-uece-green uppercase tracking-wide mb-1 block">
                                                    {item.date}
                                                </span>
                                                <h3 className="text-base font-bold text-gray-900 group-hover:text-uece-green transition-colors">
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
                    <div className="lg:sticky lg:top-6 space-y-6">
                        {/* Info Card */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Informações Gerais</h3>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-uece-green mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Número do Edital</p>
                                        <p className="font-medium text-gray-900">{call.id}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Briefcase className="w-5 h-5 text-uece-green mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Categoria</p>
                                        <p className="font-medium text-gray-900">{call.type} - {call.courseType}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-uece-green mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Período de Inscrição</p>
                                        <p className="font-medium text-gray-900">{call.startDate} até {call.endDate}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 pt-6">
                                {(call.status === 'Período de Inscrição' || call.status === 'Em Processo') && (
                                    <a
                                        href={call.subscriptionLink || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${call.subscriptionLink
                                            ? 'bg-uece-green hover:bg-green-800 hover:shadow-xl hover:-translate-y-1'
                                            : 'bg-gray-400 cursor-not-allowed'
                                            }`}
                                        onClick={(e) => !call.subscriptionLink && e.preventDefault()}
                                    >
                                        {call.subscriptionLink ? 'Inscrever-se Agora' : 'Link indisponível'}
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                )}

                                {call.appealLink && (
                                    <a
                                        href={call.appealLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-uece-green border-2 border-uece-green hover:bg-green-50 transition-all"
                                    >
                                        Formulário de Recurso
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>

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
                                    <a href="mailto:cp.sate@uece.br" className="text-sm font-bold text-blue-800 hover:text-blue-900 hover:underline flex items-center gap-1 mt-1">
                                        cp.sate@uece.br <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

            {/* Official Footer - Now outside the grid to stay at the bottom on mobile */ }
    <div className="w-full mt-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-gray-500 mb-8 italic">
                Fortaleza, {call.publicationDate ? new Date(call.publicationDate).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : 'Data não informada'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <p className="font-bold text-gray-900 text-base">Francisco Fábio Castelo Branco</p>
                    <p className="text-gray-500 text-sm">Coordenador da UAB</p>
                </div>
                <div>
                    <p className="font-bold text-gray-900 text-base">João Rameres Regis</p>
                    <p className="text-gray-500 text-sm">Coordenador da SATE</p>
                </div>
            </div>
        </div>
    </div>

            </div >
        </div >
    );
};

export default Details;
