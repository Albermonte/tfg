import * as d3 from 'd3'

import type { ChartAccessibilityContract } from './accessibility'

/**
 * Expose the data items as a list, so screen readers announce "lista" and the item count
 * `listitem` replaces the implicit `graphics-symbol`, which TalkBack reads as "símbolo gráfico"
 * No `tabindex`: focusable nodes count as controls in TalkBack's "Controles" navigation,
 * and double tapping a data item does nothing
 * @param elements - The data items, all children of the same parent
 */
export function enableHorizontalArrowKeyFocus<ElementType extends SVGElement>(
  elements: ElementType[],
): void {
  elements[0]?.parentElement?.setAttribute('role', 'list')
  elements.forEach((element) => element.setAttribute('role', 'listitem'))
}

/**
 * Create an accessible SVG element with a description for screen readers
 * The SVG is an unnamed, non-focusable `role="group"`: TalkBack announces named groups as "En <name>",
 * and reads a focusable container together with all of its text
 * The description is a transparent paragraph covering the chart, read before the data items
 * @param width - The width of the SVG element
 * @param height - The height of the SVG element
 * @param className - The class name(s) to apply to the SVG element
 * @param metadata - The accessibility metadata for the chart; only the long description is used
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

  // Text, not a labelled shape: TalkBack treats those as images ("símbolo gráfico", "se ha detectado texto")
  svg
    .append('foreignObject')
    .attr('width', width)
    .attr('height', height)
    .append('xhtml:p')
    .attr('class', 'm-0 h-full text-transparent')
    .text(metadata.longDescription)

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
  // Screen readers go straight to the data items, which already contain every value
  axis.attr('aria-hidden', 'true')
}
