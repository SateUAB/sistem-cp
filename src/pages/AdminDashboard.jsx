import React from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';

const AdminDashboard = () => {
    const { calls, deleteCall } = useData();

    if (!calls) return <div>Carregando...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Link to="/" className="text-sm text-gray-500 hover:text-uece-green flex items-center gap-1 mb-2">
                        <ArrowLeft className="w-4 h-4" /> Voltar ao Site
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Gerenciar Chamadas Públicas</h1>
                </div>
                <Link to="/admin/new" className="bg-uece-green text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nova Chamada
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Edital</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Título</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {calls.map(call => (
                                <tr key={call.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{call.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">{call.title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${call.status === 'Aberto' ? 'bg-green-100 text-green-800' :
                                                call.status === 'Em Análise' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {call.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <Link to={`/admin/edit/${encodeURIComponent(call.id)}`} className="text-blue-600 hover:text-blue-800 p-1">
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => { if (window.confirm('Tem certeza?')) deleteCall(call.id) }} className="text-red-600 hover:text-red-800 p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {calls.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        Nenhuma chamada encontrada.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
