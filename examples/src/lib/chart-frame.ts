import * as d3 from 'd3'

import type { ChartAccessibilityContract } from './accessibility'

export function enableHorizontalArrowKeyFocus<ElementType extends SVGElement>(
  elements: ElementType[],
): void {
  elements.forEach((element, index) => {
    element.setAttribute('tabindex', index === 0 ? '0' : '-1')
    element.addEventListener('keydown', (event) => {
      if (!(event instanceof KeyboardEvent) || !['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        return
      }

      event.preventDefault()

      const direction = event.key === 'ArrowRight' ? 1 : -1
      const nextIndex = (index + direction + elements.length) % elements.length

      element.setAttribute('tabindex', '-1')
      elements[nextIndex]?.setAttribute('tabindex', '0')
      elements[nextIndex]?.focus()
    })
  })
}

/**
 * Create an accessible SVG element with a title and description for screen readers
 * The SVG will have a `role` of "group" and will be focusable with `tabindex="0"`
 * The title and description will be linked to the SVG using `aria-labelledby`
 * @param width - The width of the SVG element
 * @param height - The height of the SVG element
 * @param className - The class name(s) to apply to the SVG element
 * @param metadata - The accessibility metadata for the chart, including title and long description
 * @returns 
 */
export function createAccessibleSvg(
  width: number,
  height: number,
  className: string,
  metadata: ChartAccessibilityContract,
) {
  const svg = d3
    .create('svg')
    .attr('class', className)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'group')
    .attr('tabindex', '0')
    // Connecting element to the `title` and `desc` nodes for screen readers
    // W3C ARIA technique: https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA16
    // W3C SVG AAM: https://www.w3.org/TR/svg-aam-1.0/
    .attr('aria-labelledby', `${metadata.chartId}-title ${metadata.chartId}-desc`)

  svg.append('title').attr('id', `${metadata.chartId}-title`).text(metadata.title)
  svg.append('desc').attr('id', `${metadata.chartId}-desc`).text(metadata.longDescription)

  return {
    svg,
    node: svg.node() as SVGSVGElement,
  }
}

/**
 * Give D3 axes a consistent style across charts. This is called after `.call(axis)`
 * @param axis 
 */
export function styleAxis<Datum>(
  axis: d3.Selection<SVGGElement, Datum, null, undefined>
): void {
  axis.selectAll('text').attr('class', 'text-gray-500 text-xs')
  axis.selectAll('line').attr('class', 'stroke-gray-200')
  axis.selectAll('path').attr('class', 'hidden')
}
