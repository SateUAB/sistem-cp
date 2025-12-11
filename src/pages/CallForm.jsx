import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Calendar, FileText } from 'lucide-react';

const CallForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { calls, addCall, updateCall } = useData();

    // Initial state
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        description: '',
        type: 'Tutor',
        courseType: 'Graduação',
        status: 'Aberto',
        vacancies: '',
        remuneration: '',
        startDate: '',
        endDate: '',
        timeline: []
    });

    const isEditMode = !!id;

    useEffect(() => {
        if (isEditMode) {
            const call = calls.find(c => c.id === decodeURIComponent(id));
            if (call) setFormData(call);
        } else {
            // Default/Auto files for new CP
            const currentDate = new Date().toLocaleDateString('pt-BR');
            setFormData(prev => ({
                ...prev,
                timeline: [
                    { date: currentDate, title: "Edital de Abertura", type: "pdf", isFeatured: true },
                    { date: currentDate, title: "Ead na UECE", type: "pdf", isFeatured: true }
                ]
            }));
        }
    }, [id, calls, isEditMode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            updateCall(formData);
        } else {
            // Check if ID exists
            if (calls.some(c => c.id === formData.id)) {
                alert('Já existe uma chamada com este número de edital.');
                return;
            }
            addCall(formData);
        }
        navigate('/admin');
    };

    const addTimelineItem = () => {
        const newItem = {
            date: new Date().toLocaleDateString('pt-BR'),
            title: "Nova Publicação",
            type: "pdf"
        };
        setFormData(prev => ({
            ...prev,
            timeline: [newItem, ...prev.timeline]
        }));
    };

    const removeTimelineItem = (index) => {
        setFormData(prev => ({
            ...prev,
            timeline: prev.timeline.filter((_, i) => i !== index)
        }));
    };

    const updateTimelineItem = (index, field, value) => {
        const newTimeline = [...formData.timeline];
        newTimeline[index] = { ...newTimeline[index], [field]: value };
        setFormData(prev => ({ ...prev, timeline: newTimeline }));
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/admin" className="inline-flex items-center text-gray-500 hover:text-uece-green mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Painel
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                {isEditMode ? `Editar Chamada ${formData.id}` : 'Nova Chamada Pública'}
            </h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número do Edital (ex: 137/2025)</label>
                        <input
                            required
                            type="text"
                            value={formData.id}
                            onChange={e => setFormData({ ...formData, id: e.target.value })}
                            disabled={isEditMode}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uece-green outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uece-green outline-none"
                        >
                            <option value="Aberto">Aberto</option>
                            <option value="Em Análise">Em Análise</option>
                            <option value="Finalizado">Finalizado</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uece-green outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                        required
                        rows={3}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uece-green outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                        <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uece-green outline-none"
                        >
                            <option value="Tutor">Tutor</option>
                            <option value="Professor">Professor</option>
                            <option value="Apoio Administrativo">Apoio Administrativo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Curso</label>
                        <select
                            value={formData.courseType}
                            onChange={e => setFormData({ ...formData, courseType: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uece-green outline-none"
                        >
                            <option value="Graduação">Graduação</option>
                            <option value="Especialização">Especialização</option>
                            <option value="Extensão">Extensão</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vagas</label>
                        <input
                            type="text"
                            value={formData.vacancies}
                            onChange={e => setFormData({ ...formData, vacancies: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uece-green outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remuneração</label>
                        <input
                            type="text"
                            value={formData.remuneration}
                            onChange={e => setFormData({ ...formData, remuneration: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uece-green outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Início Inscrição</label>
                        <input
                            type="text"
                            placeholder="dd/mm/aaaa"
                            value={formData.startDate}
                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uece-green outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fim Inscrição</label>
                        <input
                            type="text"
                            placeholder="dd/mm/aaaa"
                            value={formData.endDate}
                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uece-green outline-none"
                        />
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-uece-green" />
                            Documentos e Timeline
                        </h3>
                        <button type="button" onClick={addTimelineItem} className="text-sm text-uece-green font-medium hover:underline flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Adicionar
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.timeline.map((item, index) => (
                            <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                                <div className="flex-1 space-y-3">
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={e => updateTimelineItem(index, 'title', e.target.value)}
                                        className="w-full px-3 py-1.5 rounded border border-gray-300 text-sm"
                                        placeholder="Título do Documento"
                                    />
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={item.date}
                                            onChange={e => updateTimelineItem(index, 'date', e.target.value)}
                                            className="w-32 px-3 py-1.5 rounded border border-gray-300 text-sm"
                                            placeholder="Data"
                                        />
                                        <label className="flex items-center gap-2 text-sm text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={item.isFeatured || false}
                                                onChange={e => updateTimelineItem(index, 'isFeatured', e.target.checked)}
                                                className="rounded text-uece-green focus:ring-uece-green"
                                            />
                                            Destaque (Topo)
                                        </label>
                                    </div>
                                </div>
                                <button type="button" onClick={() => removeTimelineItem(index)} className="text-red-500 hover:text-red-700 p-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button type="submit" className="bg-uece-green text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors font-medium flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Salvar Chamada
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CallForm;
