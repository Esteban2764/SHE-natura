import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { Extintor, PageType } from '../types';
import { getNextCodigo, addOneYear, generateId, getExtintorEstado } from '../store';

interface Props {
  extintores: Extintor[];
  updateExtintores: (data: Extintor[]) => void;
  navigateTo: (page: PageType, id?: string) => void;
}

const tipos = ['PQS', 'CO2', 'Agua Presurizada', 'Espuma', 'Agente Limpio'];
const capacidades = ['1kg', '3kg', '4kg', '6kg', '9kg', '12kg'];

export default function NewExtinguisherPage({ extintores, updateExtintores, navigateTo }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    codigo: getNextCodigo(extintores),
    ubicacion: '',
    tipo: tipos[0],
    capacidad: capacidades[3],
    fechaRecarga: today,
    fechaVencimiento: addOneYear(today),
    presion: 'optima' as 'optima' | 'baja' | 'critica',
    notas: '',
  });

  const handleRecargaChange = (date: string) => {
    setForm({ ...form, fechaRecarga: date, fechaVencimiento: addOneYear(date) });
  };

  const handleSave = () => {
    if (!form.ubicacion) return;
    const newExt: Extintor = {
      id: generateId(),
      codigo: form.codigo,
      ubicacion: form.ubicacion,
      tipo: form.tipo,
      capacidad: form.capacidad,
      fechaRecarga: form.fechaRecarga,
      fechaVencimiento: form.fechaVencimiento,
      presion: form.presion,
      estado: getExtintorEstado({ ...form, id: 'temp', inspecciones: [], createdAt: '' } as unknown as Extintor),
      notas: form.notas,
      inspecciones: [],
      createdAt: new Date().toISOString(),
    };
    updateExtintores([newExt, ...extintores]);
    navigateTo('inicio');
  };

  return (
    <div className="space-y-4">
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigateTo('inicio')} className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <ArrowLeft size={16} /> Volver
      </motion.button>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Código</label>
          <input type="text" value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Ubicación</label>
          <input type="text" value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })} placeholder="Ej: Piso 2, Pasillo B" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Tipo</label>
            <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Capacidad</label>
            <select value={form.capacidad} onChange={e => setForm({ ...form, capacidad: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">
              {capacidades.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Fecha Recarga</label>
            <input type="date" value={form.fechaRecarga} onChange={e => handleRecargaChange(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Fecha Vencimiento</label>
            <input type="date" value={form.fechaVencimiento} onChange={e => setForm({ ...form, fechaVencimiento: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
          </div>
        </div>

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

        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Notas</label>
          <textarea value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} rows={2} placeholder="Observaciones adicionales..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none dark:text-white" />
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={!form.ubicacion} className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-medium text-sm shadow-sm disabled:opacity-50">
        <Save size={18} /> Guardar Extintor
      </motion.button>
    </div>
  );
}
