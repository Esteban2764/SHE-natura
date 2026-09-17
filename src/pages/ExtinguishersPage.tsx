import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ScanLine, X, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Extintor, PageType } from '../types';
import { getDaysUntilExpiry, getExtintorEstado } from '../store';

interface Props {
  extintores: Extintor[];
  navigateTo: (page: PageType, id?: string) => void;
}

const filters = [
  { id: 'all', label: 'Todos' },
  { id: 'activo', label: 'Activos' },
  { id: 'por-vencer', label: 'Por Vencer' },
  { id: 'vencido', label: 'Vencidos' },
  { id: 'mantenimiento', label: 'Mantenimiento' },
];

export default function ExtinguishersPage({ extintores, navigateTo }: Props) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showScanner, setShowScanner] = useState(false);
  const [scannedExtintor, setScannedExtintor] = useState<Extintor | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<string>('qr-scanner-' + Date.now());

  const getFiltered = () => {
    let list = [...extintores];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(e => e.codigo.toLowerCase().includes(s) || e.ubicacion.toLowerCase().includes(s));
    }
    switch (activeFilter) {
      case 'activo': list = list.filter(e => getExtintorEstado(e) === 'activo'); break;
      case 'por-vencer': list = list.filter(e => { const d = getDaysUntilExpiry(e.fechaVencimiento); return d >= 0 && d <= 30; }); break;
      case 'vencido': list = list.filter(e => getExtintorEstado(e) === 'vencido'); break;
      case 'mantenimiento': list = list.filter(e => getExtintorEstado(e) === 'mantenimiento'); break;
    }
    return list;
  };

  const getCount = (filter: string) => {
    switch (filter) {
      case 'activo': return extintores.filter(e => getExtintorEstado(e) === 'activo').length;
      case 'por-vencer': return extintores.filter(e => { const d = getDaysUntilExpiry(e.fechaVencimiento); return d >= 0 && d <= 30; }).length;
      case 'vencido': return extintores.filter(e => getExtintorEstado(e) === 'vencido').length;
      case 'mantenimiento': return extintores.filter(e => getExtintorEstado(e) === 'mantenimiento').length;
      default: return extintores.length;
    }
  };

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode(scannerContainerRef.current);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            if (data.type === 'fireguard-extintor' || data.id) {
              const ext = extintores.find(e => e.id === data.id);
              if (ext) {
                setScannedExtintor(ext);
                stopScanner();
              }
            }
          } catch { /* ignore */ }
        },
        () => {}
      );
    } catch (err) {
      console.error('Scanner error:', err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
  };

  useEffect(() => {
    if (showScanner) {
      setTimeout(() => startScanner(), 300);
    }
    return () => { stopScanner(); };
  }, [showScanner]);

  const filtered = getFiltered();

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por código o ubicación..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none dark:text-white"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeFilter === f.id ? 'bg-red-500 text-white shadow-sm' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'}`}
          >
            {f.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeFilter === f.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
              {getCount(f.id)}
            </span>
          </button>
        ))}
      </div>

      {/* Scan Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowScanner(true)}
        className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2.5 rounded-xl shadow-sm text-sm font-medium"
      >
        <ScanLine size={18} /> Escanear QR
      </motion.button>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm">No se encontraron extintores</p>
          </div>
        ) : (
          filtered.map(ext => {
            const estado = getExtintorEstado(ext);
            const days = getDaysUntilExpiry(ext.fechaVencimiento);
            const dotColor = estado === 'activo' ? 'bg-emerald-500' : estado === 'mantenimiento' ? 'bg-amber-500' : 'bg-red-500';
            return (
              <motion.div
                key={ext.id}
                whileTap={{ scale: 0.98 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-sm border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center gap-3" onClick={() => navigateTo('detalle-extintor', ext.id)}>
                  <div className="relative">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-lg">🧯</div>
                    <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${dotColor}`} />
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer">
                    <p className="font-semibold text-sm text-slate-800 dark:text-white">{ext.codigo}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{ext.ubicacion}</p>
                    <p className="text-[10px] text-slate-400">{ext.tipo} • {ext.capacidad}</p>
                  </div>
                  <div className={`text-[10px] px-2 py-1 rounded-full font-medium ${days < 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : days <= 30 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'}`}>
                    {days < 0 ? 'Vencido' : `${days}d`}
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateTo('inspeccion', ext.id)}
                  className="mt-2 w-full py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg"
                >
                  📋 Inspeccionar
                </motion.button>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-slate-800 w-[90%] max-w-[400px] rounded-3xl p-5"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Escanear QR</h3>
                <button onClick={() => { stopScanner(); setShowScanner(false); setScannedExtintor(null); }} className="p-1">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              {scannedExtintor ? (
                <div className="text-center space-y-3">
                  <div className="text-5xl">✅</div>
                  <h4 className="font-bold text-lg text-slate-800 dark:text-white">{scannedExtintor.codigo}</h4>
                  <p className="text-sm text-slate-500">{scannedExtintor.ubicacion}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2">
                      <p className="text-xs text-slate-500">Estado</p>
                      <p className="text-sm font-medium capitalize">{getExtintorEstado(scannedExtintor)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2">
                      <p className="text-xs text-slate-500">Presión</p>
                      <p className="text-sm font-medium capitalize">{scannedExtintor.presion}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-2">
                      <p className="text-xs text-slate-500">Días</p>
                      <p className="text-sm font-medium">{getDaysUntilExpiry(scannedExtintor.fechaVencimiento)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => { navigateTo('inspeccion', scannedExtintor.id); setShowScanner(false); setScannedExtintor(null); }} className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium">Inspeccionar</button>
                    <button onClick={() => { navigateTo('detalle-extintor', scannedExtintor.id); setShowScanner(false); setScannedExtintor(null); }} className="flex-1 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium">Ver Detalle</button>
                  </div>
                  <button onClick={() => setScannedExtintor(null)} className="text-sm text-slate-500 underline">Escanear otro</button>
                </div>
              ) : (
                <div>
                  <div id={scannerContainerRef.current} className="rounded-xl overflow-hidden bg-black aspect-square" />
                  <div className="flex gap-2 mt-3">
                    <button onClick={startScanner} className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1">
                      <Camera size={16} /> Iniciar
                    </button>
                    <button onClick={() => { stopScanner(); setShowScanner(false); }} className="flex-1 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-white rounded-xl text-sm font-medium">Cerrar</button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
