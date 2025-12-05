import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Activity, ClipboardList, PlayCircle, ChevronRight, BookOpen, Settings, Download } from 'lucide-react';
import { StorageService } from '../services/storage';
import { BeforeInstallPromptEvent } from '../types';

export const Dashboard: React.FC = () => {
  const activeRoutineId = StorageService.getActiveRoutineId();
  const routines = StorageService.getRoutines();
  const activeRoutine = routines.find(r => r.id === activeRoutineId);

  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
    }

    // Listen for install prompt
    const handleInstall = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e as BeforeInstallPromptEvent);
        window.deferredPrompt = e as BeforeInstallPromptEvent;
    };

    // Check if captured early in index.html
    if (window.deferredPrompt) {
        setInstallPrompt(window.deferredPrompt);
    }

    window.addEventListener('beforeinstallprompt', handleInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleInstall);
  }, []);

  const handleInstallClick = () => {
      if (installPrompt) {
          installPrompt.prompt();
          installPrompt.userChoice.then((choiceResult) => {
              if (choiceResult.outcome === 'accepted') {
                  setInstallPrompt(null);
              }
          });
      }
  };

  return (
    <div className="h-screen flex flex-col bg-dark overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        <header className="mt-4 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">
                <span className="text-primary">Iron</span>Track Pro
            </h1>
            <p className="text-gray-400">Tu compañero de gimnasio</p>
          </div>

          {/* Install Actions - Only shows if browser allows it automatically */}
          <div className="flex flex-col gap-2 items-end">
            {!isInstalled && installPrompt && (
                <button 
                    onClick={handleInstallClick} 
                    className="bg-white text-primary hover:bg-gray-100 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse"
                >
                    INSTALAR APP <Download size={14}/>
                </button>
            )}
          </div>
        </header>
        
        {/* Main Action */}
        <section className="bg-gradient-to-br from-surface to-gray-900 p-6 rounded-2xl border border-gray-700 shadow-xl relative overflow-hidden group mb-6">
          <div className="relative z-10">
            <h2 className="text-xl font-semibold mb-2 text-gray-200">Siguiente Entrenamiento</h2>
            {activeRoutine ? (
              <div className="mb-6">
                <p className="text-3xl font-bold text-white mb-1">{activeRoutine.name}</p>
                <p className="text-primary text-sm font-medium bg-primary/10 inline-block px-2 py-1 rounded">
                  {activeRoutine.days.length} Días configurados
                </p>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-gray-400 italic">Ninguna rutina seleccionada</p>
              </div>
            )}
            
            <Link 
              to="/workout" 
              className="inline-flex items-center justify-center gap-2 w-full bg-primary hover:bg-sky-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/25"
            >
              <PlayCircle size={24} fill="currentColor" className="text-white/20" />
              INICIAR ENTRENAMIENTO
            </Link>
          </div>
          {/* Decorative Icon */}
          <Dumbbell className="absolute -right-4 -bottom-4 text-gray-800 opacity-50 rotate-[-20deg]" size={140} />
        </section>

        {/* Grid Menu */}
        <div className="grid grid-cols-1 gap-4">
          <Link to="/routines" className="flex items-center p-5 bg-surface rounded-xl border border-gray-700 hover:border-primary/50 transition-colors">
              <div className="p-3 bg-orange-500/20 rounded-lg text-orange-500 mr-4">
                  <ClipboardList size={24} />
              </div>
              <div className="flex-1">
                  <h3 className="font-bold text-lg">Rutinas</h3>
                  <p className="text-xs text-gray-400">Crea y edita tus planes</p>
              </div>
              <ChevronRight className="text-gray-600" />
          </Link>

          {/* History Card */}
          <Link to="/history" className="flex items-center p-5 bg-surface rounded-xl border border-gray-700 hover:border-primary/50 transition-colors">
              <div className="p-3 bg-purple-500/20 rounded-lg text-purple-500 mr-4">
                  <Dumbbell size={24} />
              </div>
              <div className="flex-1">
                  <h3 className="font-bold text-lg">Historial</h3>
                  <p className="text-xs text-gray-400">Registro de entrenamientos</p>
              </div>
              <ChevronRight className="text-gray-600" />
          </Link>

          <Link to="/exercises" className="flex items-center p-5 bg-surface rounded-xl border border-gray-700 hover:border-primary/50 transition-colors">
              <div className="p-3 bg-blue-500/20 rounded-lg text-blue-500 mr-4">
                  <BookOpen size={24} />
              </div>
              <div className="flex-1">
                  <h3 className="font-bold text-lg">Biblioteca</h3>
                  <p className="text-xs text-gray-400">Gestionar ejercicios</p>
              </div>
              <ChevronRight className="text-gray-600" />
          </Link>

          <Link to="/stats" className="flex items-center p-5 bg-surface rounded-xl border border-gray-700 hover:border-primary/50 transition-colors">
              <div className="p-3 bg-green-500/20 rounded-lg text-green-500 mr-4">
                  <Activity size={24} />
              </div>
              <div className="flex-1">
                  <h3 className="font-bold text-lg">Registros Físicos</h3>
                  <p className="text-xs text-gray-400">Peso, %Grasa y medidas</p>
              </div>
              <ChevronRight className="text-gray-600" />
          </Link>

          {/* Settings / Backup */}
          <Link to="/settings" className="flex items-center p-5 bg-surface rounded-xl border border-gray-700 hover:border-primary/50 transition-colors">
              <div className="p-3 bg-gray-500/20 rounded-lg text-gray-400 mr-4">
                  <Settings size={24} />
              </div>
              <div className="flex-1">
                  <h3 className="font-bold text-lg">Datos</h3>
                  <p className="text-xs text-gray-400">Copias de seguridad</p>
              </div>
              <ChevronRight className="text-gray-600" />
          </Link>
        </div>

        <div className="mt-8 text-center text-gray-600 text-xs">
          IronTrack Pro v1.4.2
        </div>
      </div>
    </div>
  );
};