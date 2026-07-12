<script setup lang="ts">
import { onMounted, useTemplateRef, watch } from 'vue'

import { renderBarChart } from '../charts/bar-chart'
import { renderDonutChart } from '../charts/donut-chart'
import { renderLineChart } from '../charts/line-chart'
import { renderRadialDashboard } from '../charts/radial-dashboard'
import type { ChartAccessibilityContract } from '../lib/accessibility'
import type { BarDatum, DonutDatum, LineDatum, RadialStepsDatum } from '../data/examples'

type ChartDefinition =
  | { kind: 'bar'; metadata: ChartAccessibilityContract; data: BarDatum[] }
  | { kind: 'line'; metadata: ChartAccessibilityContract; data: LineDatum[] }
  | { kind: 'donut'; metadata: ChartAccessibilityContract; data: DonutDatum[] }
  | { kind: 'radial'; metadata: ChartAccessibilityContract; data: RadialStepsDatum[] }

const props = defineProps<{
  chart: ChartDefinition
}>()

const hostRef = useTemplateRef<HTMLDivElement>('host')

function renderChart(): void {
  const host = hostRef.value

  if (!host) {
    return
  }

  switch (props.chart.kind) {
    case 'bar':
      renderBarChart(host, {
        data: props.chart.data,
        metadata: props.chart.metadata,
      })
      break
    case 'line':
      renderLineChart(host, {
        data: props.chart.data,
        metadata: props.chart.metadata,
      })
      break
    case 'donut':
      renderDonutChart(host, {
        data: props.chart.data,
        metadata: props.chart.metadata,
      })
      break
    case 'radial':
      renderRadialDashboard(host, {
        data: props.chart.data,
        metadata: props.chart.metadata,
      })
      break
  }
}

onMounted(renderChart)

watch(() => props.chart, renderChart, { flush: 'post' })
</script>

<template>
  <article
    class="flex min-h-full flex-col overflow-hidden rounded-4xl bg-white shadow-black border border-gray-200"
  >
    <header class="px-5.5 pt-5 pb-2.5">
      <h2 class="m-0 leading-snug font-bold">
        {{ chart.metadata.title }}
      </h2>
    </header>

    <div ref="host" class="overflow-x-auto px-4 pt-2 pb-1" />
  </article>
</template>
