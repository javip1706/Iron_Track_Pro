import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Edit2, X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { StorageService } from '../services/storage';
import { ExerciseBase, MuscleGroup, Variant } from '../types';

export const ExerciseLibrary: React.FC = () => {
  const [exercises, setExercises] = useState<ExerciseBase[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<MuscleGroup | null>(null);
  
  // New Exercise State
  const [isAddingEx, setIsAddingEx] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExGroup, setNewExGroup] = useState<MuscleGroup>(MuscleGroup.Pecho);

  // Edit State
  const [editingExId, setEditingExId] = useState<string | null>(null);
  const [editExName, setEditExName] = useState('');

  // Variant Add State
  const [addingVariantTo, setAddingVariantTo] = useState<string | null>(null);
  const [newVariantName, setNewVariantName] = useState('');

  // Confirmation Modal State
  const [confirmDelete, setConfirmDelete] = useState<{
      type: 'exercise' | 'variant';
      exId: string;
      vId?: string;
      name: string;
  } | null>(null);

  useEffect(() => {
    setExercises(StorageService.getExercises());
  }, []);

  const saveExercises = (newList: ExerciseBase[]) => {
    setExercises(newList);
    StorageService.saveExercises(newList);
  };

  const handleAddExercise = () => {
    if (!newExName.trim()) return;
    const newEx: ExerciseBase = {
      id: `ex_${Date.now()}`,
      name: newExName,
      muscleGroup: newExGroup,
      variants: [{ id: `v_${Date.now()}`, name: 'Estándar' }]
    };
    saveExercises([...exercises, newEx]);
    setIsAddingEx(false);
    setNewExName('');
  };

  // Request Deletes
  const requestDeleteExercise = (e: React.MouseEvent, ex: ExerciseBase) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete({ type: 'exercise', exId: ex.id, name: ex.name });
  };

  const requestDeleteVariant = (e: React.MouseEvent, exId: string, v: Variant) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete({ type: 'variant', exId, vId: v.id, name: v.name });
  };

  // Execute Delete
  const executeDelete = () => {
    if (!confirmDelete) return;

    if (confirmDelete.type === 'exercise') {
      saveExercises(exercises.filter(e => e.id !== confirmDelete.exId));
    } else if (confirmDelete.type === 'variant' && confirmDelete.vId) {
        const updated = exercises.map(e => {
        if (e.id === confirmDelete.exId) {
            return { ...e, variants: e.variants.filter(v => v.id !== confirmDelete.vId) };
        }
        return e;
        });
        saveExercises(updated);
    }
    setConfirmDelete(null);
  };

  const handleAddVariant = (exId: string) => {
    if (!newVariantName.trim()) return;
    const updated = exercises.map(e => {
      if (e.id === exId) {
        return {
          ...e,
          variants: [...e.variants, { id: `v_${Date.now()}`, name: newVariantName }]
        };
      }
      return e;
    });
    saveExercises(updated);
    setAddingVariantTo(null);
    setNewVariantName('');
  };
  
  const startEditEx = (e: React.MouseEvent, ex: ExerciseBase) => {
      e.preventDefault();
      e.stopPropagation();
      setEditingExId(ex.id);
      setEditExName(ex.name);
  }

  const saveEditEx = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      const updated = exercises.map(e => e.id === id ? { ...e, name: editExName } : e);
      saveExercises(updated);
      setEditingExId(null);
  }

  return (
    <div className="h-screen bg-dark flex flex-col overflow-hidden">
      {/* Header */}
      <header className="p-4 border-b border-gray-800 flex items-center sticky top-0 bg-dark/95 z-10 backdrop-blur-md shrink-0">
        <Link to="/" className="p-2 hover:bg-gray-800 rounded-full mr-2"><ArrowLeft /></Link>
        <h1 className="text-xl font-bold flex-1">Biblioteca de Ejercicios</h1>
        <button 
          type="button"
          onClick={() => setIsAddingEx(!isAddingEx)}
          className={`p-2 rounded-full transition-colors ${isAddingEx ? 'bg-red-500/20 text-red-500' : 'bg-primary text-white'}`}
        >
          {isAddingEx ? <X /> : <Plus />}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Add Form */}
        {isAddingEx && (
          <div className="bg-surface p-4 rounded-xl mb-6 border border-primary animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold mb-3 text-primary">Nuevo Ejercicio</h3>
            <div className="flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Nombre del ejercicio"
                className="bg-dark border border-gray-700 p-3 rounded-lg focus:border-primary outline-none text-white"
                value={newExName}
                onChange={e => setNewExName(e.target.value)}
              />
              <select 
                className="bg-dark border border-gray-700 p-3 rounded-lg outline-none text-white"
                value={newExGroup}
                onChange={e => setNewExGroup(e.target.value as MuscleGroup)}
              >
                {Object.values(MuscleGroup).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <button type="button" onClick={handleAddExercise} className="bg-primary text-white font-bold py-3 rounded-lg">Guardar</button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-4 pb-20">
          {Object.values(MuscleGroup).map(group => {
            const groupExercises = exercises.filter(e => e.muscleGroup === group);
            if (groupExercises.length === 0) return null;
            
            const isExpanded = expandedGroup === group;

            return (
              <div key={group} className="bg-surface rounded-xl border border-gray-700 overflow-hidden shrink-0">
                <button 
                  type="button"
                  onClick={() => setExpandedGroup(isExpanded ? null : group)}
                  className="w-full p-4 flex justify-between items-center bg-gray-800/50 hover:bg-gray-800 transition-colors"
                >
                  <span className="font-bold text-lg text-white">{group}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">{groupExercises.length}</span>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="divide-y divide-gray-700">
                    {groupExercises.map(ex => (
                      <div key={ex.id} className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          {editingExId === ex.id ? (
                              <div className="flex gap-2 flex-1 mr-2">
                                  <input 
                                    value={editExName} 
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={e => setEditExName(e.target.value)}
                                    className="bg-dark p-2 rounded border border-gray-600 flex-1 text-white"
                                  />
                                  <button type="button" onClick={(e) => saveEditEx(e, ex.id)} className="text-green-500 p-2"><Save size={20}/></button>
                              </div>
                          ) : (
                            <h3 className="font-bold text-primary text-lg">{ex.name}</h3>
                          )}
                          
                          <div className="flex gap-1">
                             {editingExId !== ex.id && (
                                <button type="button" onClick={(e) => startEditEx(e, ex)} className="text-gray-400 hover:text-white p-2"><Edit2 size={18} /></button>
                             )}
                             {/* Delete Exercise Button */}
                             <button type="button" onClick={(e) => requestDeleteExercise(e, ex)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                          </div>
                        </div>

                        <div className="pl-4 border-l-2 border-gray-700 space-y-2 mt-2">
                          {ex.variants.map(v => (
                            <div key={v.id} className="flex justify-between items-center text-sm p-2 bg-gray-900/50 rounded border border-gray-800 text-gray-300">
                                <span>{v.name}</span>
                                <div className="flex gap-1">
                                    <button onClick={(e) => requestDeleteVariant(e, ex.id, v)} className="text-gray-500 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                                </div>
                            </div>
                          ))}
                          
                           {/* Add Variant */}
                           {addingVariantTo === ex.id ? (
                                <div className="flex gap-2 mt-2">
                                    <input 
                                        autoFocus
                                        value={newVariantName}
                                        onChange={e => setNewVariantName(e.target.value)}
                                        className="bg-dark border border-gray-600 rounded px-2 py-1 text-sm flex-1 text-white"
                                        placeholder="Nueva variante..."
                                    />
                                    <button onClick={() => handleAddVariant(ex.id)} className="bg-primary text-white px-2 rounded"><Save size={14}/></button>
                                    <button onClick={() => setAddingVariantTo(null)} className="bg-gray-700 text-white px-2 rounded"><X size={14}/></button>
                                </div>
                           ) : (
                               <button onClick={() => setAddingVariantTo(ex.id)} className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
                                    <Plus size={12} /> Añadir variante
                               </button>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Delete Confirmation Modal */}
        {confirmDelete && (
             <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                <div className="bg-surface border border-gray-700 p-6 rounded-xl w-full max-w-sm shadow-2xl">
                    <div className="flex items-center gap-3 mb-4 text-red-500">
                        <AlertTriangle size={24} />
                        <h3 className="font-bold text-lg">Confirmar Eliminación</h3>
                    </div>
                    <p className="text-gray-300 mb-6">
                        ¿Estás seguro de que deseas eliminar 
                        {confirmDelete.type === 'exercise' ? ' el ejercicio ' : ' la variante '}
                        <span className="font-bold text-white">"{confirmDelete.name}"</span>?
                        <span className="block mt-2 text-xs text-gray-500">Esta acción no se puede deshacer.</span>
                    </p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                        <button onClick={executeDelete} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded">Eliminar</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};