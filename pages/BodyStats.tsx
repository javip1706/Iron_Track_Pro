import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, AlertTriangle, Activity } from 'lucide-react';
import { StorageService } from '../services/storage';
import { BodyStat } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type MetricType = 'weight' | 'bodyFat' | 'waist' | 'chest' | 'arm';

const METRICS: { key: MetricType; label: string; color: string; unit: string }[] = [
  { key: 'weight', label: 'Peso', color: '#0ea5e9', unit: 'kg' },
  { key: 'bodyFat', label: '% Grasa', color: '#f59e0b', unit: '%' },
  { key: 'waist', label: 'Cintura', color: '#10b981', unit: 'cm' },
  { key: 'chest', label: 'Pecho', color: '#8b5cf6', unit: 'cm' },
  { key: 'arm', label: 'Brazo', color: '#ef4444', unit: 'cm' },
];

export const BodyStats: React.FC = () => {
  const [stats, setStats] = useState<BodyStat[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('weight');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [newStat, setNewStat] = useState<Partial<BodyStat>>({
    weight: 0, bodyFat: 0, waist: 0, chest: 0, arm: 0
  });

  useEffect(() => {
    const loaded = StorageService.getBodyStats();
    setStats(loaded.sort((a, b) => a.date - b.date));
  }, []);

  const handleSave = () => {
    const entry: BodyStat = {
      id: Date.now().toString(),
      date: Date.now(),
      weight: Number(newStat.weight) || 0,
      bodyFat: Number(newStat.bodyFat) || 0,
      waist: Number(newStat.waist) || 0,
      chest: Number(newStat.chest) || 0,
      arm: Number(newStat.arm) || 0,
    };
    const updated = [...stats, entry];
    StorageService.saveBodyStats(updated);
    setStats(updated.sort((a, b) => a.date - b.date));
    setShowForm(false);
    setNewStat({ weight: 0, bodyFat: 0, waist: 0, chest: 0, arm: 0 });
  };

  const handleDelete = () => {
    if (deleteId) {
        const updated = stats.filter(s => s.id !== deleteId);
        StorageService.saveBodyStats(updated);
        setStats(updated);
        setDeleteId(null);
    }
  }

  // Prepare chart data
  const chartData = stats.map(s => ({
    date: new Date(s.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
    value: s[selectedMetric] || 0
  }));

  const currentMetricConfig = METRICS.find(m => m.key === selectedMetric)!;

  return (
    <div className="h-screen flex flex-col bg-dark overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark/80 backdrop-blur-md border-b border-gray-800 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-full">
            <ArrowLeft />
          </Link>
          <h1 className="text-xl font-bold">Registros Físicos</h1>
        </div>
        <button
            onClick={() => setShowForm(!showForm)}
            className={`p-2 rounded-full shadow-lg transition-colors ${showForm ? 'bg-red-500/20 text-red-500' : 'bg-primary text-white shadow-primary/20'}`}
        >
            {showForm ? <Activity size={20} /> : <Plus size={20} />}
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto pb-20">
        
        {/* Chart Section */}
        <div className="bg-surface rounded-xl p-4 mb-6 border border-gray-700">
             {/* Metric Selector */}
             <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-2">
                {METRICS.map(m => (
                    <button
                        key={m.key}
                        onClick={() => setSelectedMetric(m.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${
                            selectedMetric === m.key 
                            ? `bg-${m.color === '#0ea5e9' ? 'primary' : '[#334155]'} border-transparent text-white`
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                        }`}
                        style={{ 
                            backgroundColor: selectedMetric === m.key ? m.color : undefined,
                            borderColor: selectedMetric === m.key ? m.color : undefined
                        }}
                    >
                        {m.label}
                    </button>
                ))}
             </div>

             {stats.length > 1 ? (
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickMargin={10} />
                            <YAxis stroke="#94a3b8" domain={['auto', 'auto']} fontSize={10} width={30} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} 
                                itemStyle={{ color: '#fff' }}
                                formatter={(value: number) => [`${value} ${currentMetricConfig.unit}`, currentMetricConfig.label]}
                                labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={currentMetricConfig.color} 
                                strokeWidth={3} 
                                dot={{r: 4, fill: currentMetricConfig.color, strokeWidth: 0}} 
                                activeDot={{r: 6}}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
             ) : (
                 <div className="h-64 flex items-center justify-center text-gray-500 text-sm italic">
                     Añade al menos 2 registros para ver la gráfica
                 </div>
             )}
        </div>

        {/* Add Form */}
        {showForm && (
            <div className="bg-surface p-5 rounded-xl mb-6 animate-in slide-in-from-top-5 border border-primary/50 shadow-lg shadow-primary/10">
                <h3 className="font-bold mb-4 text-primary">Nuevo Registro</h3>
                <div className="grid grid-cols-2 gap-4">
                    {METRICS.map(m => (
                        <label key={m.key} className="block">
                            <span className="text-xs text-gray-400 font-medium ml-1">{m.label} ({m.unit})</span>
                            <input 
                                type="number" 
                                className="w-full bg-dark border border-gray-700 rounded-lg p-2.5 mt-1 text-white focus:border-primary outline-none transition-colors" 
                                value={newStat[m.key] || ''} 
                                onChange={e => setNewStat({...newStat, [m.key]: parseFloat(e.target.value)})} 
                                placeholder="0"
                            />
                        </label>
                    ))}
                </div>
                <button onClick={handleSave} className="w-full mt-6 bg-primary hover:bg-sky-500 text-white py-3 rounded-lg font-bold shadow-lg shadow-primary/25 transition-all active:scale-95">
                    Guardar Datos
                </button>
            </div>
        )}

        {/* Detailed Cards View */}
        <div className="space-y-4">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider ml-1">Historial</h3>
            {stats.length === 0 ? (
                <div className="p-8 text-center text-gray-500 border border-dashed border-gray-700 rounded-xl">No hay registros guardados</div>
            ) : (
                stats.slice().reverse().map((s) => (
                    <div key={s.id} className="bg-surface rounded-xl p-4 border border-gray-700 shadow-sm relative group">
                        <div className="flex justify-between items-start mb-3 border-b border-gray-700/50 pb-2">
                            <div className="text-white font-bold text-lg">
                                {new Date(s.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <button 
                                onClick={() => setDeleteId(s.id)} 
                                className="text-gray-500 hover:text-red-500 p-2 -mr-2 -mt-2 rounded-full hover:bg-gray-700 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-y-4 gap-x-2">
                            {METRICS.map(m => (
                                <div key={m.key} className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase font-bold">{m.label}</span>
                                    <span className="text-sm font-mono text-gray-300">
                                        {s[m.key] ? (
                                            <>
                                                <span className="text-white font-bold text-base">{s[m.key]}</span>
                                                <span className="text-xs ml-0.5">{m.unit}</span>
                                            </>
                                        ) : (
                                            <span className="text-gray-600">-</span>
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-surface rounded-xl border border-gray-700 p-6 w-full max-w-xs shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center mb-5">
                    <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-3">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white">¿Eliminar registro?</h3>
                    <p className="text-gray-400 text-sm mt-2">
                        Esta acción no se puede deshacer.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setDeleteId(null)} 
                        className="py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleDelete} 
                        className="py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-colors"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};