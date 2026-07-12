const euroFormatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat('es-ES', {
  style: 'percent',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 0,
})

export function formatEuro(value: number): string {
  return euroFormatter.format(value)
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatSteps(value: number): string {
  return `${formatNumber(value)} pasos`
}
