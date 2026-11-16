import * as d3 from 'd3'

import type { BarDatum } from '../data/examples'
import type { ChartAccessibilityContract } from '../lib/accessibility'
import {
  createAccessibleSvg,
  styleAxis,
} from '../lib/chart-frame'
import { formatEuro, formatPercent } from '../lib/format'

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

  const barCenterX = (datum: BarDatum) => (x(datum.category) ?? 0) + x.bandwidth() / 2

  // Creates one SVG rect for each datum
  // Docs: https://d3js.org/d3-selection/joining
  const bars = svg
    .append('g')
    .selectAll<SVGRectElement, BarDatum>('rect')
    .data(data)
    .join('rect')
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
      'class',
      'cursor-pointer outline-none focus-visible:stroke-gray-900 focus-visible:stroke-3',
    )
    // Bars open the breakdown, so they are buttons: reachable with Tab and listed as controls by TalkBack
    .attr('role', 'button')
    .attr('tabindex', 0)
    .attr('aria-expanded', 'false')
    .attr(
      'aria-label',
      datum =>
        `${datum.category}: ${formatEuro(datum.value)} gastados esta semana. ${datum.note}`,
    )
    .on('click', (_event, datum) => showTooltip(datum))
    .on('keydown', (event: KeyboardEvent, datum) => {
      if (event.key === 'Enter' || event.key === ' ') {
        // Space would scroll the page otherwise
        event.preventDefault()
        showTooltip(datum)
      }
    })

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
    .attr('x', barCenterX)
    .attr('y', datum => y(datum.value) - 10)
    .attr('text-anchor', 'middle')
    .text(datum => formatEuro(datum.value))

  // The tooltip is HTML laid over the SVG, so it can hold a real button and a list
  // Positions are percentages of the viewBox, so they follow the SVG when it scales
  const wrapper = d3.create('div').attr('class', 'relative')
  wrapper.append(() => svgNode)

  const tooltip = wrapper
    .append('div')
    // A labelled group, not `role="dialog"`: TalkBack treats a dialog as a pane
    // and reads all of it again on every change inside it
    .attr('role', 'group')
    .attr('class', 'absolute z-10 hidden w-60 max-w-[90%] rounded-2xl border border-gray-200 bg-white p-4 shadow-lg')
    .on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideTooltip()
      }
    })

  // `showTooltip` rebuilds the content, so closing only hides it
  function hideTooltip(): void {
    tooltip.classed('hidden', true)
    // The expanded bar opened the tooltip, so focus returns to it
    bars.filter('[aria-expanded="true"]').node()?.focus()
    bars.attr('aria-expanded', 'false')
  }

  function showTooltip(datum: BarDatum): void {
    const anchorX = barCenterX(datum) / width
    const anchorY = y(datum.value) / height

    // Keep the tooltip inside the chart: align to the bar's edge near the sides,
    // and open downward from tall bars, upward from short ones
    const translateX = anchorX < 0.33 ? '-20%' : anchorX > 0.66 ? '-80%' : '-50%'
    const translateY = anchorY < 0.5 ? '8px' : 'calc(-100% - 8px)'

    // Build the content while hidden and show it in one step, so the screen reader sees a single change
    tooltip
      .classed('hidden', true)
      .attr('aria-label', `Desglose de ${datum.category}`)
      .style('left', `${anchorX * 100}%`)
      .style('top', `${anchorY * 100}%`)
      .style('transform', `translate(${translateX}, ${translateY})`)
      .selectChildren()
      .remove()

    const header = tooltip.append('div').attr('class', 'mb-2 flex items-start justify-between gap-2')
    const heading = header.append('div')
    heading.append('p').attr('class', 'm-0 font-bold text-gray-900').text(datum.category)
    heading
      .append('p')
      .attr('class', 'm-0 text-sm text-gray-500')
      .text(`${formatEuro(datum.value)} esta semana`)

    const closeButton = header
      .append('button')
      .attr('type', 'button')
      .attr('aria-label', 'Cerrar desglose')
      .attr(
        'class',
        'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-lg leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-gray-900',
      )
      .text('×')
      .on('click', hideTooltip)

    const items = tooltip
      .append('ul')
      .attr('class', 'm-0 flex list-none flex-col gap-1.5 p-0')
      .selectAll('li')
      .data(datum.breakdown)
      .join('li')
      .attr('class', 'flex items-center gap-2 text-sm')

    items
      .append('span')
      .attr('aria-hidden', 'true')
      .attr('class', 'size-2.5 shrink-0 rounded-full')
      .style('background-color', datum.color)
    items.append('span').attr('class', 'flex-1 text-gray-700').text(item => item.label)
    items
      .append('span')
      .attr('class', 'font-bold text-gray-900')
      .text(item => `${formatEuro(item.value)} (${formatPercent(item.value / datum.value)})`)

    tooltip.classed('hidden', false)
    bars.attr('aria-expanded', item => String(item === datum))

    // Move focus into the tooltip so keyboard and screen reader users land on it
    closeButton.node()?.focus()
  }

  host.replaceChildren(wrapper.node() as HTMLDivElement)
}
