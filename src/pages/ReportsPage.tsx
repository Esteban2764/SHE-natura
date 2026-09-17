import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, AlertCircle } from 'lucide-react';
import { Brigadista, ReporteAccidente } from '../types';
import { getReportes, saveReportes, generateId } from '../store';

interface Props {
  brigadistaTurno: Brigadista | null;
}

const tipos = [
  { value: 'incendio-menor', label: '🔥 Incendio menor' },
  { value: 'incendio-mayor', label: '🔥 Incendio mayor' },
  { value: 'fuga-gas', label: '💨 Fuga de gas' },
  { value: 'extintor-danado', label: '🧯 Extintor dañado' },
  { value: 'falsa-alarma', label: '🚨 Falsa alarma' },
  { value: 'otro', label: '📝 Otro' },
];

const gravedades = [
  { value: 'leve' as const, label: '🟡 Leve', color: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { value: 'moderado' as const, label: '🟠 Moderado', color: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300' },
  { value: 'grave' as const, label: '🔴 Grave', color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300' },
];

export default function ReportsPage({ brigadistaTurno }: Props) {
  const [reportes, setReportes] = useState<ReporteAccidente[]>(getReportes());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    ubicacion: '', fecha: new Date().toISOString().split('T')[0], hora: new Date().toTimeString().slice(0, 5),
    tipo: 'otro', gravedad: 'leve' as 'leve' | 'moderado' | 'grave', reportadoPor: brigadistaTurno?.nombre || '', descripcion: ''
  });

  useEffect(() => { if (brigadistaTurno) setForm(f => ({ ...f, reportadoPor: brigadistaTurno.nombre })); }, [brigadistaTurno]);

  const handleSave = () => {
    if (!form.ubicacion || !form.descripcion) return;
    const newReporte: ReporteAccidente = {
      id: generateId(), fecha: `${form.fecha}T${form.hora}`, ubicacion: form.ubicacion,
      descripcion: form.descripcion, tipo: form.tipo, gravedad: form.gravedad,
      reportadoPor: form.reportadoPor, createdAt: new Date().toISOString()
    };
    const updated = [newReporte, ...reportes];
    setReportes(updated);
    saveReportes(updated);
    setShowForm(false);
    setForm({ ubicacion: '', fecha: new Date().toISOString().split('T')[0], hora: new Date().toTimeString().slice(0, 5), tipo: 'otro', gravedad: 'leve', reportadoPor: brigadistaTurno?.nombre || '', descripcion: '' });
  };

  const getGravedadIcon = (g: string) => g === 'grave' ? '🔴' : g === 'moderado' ? '🟠' : '🟡';
  const getTipoLabel = (t: string) => tipos.find(tp => tp.value === t)?.label || t;

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowForm(true)}
        className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 rounded-xl shadow-sm text-sm font-medium"
      >
        <Plus size={18} /> Nuevo Reporte
      </motion.button>

      {/* Reports List */}
      {reportes.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-sm">No hay reportes registrados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reportes.map(r => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getGravedadIcon(r.gravedad)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-slate-800 dark:text-white">{getTipoLabel(r.tipo)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${r.gravedad === 'grave' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : r.gravedad === 'moderado' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>{r.gravedad}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.ubicacion}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.descripcion}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-slate-400">{new Date(r.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-[10px] text-slate-400">• {r.reportadoPor}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-white dark:bg-slate-800 w-full max-w-[480px] rounded-t-3xl p-5 max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><AlertCircle size={20} className="text-orange-500" /> Nuevo Reporte</h3>
                <button onClick={() => setShowForm(false)}><X size={20} className="text-slate-500" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Ubicación</label>
                  <input type="text" value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })} placeholder="Ej: Piso 3, Ala Norte" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 dark:text-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Fecha</label>
                    <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Hora</label>
                    <input type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Tipo</label>
                  <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 dark:text-white">
                    {tipos.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">Gravedad</label>
                  <div className="grid grid-cols-3 gap-2">
                    {gravedades.map(g => (
                      <button key={g.value} onClick={() => setForm({ ...form, gravedad: g.value })} className={`py-2 rounded-xl text-xs font-medium border transition-all ${form.gravedad === g.value ? g.color + ' ring-2 ring-offset-1 ring-current scale-95' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Reportado por</label>
                  <input type="text" value={form.reportadoPor} onChange={e => setForm({ ...form, reportadoPor: e.target.value })} placeholder="Nombre" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 dark:text-white" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Descripción</label>
                  <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={3} placeholder="Describe el incidente..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500 resize-none dark:text-white" />
                </div>
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={!form.ubicacion || !form.descripcion} className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium text-sm disabled:opacity-50">
                  Guardar Reporte
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
