import type { ChartAccessibilityContract } from '../lib/accessibility'

interface ChartDatumBase {
  color: string
  note: string
}

export interface BarDatum extends ChartDatumBase {
  category: string
  value: number
}

export interface LineDatum {
  month: string
  value: number
  note: string
}

export interface DonutDatum extends ChartDatumBase {
  label: string
  value: number
}

export interface RadialStepsDatum extends ChartDatumBase {
  label: string
  amount: number
  target: number
}

export const barChartData: BarDatum[] = [
  {
    category: 'Vivienda',
    value: 1240,
    color: '#af1e69',
    note: 'Alquiler, suministros y seguros.',
  },
  {
    category: 'Alimentación',
    value: 520,
    color: '#16a34a',
    note: 'Compra semanal y comidas compartidas.',
  },
  {
    category: 'Transporte',
    value: 310,
    color: '#ea580c',
    note: 'Transporte público, combustible y mantenimiento.',
  },
  {
    category: 'Formación',
    value: 240,
    color: '#7c3aed',
    note: 'Cursos, libros y herramientas.',
  },
]

export const lineChartData: LineDatum[] = [
  { month: 'Ene', value: 11, note: 'Mes más frío del periodo.' },
  { month: 'Feb', value: 13, note: 'Ligero aumento respecto a enero.' },
  { month: 'Mar', value: 17, note: 'Inicio de temperaturas primaverales.' },
  { month: 'Abr', value: 19, note: 'Máximas suaves durante el mes.' },
  { month: 'May', value: 24, note: 'Ascenso claro antes del verano.' },
  { month: 'Jun', value: 31, note: 'Primeras máximas veraniegas.' },
]

export const donutChartData: DonutDatum[] = [
  {
    label: 'Fondo de emergencia',
    value: 42,
    color: '#16a34a',
    note: 'Reservado para protección a corto plazo.',
  },
  {
    label: 'Viajes',
    value: 24,
    color: '#af1e69',
    note: 'Ahorrado para el viaje de verano.',
  },
  {
    label: 'Equipamiento',
    value: 18,
    color: '#9333ea',
    note: 'Renovación de portátil y monitor.',
  },
  {
    label: 'Formación',
    value: 16,
    color: '#ea580c',
    note: 'Presupuesto para formación y certificaciones.',
  },
]

export const radialDashboardData: RadialStepsDatum[] = [
  {
    label: 'Diario',
    amount: 8000,
    target: 10000,
    color: '#ea580c',
    note: 'Casi alcanza el objetivo recomendado para el día.',
  },
  {
    label: 'Semanal',
    amount: 50000,
    target: 70000,
    color: '#af1e69',
    note: 'Mantiene una media alta durante la semana.',
  },
  {
    label: 'Mensual',
    amount: 200000,
    target: 300000,
    color: '#9333ea',
    note: 'Progreso acumulado del mes en curso.',
  },
]

export const barChartAccessibility: ChartAccessibilityContract = {
  chartId: 'gasto-semanal-barras',
  title: 'Gasto semanal por categoría',
  longDescription:
    'Gráfico de barras que compara el gasto semanal en vivienda, alimentación, transporte y formación.',
}

export const lineChartAccessibility: ChartAccessibilityContract = {
  chartId: 'temperatura-maxima-madrid',
  title: 'Temperatura máxima media en Madrid',
  longDescription:
    'Gráfico de líneas que muestra la temperatura máxima media mensual en Madrid de enero a junio.',
}

export const donutChartAccessibility: ChartAccessibilityContract = {
  chartId: 'distribucion-ahorro-mensual',
  title: 'Distribución del ahorro mensual',
  longDescription:
    'Gráfico de anillo que reparte el ahorro mensual entre fondo de emergencia, viajes, equipamiento y formación.',
}

export const radialDashboardAccessibility: ChartAccessibilityContract = {
  chartId: 'recuento-pasos-periodo',
  title: 'Recuento de pasos por periodo',
  longDescription:
    'Panel radial que muestra el progreso de pasos registrados frente al objetivo diario, semanal y mensual.',
}
