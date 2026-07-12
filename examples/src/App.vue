<script setup lang="ts">
import AccessibleChart from './components/AccessibleChart.vue'
import {
  barChartAccessibility,
  barChartData,
  donutChartAccessibility,
  donutChartData,
  lineChartAccessibility,
  lineChartData,
  radialDashboardAccessibility,
  radialDashboardData,
} from './data/examples'

const charts = [
  {
    kind: 'bar',
    metadata: barChartAccessibility,
    data: barChartData,
  },
  {
    kind: 'line',
    metadata: lineChartAccessibility,
    data: lineChartData,
  },
  {
    kind: 'donut',
    metadata: donutChartAccessibility,
    data: donutChartData,
  },
  {
    kind: 'radial',
    metadata: radialDashboardAccessibility,
    data: radialDashboardData,
  },
] as const
</script>

<template>
  <main class="min-h-screen bg-gray-50 font-sans">
    <div class="mx-auto w-full max-w-370 px-4 py-6">
      <h1 class="mb-10 text-2xl leading-tight font-bold text-center">
        Generación de gráficos accesibles con D3.js
      </h1>

      <section class="flex flex-wrap items-stretch gap-6" aria-label="Ejemplos de gráficos accesibles">
        <AccessibleChart
          v-for="chart in charts"
          :key="chart.kind"
          class="min-w-full flex-1 sm:min-w-105 sm:basis-140"
          :chart="chart"
        />
      </section>
    </div>
  </main>
</template>
