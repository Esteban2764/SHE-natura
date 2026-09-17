import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, Plus, Trash2, Printer, X, Database, Info } from 'lucide-react';
import QRCode from 'qrcode';
import { ThemeType, Extintor, Inspector, Brigadista } from '../types';
import { getInspectores, saveInspectores, getBrigadistas, saveBrigadistas, clearAllData, generateId } from '../store';

interface Props {
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  extintores: Extintor[];
  refreshData: () => void;
}

export default function SettingsPage({ theme, setTheme, extintores, refreshData }: Props) {
  const [inspectores, setInspectores] = useState<Inspector[]>(getInspectores());
  const [brigadistas, setBrigadistas] = useState<Brigadista[]>(getBrigadistas());
  const [showAddInspector, setShowAddInspector] = useState(false);
  const [showAddBrigadista, setShowAddBrigadista] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [newInspector, setNewInspector] = useState({ nombre: '', cargo: '' });
  const [newBrigadista, setNewBrigadista] = useState({ nombre: '', cargo: 'Brigadista' });
  const [selectedQR, setSelectedQR] = useState<Set<string>>(new Set());

  const themes = [
    { id: 'light' as ThemeType, icon: Sun, label: 'Claro' },
    { id: 'dark' as ThemeType, icon: Moon, label: 'Oscuro' },
    { id: 'auto' as ThemeType, icon: Monitor, label: 'Automático' },
  ];

  const addInspector = () => {
    if (!newInspector.nombre) return;
    const updated = [...inspectores, { id: generateId(), nombre: newInspector.nombre, cargo: newInspector.cargo || 'Inspector', activo: true, createdAt: new Date().toISOString() }];
    setInspectores(updated);
    saveInspectores(updated);
    setNewInspector({ nombre: '', cargo: '' });
    setShowAddInspector(false);
  };

  const removeInspector = (id: string) => {
    const updated = inspectores.filter(i => i.id !== id);
    setInspectores(updated);
    saveInspectores(updated);
  };

  const addBrigadista = () => {
    if (!newBrigadista.nombre) return;
    const updated = [...brigadistas, { id: generateId(), nombre: newBrigadista.nombre, cargo: newBrigadista.cargo || 'Brigadista', activo: true, createdAt: new Date().toISOString() }];
    setBrigadistas(updated);
    saveBrigadistas(updated);
    setNewBrigadista({ nombre: '', cargo: 'Brigadista' });
    setShowAddBrigadista(false);
  };

  const removeBrigadista = (id: string) => {
    const updated = brigadistas.filter(b => b.id !== id);
    setBrigadistas(updated);
    saveBrigadistas(updated);
  };

  const toggleQR = (id: string) => {
    const next = new Set(selectedQR);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedQR(next);
  };

  const printQRs = async () => {
    const selected = extintores.filter(e => selectedQR.has(e.id));
    if (selected.length === 0) return;
    const qrDataUrls = await Promise.all(selected.map(async e => {
      const data = JSON.stringify({ id: e.id, codigo: e.codigo, type: 'fireguard-extintor' });
      return QRCode.toDataURL(data, { width: 200, margin: 1 });
    }));

    const html = `<!DOCTYPE html><html><head><title>QR Codes - SHE Natura</title><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px; }
      .item { text-align: center; border: 1px dashed #ccc; padding: 15px; border-radius: 8px; }
      .item h3 { font-size: 12px; margin-bottom: 8px; }
      .item img { width: 150px; height: 150px; }
      @media print { .grid { page-break-inside: avoid; } body { -webkit-print-color-adjust: exact; } }
    </style></head><body><div class="grid">`;
    const items = selected.map((e, i) => `<div class="item"><h3>${e.codigo} - ${e.ubicacion}</h3><img src="${qrDataUrls[i]}" alt="QR"/></div>`).join('');
    const fullHtml = html + items + '</div><script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500);}</script></body></html>';

    const win = window.open('', '_blank');
    if (win) { win.document.write(fullHtml); win.document.close(); }
  };

  const handleClearAll = () => {
    clearAllData();
    refreshData();
    setShowClearConfirm(false);
    setInspectores([]);
    setBrigadistas([]);
  };

  return (
    <div className="space-y-4">
      {/* Theme */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Apariencia</h3>
        <div className="grid grid-cols-3 gap-2">
          {themes.map(t => {
            const Icon = t.icon;
            return (
              <motion.button key={t.id} whileTap={{ scale: 0.95 }} onClick={() => setTheme(t.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${theme === t.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' : 'border-slate-200 dark:border-slate-600 text-slate-500'}`}>
                <Icon size={20} />
                <span className="text-xs font-medium">{t.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Inspectores */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Inspectores</h3>
          <button onClick={() => setShowAddInspector(!showAddInspector)} className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
            <Plus size={14} className="text-emerald-600" />
          </button>
        </div>
        <AnimatePresence>
          {showAddInspector && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-3">
              <div className="space-y-2 p-2 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <input type="text" placeholder="Nombre" value={newInspector.nombre} onChange={e => setNewInspector({ ...newInspector, nombre: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-sm outline-none dark:text-white" />
                <input type="text" placeholder="Cargo" value={newInspector.cargo} onChange={e => setNewInspector({ ...newInspector, cargo: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-sm outline-none dark:text-white" />
                <button onClick={addInspector} className="w-full py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium">Agregar</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-1.5">
          {inspectores.map(i => (
            <div key={i.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-white">{i.nombre}</p>
                <p className="text-xs text-slate-500">{i.cargo}</p>
              </div>
              <button onClick={() => removeInspector(i.id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Brigadistas */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Brigadistas</h3>
          <button onClick={() => setShowAddBrigadista(!showAddBrigadista)} className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
            <Plus size={14} className="text-emerald-600" />
          </button>
        </div>
        <AnimatePresence>
          {showAddBrigadista && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-3">
              <div className="space-y-2 p-2 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <input type="text" placeholder="Nombre" value={newBrigadista.nombre} onChange={e => setNewBrigadista({ ...newBrigadista, nombre: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-sm outline-none dark:text-white" />
                <input type="text" placeholder="Cargo" value={newBrigadista.cargo} onChange={e => setNewBrigadista({ ...newBrigadista, cargo: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-sm outline-none dark:text-white" />
                <button onClick={addBrigadista} className="w-full py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium">Agregar</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-1.5">
          {brigadistas.map(b => (
            <div key={b.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-white">{b.nombre}</p>
                <p className="text-xs text-slate-500">{b.cargo}</p>
              </div>
              <button onClick={() => removeBrigadista(b.id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* QR Print */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Códigos QR</h3>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowPrintModal(true)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium">
          <Printer size={16} /> Imprimir Todos los QR
        </motion.button>
      </div>

      {/* Clear Data */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Datos</h3>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowClearConfirm(true)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">
          <Database size={16} /> Limpiar Todos los Datos
        </motion.button>
      </div>

      {/* About */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center mx-auto mb-2">
          <span className="text-2xl">🌿</span>
        </div>
        <h3 className="font-bold text-slate-800 dark:text-white">SHE Natura</h3>
        <p className="text-xs text-slate-500 mt-1">Safety • Health • Environment</p>
        <p className="text-xs text-slate-400 mt-2">Versión 1.0.0</p>
        <p className="text-[10px] text-slate-400 mt-1">Sistema de Gestión de Extintores</p>
      </div>

      {/* Print Modal */}
      <AnimatePresence>
        {showPrintModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowPrintModal(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-white dark:bg-slate-800 w-full max-w-[480px] rounded-t-3xl p-5 max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Seleccionar QR</h3>
                <button onClick={() => setShowPrintModal(false)}><X size={20} className="text-slate-500" /></button>
              </div>
              <div className="flex gap-2 mb-3">
                <button onClick={() => setSelectedQR(new Set(extintores.map(e => e.id)))} className="flex-1 py-1.5 text-xs bg-emerald-100 text-emerald-700 rounded-lg font-medium">Seleccionar Todos</button>
                <button onClick={() => setSelectedQR(new Set())} className="flex-1 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-medium">Deseleccionar</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {extintores.map(e => (
                  <motion.button key={e.id} whileTap={{ scale: 0.95 }} onClick={() => toggleQR(e.id)} className={`relative p-3 rounded-xl border-2 transition-all ${selectedQR.has(e.id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-200 dark:border-slate-600'}`}>
                    {selectedQR.has(e.id) && <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><span className="text-white text-[10px]">✓</span></div>}
                    <p className="text-xs font-medium text-slate-700 dark:text-white">{e.codigo}</p>
                    <p className="text-[10px] text-slate-500 truncate">{e.ubicacion}</p>
                  </motion.button>
                ))}
              </div>
              {extintores.length === 0 && <p className="text-center text-sm text-slate-400 py-4">No hay extintores para imprimir</p>}
              <motion.button whileTap={{ scale: 0.98 }} onClick={printQRs} disabled={selectedQR.size === 0} className="w-full mt-4 py-3 bg-blue-500 text-white rounded-xl font-medium text-sm disabled:opacity-50">
                Imprimir ({selectedQR.size})
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Confirm Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowClearConfirm(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white dark:bg-slate-800 rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
              <div className="text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="font-bold text-slate-800 dark:text-white">¿Eliminar todos los datos?</h3>
                <p className="text-sm text-slate-500 mt-2">Esta acción no se puede deshacer. Se eliminarán extintores, reportes, inspectores y brigadistas.</p>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-sm font-medium">Cancelar</button>
                <button onClick={handleClearAll} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium">Eliminar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
