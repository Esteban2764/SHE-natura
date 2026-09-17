import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Clock, ChevronRight, User } from 'lucide-react';
import { Extintor, Brigadista, PageType } from '../types';
import { getDaysUntilExpiry, getExtintorEstado, formatDate } from '../store';

interface Props {
  extintores: Extintor[];
  brigadistaTurno: Brigadista | null;
  updateBrigadistaTurno: (b: Brigadista | null) => void;
  navigateTo: (page: PageType, id?: string) => void;
}

export default function HomePage({ extintores, brigadistaTurno, updateBrigadistaTurno, navigateTo }: Props) {
  const [showBrigadistaModal, setShowBrigadistaModal] = useState(false);
  const [brigadistas] = useState<Brigadista[]>(() => {
    try {
      const data = localStorage.getItem('she_brigadistas');
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  });

  const activos = extintores.filter(e => getExtintorEstado(e) === 'activo').length;
  const mantenimiento = extintores.filter(e => getExtintorEstado(e) === 'mantenimiento').length;
  const vencidos = extintores.filter(e => getExtintorEstado(e) === 'vencido').length;
  const total = extintores.length;
  const pctActivos = total > 0 ? Math.round((activos / total) * 100) : 0;
  const pctMant = total > 0 ? Math.round((mantenimiento / total) * 100) : 0;
  const pctVenc = total > 0 ? Math.round((vencidos / total) * 100) : 0;

  const proximosVencer = extintores.filter(e => {
    const days = getDaysUntilExpiry(e.fechaVencimiento);
    return days >= 0 && days <= 30;
  });

  return (
    <div className="space-y-5">
      {/* Brigadista de Turno */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowBrigadistaModal(true)}
        className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500 dark:text-slate-400">Brigadista de Turno</p>
            {brigadistaTurno ? (
              <p className="font-semibold text-slate-800 dark:text-white">{brigadistaTurno.nombre}</p>
            ) : (
              <p className="text-sm text-slate-400">Seleccionar brigadista...</p>
            )}
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div whileTap={{ scale: 0.95 }} onClick={() => navigateTo('extintores')} className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700 text-center cursor-pointer">
          <div className="text-2xl font-bold text-emerald-600">{activos}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Activos</div>
        </motion.div>
        <motion.div whileTap={{ scale: 0.95 }} onClick={() => navigateTo('extintores')} className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700 text-center cursor-pointer">
          <div className="text-2xl font-bold text-amber-500">{mantenimiento}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mantenimiento</div>
        </motion.div>
        <motion.div whileTap={{ scale: 0.95 }} onClick={() => navigateTo('extintores')} className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700 text-center cursor-pointer">
          <div className="text-2xl font-bold text-red-500">{vencidos}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Vencidos</div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      {total > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado General</span>
            <span className="text-sm font-bold text-emerald-600">{pctActivos}%</span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${pctActivos}%` }} />
            <div className="bg-amber-500 h-full transition-all" style={{ width: `${pctMant}%` }} />
            <div className="bg-red-500 h-full transition-all" style={{ width: `${pctVenc}%` }} />
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] text-slate-500">Activos</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[10px] text-slate-500">Mant.</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[10px] text-slate-500">Vencidos</span></div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {vencidos > 0 && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-3 flex items-center gap-3">
          <AlertTriangle size={20} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300"><strong>{vencidos}</strong> extintor(es) vencido(s)</p>
        </motion.div>
      )}
      {proximosVencer.length > 0 && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-3 flex items-center gap-3">
          <Clock size={20} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300"><strong>{proximosVencer.length}</strong> extintor(es) próximo(s) a vencer</p>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigateTo('nuevo-extintor')} className="bg-emerald-500 text-white rounded-2xl p-3 shadow-sm text-center">
          <div className="text-xl mb-1">🧯</div>
          <div className="text-[10px] font-medium">Nuevo</div>
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigateTo('extintores')} className="bg-blue-500 text-white rounded-2xl p-3 shadow-sm text-center">
          <div className="text-xl mb-1">📷</div>
          <div className="text-[10px] font-medium">Escanear</div>
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigateTo('reportes')} className="bg-orange-500 text-white rounded-2xl p-3 shadow-sm text-center">
          <div className="text-xl mb-1">📋</div>
          <div className="text-[10px] font-medium">Reportar</div>
        </motion.button>
      </div>

      {/* Extinguisher List */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 px-1">Extintores Registrados</h3>
        {extintores.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-4xl mb-2">🧯</p>
            <p className="text-sm">No hay extintores registrados</p>
          </div>
        ) : (
          <div className="space-y-2">
            {extintores.map(ext => {
              const estado = getExtintorEstado(ext);
              const days = getDaysUntilExpiry(ext.fechaVencimiento);
              const dotColor = estado === 'activo' ? 'bg-emerald-500' : estado === 'mantenimiento' ? 'bg-amber-500' : 'bg-red-500';
              return (
                <motion.div
                  key={ext.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo('detalle-extintor', ext.id)}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3 cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-lg">🧯</div>
                    <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${dotColor} animate-pulse-dot`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 dark:text-white">{ext.codigo}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{ext.ubicacion}</p>
                    <p className="text-[10px] text-slate-400">{ext.tipo} • {ext.capacidad}</p>
                  </div>
                  <div className={`text-[10px] px-2 py-1 rounded-full font-medium ${days < 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : days <= 30 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'}`}>
                    {days < 0 ? `Vencido` : `${days}d`}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Brigadista Modal */}
      <AnimatePresence>
        {showBrigadistaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowBrigadistaModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white dark:bg-slate-800 w-full max-w-[480px] rounded-t-3xl p-5 max-h-[70vh] overflow-auto"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Seleccionar Brigadista</h3>
              {brigadistas.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No hay brigadistas registrados. Ve a Ajustes para agregar.</p>
              ) : (
                <div className="space-y-2">
                  {brigadistas.filter(b => b.activo).map(b => (
                    <motion.button
                      key={b.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { updateBrigadistaTurno(b); setShowBrigadistaModal(false); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border ${brigadistaTurno?.id === b.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30' : 'border-slate-200 dark:border-slate-600'}`}
                    >
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
                        <User size={16} className="text-emerald-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm text-slate-800 dark:text-white">{b.nombre}</p>
                        <p className="text-xs text-slate-500">{b.cargo}</p>
                      </div>
                      {brigadistaTurno?.id === b.id && <CheckCircle size={18} className="text-emerald-500 ml-auto" />}
                    </motion.button>
                  ))}
                </div>
              )}
              {brigadistaTurno && (
                <button
                  onClick={() => { updateBrigadistaTurno(null); setShowBrigadistaModal(false); }}
                  className="w-full mt-4 py-2.5 text-sm text-red-500 font-medium border border-red-200 dark:border-red-800 rounded-xl"
                >
                  Quitar Brigadista de Turno
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
