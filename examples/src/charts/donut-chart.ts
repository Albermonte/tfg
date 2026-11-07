import * as d3 from 'd3'

import type { DonutDatum } from '../data/examples'
import type { ChartAccessibilityContract } from '../lib/accessibility'
import {
  createAccessibleSvg,
  enableHorizontalArrowKeyFocus,
} from '../lib/chart-frame'
import { formatPercent } from '../lib/format'

interface DonutChartOptions {
  data: DonutDatum[]
  metadata: ChartAccessibilityContract
}

export function renderDonutChart(
  host: HTMLElement,
  { data, metadata }: DonutChartOptions,
): void {
  const width = 680
  const height = 360
  const radius = 128

  const { svg, node: svgNode } = createAccessibleSvg(
    width,
    height,
    'block h-auto w-full outline-none',
    metadata,
  )

  const centerX = 220
  const centerY = height / 2
  // Inner radius to make the donut hole
  // Docs: https://d3js.org/d3-shape/arc
  const arc = d3.arc<d3.PieArcDatum<DonutDatum>>().innerRadius(radius * 0.6).outerRadius(radius)

  // Docs: https://d3js.org/d3-shape/pie
  const pie = d3
    .pie<DonutDatum>()
    .sort(null)
    .value(datum => datum.value)

  // Move donut to center
  const group = svg.append('g').attr('transform', `translate(${centerX},${centerY})`)
  
  // Center and legend repeat the slice labels, so they are hidden from screen readers
  // Percentage label
  const centerValue = svg
    .append('text')
    .attr('aria-hidden', 'true')
    .attr('class', 'fill-gray-900 text-[26px] font-bold')
    .attr('x', centerX)
    .attr('y', centerY - 8)
    .attr('text-anchor', 'middle')

  // Category label
  const centerLabel = svg
    .append('text')
    .attr('aria-hidden', 'true')
    .attr('class', 'fill-gray-500 text-[14px]')
    .attr('x', centerX)
    .attr('y', centerY + 16)
    .attr('text-anchor', 'middle')

  function updateCenterLabel(datum: DonutDatum): void {
    centerValue.text(`${datum.value}%`)
    centerLabel.text(datum.label)
  }

  if (data[0]) {
    updateCenterLabel(data[0])
  }

  const slices = group
    .selectAll<SVGPathElement, d3.PieArcDatum<DonutDatum>>('path')
    .data(pie(data))
    .join('path')
    .attr(
      'class',
      'cursor-pointer',
    )
    .attr('d', arc)
    .attr('fill', datum => datum.data.color)
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 4)
    .attr(
      'aria-label',
      datum =>
        `${datum.data.label}: ${formatPercent(datum.data.value / 100)} del total de ahorro. ${datum.data.note}`,
    )
    // No click: TalkBack would say "Toca dos veces para activar", but there is nothing to activate
    .on('focus mouseenter', (_event, datum) => updateCenterLabel(datum.data))

  enableHorizontalArrowKeyFocus(slices.nodes())

  const legend = svg.append('g').attr('aria-hidden', 'true').attr('transform', 'translate(420,72)')
  const legendRows = legend
    .selectAll<SVGGElement, DonutDatum>('g')
    .data(data)
    .join('g')
    // Margin between rows is 76px, so each row is translated by its index times that value
    .attr('transform', (_datum, index) => `translate(0, ${index * 76})`)

  legendRows
    .append('rect')
    .attr('x', 0)
    .attr('y', -12)
    .attr('width', 18)
    .attr('height', 18)
    .attr('rx', 5)
    .attr('fill', datum => datum.color)

  // For text wrapping
  const legendContent = legendRows
    .append('foreignObject')
    .attr('x', 32)
    .attr('y', -22)
    .attr('width', 220)
    .attr('height', 100)

  // Then append a div inside the foreignObject to hold the text content. The div is styled with flexbox to stack the label and note vertically, and to allow for text wrapping
  const legendText = legendContent
    .append('xhtml:div')
    .style('display', 'flex')
    .style('flex-direction', 'column')
    .style('gap', '3px')
    .style('width', '220px')
    .style('min-width', '0')
    .style('font-family', 'inherit')
    .style('overflow-wrap', 'anywhere')
    .style('word-break', 'normal')

  legendText
    .append('xhtml:div')
    .style('color', '#0f172a')
    .style('font-size', '16px')
    .style('font-weight', '700')
    .style('line-height', '1.18')
    .text(datum => `${datum.label} · ${datum.value}%`)

  legendText
    .append('xhtml:div')
    .style('color', '#64748b')
    .style('font-size', '13px')
    .style('line-height', '1.25')
    .text(datum => datum.note)

  host.replaceChildren(svgNode)
}
