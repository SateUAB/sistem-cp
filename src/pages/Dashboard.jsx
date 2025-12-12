import React, { useState } from 'react';
import { Search, Filter, Briefcase, BookOpen, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { useData } from '../context/DataContext';

const Dashboard = () => {
    const { calls } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('Todos');
    const [selectedCourseType, setSelectedCourseType] = useState('Todos');
    const [selectedStatus, setSelectedStatus] = useState('Todos');

    const filteredCalls = calls.filter(call => {
        const matchesSearch = call.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            call.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'Todos' || call.type === selectedRole;
        const matchesStatus = selectedStatus === 'Todos' || call.status === selectedStatus;
        const matchesCourseType = selectedCourseType === 'Todos' || call.courseType === selectedCourseType;

        return matchesSearch && matchesRole && matchesStatus && matchesCourseType;
    });

    const getRoleIcon = (type) => {
        switch (type) {
            case 'Tutor': return <Users className="w-5 h-5" />;
            case 'Professor': return <BookOpen className="w-5 h-5" />;
            case 'Apoio Administrativo': return <Briefcase className="w-5 h-5" />;
            default: return <Briefcase className="w-5 h-5" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Aberto': return 'bg-green-100 text-green-700 border-green-200';
            case 'Em Análise': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Finalizado': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <div className="bg-uece-green text-white font-bold text-xl px-2 py-1 rounded-lg shadow-sm">
                                SATE
                            </div>
                            <span className="text-gray-400 font-normal text-xl">|</span>
                            <span className="text-gray-600 font-semibold text-lg tracking-tight">UECE</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Processos Seletivos SATE/UAB
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Acompanhe as chamadas públicas para tutores, professores e equipe de apoio
                            para os cursos a distância da Universidade Estadual do Ceará.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Nº edital ou curso..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uece-green focus:border-uece-green outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Curso</label>
                            <select
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uece-green focus:border-uece-green outline-none bg-white"
                                value={selectedCourseType}
                                onChange={(e) => setSelectedCourseType(e.target.value)}
                            >
                                <option value="Todos">Todos</option>
                                <option value="Graduação">Graduação</option>
                                <option value="Especialização">Especialização</option>
                                <option value="Extensão">Extensão</option>
                            </select>
                        </div>

                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Função</label>
                            <select
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uece-green focus:border-uece-green outline-none bg-white"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                <option value="Todos">Todas as Funções</option>
                                <option value="Tutor">Tutores</option>
                                <option value="Professor">Professores</option>
                                <option value="Apoio Administrativo">Apoio</option>
                            </select>
                        </div>

                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uece-green focus:border-uece-green outline-none bg-white"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="Todos">Todos os Status</option>
                                <option value="Aberto">Abertos</option>
                                <option value="Em Análise">Em Análise</option>
                                <option value="Finalizado">Finalizados</option>
                            </select>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Cards Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-uece-green" />
                    Chamadas Públicas ({filteredCalls.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCalls.map((call, index) => (
                        <motion.div
                            key={call.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link to={`/details/${encodeURIComponent(call.id)}`} className="group block h-full">
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-uece-green/50 transition-all duration-300 h-full flex flex-col p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-uece-green/5 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>

                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(call.status)}`}>
                                            {call.status}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {call.courseType && (
                                                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {call.courseType}
                                                </span>
                                            )}
                                            <div className="bg-gray-50 p-2 rounded-lg text-uece-green">
                                                {getRoleIcon(call.type)}
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-uece-green transition-colors mb-2">
                                        Chamada Pública {call.id}
                                    </h3>
                                    <p className="text-sm font-medium text-gray-900 mb-3">
                                        {call.title}
                                    </p>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                                        {call.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto gap-4">
                                        <div className="flex items-center text-uece-green font-medium text-sm group-hover:underline">
                                            Ver Detalhes
                                            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                                        </div>

                                        {call.status === 'Aberto' && (
                                            <button className="bg-uece-green text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-800 transition-colors shadow-sm hover:shadow-md z-10 relative">
                                                Inscreva-se
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}

                    {filteredCalls.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-lg">Nenhuma chamada pública encontrada com os filtros selecionados.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
