import { Extintor, ReporteAccidente, Inspector, Brigadista, ThemeType } from './types';

const KEYS = {
  extintores: 'she_extintores',
  reportes: 'she_reportes',
  inspectores: 'she_inspectores',
  brigadistas: 'she_brigadistas',
  brigadistaTurno: 'she_brigadistaTurno',
  theme: 'she_theme',
};

function get<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Extintores
export const getExtintores = (): Extintor[] => get(KEYS.extintores, []);
export const saveExtintores = (data: Extintor[]) => set(KEYS.extintores, data);

// Reportes
export const getReportes = (): ReporteAccidente[] => get(KEYS.reportes, []);
export const saveReportes = (data: ReporteAccidente[]) => set(KEYS.reportes, data);

// Inspectores
const defaultInspectores: Inspector[] = [
  { id: '1', nombre: 'Carlos Méndez', cargo: 'Supervisor de Seguridad', activo: true, createdAt: new Date().toISOString() },
  { id: '2', nombre: 'Ana López', cargo: 'Inspector de Seguridad', activo: true, createdAt: new Date().toISOString() },
  { id: '3', nombre: 'Roberto García', cargo: 'Jefe de Mantenimiento', activo: true, createdAt: new Date().toISOString() },
];
export const getInspectores = (): Inspector[] => {
  const data = get<Inspector[]>(KEYS.inspectores, []);
  if (data.length === 0) { saveInspectores(defaultInspectores); return defaultInspectores; }
  return data;
};
export const saveInspectores = (data: Inspector[]) => set(KEYS.inspectores, data);

// Brigadistas
const defaultBrigadistas: Brigadista[] = [
  { id: '1', nombre: 'Miguel Torres', cargo: 'Brigadista', activo: true, createdAt: new Date().toISOString() },
  { id: '2', nombre: 'Laura Martínez', cargo: 'Brigadista', activo: true, createdAt: new Date().toISOString() },
  { id: '3', nombre: 'Pedro Sánchez', cargo: 'Brigadista', activo: true, createdAt: new Date().toISOString() },
];
export const getBrigadistas = (): Brigadista[] => {
  const data = get<Brigadista[]>(KEYS.brigadistas, []);
  if (data.length === 0) { saveBrigadistas(defaultBrigadistas); return defaultBrigadistas; }
  return data;
};
export const saveBrigadistas = (data: Brigadista[]) => set(KEYS.brigadistas, data);

// Brigadista de Turno
export const getBrigadistaTurno = (): Brigadista | null => get(KEYS.brigadistaTurno, null);
export const saveBrigadistaTurno = (data: Brigadista | null) => set(KEYS.brigadistaTurno, data);

// Theme
export const getTheme = (): ThemeType => get(KEYS.theme, 'light');
export const saveTheme = (data: ThemeType) => set(KEYS.theme, data);

// Clear all
export const clearAllData = () => {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
};

// Utils
export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const getDaysUntilExpiry = (fecha: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(fecha);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const getExtintorEstado = (extintor: Extintor): 'activo' | 'mantenimiento' | 'vencido' => {
  const days = getDaysUntilExpiry(extintor.fechaVencimiento);
  if (days < 0) return 'vencido';
  if (extintor.presion === 'critica' || extintor.presion === 'baja') return 'mantenimiento';
  return 'activo';
};

export const getNextCodigo = (extintores: Extintor[]): string => {
  const nums = extintores.map(e => {
    const match = e.codigo.match(/EXT-(\d+)/);
    return match ? parseInt(match[1]) : 0;
  });
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `EXT-${String(max + 1).padStart(3, '0')}`;
};

export const addOneYear = (dateStr: string): string => {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
};

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
