import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit, Trash2, Download, QrCode, Calendar, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';
import { Extintor, PageType } from '../types';
import { getDaysUntilExpiry, getExtintorEstado, formatDate, addOneYear } from '../store';

interface Props {
  extintorId: string;
  extintores: Extintor[];
  updateExtintores: (data: Extintor[]) => void;
  navigateTo: (page: PageType, id?: string) => void;
}

export default function ExtinguisherDetailPage({ extintorId, extintores, updateExtintores, navigateTo }: Props) {
  const extintor = extintores.find(e => e.id === extintorId);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Extintor>>({});
  const [newVencimiento, setNewVencimiento] = useState('');

  useEffect(() => {
    if (extintor) {
      const data = JSON.stringify({ id: extintor.id, codigo: extintor.codigo, type: 'fireguard_extintor' });
      QRCode.toDataURL(data, { width: 200, margin: 1 }).then(setQrDataUrl);
      setEditForm({ ...extintor });
    }
  }, [extintor]);

  if (!extintor) {
    return (
      <div className="text-center py-8">
        <p className="text-4xl mb-2">❌</p>
        <p className="text-sm text-slate-500">Extintor no encontrado</p>
        <button onClick={() => navigateTo('inicio')} className="mt-3 text-sm text-emerald-600 underline">Volver al inicio</button>
      </div>
    );
  }

  const estado = getExtintorEstado(extintor);
  const days = getDaysUntilExpiry(extintor.fechaVencimiento);
  const headerGradient = estado === 'activo' ? 'from-emerald-500 to-teal-500' : estado === 'mantenimiento' ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-500';

  const getVigenciaMessage = () => {
    if (days < 0) return { text: `VENCIDO hace ${Math.abs(days)} días`, color: 'text-red-600 dark:text-red-400' };
    if (days === 0) return { text: 'Vence hoy', color: 'text-red-600 dark:text-red-400' };
    if (days <= 30) return { text: `Vence en ${days} días`, color: 'text-amber-600 dark:text-amber-400' };
    const months = Math.floor(days / 30);
    return { text: months > 0 ? `Vigente - ${months} mes${months > 1 ? 'es' : ''}` : `Vigente - ${days} días`, color: 'text-emerald-600 dark:text-emerald-400' };
  };

  const vigencia = getVigenciaMessage();
  const totalDays = Math.ceil((new Date(extintor.fechaVencimiento).getTime() - new Date(extintor.fechaRecarga).getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = totalDays - days;
  const progressPct = totalDays > 0 ? Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100)) : 0;

  const handleSaveEdit = () => {
    const updated = extintores.map(e => e.id === extintorId ? { ...e, ...editForm, estado: getExtintorEstado({ ...e, ...editForm } as Extintor) } : e);
    updateExtintores(updated);
    setShowEditModal(false);
  };

  const handleDelete = () => {
    updateExtintores(extintores.filter(e => e.id !== extintorId));
    navigateTo('inicio');
  };

  const handleRenew = () => {
    if (!newVencimiento) return;
    const updated = extintores.map(e => e.id === extintorId ? { ...e, fechaVencimiento: newVencimiento, fechaRecarga: e.fechaRecarga, estado: getExtintorEstado({ ...e, fechaVencimiento: newVencimiento } as Extintor) } : e);
    updateExtintores(updated);
    setShowRenewModal(false);
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR-${extintor.codigo}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="space-y-4">
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigateTo('inicio')} className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <ArrowLeft size={16} /> Volver
      </motion.button>

      {/* Header Card */}
      <div className={`bg-gradient-to-r ${headerGradient} rounded-2xl p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{extintor.codigo}</h2>
            <p className="text-sm text-white/80">{extintor.ubicacion}</p>
          </div>
          <div className="text-4xl">🧯</div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/15 rounded-xl p-2 text-center backdrop-blur-sm">
            <p className="text-[10px] text-white/70">Tipo</p>
            <p className="text-xs font-medium">{extintor.tipo}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-2 text-center backdrop-blur-sm">
            <p className="text-[10px] text-white/70">Capacidad</p>
            <p className="text-xs font-medium">{extintor.capacidad}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-2 text-center backdrop-blur-sm">
            <p className="text-[10px] text-white/70">Presión</p>
            <p className="text-xs font-medium capitalize">{extintor.presion}</p>
          </div>
        </div>
      </div>

      {/* Vigencia Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className={`text-center mb-3 ${vigencia.color}`}>
          <p className="text-lg font-bold">{vigencia.text}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-2 text-center">
            <p className="text-[10px] text-slate-500">Fecha Recarga</p>
            <p className="text-xs font-medium text-slate-700 dark:text-white">{formatDate(extintor.fechaRecarga)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-2 text-center">
            <p className="text-[10px] text-slate-500">Fecha Vencimiento</p>
            <p className="text-xs font-medium text-slate-700 dark:text-white">{formatDate(extintor.fechaVencimiento)}</p>
          </div>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${progressPct > 90 ? 'bg-red-500' : progressPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${progressPct}%` }} />
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setNewVencimiento(addOneYear(extintor.fechaRecarga)); setShowRenewModal(true); }} className="w-full mt-3 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center gap-1">
          <RefreshCw size={14} /> Renovar / Editar Vencimiento
        </motion.button>
      </div>

      {/* QR Code */}
      {qrDataUrl && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
          <div className="flex items-center gap-2 justify-center mb-3">
            <QrCode size={16} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Código QR</h3>
          </div>
          <img src={qrDataUrl} alt="QR" className="w-40 h-40 mx-auto rounded-xl" />
          <motion.button whileTap={{ scale: 0.95 }} onClick={downloadQR} className="mt-3 flex items-center justify-center gap-1 mx-auto py-2 px-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium">
            <Download size={14} /> Descargar QR
          </motion.button>
        </div>
      )}

      {/* Inspecciones */}
      {extintor.inspecciones.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Historial de Inspecciones</h3>
          <div className="space-y-2">
            {extintor.inspecciones.slice(0, 5).map(insp => (
              <div key={insp.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <span className="text-lg">{insp.estado === 'aprobado' ? '✅' : insp.estado === 'observacion' ? '⚠️' : '❌'}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-700 dark:text-white">{insp.inspector}</p>
                  <p className="text-[10px] text-slate-500">{formatDate(insp.fecha)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigateTo('inspeccion', extintorId)} className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-medium text-sm shadow-sm">
          📋 Nueva Inspección
        </motion.button>
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => { setEditForm({ ...extintor }); setShowEditModal(true); }} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-xl font-medium text-sm shadow-sm">
          <Edit size={16} /> Editar Extintor
        </motion.button>
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowDeleteModal(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-medium text-sm border border-red-200 dark:border-red-800">
          <Trash2 size={16} /> Eliminar Extintor
        </motion.button>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowEditModal(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-white dark:bg-slate-800 w-full max-w-[480px] rounded-t-3xl p-5 max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Editar Extintor</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Código</label>
                  <input type="text" value={editForm.codigo || ''} onChange={e => setEditForm({ ...editForm, codigo: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none dark:text-white" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Ubicación</label>
                  <input type="text" value={editForm.ubicacion || ''} onChange={e => setEditForm({ ...editForm, ubicacion: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none dark:text-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Tipo</label>
                    <select value={editForm.tipo || ''} onChange={e => setEditForm({ ...editForm, tipo: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none dark:text-white">
                      {['PQS', 'CO2', 'Agua Presurizada', 'Espuma', 'Agente Limpio'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Capacidad</label>
                    <select value={editForm.capacidad || ''} onChange={e => setEditForm({ ...editForm, capacidad: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none dark:text-white">
                      {['1kg', '3kg', '4kg', '6kg', '9kg', '12kg'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Fecha Recarga</label>
                    <input type="date" value={editForm.fechaRecarga || ''} onChange={e => setEditForm({ ...editForm, fechaRecarga: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Fecha Vencimiento</label>
                    <input type="date" value={editForm.fechaVencimiento || ''} onChange={e => setEditForm({ ...editForm, fechaVencimiento: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">Presión</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ v: 'optima', l: '✅ Óptima' }, { v: 'baja', l: '⚠️ Baja' }, { v: 'critica', l: '🔴 Crítica' }].map(p => (
                      <button key={p.v} onClick={() => setEditForm({ ...editForm, presion: p.v as any })} className={`py-2 rounded-xl text-xs font-medium border ${editForm.presion === p.v ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`}>{p.l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Notas</label>
                  <textarea value={editForm.notas || ''} onChange={e => setEditForm({ ...editForm, notas: e.target.value })} rows={2} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none resize-none dark:text-white" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-sm font-medium">Cancelar</button>
                  <button onClick={handleSaveEdit} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium">Guardar</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white dark:bg-slate-800 rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <div className="text-center">
                <div className="text-4xl mb-3">🗑️</div>
                <h3 className="font-bold text-slate-800 dark:text-white">¿Eliminar {extintor.codigo}?</h3>
                <p className="text-sm text-slate-500 mt-2">Esta acción no se puede deshacer.</p>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-sm font-medium">Cancelar</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium">Eliminar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Renew Modal */}
      <AnimatePresence>
        {showRenewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowRenewModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white dark:bg-slate-800 rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🔄</div>
                <h3 className="font-bold text-slate-800 dark:text-white">Renovar Vencimiento</h3>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Nueva Fecha de Vencimiento</label>
                <input type="date" value={newVencimiento} onChange={e => setNewVencimiento(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none dark:text-white" />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowRenewModal(false)} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-sm font-medium">Cancelar</button>
                <button onClick={handleRenew} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium">Renovar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
