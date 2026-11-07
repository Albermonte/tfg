import * as d3 from 'd3'

import type { BarDatum } from '../data/examples'
import type { ChartAccessibilityContract } from '../lib/accessibility'
import {
  createAccessibleSvg,
  enableHorizontalArrowKeyFocus,
  styleAxis,
} from '../lib/chart-frame'
import { formatEuro } from '../lib/format'

interface BarChartOptions {
  data: BarDatum[]
  metadata: ChartAccessibilityContract
}

export function renderBarChart(
  host: HTMLElement,
  { data, metadata }: BarChartOptions,
): void {
  const width = 680
  const height = 360
  const margin = { top: 24, right: 24, bottom: 52, left: 52 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const { svg, node: svgNode } = createAccessibleSvg(
    width,
    height,
    'block h-auto w-full outline-none',
    metadata,
  )

  // Categories need fixed horizontal slots
  // `scaleBand` is the right D3 scale because it maps labels into uniform bands and exposes `bandwidth()` for bar width
  // `scaleOrdinal` would map labels to discrete outputs like colors, but it would not reserve pixel width for each bar
  // Docs: https://d3js.org/d3-scale/band
  const x = d3
    .scaleBand()
    .domain(data.map((item) => item.category))
    .range([margin.left, margin.left + innerWidth])
    .padding(0.3)

  // Euro values are continuous numbers, so `scaleLinear` preserves proportional differences between amounts
  // The range is inverted because SVG's y-axis grows downward, while larger chart values should appear higher
  // D3 docs: https://d3js.org/d3-scale/linear
  // W3C SVG coordinates: https://www.w3.org/TR/SVG2/coords.html
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, item => item.value) ?? 0])
    .nice()
    .range([margin.top + innerHeight, margin.top])

  // Docs: https://d3js.org/d3-axis
  const gridAxis = svg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickSize(-innerWidth))
  styleAxis(gridAxis)

  const xAxis = svg
    .append('g')
    .attr('transform', `translate(0,${margin.top + innerHeight})`)
    .call(d3.axisBottom(x))
  styleAxis(xAxis)

  // Creates one SVG rect for each datum
  // Docs: https://d3js.org/d3-selection/joining
  const bars = svg
    .append('g')
    .selectAll<SVGRectElement, BarDatum>('rect')
    .data(data)
    .join('rect')
    .attr(
      'class',
      'cursor-pointer',
    )
    // Put each bar in its horizontal slot
    .attr('x', datum => x(datum.category) ?? 0)
    // Scale the bar height to the datum value, and position it so the bottom of the bar sits on the x-axis
    .attr('y', datum => y(datum.value))
    .attr('width', x.bandwidth())
    .attr('height', datum => margin.top + innerHeight - y(datum.value))
    // Rounded corners
    .attr('rx', 12)
    .attr('fill', datum => datum.color)
    .attr(
      'aria-label',
      datum =>
        `${datum.category}: ${formatEuro(datum.value)} gastados esta semana. ${datum.note}`,
    )

  enableHorizontalArrowKeyFocus(bars.nodes())

  // Labels need a separate layer because SVG rects cannot contain text
  // Appending it after the bars keeps the labels visible above them
  // Hidden from screen readers: the value is already in each bar's label
  svg
    .append('g')
    .attr('aria-hidden', 'true')
    .selectAll<SVGTextElement, BarDatum>('text')
    .data(data)
    .join('text')
    .attr('class', 'fill-gray-900 text-sm font-bold')
    .attr('x', datum => (x(datum.category) ?? 0) + x.bandwidth() / 2)
    .attr('y', datum => y(datum.value) - 10)
    .attr('text-anchor', 'middle')
    .text(datum => formatEuro(datum.value))

  host.replaceChildren(svgNode)
}
