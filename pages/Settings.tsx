import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Database, AlertTriangle, Trash2, CheckSquare, Square, RefreshCw, CopyPlus } from 'lucide-react';
import { StorageService, AppBackup } from '../services/storage';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingData, setPendingData] = useState<Partial<AppBackup> | null>(null);
  const [selection, setSelection] = useState({
      routines: true,
      exercises: true,
      logs: true,
      stats: true
  });
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');

  const handleExport = () => {
    const data = StorageService.createBackup();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `irontrack_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
          try {
              const data = JSON.parse(content);
              // Check basics
              if (!data.version) throw new Error("Formato inválido");
              setPendingData(data);
          } catch (err) {
              alert("Error al leer el archivo. Formato incorrecto.");
          }
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const executeImport = () => {
      if (!pendingData) return;
      
      const dataToRestore: Partial<AppBackup> = {};
      if (selection.routines && pendingData.routines) dataToRestore.routines = pendingData.routines;
      if (selection.exercises && pendingData.exercises) dataToRestore.exercises = pendingData.exercises;
      if (selection.logs && pendingData.logs) dataToRestore.logs = pendingData.logs;
      if (selection.stats && pendingData.stats) dataToRestore.stats = pendingData.stats;

      const success = StorageService.restoreData(dataToRestore, importMode);
      if (success) {
          alert("Datos importados correctamente.");
          // Instead of window.location.reload(), navigate to Dashboard to force re-render
          navigate('/');
      } else {
          alert("Hubo un error al guardar los datos.");
      }
  };

  const handleClearAll = () => {
      if (confirm("PELIGRO: ¿Estás seguro de borrar TODOS los datos de la aplicación? Esto no se puede deshacer.")) {
          if (confirm("¿Realmente seguro? Se borrarán rutinas, historiales y registros.")) {
              StorageService.clearAllData();
              navigate('/');
          }
      }
  }

  const toggleSelection = (key: keyof typeof selection) => {
      setSelection(prev => ({...prev, [key]: !prev[key]}));
  }

  return (
    <div className="h-screen bg-dark flex flex-col overflow-hidden">
      <header className="p-4 border-b border-gray-800 flex items-center sticky top-0 bg-dark/95 z-10 backdrop-blur-md">
        <Link to="/" className="p-2 hover:bg-gray-800 rounded-full mr-2"><ArrowLeft /></Link>
        <h1 className="text-xl font-bold flex-1">Configuración y Datos</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Export Section */}
        <section className="bg-surface p-6 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg text-blue-500">
                    <Download size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">Exportar Datos</h2>
                    <p className="text-sm text-gray-400">Guarda una copia de seguridad</p>
                </div>
            </div>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                Descarga un archivo JSON con todas tus rutinas, historial de entrenamientos, ejercicios personalizados y registros físicos.
            </p>
            <button 
                onClick={handleExport}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg border border-gray-600 transition-colors flex justify-center items-center gap-2"
            >
                <Download size={18} /> Descargar Copia
            </button>
        </section>

        {/* Import Section */}
        <section className="bg-surface p-6 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg text-green-500">
                    <Upload size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">Importar Datos</h2>
                    <p className="text-sm text-gray-400">Restaura una copia anterior</p>
                </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 mb-4 flex gap-2">
                <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                <p className="text-xs text-yellow-200">
                    Importar un archivo puede modificar o eliminar los datos actuales según la opción que elijas.
                </p>
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".json"
            />
            <button 
                onClick={handleImportClick}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg border border-gray-600 transition-colors flex justify-center items-center gap-2"
            >
                <Upload size={18} /> Seleccionar Archivo
            </button>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-900/10 p-6 rounded-xl border border-red-900/30 mt-8">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/20 rounded-lg text-red-500">
                    <Trash2 size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">Zona de Peligro</h2>
                    <p className="text-sm text-gray-400">Restablecer aplicación</p>
                </div>
            </div>
            <button 
                onClick={handleClearAll}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
                Borrar Todos los Datos
            </button>
        </section>
      </div>

      {/* Import Modal */}
      {pendingData && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-surface rounded-xl border border-gray-700 p-6 w-full max-w-sm shadow-2xl flex flex-col max-h-[90vh]">
                  <h3 className="text-xl font-bold text-white mb-2">Importar Datos</h3>
                  <p className="text-gray-400 text-sm mb-4">Elige cómo quieres restaurar la información.</p>
                  
                  {/* Mode Selection */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                      <button 
                          onClick={() => setImportMode('merge')}
                          className={`p-3 rounded-lg border flex flex-col items-center gap-2 text-center transition-all ${importMode === 'merge' ? 'bg-primary/20 border-primary text-white' : 'bg-dark border-gray-700 text-gray-400'}`}
                      >
                          <CopyPlus size={24} />
                          <span className="text-xs font-bold">FUSIONAR</span>
                          <span className="text-[10px] opacity-70">Añade datos nuevos sin borrar los actuales</span>
                      </button>
                      <button 
                          onClick={() => setImportMode('overwrite')}
                          className={`p-3 rounded-lg border flex flex-col items-center gap-2 text-center transition-all ${importMode === 'overwrite' ? 'bg-red-500/20 border-red-500 text-white' : 'bg-dark border-gray-700 text-gray-400'}`}
                      >
                          <RefreshCw size={24} />
                          <span className="text-xs font-bold">SOBRESCRIBIR</span>
                          <span className="text-[10px] opacity-70">Borra todo y reemplaza con el archivo</span>
                      </button>
                  </div>

                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Datos a incluir</h4>
                  <div className="space-y-2 mb-6 overflow-y-auto">
                      <button onClick={() => toggleSelection('routines')} className="flex items-center gap-3 w-full p-3 rounded-lg bg-dark hover:bg-gray-800 transition-colors">
                          {selection.routines ? <CheckSquare className="text-primary" /> : <Square className="text-gray-500" />}
                          <span className="text-white">Rutinas</span>
                          <span className="ml-auto text-xs text-gray-500">({pendingData.routines?.length || 0})</span>
                      </button>
                      <button onClick={() => toggleSelection('exercises')} className="flex items-center gap-3 w-full p-3 rounded-lg bg-dark hover:bg-gray-800 transition-colors">
                          {selection.exercises ? <CheckSquare className="text-primary" /> : <Square className="text-gray-500" />}
                          <span className="text-white">Ejercicios</span>
                          <span className="ml-auto text-xs text-gray-500">({pendingData.exercises?.length || 0})</span>
                      </button>
                      <button onClick={() => toggleSelection('logs')} className="flex items-center gap-3 w-full p-3 rounded-lg bg-dark hover:bg-gray-800 transition-colors">
                          {selection.logs ? <CheckSquare className="text-primary" /> : <Square className="text-gray-500" />}
                          <span className="text-white">Historial</span>
                          <span className="ml-auto text-xs text-gray-500">({pendingData.logs?.length || 0})</span>
                      </button>
                      <button onClick={() => toggleSelection('stats')} className="flex items-center gap-3 w-full p-3 rounded-lg bg-dark hover:bg-gray-800 transition-colors">
                          {selection.stats ? <CheckSquare className="text-primary" /> : <Square className="text-gray-500" />}
                          <span className="text-white">Registros Físicos</span>
                          <span className="ml-auto text-xs text-gray-500">({pendingData.stats?.length || 0})</span>
                      </button>
                  </div>

                  <div className="flex flex-col gap-3 mt-auto">
                      <button onClick={executeImport} className="w-full bg-primary hover:bg-sky-500 text-white font-bold py-3 rounded-lg">
                          {importMode === 'merge' ? 'Fusionar Datos' : 'Reemplazar Datos'}
                      </button>
                      <button onClick={() => setPendingData(null)} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg">
                          Cancelar
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};