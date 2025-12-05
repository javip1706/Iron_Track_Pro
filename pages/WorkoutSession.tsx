import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, RefreshCw, Link as LinkIcon, ChevronUp, ChevronDown, Plus, Minus, Timer, MoreVertical, Trash2, X, Check, History, Edit3, Save, LogOut, Download } from 'lucide-react';
import { StorageService } from '../services/storage';
import { Routine, RoutineDay, ScheduledExercise, SetLog, WorkoutSessionLog, ExerciseBase, ExerciseType, MuscleGroup, CompletedExerciseLog } from '../types';
import { RestTimer } from '../components/RestTimer';

// Helper to format dates like "W47-25"
const getWeekId = (date: Date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date.getTime() - startOfYear.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
    return `W${weekNum}-${date.getFullYear().toString().substr(-2)}`;
};

const REST_OPTIONS = [5, 10, 30, 45, 60, , 75, 90, 120];

export const WorkoutSession: React.FC = () => {
  const navigate = useNavigate();
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [selectedDay, setSelectedDay] = useState<RoutineDay | null>(null);
  const [exercisesDB, setExercisesDB] = useState<ExerciseBase[]>([]);
  
  // Logs state
  const [sessionLogs, setSessionLogs] = useState<Record<string, SetLog[]>>({});
  
  // Start time for duration calculation
  const startTimeRef = useRef<number>(Date.now());
  
  // Timer State
  const [timerState, setTimerState] = useState({ isOpen: false, seconds: 60, exerciseId: '', setIndex: -1 });
  
  // Mini Timer State (for BIIO 5s)
  const [miniTimer, setMiniTimer] = useState<{id: string, active: boolean}>({id: '', active: false});
  
  // Audio ref for Beeps
  const audioContextRef = useRef<AudioContext | null>(null);

  // UI State
  const [viewMode, setViewMode] = useState<'select-day' | 'active'>('select-day');
  
  // New Exercise Selector State
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [expandedSelectorGroup, setExpandedSelectorGroup] = useState<string | null>(null); // Accordion state
  
  // Edit Modal State
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{exerciseBaseId: string, variantId: string, targetSets: number, targetReps: string, restTimeSeconds: number, type: ExerciseType} | null>(null);
  
  // Quick Edit Rest Time State
  const [editingRestTimeExId, setEditingRestTimeExId] = useState<string | null>(null);

  // History Popover State
  const [showHistoryFor, setShowHistoryFor] = useState<string | null>(null); // variantId

  // Menu State (3 dots)
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  // Finish Modal State
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [saveAsRoutineName, setSaveAsRoutineName] = useState('');

  // Auto-Save Effect with DEBOUNCE (Performance Optimization)
  useEffect(() => {
    if (viewMode === 'active' && selectedDay) {
        // Set a timeout to save after 1 second of inactivity
        const timer = setTimeout(() => {
            StorageService.saveSessionDraft(sessionLogs, selectedDay.id);
        }, 1000);

        // Clear timeout if dependencies change (user is still typing)
        return () => clearTimeout(timer);
    }
  }, [sessionLogs, viewMode, selectedDay]);

  useEffect(() => {
    const rId = StorageService.getActiveRoutineId();
    const routines = StorageService.getRoutines();
    const exDB = StorageService.getExercises();
    setExercisesDB(exDB);

    const routine = routines.find(r => r.id === rId);
    if (routine) {
        setActiveRoutine(routine);
    } else {
        alert("Por favor selecciona una rutina activa primero.");
        navigate('/routines');
    }
  }, [navigate]);

  // BIIO Timer Logic with Beep
  useEffect(() => {
      let timeout: ReturnType<typeof setTimeout>;
      if (miniTimer.active) {
          timeout = setTimeout(() => {
              playShortBeep();
              setMiniTimer(prev => ({...prev, active: false})); 
          }, 5000); // 5 seconds for BIIO
      }
      return () => clearTimeout(timeout);
  }, [miniTimer.active]);

  const playShortBeep = () => {
      try {
          if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          const ctx = audioContextRef.current;
          
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.connect(gain);
          gain.connect(ctx.destination);

          // Soft beep
          osc.type = 'sine';
          osc.frequency.setValueAtTime(500, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

          osc.start();
          osc.stop(ctx.currentTime + 0.2);
      } catch (e) {
          console.error("Audio play failed", e);
      }
  };

  const startDay = (day: RoutineDay) => {
      setSelectedDay(JSON.parse(JSON.stringify(day))); // Deep copy to allow local reordering
      setSaveAsRoutineName(`${day.name} (Modificado)`);

      // Check for Draft
      const draft = StorageService.getSessionDraft();
      let initLogs: Record<string, SetLog[]> = {};
      let restoredStartTime = Date.now();

      let loadDraft = false;
      if (draft && draft.dayId === day.id) {
          try {
             // Basic confirm is safer in pure React environments than custom modals for initial load
             // But we can just load it if it exists or ask. 
             // Using confirm here as requested by user flow previously
             // eslint-disable-next-line no-restricted-globals
             if(confirm("Se ha encontrado una sesión no finalizada. ¿Quieres recuperarla?")) {
                 loadDraft = true;
             }
          } catch(e) {
              loadDraft = true; 
          }
      }

      if (loadDraft && draft) {
          initLogs = draft.logs;
          const storedTime = StorageService.getSessionStartTime();
          if (storedTime) restoredStartTime = storedTime;
      } else {
          // Initialize fresh logs
          day.exercises.forEach(ex => {
              initLogs[ex.id] = Array(ex.targetSets).fill(null).map((_, i) => ({
                  setNumber: i + 1,
                  weight: 0,
                  reps: 0,
                  completed: false
              }));
          });
          StorageService.saveSessionStartTime(restoredStartTime);
      }
      
      startTimeRef.current = restoredStartTime;
      setSessionLogs(initLogs);
      setViewMode('active');
  };

  const updateLog = (exId: string, setIndex: number, field: keyof SetLog, value: number) => {
      setSessionLogs(prev => {
          const exLogs = [...prev[exId]];
          if (!exLogs[setIndex]) return prev;
          exLogs[setIndex] = { ...exLogs[setIndex], [field]: value };
          return { ...prev, [exId]: exLogs };
      });
  };

  const toggleSetComplete = (exId: string, setIndex: number, restTime: number, linkedToNext: boolean = false) => {
      setSessionLogs(prev => {
          const exLogs = [...prev[exId]];
          const isCompleting = !exLogs[setIndex].completed;
          exLogs[setIndex] = { ...exLogs[setIndex], completed: isCompleting };
          
          if (isCompleting) {
             // Only open timer if NOT linked to next
             if (!linkedToNext) {
                 setTimerState({ isOpen: true, seconds: restTime, exerciseId: exId, setIndex: setIndex });
             } else {
                 // If linked, we assume 0 rest or immediate transition, so we just mark complete
                 exLogs[setIndex].actualRestTime = 0;
             }
          } else {
              // Reset actual rest time if unchecking
               exLogs[setIndex].actualRestTime = undefined;
          }

          return { ...prev, [exId]: exLogs };
      });
  };

  const handleTimerFinish = (actualTime: number) => {
      if (timerState.exerciseId && timerState.setIndex !== -1) {
          setSessionLogs(prev => {
              const exLogs = [...prev[timerState.exerciseId]];
              if (exLogs[timerState.setIndex]) {
                  exLogs[timerState.setIndex] = { ...exLogs[timerState.setIndex], actualRestTime: actualTime };
              }
              return { ...prev, [timerState.exerciseId]: exLogs };
          });
      }
      setTimerState({...timerState, isOpen: false});
  };

  const addSet = (exId: string) => {
      setSessionLogs(prev => {
          const current = prev[exId] || [];
          const newSet: SetLog = {
              setNumber: current.length + 1,
              weight: current.length > 0 ? current[current.length-1].weight : 0,
              reps: 0,
              completed: false
          };
          return { ...prev, [exId]: [...current, newSet] };
      });
  };

  const removeSet = (exId: string) => {
      setSessionLogs(prev => {
          const current = prev[exId] || [];
          if (current.length <= 1) return prev;
          return { ...prev, [exId]: current.slice(0, -1) };
      });
  };

  const triggerMiniTimer = (id: string) => {
      // Initialize/Resume audio context on user interaction
      if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
      }
      
      setMiniTimer({id, active: true});
  };

  const handleFinishClick = () => {
    setShowFinishModal(true);
  };

  const handleExitWithoutSaving = () => {
      // Remove confirm, just execute
      StorageService.clearSessionDraft();
      navigate('/');
  };

  const finalizeSession = (saveAsNew: boolean) => {
      if (!activeRoutine || !selectedDay) return;
      
      // Calculate duration
      const endTime = Date.now();
      const duration = endTime - startTimeRef.current;

      // 1. Construct the log with detailed snapshots
      const completedExercises: CompletedExerciseLog[] = selectedDay.exercises.map(ex => {
          const base = exercisesDB.find(e => e.id === ex.exerciseBaseId);
          const variant = base?.variants.find(v => v.id === ex.variantId);
          return {
              exerciseBaseId: ex.exerciseBaseId,
              variantId: ex.variantId,
              exerciseName: base?.name || 'Desconocido',
              variantName: variant?.name || 'Desconocido',
              sets: sessionLogs[ex.id] || []
          };
      });

      const logEntry: WorkoutSessionLog = {
          id: Date.now().toString(),
          routineId: activeRoutine.id,
          routineName: activeRoutine.name,
          dayId: selectedDay.id,
          dayName: selectedDay.name,
          date: endTime,
          weekId: getWeekId(new Date()),
          startTime: startTimeRef.current,
          endTime: endTime,
          duration: duration,
          exercises: completedExercises
      };

      StorageService.saveWorkoutLog(logEntry);
      StorageService.clearSessionDraft(); // Clear draft on successful save

      // 2. Optional: Save as new Routine
      if (saveAsNew && saveAsRoutineName.trim()) {
          const newRoutine: Routine = {
              id: Date.now().toString(),
              name: saveAsRoutineName,
              days: [{ ...selectedDay, name: 'Día Único' }], // Simplified
              createdAt: Date.now()
          };
          const currentRoutines = StorageService.getRoutines();
          StorageService.saveRoutines([...currentRoutines, newRoutine]);
      }

      setShowFinishModal(false);
      navigate('/');
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
      if (!selectedDay) return;
      const newExercises = [...selectedDay.exercises];
      if (direction === 'up' && index > 0) {
          [newExercises[index], newExercises[index - 1]] = [newExercises[index - 1], newExercises[index]];
      } else if (direction === 'down' && index < newExercises.length - 1) {
          [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
      }
      setSelectedDay({ ...selectedDay, exercises: newExercises });
  };

  // Copy History Logic Fixed
  const copyHistoryToCurrent = (exId: string, historySets: SetLog[]) => {
      // Direct copy without confirmation to avoid browser blocks
      setSessionLogs(prev => {
          // Create deep copy of previous state
          const newState = JSON.parse(JSON.stringify(prev));
          const currentLogs = newState[exId] || [];
          
          // Map history sets to current sets
          const updatedLogs = currentLogs.map((log: SetLog, index: number) => {
              const matchingHistorySet = historySets[index];
              if (matchingHistorySet) {
                  return {
                      ...log,
                      weight: matchingHistorySet.weight,
                      reps: matchingHistorySet.reps,
                      reps2: matchingHistorySet.reps2,
                      reps3: matchingHistorySet.reps3,
                      completed: false // Keep unchecked
                  };
              }
              return log;
          });
          
          newState[exId] = updatedLogs;
          return newState;
      });
      setShowHistoryFor(null);
  };

  // --- Dynamic Exercise Management ---

  const addExerciseToSession = (exerciseBase: ExerciseBase, variantId: string) => {
      if (!selectedDay) return;
      const newEx: ScheduledExercise = {
          id: `temp_${Date.now()}`,
          exerciseBaseId: exerciseBase.id,
          variantId: variantId,
          targetSets: 3,
          targetReps: '10-12',
          restTimeSeconds: 60,
          type: ExerciseType.Normal
      };
      
      // Add to logs
      const initLogs = Array(3).fill(null).map((_, i) => ({
        setNumber: i + 1,
        weight: 0,
        reps: 0,
        completed: false
      }));
      
      setSessionLogs(prev => ({...prev, [newEx.id]: initLogs}));
      setSelectedDay({...selectedDay, exercises: [...selectedDay.exercises, newEx]});
      setShowExerciseSelector(false);
  };

  const removeExerciseFromSession = (index: number) => {
      if (!selectedDay) return;
      // Removed native confirm block. Immediate action.
      
      const exId = selectedDay.exercises[index].id;
      const newExercises = selectedDay.exercises.filter((_, i) => i !== index);
      
      // Clean logs
      const newLogs = {...sessionLogs};
      delete newLogs[exId];
      
      setSelectedDay({...selectedDay, exercises: newExercises});
      setSessionLogs(newLogs);
      setOpenMenuIndex(null); // Close menu if open
  };

  const startEditingExercise = (index: number) => {
      if (!selectedDay) return;
      const ex = selectedDay.exercises[index];
      setEditingExerciseIndex(index);
      setEditForm({
          exerciseBaseId: ex.exerciseBaseId,
          variantId: ex.variantId,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          restTimeSeconds: ex.restTimeSeconds,
          type: ex.type
      });
      setOpenMenuIndex(null); // Close menu
  };

  const saveExerciseEdit = () => {
      if (editingExerciseIndex === null || !selectedDay || !editForm) return;
      const newExercises = [...selectedDay.exercises];
      newExercises[editingExerciseIndex] = {
          ...newExercises[editingExerciseIndex],
          exerciseBaseId: editForm.exerciseBaseId,
          variantId: editForm.variantId,
          targetSets: editForm.targetSets,
          targetReps: editForm.targetReps,
          restTimeSeconds: editForm.restTimeSeconds,
          type: editForm.type
      };
      setSelectedDay({...selectedDay, exercises: newExercises});
      setEditingExerciseIndex(null);
      setEditForm(null);
  };

  const updateRestTime = (exIndex: number, newTime: number) => {
      if (!selectedDay) return;
      const newExercises = [...selectedDay.exercises];
      newExercises[exIndex].restTimeSeconds = newTime;
      setSelectedDay({...selectedDay, exercises: newExercises});
      setEditingRestTimeExId(null);
  };

  // Selection Screen
  if (viewMode === 'select-day' && activeRoutine) {
      return (
        <div className="h-screen bg-dark flex flex-col overflow-hidden">
            <div className="p-6 pb-0">
                <Link to="/" className="mb-6 flex items-center text-gray-400"><ArrowLeft className="mr-2"/> Cancelar</Link>
                <h1 className="text-3xl font-bold text-white mb-2">{activeRoutine.name}</h1>
                <p className="text-gray-400 mb-6">Selecciona el día para entrenar hoy</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 pt-0 flex flex-col gap-4">
                {activeRoutine.days.map(day => (
                    <button 
                        key={day.id} 
                        onClick={() => startDay(day)}
                        className="bg-surface p-6 rounded-xl border border-gray-700 hover:border-primary text-left transition-all active:scale-95 shrink-0"
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-bold">{day.name}</span>
                            <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">{day.exercises.length} Ejercicios</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
      );
  }

  if (!activeRoutine || !selectedDay) return <div>Cargando...</div>;

  return (
    <div className="h-screen bg-dark flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-dark/95 border-b border-gray-800 p-3 flex justify-between items-center backdrop-blur shrink-0">
            <div>
                <h2 className="font-bold text-lg leading-none">{selectedDay.name}</h2>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                    <span>{getWeekId(new Date())}</span>
                    <span className="text-green-500 font-medium flex items-center gap-1">
                        <Save size={10} /> Guardado autom.
                    </span>
                </div>
            </div>
            <div className="flex gap-3 items-center">
                <button onClick={handleFinishClick} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg text-sm shadow-lg shadow-green-900/20 transition-colors">
                    Finalizar
                </button>
            </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-4">
            {selectedDay.exercises.map((ex, exIndex) => {
                const base = exercisesDB.find(e => e.id === ex.exerciseBaseId);
                const variant = base?.variants.find(v => v.id === ex.variantId);
                const sets = sessionLogs[ex.id] || [];
                const isLinked = ex.linkedToNext;
                const isBIIO = ex.type === ExerciseType.BIIO;
                const isEditing = editingExerciseIndex === exIndex;
                const isHistoryOpen = showHistoryFor === ex.variantId;
                const isMenuOpen = openMenuIndex === exIndex;
                
                // Fetch History if open
                const history = isHistoryOpen ? StorageService.getExerciseHistory(ex.variantId) : [];

                return (
                    <div key={`${ex.id}-${exIndex}`} className="relative"> 
                        {/* Connector Line */}
                        {isLinked && (
                            <div className="absolute left-1/2 bottom-[-20px] h-[40px] w-[2px] bg-primary z-0 transform -translate-x-1/2"></div>
                        )}

                        <div className={`relative z-10 bg-surface rounded-xl overflow-hidden border shadow-sm ${isLinked ? 'border-primary/50 mb-0 rounded-b-lg' : 'border-gray-700'}`}>
                            {/* Exercise Header */}
                            <div className="bg-gray-800 p-3 flex justify-between items-start">
                                <div className="flex-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-900 px-1 rounded mb-1 inline-block">{base?.muscleGroup}</span>
                                    {isEditing ? (
                                        // Edit Mode: Allow Changing Exercise Base
                                        <div className="flex flex-col gap-2 mt-1 w-full max-w-[240px]">
                                            <label className="text-[10px] text-gray-400">Ejercicio:</label>
                                            <select 
                                                className="bg-gray-700 text-white text-xs p-1.5 rounded w-full"
                                                value={editForm?.exerciseBaseId}
                                                onChange={e => {
                                                    const newBaseId = e.target.value;
                                                    const newBase = exercisesDB.find(ex => ex.id === newBaseId);
                                                    setEditForm(prev => prev ? {
                                                        ...prev, 
                                                        exerciseBaseId: newBaseId,
                                                        variantId: newBase?.variants[0]?.id || '' // Reset variant to first available
                                                    } : null);
                                                }}
                                            >
                                                {/* Filter exercises by the current muscle group to keep it sane */}
                                                {exercisesDB.filter(e => e.muscleGroup === base?.muscleGroup).map(e => (
                                                    <option key={e.id} value={e.id}>{e.name}</option>
                                                ))}
                                            </select>

                                            <label className="text-[10px] text-gray-400">Variante:</label>
                                            <select 
                                                className="bg-gray-700 text-white text-xs p-1.5 rounded w-full"
                                                value={editForm?.variantId}
                                                onChange={e => setEditForm(prev => prev ? {...prev, variantId: e.target.value} : null)}
                                            >
                                                {/* Re-find base based on editForm selection to show correct variants */}
                                                {exercisesDB.find(e => e.id === editForm?.exerciseBaseId)?.variants.map(v => (
                                                    <option key={v.id} value={v.id}>{v.name}</option>
                                                ))}
                                            </select>

                                            <label className="text-[10px] text-gray-400">Tipo:</label>
                                            <select 
                                                className="bg-gray-700 text-white text-xs p-1.5 rounded w-full"
                                                value={editForm?.type}
                                                onChange={e => setEditForm(prev => prev ? {...prev, type: e.target.value as ExerciseType} : null)}
                                            >
                                                {Object.values(ExerciseType).map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-white text-lg">{base?.name}</h3>
                                                {ex.type !== ExerciseType.Normal && (
                                                    <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1 rounded border border-purple-500/30">
                                                        {ex.type}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-primary text-sm">
                                                <span>{variant?.name}</span>
                                                {base && base.variants.length > 1 && <RefreshCw size={12} className="opacity-50" />}
                                            </div>
                                        </>
                                    )}
                                </div>
                                
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex gap-2 items-start relative">
                                        <button 
                                            onClick={() => setShowHistoryFor(isHistoryOpen ? null : ex.variantId)}
                                            className={`p-1 rounded ${isHistoryOpen ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                            title="Ver Historial"
                                        >
                                            <History size={16} />
                                        </button>
                                        
                                        <div className="flex gap-1">
                                            <button onClick={() => moveExercise(exIndex, 'up')} disabled={exIndex === 0} className="p-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30"><ChevronUp size={16}/></button>
                                            <button onClick={() => moveExercise(exIndex, 'down')} disabled={exIndex === selectedDay.exercises.length -1} className="p-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30"><ChevronDown size={16}/></button>
                                        </div>
                                        
                                        {/* Menu / Options */}
                                        <div className="relative">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(isMenuOpen ? null : exIndex); }}
                                                className={`p-1 rounded hover:bg-gray-600 ${isMenuOpen ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                                            >
                                                <MoreVertical size={16}/>
                                            </button>
                                            
                                            {isMenuOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-30" onClick={() => setOpenMenuIndex(null)}></div>
                                                    <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-xl z-40 min-w-[140px] overflow-hidden">
                                                        <button onClick={() => startEditingExercise(exIndex)} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-700 flex items-center gap-2 border-b border-gray-700">
                                                            <RefreshCw size={14}/> Editar
                                                        </button>
                                                        <button onClick={() => removeExerciseFromSession(exIndex)} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-700 text-red-400 flex items-center gap-2">
                                                            <Trash2 size={14}/> Eliminar
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="text-right mt-1">
                                        {isEditing ? (
                                            <div className="flex flex-col gap-1 items-end mt-2">
                                                 <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-gray-400">Sets:</span>
                                                    <input type="number" className="w-8 bg-gray-700 text-xs text-center rounded" value={editForm?.targetSets} onChange={e => setEditForm(prev => prev ? {...prev, targetSets: parseInt(e.target.value)} : null)} />
                                                 </div>
                                                 <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-gray-400">Reps:</span>
                                                    <input type="text" className="w-12 bg-gray-700 text-xs text-center rounded" value={editForm?.targetReps} onChange={e => setEditForm(prev => prev ? {...prev, targetReps: e.target.value} : null)} />
                                                 </div>
                                                 <div className="flex gap-2 mt-1">
                                                     <button onClick={() => setEditingExerciseIndex(null)} className="text-red-400"><X size={14}/></button>
                                                     <button onClick={saveExerciseEdit} className="text-green-400"><Check size={14}/></button>
                                                 </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-xs text-gray-400">Obj: {ex.targetSets} x {ex.targetReps}</div>
                                                
                                                {/* Rest Time Config */}
                                                {isLinked ? (
                                                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-primary font-bold opacity-80">
                                                        <LinkIcon size={10} /> Sin descanso
                                                    </div>
                                                ) : (
                                                    editingRestTimeExId === ex.id ? (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <span className="text-xs text-gray-400">Desc:</span>
                                                            <select
                                                                autoFocus
                                                                className="bg-gray-700 text-xs text-white p-1 rounded text-center outline-none border border-primary"
                                                                value={ex.restTimeSeconds}
                                                                onChange={(e) => {
                                                                    updateRestTime(exIndex, parseInt(e.target.value));
                                                                    setEditingRestTimeExId(null);
                                                                }}
                                                                onBlur={() => setEditingRestTimeExId(null)}
                                                            >
                                                                {REST_OPTIONS.map(time => (
                                                                    <option key={time} value={time}>{time}s</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setEditingRestTimeExId(ex.id)}
                                                            className="text-xs text-gray-500 hover:text-primary hover:bg-gray-700 px-1 rounded transition-colors flex items-center justify-end gap-1 mt-1"
                                                        >
                                                            Desc: {ex.restTimeSeconds}s <Edit3 size={10} />
                                                        </button>
                                                    )
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* History Panel */}
                            {isHistoryOpen && (
                                <div className="bg-gray-900/90 p-4 border-b border-primary/30 text-sm animate-in slide-in-from-top-2 shadow-inner">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-primary font-bold flex items-center gap-2">
                                            <History size={16} /> Historial Reciente
                                        </h4>
                                        <button onClick={() => setShowHistoryFor(null)} className="bg-gray-800 p-1 rounded-full hover:bg-gray-700"><X size={16} /></button>
                                    </div>
                                    {history.length === 0 ? (
                                        <p className="text-gray-500 italic text-center py-4">No hay registros anteriores para esta variante.</p>
                                    ) : (
                                        <div className="flex gap-4 overflow-x-auto pb-2 snap-x no-scrollbar">
                                            {history.map((entry, hIdx) => (
                                                <div key={hIdx} className="bg-gray-800 rounded-xl p-3 border border-gray-600 shadow-lg min-w-[160px] snap-center flex-shrink-0">
                                                    <div className="text-white font-bold text-xs mb-2 border-b border-gray-600 pb-2 flex justify-between items-center">
                                                        <span className="capitalize">{new Date(entry.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                copyHistoryToCurrent(ex.id, entry.sets);
                                                            }} 
                                                            type="button"
                                                            className="text-primary hover:text-white p-2 rounded hover:bg-gray-700 active:scale-95 transition-transform" 
                                                            title="Copiar datos"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-[10px] text-gray-500 px-1">
                                                            <span>#</span>
                                                            <span>Kg</span>
                                                            <span>Reps</span>
                                                        </div>
                                                        {entry.sets.filter((s:any) => s.completed || s.weight > 0 || s.reps > 0).map((s:any, sIdx:number) => (
                                                            <div key={sIdx} className="flex justify-between items-center text-xs bg-dark/40 p-1.5 rounded border border-gray-700/50">
                                                                <span className="text-gray-500 w-4 text-[10px]">{s.setNumber}</span>
                                                                <span className="font-bold text-white">{s.weight} <span className="text-[9px] font-normal text-gray-500">kg</span></span>
                                                                <span className="font-mono text-primary">
                                                                    {s.reps}
                                                                    {s.reps2 ? `-${s.reps2}` : ''}
                                                                    {s.reps3 ? `-${s.reps3}` : ''}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Sets Table */}
                            <div className="p-2">
                                <div className="grid grid-cols-10 gap-1 mb-2 text-xs text-gray-500 font-bold text-center items-center">
                                    <div className="col-span-1">#</div>
                                    <div className="col-span-2">KG</div>
                                    <div className={`${isBIIO ? 'col-span-5' : 'col-span-3'}`}>REPS</div>
                                    <div className="col-span-2">HECHO</div>
                                </div>
                                {sets.map((set, idx) => {
                                    const isMiniTimerActive = miniTimer.id.startsWith(`${ex.id}-${idx}`) && miniTimer.active;
                                    
                                    return (
                                    <div key={idx} className={`grid grid-cols-10 gap-1 mb-3 items-center relative ${set.completed ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
                                        <div className="col-span-1 text-center text-gray-400 font-mono">{idx + 1}</div>
                                        
                                        {/* Weight */}
                                        <div className="col-span-2">
                                            <input 
                                                type="number" 
                                                placeholder="0"
                                                value={set.weight || ''}
                                                onChange={(e) => updateLog(ex.id, idx, 'weight', parseFloat(e.target.value))}
                                                className="w-full bg-dark border border-gray-600 rounded p-2 text-center text-lg font-bold focus:border-primary focus:outline-none"
                                            />
                                        </div>
                                        
                                        {/* Reps */}
                                        <div className={`${isBIIO ? 'col-span-5 flex gap-1' : 'col-span-3'}`}>
                                            {isBIIO ? (
                                                <>
                                                    <input 
                                                        type="number" placeholder="R1" value={set.reps || ''}
                                                        onChange={(e) => updateLog(ex.id, idx, 'reps', parseFloat(e.target.value))}
                                                        className="w-full bg-dark border border-gray-600 rounded p-1 text-center focus:border-primary"
                                                    />
                                                    <button 
                                                        onClick={() => triggerMiniTimer(`${ex.id}-${idx}-1`)} 
                                                        className={`p-1 rounded ${miniTimer.id === `${ex.id}-${idx}-1` && miniTimer.active ? 'bg-yellow-500 animate-pulse' : 'bg-gray-700'}`}
                                                    >
                                                        <Timer size={12} />
                                                    </button>
                                                    <input 
                                                        type="number" placeholder="R2" value={set.reps2 || ''}
                                                        onChange={(e) => updateLog(ex.id, idx, 'reps2', parseFloat(e.target.value))}
                                                        className="w-full bg-dark border border-gray-600 rounded p-1 text-center focus:border-primary"
                                                    />
                                                    <button 
                                                        onClick={() => triggerMiniTimer(`${ex.id}-${idx}-2`)} 
                                                        className={`p-1 rounded ${miniTimer.id === `${ex.id}-${idx}-2` && miniTimer.active ? 'bg-yellow-500 animate-pulse' : 'bg-gray-700'}`}
                                                    >
                                                        <Timer size={12} />
                                                    </button>
                                                    <input 
                                                        type="number" placeholder="R3" value={set.reps3 || ''}
                                                        onChange={(e) => updateLog(ex.id, idx, 'reps3', parseFloat(e.target.value))}
                                                        className="w-full bg-dark border border-gray-600 rounded p-1 text-center focus:border-primary"
                                                    />
                                                </>
                                            ) : (
                                                <input 
                                                    type="number"
                                                    placeholder="0"
                                                    value={set.reps || ''}
                                                    onChange={(e) => updateLog(ex.id, idx, 'reps', parseFloat(e.target.value))}
                                                    className="w-full bg-dark border border-gray-600 rounded p-2 text-center text-lg font-bold focus:border-primary focus:outline-none"
                                                />
                                            )}
                                        </div>
                                        
                                        {/* Check Button */}
                                        <div className="col-span-2 flex flex-col items-center justify-center">
                                            <button 
                                                onClick={() => toggleSetComplete(ex.id, idx, ex.restTimeSeconds, !!ex.linkedToNext)}
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${set.completed ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                            {set.actualRestTime !== undefined && !isLinked && (
                                                <span className="text-[10px] text-primary mt-1 font-mono">
                                                    Desc: {set.actualRestTime}s
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )})}

                                {/* Dynamic Set Controls */}
                                <div className="flex justify-center gap-4 mt-2 border-t border-gray-700 pt-2">
                                    <button onClick={() => addSet(ex.id)} className="flex items-center gap-1 text-xs text-primary hover:bg-gray-700 px-2 py-1 rounded">
                                        <Plus size={12} /> Series
                                    </button>
                                    {sets.length > 1 && (
                                        <button onClick={() => removeSet(ex.id)} className="flex items-center gap-1 text-xs text-red-400 hover:bg-gray-700 px-2 py-1 rounded">
                                            <Minus size={12} /> Series
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        {isLinked && (
                            <div className="flex justify-center my-[-12px] relative z-20">
                                <div className="bg-dark border border-primary rounded-full p-1 text-primary shadow-lg shadow-primary/20">
                                    <LinkIcon size={14} />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
            
            <button 
                onClick={() => setShowExerciseSelector(true)}
                className="w-full py-4 rounded-xl border border-dashed border-gray-600 text-gray-400 font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
                <Plus size={20} /> Añadir Ejercicio
            </button>

            {/* Footer spacer */}
            <div className="h-12"></div>
        </div>

        <RestTimer 
            isOpen={timerState.isOpen} 
            seconds={timerState.seconds} 
            onClose={(time) => handleTimerFinish(time)}
            onComplete={(time) => handleTimerFinish(time)}
        />

        {/* Finish Modal */}
        {showFinishModal && (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                <div className="bg-surface rounded-xl border border-gray-700 p-6 w-full max-w-md shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-4">Finalizar Entrenamiento</h3>
                    <p className="text-gray-400 mb-6">¿Deseas guardar los cambios realizados en esta sesión como una nueva rutina personalizada?</p>
                    
                    <div className="mb-6">
                        <label className="text-xs text-gray-500 block mb-2">Nombre para la nueva rutina (opcional)</label>
                        <input 
                            type="text" 
                            className="w-full bg-dark border border-gray-600 rounded p-3 text-white"
                            value={saveAsRoutineName}
                            onChange={(e) => setSaveAsRoutineName(e.target.value)}
                            placeholder="Ej: Torso (Variación)"
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <button onClick={() => finalizeSession(true)} className="bg-primary hover:bg-sky-500 text-white font-bold py-3 rounded-lg">
                            Guardar como Nueva Rutina
                        </button>
                        <button onClick={() => finalizeSession(false)} className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg">
                            Sólo Guardar Registro
                        </button>
                        <button onClick={handleExitWithoutSaving} type="button" className="border border-red-500/50 text-red-400 hover:bg-red-500/10 font-medium py-3 rounded-lg flex items-center justify-center gap-2">
                           <LogOut size={18} /> Salir sin guardar
                        </button>
                        <button onClick={() => setShowFinishModal(false)} className="text-gray-500 hover:text-white py-2">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Exercise Selector Modal */}
        {showExerciseSelector && (
            <div className="fixed inset-0 bg-black/90 z-50 flex flex-col animate-in fade-in slide-in-from-bottom-10">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">Seleccionar Ejercicio</h3>
                    <button onClick={() => setShowExerciseSelector(false)} className="p-2 bg-gray-800 rounded-full"><X className="text-white" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {Object.values(MuscleGroup).map(group => {
                        const isExpanded = expandedSelectorGroup === group;
                        const groupExercises = exercisesDB.filter(e => e.muscleGroup === group);
                        
                        return (
                            <div key={group} className="mb-3 bg-surface rounded-xl border border-gray-700 overflow-hidden">
                                <button 
                                    onClick={() => setExpandedSelectorGroup(isExpanded ? null : group)}
                                    className="w-full p-4 flex justify-between items-center bg-gray-800 hover:bg-gray-700 transition-colors"
                                >
                                    <h4 className="text-primary font-bold text-sm uppercase tracking-wider">{group}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 bg-gray-900 px-2 py-0.5 rounded-full">{groupExercises.length}</span>
                                        {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                    </div>
                                </button>
                                
                                {isExpanded && (
                                    <div className="divide-y divide-gray-700/50 bg-gray-900/50">
                                        {groupExercises.length === 0 && (
                                            <p className="text-gray-500 text-xs p-4 text-center italic">No hay ejercicios en este grupo.</p>
                                        )}
                                        {groupExercises.map(ex => (
                                            <div key={ex.id} className="p-0">
                                                <div className="px-4 py-2 bg-gray-800/30 text-xs font-bold text-gray-300 uppercase tracking-wide border-b border-gray-800">
                                                    {ex.name}
                                                </div>
                                                <div>
                                                    {ex.variants.map(v => (
                                                        <button 
                                                            key={v.id} 
                                                            onClick={() => addExerciseToSession(ex, v.id)}
                                                            className="w-full text-left px-4 py-3 text-sm text-gray-400 hover:bg-gray-800 hover:text-white flex justify-between items-center transition-colors border-b border-gray-800/50 last:border-0"
                                                        >
                                                            {v.name}
                                                            <div className="bg-gray-800 p-1 rounded text-primary">
                                                                <Plus size={14} />
                                                            </div>
                                                        </button>
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
            </div>
        )}
    </div>
  );
};