import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Flame, FileText, Settings, Plus, X } from 'lucide-react';
import { TabType, PageType, ThemeType, Extintor, Brigadista } from './types';
import { getTheme, saveTheme, getExtintores, saveExtintores, getBrigadistaTurno, saveBrigadistaTurno } from './store';
import HomePage from './pages/HomePage';
import ExtinguishersPage from './pages/ExtinguishersPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import NewExtinguisherPage from './pages/NewExtinguisherPage';
import ExtinguisherDetailPage from './pages/ExtinguisherDetailPage';
import InspectionPage from './pages/InspectionPage';

const headerGradients: Record<TabType, string> = {
  inicio: 'from-emerald-600 to-teal-600',
  extintores: 'from-red-600 to-rose-600',
  reportes: 'from-orange-500 to-amber-500',
  ajustes: 'from-slate-600 to-gray-600',
};

export default function App() {
  const [theme, setTheme] = useState<ThemeType>(getTheme());
  const [activeTab, setActiveTab] = useState<TabType>('inicio');
  const [page, setPage] = useState<PageType>('inicio');
  const [selectedExtintorId, setSelectedExtintorId] = useState<string | null>(null);
  const [extintores, setExtintores] = useState<Extintor[]>(getExtintores());
  const [brigadistaTurno, setBrigadistaTurno] = useState<Brigadista | null>(getBrigadistaTurno());
  const [fabOpen, setFabOpen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Theme
  useEffect(() => {
    const root = document.documentElement;
    const resolved = theme === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
    root.className = resolved;
    saveTheme(theme);
  }, [theme]);

  // Refresh extintores
  const refreshData = useCallback(() => {
    setExtintores(getExtintores());
    setBrigadistaTurno(getBrigadistaTurno());
  }, []);

  // Auto-hide nav on scroll
  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const current = window.scrollY;
      setShowNav(current < lastScroll || current < 50);
      lastScroll = current;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    const tabs: TabType[] = ['inicio', 'extintores', 'reportes', 'ajustes'];
    const idx = tabs.indexOf(activeTab);
    if (Math.abs(diff) > 80 && page === activeTab) {
      if (diff > 0 && idx > 0) setActiveTab(tabs[idx - 1]);
      if (diff < 0 && idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
    }
    setTouchStart(null);
  };

  const navigateTo = (p: PageType, extintorId?: string) => {
    setPage(p);
    if (extintorId) setSelectedExtintorId(extintorId);
    if (['inicio', 'extintores', 'reportes', 'ajustes'].includes(p)) {
      setActiveTab(p as TabType);
    }
    setFabOpen(false);
    window.scrollTo(0, 0);
  };

  const updateExtintores = (data: Extintor[]) => {
    setExtintores(data);
    saveExtintores(data);
  };

  const updateBrigadistaTurno = (b: Brigadista | null) => {
    setBrigadistaTurno(b);
    saveBrigadistaTurno(b);
  };

  const currentTab = ['inicio', 'extintores', 'reportes', 'ajustes'].includes(page) ? page as TabType : activeTab;

  const renderPage = () => {
    switch (page) {
      case 'inicio':
        return <HomePage extintores={extintores} brigadistaTurno={brigadistaTurno} updateBrigadistaTurno={updateBrigadistaTurno} navigateTo={navigateTo} />;
      case 'extintores':
        return <ExtinguishersPage extintores={extintores} navigateTo={navigateTo} />;
      case 'reportes':
        return <ReportsPage brigadistaTurno={brigadistaTurno} />;
      case 'ajustes':
        return <SettingsPage theme={theme} setTheme={setTheme} extintores={extintores} refreshData={refreshData} />;
      case 'nuevo-extintor':
        return <NewExtinguisherPage extintores={extintores} updateExtintores={updateExtintores} navigateTo={navigateTo} />;
      case 'detalle-extintor':
        return <ExtinguisherDetailPage extintorId={selectedExtintorId!} extintores={extintores} updateExtintores={updateExtintores} navigateTo={navigateTo} />;
      case 'inspeccion':
        return <InspectionPage extintorId={selectedExtintorId!} extintores={extintores} updateExtintores={updateExtintores} navigateTo={navigateTo} brigadistaTurno={brigadistaTurno} />;
      default:
        return <HomePage extintores={extintores} brigadistaTurno={brigadistaTurno} updateBrigadistaTurno={updateBrigadistaTurno} navigateTo={navigateTo} />;
    }
  };

  const tabs = [
    { id: 'inicio' as TabType, icon: Home, label: 'Inicio' },
    { id: 'extintores' as TabType, icon: Flame, label: 'Extintores' },
    { id: 'reportes' as TabType, icon: FileText, label: 'Reportes' },
    { id: 'ajustes' as TabType, icon: Settings, label: 'Ajustes' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-[480px] mx-auto relative min-h-screen" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {/* Header */}
        <motion.header
          className={`bg-gradient-to-r ${headerGradients[currentTab]} text-white px-5 pt-8 pb-5 rounded-b-3xl shadow-lg`}
          layout
          animate={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-xl">🌿</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">SHE Natura</h1>
              <p className="text-xs text-white/80">
                {currentTab === 'inicio' && 'Panel Principal'}
                {currentTab === 'extintores' && 'Mis Extintores'}
                {currentTab === 'reportes' && 'Reportes'}
                {currentTab === 'ajustes' && 'Ajustes'}
                {page === 'nuevo-extintor' && 'Nuevo Extintor'}
                {page === 'detalle-extintor' && 'Detalle'}
                {page === 'inspeccion' && 'Inspección'}
              </p>
            </div>
          </div>
          {currentTab === 'inicio' && (
            <div className="mt-2 inline-flex items-center gap-1 bg-white/15 rounded-full px-3 py-1 text-xs backdrop-blur-sm">
              <span>Safety</span><span>•</span><span>Health</span><span>•</span><span>Environment</span>
            </div>
          )}
        </motion.header>

        {/* Content */}
        <main className="px-4 py-5 pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={page + (selectedExtintorId || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* FAB */}
        <div className="fixed bottom-24 right-4 z-40 max-w-[480px] w-full pointer-events-none">
          <div className="relative flex flex-col items-end gap-3 pointer-events-auto">
            <AnimatePresence>
              {fabOpen && (
                <>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    onClick={() => navigateTo('nuevo-extintor')}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-full shadow-lg text-sm font-medium"
                  >
                    <span>🧯</span> Nuevo Extintor
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ delay: 0.05 }}
                    onClick={() => navigateTo('extintores')}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-full shadow-lg text-sm font-medium"
                  >
                    <span>📷</span> Escanear QR
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => navigateTo('reportes')}
                    className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-full shadow-lg text-sm font-medium"
                  >
                    <span>📋</span> Reportar
                  </motion.button>
                </>
              )}
            </AnimatePresence>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setFabOpen(!fabOpen)}
              className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white ${fabOpen ? 'bg-slate-700 rotate-45' : 'bg-emerald-600'} transition-all duration-300`}
            >
              {fabOpen ? <X size={24} /> : <Plus size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <motion.nav
          initial={false}
          animate={{ y: showNav ? 0 : 80 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div className="max-w-[480px] mx-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 px-2 py-2 flex justify-around">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id && ['inicio', 'extintores', 'reportes', 'ajustes'].includes(page);
              return (
                <button
                  key={tab.id}
                  onClick={() => navigateTo(tab.id)}
                  className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${isActive ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : 'text-slate-400 dark:text-slate-500'}`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.nav>
      </div>
    </div>
  );
}
