export interface Extintor {
  id: string;
  codigo: string;
  ubicacion: string;
  tipo: string;
  capacidad: string;
  fechaRecarga: string;
  fechaVencimiento: string;
  presion: 'optima' | 'baja' | 'critica';
  estado: 'activo' | 'mantenimiento' | 'vencido';
  notas: string;
  inspecciones: Inspeccion[];
  createdAt: string;
}

export interface Inspeccion {
  id: string;
  extintorId: string;
  fecha: string;
  inspector: string;
  estado: 'aprobado' | 'rechazado' | 'observacion';
  presion: 'optima' | 'baja' | 'critica';
  observaciones: string;
  checklist: boolean[];
  renovacionFecha?: string;
}

export interface ReporteAccidente {
  id: string;
  fecha: string;
  ubicacion: string;
  descripcion: string;
  tipo: string;
  gravedad: 'leve' | 'moderado' | 'grave';
  extintorUsado?: string;
  reportadoPor: string;
  createdAt: string;
}

export interface Inspector {
  id: string;
  nombre: string;
  cargo: string;
  activo: boolean;
  createdAt: string;
}

export interface Brigadista {
  id: string;
  nombre: string;
  cargo: string;
  activo: boolean;
  createdAt: string;
}

export type TabType = 'inicio' | 'extintores' | 'reportes' | 'ajustes';
export type PageType = TabType | 'nuevo-extintor' | 'detalle-extintor' | 'inspeccion';
export type ThemeType = 'light' | 'dark' | 'auto';
