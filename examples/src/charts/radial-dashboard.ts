import * as d3 from 'd3'

import type { RadialStepsDatum } from '../data/examples'
import type { ChartAccessibilityContract } from '../lib/accessibility'
import {
  createAccessibleSvg,
  enableHorizontalArrowKeyFocus,
} from '../lib/chart-frame'
import { formatNumber, formatPercent, formatSteps } from '../lib/format'

interface RadialDashboardOptions {
  data: RadialStepsDatum[]
  metadata: ChartAccessibilityContract
}

export function renderRadialDashboard(
  host: HTMLElement,
  { data, metadata }: RadialDashboardOptions,
): void {
  const width = 680
  const height = 460
  const centerX = width / 2
  const centerY = 184
  const summaryY = 376
  const ringGap = 28
  const ringWidth = 18

  const { svg, node: svgNode } = createAccessibleSvg(
    width,
    height,
    'block h-auto w-full min-w-[520px] outline-none',
    metadata,
  )

  // Centering rings in the middle
  const ringGroup = svg.append('g').attr('transform', `translate(${centerX},${centerY})`)

  // Docs: https://d3js.org/d3-shape/arc
  const arc = d3.arc<d3.DefaultArcObject>()
  const focusableArcs: SVGPathElement[] = []

  const summaryLabel = svg
    .append('text')
    .attr('class', 'fill-gray-500 text-[14px]')
    .attr('x', centerX)
    .attr('y', summaryY)
    .attr('text-anchor', 'middle')

  const summaryValue = svg
    .append('text')
    .attr('class', 'fill-gray-900 text-[24px] font-bold')
    .attr('x', centerX)
    .attr('y', summaryY + 32)
    .attr('text-anchor', 'middle')

  const summaryProgress = svg
    .append('text')
    .attr('class', 'fill-gray-500 text-[14px]')
    .attr('x', centerX)
    .attr('y', summaryY + 60)
    .attr('text-anchor', 'middle')

  function updateSummary(datum: RadialStepsDatum): void {
    const completion = datum.amount / datum.target

    summaryLabel.text(datum.label)
    summaryValue.text(`${formatNumber(datum.amount)} / ${formatNumber(datum.target)} pasos`)
    summaryProgress.text(`${formatPercent(completion)} completado`)
  }

  if (data[0]) {
    updateSummary(data[0])
  }

  data.forEach((datum, index) => {
    const completion = datum.amount / datum.target
    const innerRadius = 64 + index * ringGap
    const outerRadius = innerRadius + ringWidth

    // Angles start at -π/2 radians (-90 deg)
    const baseDatum: d3.DefaultArcObject = {
      innerRadius,
      outerRadius,
      startAngle: -Math.PI / 2,
      endAngle: (3 * Math.PI) / 2,
    }

    const progressDatum: d3.DefaultArcObject = {
      ...baseDatum,
      // Changing end angle to reflect completion percentage
      endAngle: -Math.PI / 2 + completion * Math.PI * 2,
    }

    ringGroup
      .append('path')
      .attr('d', arc(baseDatum) ?? '')
      .attr('class', 'fill-gray-200')

    const progressNode = ringGroup
      .append('path')
      .attr('d', arc(progressDatum) ?? '')
      .attr(
        'class',
        'cursor-pointer',
      )
      .attr('fill', datum.color)
      .attr(
        'aria-label',
        `${datum.label}: ${formatSteps(datum.amount)} registrados de ${formatSteps(datum.target)} previstos, ${formatPercent(completion)} completado. ${datum.note}`,
      )
      .on('focus mouseenter click', () => updateSummary(datum))
      .node()

    if (progressNode) {
      focusableArcs.push(progressNode)
    }
  })

  enableHorizontalArrowKeyFocus(focusableArcs)

  host.replaceChildren(svgNode)
}
