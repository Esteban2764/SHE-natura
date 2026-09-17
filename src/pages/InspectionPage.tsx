import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { Extintor, Brigadista, PageType, Inspeccion } from '../types';
import { generateId, getInspectores } from '../store';

interface Props {
  extintorId: string;
  extintores: Extintor[];
  updateExtintores: (data: Extintor[]) => void;
  navigateTo: (page: PageType, id?: string) => void;
  brigadistaTurno: Brigadista | null;
}

const checklistItems = [
  'Sellado de seguridad intacto',
  'Manguera sin daños',
  'Boquilla limpia',
  'Señalización visible',
  'Acceso libre',
  'Sin corrosión visible',
];

export default function InspectionPage({ extintorId, extintores, updateExtintores, navigateTo, brigadistaTurno }: Props) {
  const extintor = extintores.find(e => e.id === extintorId);
  const inspectores = getInspectores();
  const now = new Date();

  const [form, setForm] = useState({
    inspector: brigadistaTurno?.nombre || (inspectores.length > 0 ? inspectores[0].nombre : ''),
    fecha: now.toISOString().split('T')[0],
    hora: now.toTimeString().slice(0, 5),
    estado: 'aprobado' as 'aprobado' | 'rechazado' | 'observacion',
    presion: extintor?.presion || 'optima' as 'optima' | 'baja' | 'critica',
    observaciones: '',
    checklist: checklistItems.map(() => true),
    renovarVencimiento: false,
    nuevaFechaVencimiento: '',
  });

  const [saved, setSaved] = useState(false);

  if (!extintor) {
    return (
      <div className="text-center py-8">
        <p className="text-4xl mb-2">❌</p>
        <p className="text-sm text-slate-500">Extintor no encontrado</p>
        <button onClick={() => navigateTo('inicio')} className="mt-3 text-sm text-emerald-600 underline">Volver al inicio</button>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="text-center py-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">✅</motion.div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Inspección Guardada</h2>
        <p className="text-sm text-slate-500 mb-6">La inspección de {extintor.codigo} ha sido registrada exitosamente.</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigateTo('inicio')} className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium">
          Volver al Inicio
        </motion.button>
      </div>
    );
  }

  const handleSave = () => {
    const inspeccion: Inspeccion = {
      id: generateId(),
      extintorId: extintor.id,
      fecha: `${form.fecha}T${form.hora}`,
      inspector: form.inspector,
      estado: form.estado,
      presion: form.presion,
      observaciones: form.observaciones,
      checklist: form.checklist,
    };

    let updatedExtintor = {
      ...extintor,
      presion: form.presion,
      estado: form.estado === 'rechazado' ? 'mantenimiento' as const : extintor.estado,
      inspecciones: [inspeccion, ...extintor.inspecciones],
    };

    if (form.renovarVencimiento && form.nuevaFechaVencimiento) {
      updatedExtintor = { ...updatedExtintor, fechaVencimiento: form.nuevaFechaVencimiento };
      inspeccion.renovacionFecha = form.nuevaFechaVencimiento;
    }

    const updated = extintores.map(e => e.id === extintorId ? updatedExtintor : e);
    updateExtintores(updated);
    setSaved(true);
  };

  const toggleChecklist = (idx: number) => {
    const next = [...form.checklist];
    next[idx] = !next[idx];
    setForm({ ...form, checklist: next });
  };

  return (
    <div className="space-y-4">
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigateTo('detalle-extintor', extintorId)} className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <ArrowLeft size={16} /> Volver
      </motion.button>

      {/* Extinguisher Info */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-2xl">🧯</div>
        <div>
          <p className="font-bold text-slate-800 dark:text-white">{extintor.codigo}</p>
          <p className="text-xs text-slate-500">{extintor.ubicacion}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
        {/* Inspector */}
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Inspector</label>
          <select value={form.inspector} onChange={e => setForm({ ...form, inspector: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">
            {brigadistaTurno && <option value={brigadistaTurno.nombre}>⭐ {brigadistaTurno.nombre} (Brigadista de Turno)</option>}
            {inspectores.map(i => <option key={i.id} value={i.nombre}>{i.nombre} - {i.cargo}</option>)}
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Fecha</label>
            <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Hora</label>
            <input type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
          </div>
        </div>

        {/* Estado General */}
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">Estado General</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'aprobado' as const, label: '✅ Aprobado', color: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300' },
              { value: 'observacion' as const, label: '⚠️ Observación', color: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300' },
              { value: 'rechazado' as const, label: '❌ Rechazado', color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300' },
            ].map(s => (
              <button key={s.value} onClick={() => setForm({ ...form, estado: s.value })} className={`py-3 rounded-xl text-xs font-medium border transition-all ${form.estado === s.value ? s.color + ' ring-2 ring-offset-1 ring-current scale-95' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Presión */}
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">Presión</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'optima' as const, label: '✅ Óptima', color: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300' },
              { value: 'baja' as const, label: '⚠️ Baja', color: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300' },
              { value: 'critica' as const, label: '🔴 Crítica', color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300' },
            ].map(p => (
              <button key={p.value} onClick={() => setForm({ ...form, presion: p.value })} className={`py-2 rounded-xl text-xs font-medium border transition-all ${form.presion === p.value ? p.color + ' ring-2 ring-offset-1 ring-current scale-95' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Observaciones</label>
          <textarea value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} rows={2} placeholder="Notas adicionales..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none dark:text-white" />
        </div>

        {/* Checklist */}
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">Checklist de Verificación</label>
          <div className="space-y-2">
            {checklistItems.map((item, idx) => (
              <button key={idx} onClick={() => toggleChecklist(idx)} className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left ${form.checklist[idx] ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${form.checklist[idx] ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                  {form.checklist[idx] && <CheckCircle size={12} className="text-white" />}
                </div>
                <span className={`text-xs ${form.checklist[idx] ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-300'}`}>{item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Renovar Vencimiento */}
        <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.renovarVencimiento} onChange={e => setForm({ ...form, renovarVencimiento: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Renovar Vencimiento</span>
          </label>
          {form.renovarVencimiento && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-2">
              <input type="date" value={form.nuevaFechaVencimiento} onChange={e => setForm({ ...form, nuevaFechaVencimiento: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-medium text-sm shadow-sm">
        <Save size={18} /> Guardar Inspección
      </motion.button>
    </div>
  );
}
