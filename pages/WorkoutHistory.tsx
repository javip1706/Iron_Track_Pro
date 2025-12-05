import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Trash2, ChevronDown, AlertTriangle, Clock, Dumbbell, Download } from 'lucide-react';
import { StorageService } from '../services/storage';
import { WorkoutSessionLog, SetLog } from '../types';

type ViewMode = 'sessions' | 'exercises';
type SortMode = 'recent' | 'oldest' | 'freq_high' | 'freq_low';

interface ExerciseHistoryGroup {
    variantId: string;
    exerciseName: string;
    variantName: string;
    lastPerformed: number;
    sessions: {
        date: number;
        sets: SetLog[];
    }[];
}

export const WorkoutHistory: React.FC = () => {
  const [logs, setLogs] = useState<WorkoutSessionLog[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('sessions');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const loadedLogs = StorageService.getWorkoutLogs();
    // Sort by date descending initially
    setLogs(loadedLogs.sort((a, b) => b.date - a.date));
  }, []);

  // --- Data Processing for Exercise View ---
  const exerciseHistory = useMemo(() => {
      const groups = new Map<string, ExerciseHistoryGroup>();

      logs.forEach(session => {
          session.exercises.forEach(ex => {
              if (!groups.has(ex.variantId)) {
                  groups.set(ex.variantId, {
                      variantId: ex.variantId,
                      exerciseName: ex.exerciseName,
                      variantName: ex.variantName,
                      lastPerformed: 0,
                      sessions: []
                  });
              }
              
              const group = groups.get(ex.variantId)!;
              group.sessions.push({
                  date: session.date,
                  sets: ex.sets
              });
              if (session.date > group.lastPerformed) {
                  group.lastPerformed = session.date;
              }
          });
      });

      const result = Array.from(groups.values());

      // Sorting Logic
      return result.sort((a, b) => {
          switch (sortMode) {
              case 'recent': return b.lastPerformed - a.lastPerformed;
              case 'oldest': return a.lastPerformed - b.lastPerformed;
              case 'freq_high': return b.sessions.length - a.sessions.length;
              case 'freq_low': return a.sessions.length - b.sessions.length;
              default: return 0;
          }
      });

  }, [logs, sortMode]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = () => {
      if (deleteId) {
          StorageService.deleteWorkoutLog(deleteId);
          setLogs(prev => prev.filter(l => l.id !== deleteId));
          setDeleteId(null);
      }
  };

  const handleExportCSV = () => {
      let csvContent = "Fecha,Rutina,Ejercicio,Variante,Serie,Peso (kg),Repeticiones\n";

      logs.forEach(log => {
          const dateStr = new Date(log.date).toLocaleDateString('es-ES');
          // Escape quotes to prevent CSV breakage
          const safeRoutine = `"${log.routineName.replace(/"/g, '""')}"`;
          
          log.exercises.forEach(ex => {
              const safeExercise = `"${ex.exerciseName.replace(/"/g, '""')}"`;
              const safeVariant = `"${ex.variantName.replace(/"/g, '""')}"`;

              ex.sets.forEach(set => {
                  if (set.completed || set.weight > 0 || set.reps > 0) {
                      let repsStr = `${set.reps}`;
                      if (set.reps2) repsStr += `-${set.reps2}`;
                      if (set.reps3) repsStr += `-${set.reps3}`;
                      
                      const row = [
                          dateStr,
                          safeRoutine,
                          safeExercise,
                          safeVariant,
                          set.setNumber,
                          set.weight,
                          repsStr
                      ].join(",");
                      csvContent += row + "\n";
                  }
              });
          });
      });

      // Add BOM for Excel compatibility with UTF-8
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `irontrack_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const formatDuration = (ms: number) => {
      if (!ms) return '--';
      const minutes = Math.floor(ms / 60000);
      return `${minutes} min`;
  };

  const hasSetData = (set: SetLog) => set.completed || set.weight > 0 || set.reps > 0;

  return (
    <div className="h-screen bg-dark flex flex-col overflow-hidden">
      <header className="p-4 border-b border-gray-800 flex flex-col gap-4 sticky top-0 bg-dark/95 z-10 backdrop-blur-md shrink-0">
        <div className="flex items-center">
            <Link to="/" className="p-2 hover:bg-gray-800 rounded-full mr-2"><ArrowLeft /></Link>
            <h1 className="text-xl font-bold flex-1">Historial</h1>
            <button 
                onClick={handleExportCSV} 
                className="p-2 text-primary hover:bg-gray-800 rounded-full transition-colors" 
                title="Exportar a Excel (CSV)"
            >
                <Download size={24} />
            </button>
        </div>
        
        {/* View Switcher */}
        <div className="flex bg-gray-800 p-1 rounded-lg">
            <button 
                onClick={() => setViewMode('sessions')}
                className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'sessions' ? 'bg-surface text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                <Calendar size={16} /> Por Sesión
            </button>
            <button 
                onClick={() => setViewMode('exercises')}
                className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'exercises' ? 'bg-surface text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                <Dumbbell size={16} /> Por Ejercicio
            </button>
        </div>

        {/* Sort Controls (Only for Exercise View) */}
        {viewMode === 'exercises' && (
            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
                 <button onClick={() => setSortMode('recent')} className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold border transition-colors ${sortMode === 'recent' ? 'bg-primary/20 border-primary text-primary' : 'bg-transparent border-gray-600 text-gray-400'}`}>
                    Más Recientes
                 </button>
                 <button onClick={() => setSortMode('oldest')} className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold border transition-colors ${sortMode === 'oldest' ? 'bg-primary/20 border-primary text-primary' : 'bg-transparent border-gray-600 text-gray-400'}`}>
                    Menos Recientes
                 </button>
                 <button onClick={() => setSortMode('freq_high')} className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold border transition-colors ${sortMode === 'freq_high' ? 'bg-primary/20 border-primary text-primary' : 'bg-transparent border-gray-600 text-gray-400'}`}>
                    Más Frecuentes
                 </button>
                 <button onClick={() => setSortMode('freq_low')} className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold border transition-colors ${sortMode === 'freq_low' ? 'bg-primary/20 border-primary text-primary' : 'bg-transparent border-gray-600 text-gray-400'}`}>
                    Menos Frecuentes
                 </button>
            </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        
        {/* --- SESSIONS VIEW --- */}
        {viewMode === 'sessions' && (
            logs.length === 0 ? (
                <div className="text-center text-gray-500 mt-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <Calendar size={32} />
                    </div>
                    <p>No hay entrenamientos registrados.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {logs.map(log => {
                        const isExpanded = expandedId === log.id;
                        const dateObj = new Date(log.date);
                        
                        return (
                            <div key={log.id} className="bg-surface rounded-xl border border-gray-700 overflow-hidden">
                                <div 
                                    onClick={() => toggleExpand(log.id)}
                                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-800/50 transition-colors relative"
                                >
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Calendar size={10} /> {log.weekId}
                                            </span>
                                            {log.duration && (
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <Clock size={10} /> {formatDuration(log.duration)}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-white text-lg">{log.routineName}</h3>
                                        <p className="text-sm text-gray-400 capitalize">
                                            {dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            <span className="mx-1">•</span>
                                            {log.dayName}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setDeleteId(log.id); }}
                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-700 rounded-full transition-colors z-10"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div className={`text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={20} />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="bg-dark/30 border-t border-gray-700 p-4 space-y-4 animate-in slide-in-from-top-2">
                                        {log.exercises.map((ex, i) => (
                                            <div key={i} className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                                                <div className="flex justify-between items-start mb-2 border-b border-gray-700 pb-1">
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{ex.exerciseName}</p>
                                                        <p className="text-xs text-primary">{ex.variantName}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-3 gap-2">
                                                    {ex.sets.filter(hasSetData).map((set, j) => (
                                                        <div key={j} className="bg-dark rounded p-1.5 text-center border border-gray-700">
                                                            <div className="text-[9px] text-gray-500 mb-0.5">Serie {set.setNumber}</div>
                                                            <div className="font-bold text-sm text-white">
                                                                {set.weight}<span className="text-[10px] font-normal text-gray-400">kg</span>
                                                            </div>
                                                            <div className="text-xs text-primary font-mono">
                                                                {set.reps}
                                                                {set.reps2 ? `-${set.reps2}` : ''}
                                                                {set.reps3 ? `-${set.reps3}` : ''}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )
        )}

        {/* --- EXERCISES VIEW --- */}
        {viewMode === 'exercises' && (
            exerciseHistory.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                    <p>No hay datos suficientes.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {exerciseHistory.map(group => {
                        const isExpanded = expandedId === group.variantId;
                        
                        return (
                            <div key={group.variantId} className="bg-surface rounded-xl border border-gray-700 overflow-hidden">
                                <div 
                                    onClick={() => toggleExpand(group.variantId)}
                                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-800/50 transition-colors"
                                >
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{group.exerciseName}</h3>
                                        <p className="text-xs text-primary mb-1">{group.variantName}</p>
                                        <div className="flex gap-3 text-xs text-gray-400">
                                            <span>Sesiones: <strong className="text-white">{group.sessions.length}</strong></span>
                                            <span>Última: <strong className="text-white">{new Date(group.lastPerformed).toLocaleDateString()}</strong></span>
                                        </div>
                                    </div>
                                    <div className={`text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="bg-dark/30 border-t border-gray-700 p-4 space-y-3 animate-in slide-in-from-top-2">
                                        {group.sessions.sort((a,b) => b.date - a.date).map((session, idx) => (
                                            <div key={idx} className="bg-gray-800/40 rounded p-3 border border-gray-700/50">
                                                <div className="text-xs text-gray-400 mb-2 border-b border-gray-700 pb-1">
                                                    {new Date(session.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {session.sets.filter(hasSetData).map((set, sIdx) => (
                                                        <div key={sIdx} className="bg-dark rounded px-2 py-1 text-center border border-gray-700 flex items-center gap-2">
                                                            <span className="font-bold text-white text-sm">{set.weight}<span className="text-[9px] font-normal text-gray-500">kg</span></span>
                                                            <span className="text-gray-600 text-[10px]">x</span>
                                                            <span className="text-xs text-primary font-mono">
                                                                {set.reps}
                                                                {set.reps2 ? `-${set.reps2}` : ''}
                                                                {set.reps3 ? `-${set.reps3}` : ''}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )
        )}
      </div>

       {/* Delete Modal (Only for Sessions view) */}
       {deleteId && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-surface rounded-xl border border-gray-700 p-6 w-full max-w-xs shadow-2xl">
                <div className="flex flex-col items-center text-center mb-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mb-3">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white">¿Eliminar Entrenamiento?</h3>
                    <p className="text-gray-400 text-sm mt-2">
                        Esta acción no se puede deshacer.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setDeleteId(null)} className="py-3 rounded-lg bg-gray-700 text-white font-bold hover:bg-gray-600">Cancelar</button>
                    <button onClick={handleDelete} className="py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500">Eliminar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};