import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Check, Link as LinkIcon, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { StorageService } from '../services/storage';
import { ExerciseBase, ExerciseType, MuscleGroup, Routine, RoutineDay, ScheduledExercise } from '../types';

export const RoutineBuilder: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exercisesDB, setExercisesDB] = useState<ExerciseBase[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);

  const [tempRoutine, setTempRoutine] = useState<Routine | null>(null);
  const [showExerciseSelector, setShowExerciseSelector] = useState<{dayId: string} | null>(null);
  
  // Collapsible State for Modal
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  useEffect(() => {
    setRoutines(StorageService.getRoutines());
    setExercisesDB(StorageService.getExercises());
    setActiveRoutineId(StorageService.getActiveRoutineId());
  }, []);

  const createNewRoutine = () => {
    const newR: Routine = {
      id: Date.now().toString(),
      name: 'Nueva Rutina',
      days: [],
      createdAt: Date.now()
    };
    setTempRoutine(newR);
    setEditingId(newR.id);
  };

  const duplicateRoutine = (r: Routine) => {
      const copy: Routine = {
          ...JSON.parse(JSON.stringify(r)),
          id: Date.now().toString(),
          name: `${r.name} (Copia)`,
          createdAt: Date.now()
      };
      const updated = [...routines, copy];
      setRoutines(updated);
      StorageService.saveRoutines(updated);
  };

  const handleDeleteRoutine = (id: string) => {
      if(confirm("¿Estás seguro de eliminar esta rutina?")) {
          const updated = routines.filter(r => r.id !== id);
          setRoutines(updated);
          StorageService.saveRoutines(updated);
          if (activeRoutineId === id) {
              setActiveRoutineId(null);
              StorageService.setActiveRoutineId('');
          }
      }
  };

  const handleEdit = (r: Routine) => {
    setTempRoutine(JSON.parse(JSON.stringify(r))); 
    setEditingId(r.id);
  };

  const saveRoutine = () => {
    if (!tempRoutine) return;
    let updatedRoutines = [...routines];
    const idx = updatedRoutines.findIndex(r => r.id === tempRoutine.id);
    if (idx >= 0) {
      updatedRoutines[idx] = tempRoutine;
    } else {
      updatedRoutines.push(tempRoutine);
    }
    setRoutines(updatedRoutines);
    StorageService.saveRoutines(updatedRoutines);
    setEditingId(null);
    setTempRoutine(null);
  };

  const toggleActive = (id: string) => {
      StorageService.setActiveRoutineId(id);
      setActiveRoutineId(id);
  };

  const addDay = () => {
    if (!tempRoutine) return;
    const newDay: RoutineDay = {
        id: Date.now().toString(),
        name: `Día ${tempRoutine.days.length + 1}`,
        exercises: []
    };
    setTempRoutine({
        ...tempRoutine,
        days: [...tempRoutine.days, newDay]
    });
  };

  const addExerciseToDay = (exerciseBase: ExerciseBase, variantId: string) => {
    if (!tempRoutine || !showExerciseSelector) return;
    
    const dayIndex = tempRoutine.days.findIndex(d => d.id === showExerciseSelector.dayId);
    if (dayIndex === -1) return;

    const newEx: ScheduledExercise = {
        id: Date.now().toString(),
        exerciseBaseId: exerciseBase.id,
        variantId: variantId,
        targetSets: 3,
        targetReps: '10-12',
        restTimeSeconds: 60,
        type: ExerciseType.Normal
    };

    const updatedDays = [...tempRoutine.days];
    updatedDays[dayIndex].exercises.push(newEx);
    setTempRoutine({...tempRoutine, days: updatedDays});
    setShowExerciseSelector(null);
  };

  const removeExercise = (dayId: string, exId: string) => {
    if(!tempRoutine) return;
    const updatedDays = tempRoutine.days.map(d => {
        if (d.id === dayId) {
            return { ...d, exercises: d.exercises.filter(e => e.id !== exId) };
        }
        return d;
    });
    setTempRoutine({...tempRoutine, days: updatedDays});
  };

  const updateExercise = (dayId: string, exId: string, field: keyof ScheduledExercise, value: any) => {
    if(!tempRoutine) return;
    const updatedDays = tempRoutine.days.map(d => {
        if (d.id === dayId) {
            return {
                ...d,
                exercises: d.exercises.map(e => e.id === exId ? { ...e, [field]: value } : e)
            };
        }
        return d;
    });
    setTempRoutine({...tempRoutine, days: updatedDays});
  };

  // --- Main List View ---
  if (!editingId) {
    return (
        <div className="h-screen bg-dark flex flex-col overflow-hidden">
            <header className="p-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-dark/95 z-10">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-gray-800 rounded-full"><ArrowLeft /></Link>
                    <h1 className="text-xl font-bold">Mis Rutinas</h1>
                </div>
                <button onClick={createNewRoutine} className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                    <Plus size={18} /> Crear
                </button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {routines.map(r => (
                    <div key={r.id} className={`bg-surface p-4 rounded-xl border ${activeRoutineId === r.id ? 'border-primary ring-1 ring-primary' : 'border-gray-700'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-lg text-white">{r.name}</h3>
                                <p className="text-sm text-gray-400">{r.days.length} Días de entrenamiento</p>
                            </div>
                            {activeRoutineId === r.id && <span className="bg-primary text-xs font-bold px-2 py-1 rounded text-white">ACTIVA</span>}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => handleEdit(r)} className="flex-1 bg-gray-700 py-2 rounded text-sm font-medium hover:bg-gray-600">Editar</button>
                            <button onClick={() => duplicateRoutine(r)} className="bg-gray-700 px-3 py-2 rounded text-gray-300 hover:bg-gray-600" title="Duplicar">
                                <Copy size={18} />
                            </button>
                            <button onClick={() => handleDeleteRoutine(r.id)} className="bg-gray-700 px-3 py-2 rounded text-red-400 hover:bg-gray-600" title="Eliminar">
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <button onClick={() => toggleActive(r.id)} className={`w-full mt-2 py-2 rounded text-sm font-medium transition-colors ${activeRoutineId === r.id ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}>
                            {activeRoutineId === r.id ? 'Desactivar' : 'Seleccionar para Entrenar'}
                        </button>
                    </div>
                ))}
                {routines.length === 0 && <p className="text-center text-gray-500 mt-10">No tienes rutinas creadas.</p>}
            </div>
        </div>
    );
  }

  // --- Editor View ---
  return (
    <div className="h-screen bg-dark flex flex-col overflow-hidden">
         <header className="p-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-dark/95 z-20">
            <div className="flex items-center gap-4">
                <button onClick={() => setEditingId(null)} className="p-2 hover:bg-gray-800 rounded-full"><ArrowLeft /></button>
                <input 
                    type="text" 
                    value={tempRoutine?.name} 
                    onChange={(e) => setTempRoutine(prev => prev ? ({...prev, name: e.target.value}) : null)}
                    className="bg-transparent font-bold text-xl focus:outline-none border-b border-transparent focus:border-primary w-full"
                />
            </div>
            <button onClick={saveRoutine} className="text-primary p-2 rounded-full hover:bg-gray-800">
                <Save size={24} />
            </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 pb-24">
            <div className="flex flex-col gap-6">
                {tempRoutine?.days.map((day, idx) => (
                    <div key={day.id} className="bg-surface rounded-xl border border-gray-700 overflow-hidden">
                        <div className="bg-gray-800/50 p-3 flex justify-between items-center border-b border-gray-700">
                            <input 
                                className="bg-transparent font-bold text-white focus:outline-none" 
                                value={day.name} 
                                onChange={(e) => {
                                    const newDays = [...tempRoutine.days];
                                    newDays[idx].name = e.target.value;
                                    setTempRoutine({...tempRoutine, days: newDays});
                                }}
                            />
                            <button onClick={() => {
                                const newDays = tempRoutine.days.filter((_, i) => i !== idx);
                                setTempRoutine({...tempRoutine, days: newDays});
                            }} className="text-red-400"><Trash2 size={16} /></button>
                        </div>
                        
                        <div className="p-2 flex flex-col gap-2">
                            {day.exercises.map((ex, exIdx) => {
                                const base = exercisesDB.find(e => e.id === ex.exerciseBaseId);
                                const variant = base?.variants.find(v => v.id === ex.variantId);
                                return (
                                    <div key={ex.id} className={`bg-dark p-3 rounded border border-gray-700 relative ${ex.linkedToNext ? 'border-b-0 rounded-b-none mb-0 pb-6' : ''}`}>
                                        
                                        {/* Linking Visual Connector */}
                                        {ex.linkedToNext && (
                                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-3 z-10 bg-dark border border-gray-600 rounded-full p-1">
                                                <LinkIcon size={12} className="text-primary" />
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-800 px-1 rounded">{base?.muscleGroup}</span>
                                                <p className="font-bold text-sm text-primary mt-1">{base?.name}</p>
                                                <p className="text-xs text-gray-300">{variant?.name}</p>
                                            </div>
                                            <button onClick={() => removeExercise(day.id, ex.id)} className="text-gray-600 hover:text-red-400"><Trash2 size={14} /></button>
                                        </div>
                                        
                                        <div className="grid grid-cols-4 gap-2 text-xs">
                                            <label>
                                                <span className="text-gray-500 block mb-1">Series</span>
                                                <input type="number" value={ex.targetSets} 
                                                    onChange={(e) => updateExercise(day.id, ex.id, 'targetSets', parseInt(e.target.value))}
                                                    className="w-full bg-gray-800 rounded p-1 text-center" />
                                            </label>
                                            <label>
                                                <span className="text-gray-500 block mb-1">Reps</span>
                                                <input type="text" value={ex.targetReps}
                                                    onChange={(e) => updateExercise(day.id, ex.id, 'targetReps', e.target.value)}
                                                    className="w-full bg-gray-800 rounded p-1 text-center" />
                                            </label>
                                            <label>
                                                <span className="text-gray-500 block mb-1">Desc(s)</span>
                                                <select value={ex.restTimeSeconds}
                                                    onChange={(e) => updateExercise(day.id, ex.id, 'restTimeSeconds', parseInt(e.target.value))}
                                                    className="w-full bg-gray-800 rounded p-1 text-center appearance-none"
                                                >
                                                    <option value="5">5</option>
                                                    <option value="10">10</option>
                                                    <option value="30">30</option>
                                                    <option value="45">45</option>
                                                    <option value="60">60</option>
                                                    <option value="75">75</option>
                                                    <option value="90">90</option>
                                                    <option value="120">120</option>
                                                </select>
                                            </label>
                                             <label>
                                                <span className="text-gray-500 block mb-1">Tipo</span>
                                                <select value={ex.type}
                                                    onChange={(e) => updateExercise(day.id, ex.id, 'type', e.target.value)}
                                                    className="w-full bg-gray-800 rounded p-1 text-center appearance-none truncate"
                                                >
                                                    <option value={ExerciseType.Normal}>Normal</option>
                                                    <option value={ExerciseType.Superserie}>S.Serie</option>
                                                    <option value={ExerciseType.Biserie}>Biserie</option>
                                                    <option value={ExerciseType.BIIO}>BIIO</option>
                                                </select>
                                            </label>
                                        </div>
                                        
                                        {/* Linking Option */}
                                        {(ex.type === ExerciseType.Superserie || ex.type === ExerciseType.Biserie) && (
                                            <div className="mt-2 pt-2 border-t border-gray-700 flex items-center gap-2">
                                                <input 
                                                    type="checkbox" 
                                                    id={`link-${ex.id}`}
                                                    checked={!!ex.linkedToNext}
                                                    onChange={(e) => updateExercise(day.id, ex.id, 'linkedToNext', e.target.checked)}
                                                    className="rounded bg-gray-800 border-gray-600 text-primary focus:ring-primary"
                                                />
                                                <label htmlFor={`link-${ex.id}`} className="text-xs text-gray-400">Enlazar con siguiente</label>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <button 
                                onClick={() => setShowExerciseSelector({ dayId: day.id })}
                                className="w-full py-3 border border-dashed border-gray-600 rounded text-gray-400 text-sm hover:bg-gray-800 transition-colors"
                            >
                                + Añadir Ejercicio
                            </button>
                        </div>
                    </div>
                ))}
                
                <button onClick={addDay} className="bg-surface py-4 rounded-xl border border-gray-700 font-bold text-gray-300 hover:text-white transition-colors">
                    + Añadir Día
                </button>
            </div>
        </div>

        {/* Exercise Selector Modal */}
        {showExerciseSelector && (
            <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Seleccionar Ejercicio</h3>
                    <button onClick={() => setShowExerciseSelector(null)}><Check className="text-primary" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {Object.values(MuscleGroup).map(group => {
                        const isOpen = expandedGroup === group;
                        return (
                            <div key={group} className="mb-4 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                                <button 
                                    onClick={() => setExpandedGroup(isOpen ? null : group)}
                                    className="w-full p-4 flex justify-between items-center bg-gray-800 hover:bg-gray-700"
                                >
                                    <h4 className="text-primary font-bold text-sm uppercase tracking-wider">{group}</h4>
                                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                
                                {isOpen && (
                                    <div className="p-2 flex flex-col gap-2">
                                        {exercisesDB.filter(e => e.muscleGroup === group).map(ex => (
                                            <div key={ex.id} className="bg-dark rounded border border-gray-700 overflow-hidden">
                                                <div className="p-2 bg-gray-800/50 font-medium text-xs text-gray-300">{ex.name}</div>
                                                <div className="divide-y divide-gray-800">
                                                    {ex.variants.map(v => (
                                                        <button 
                                                            key={v.id} 
                                                            onClick={() => addExerciseToDay(ex, v.id)}
                                                            className="w-full text-left p-2 text-sm text-white hover:bg-gray-700 flex justify-between"
                                                        >
                                                            {v.name}
                                                            <Plus size={16} className="text-gray-500" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {exercisesDB.filter(e => e.muscleGroup === group).length === 0 && (
                                            <p className="text-xs text-gray-500 p-2 text-center">No hay ejercicios.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
    </div>
  );
};