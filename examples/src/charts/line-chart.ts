import * as d3 from 'd3'

import type { LineDatum } from '../data/examples'
import type { ChartAccessibilityContract } from '../lib/accessibility'
import {
  createAccessibleSvg,
  enableHorizontalArrowKeyFocus,
  styleAxis,
} from '../lib/chart-frame'

interface LineChartOptions {
  data: LineDatum[]
  metadata: ChartAccessibilityContract
  accentColor?: string
}

export function renderLineChart(
  host: HTMLElement,
  { data, metadata, accentColor = '#af1e69' }: LineChartOptions,
): void {
  const width = 680
  const height = 360
  const margin = { top: 24, right: 24, bottom: 52, left: 40 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const { svg, node: svgNode } = createAccessibleSvg(
    width,
    height,
    'block h-auto w-full min-w-[520px] outline-none',
    metadata,
  )

  // Months are strings, so `scalePoint` evenly distributes them across the range
  // Docs: https://d3js.org/d3-scale/point
  const x = d3
    .scalePoint<string>()
    .domain(data.map((item) => item.month))
    .range([margin.left, margin.left + innerWidth])
    // Horizontal padding, so the first and last points don't sit on the edge of the chart
    .padding(0.2)

  // Returns min and max values in the array
  // Docs: https://d3js.org/d3-array/summarize#extent
  const valueExtent = d3.extent(data, item => item.value)
  const minValue = valueExtent[0] ?? 0
  const maxValue = valueExtent[1] ?? minValue
  const yPadding = Math.max((maxValue - minValue) * 0.2, 2)

  // Temperatures are continuous numbers, so `scaleLinear` preserves space between them. 
  // The output range is inverted because SVG y coordinates grow downward, but higher temperatures should sit higher in the plot
  // D3 docs: https://d3js.org/d3-scale/linear
  const y = d3
    .scaleLinear()
    .domain([Math.max(0, minValue - yPadding), maxValue + yPadding])
    .nice()
    .range([margin.top + innerHeight, margin.top])

  // Docs: https://d3js.org/d3-axis
  const gridAxis = svg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    // Negative tick size extends the ticks to the left, rendering horizontal grid lines
    .call(d3.axisLeft(y).tickSize(-innerWidth))
  styleAxis(gridAxis)

  const xAxis = svg
    .append('g')
    .attr('transform', `translate(0,${margin.top + innerHeight})`)
    .call(d3.axisBottom(x))
  styleAxis(xAxis)

  // Line docs: https://d3js.org/d3-shape/line
  // Curve docs: https://d3js.org/d3-shape/curve#curveCatmullRom
  const line = d3
    .line<LineDatum>()
    .x(datum => x(datum.month) ?? 0)
    .y(datum => y(datum.value))
    // Giving a subtle curve to the line
    .curve(d3.curveCatmullRom.alpha(0.5))

  svg
    .append('path')
    .datum(data)
    .attr('class', 'drop-shadow-md')
    .attr('fill', 'none')
    .attr('stroke', accentColor)
    .attr('stroke-width', 4)
    .attr('d', line)

  // Docs: https://d3js.org/d3-selection/joining
  const points = svg
    .append('g')
    .selectAll<SVGCircleElement, LineDatum>('circle')
    .data(data)
    .join('circle')
    .attr(
      'class',
      'cursor-pointer',
    )
    .attr('cx', datum => x(datum.month) ?? 0)
    .attr('cy', datum => y(datum.value))
    // Circle radius
    .attr('r', 8)
    .attr('fill', accentColor)
    .attr(
      'aria-label',
      datum =>
        `${datum.month}: temperatura máxima media ${datum.value} grados Celsius. ${datum.note}`,
    )

  enableHorizontalArrowKeyFocus(points.nodes())

  svg
    .append('g')
    .selectAll<SVGTextElement, LineDatum>('text')
    .data(data)
    .join('text')
    .attr('class', 'fill-gray-900 text-sm font-bold')
    // Position the label horizontally centered on the point
    .attr('x', datum => x(datum.month) ?? 0)
    // Position the label above the point, with a small vertical offset
    .attr('y', datum => y(datum.value) - 16)
    // Center the text horizontally
    .attr('text-anchor', 'middle')
    .text(datum => `${datum.value} °C`)

  host.replaceChildren(svgNode)
}
