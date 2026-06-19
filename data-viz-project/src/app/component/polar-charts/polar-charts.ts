import { afterNextRender, Component, ElementRef, inject, viewChild } from '@angular/core';
import { DataManipulation } from '../../service/data-manipulation';
import * as d3 from 'd3';
import { BOTTOM_10_COLOR, TOP_10_COLOR } from '../../common/constants';

@Component({
  selector: 'app-polar-charts',
  imports: [],
  templateUrl: './polar-charts.html',
  styleUrl: './polar-charts.scss',
})
export class PolarCharts {
  private dataManipulationService = inject(DataManipulation);

  private chartContainerTop10 = viewChild<ElementRef>('polarChartContainerTop10');
  private chartContainerBottom10 = viewChild<ElementRef>('polarChartContainerBottom10');

  constructor() {
    // Ensure D3 only manipulates the DOM on the browser
    afterNextRender(() => {
      this.createChart(true);
      this.createChart(false);
    });
  }

  private createChart(isTop10: Boolean) {
    const element = isTop10
      ? this.chartContainerTop10()?.nativeElement
      : this.chartContainerBottom10()?.nativeElement;
    if (!element) return;

    // REFERENCE - Based on: https://stackoverflow.com/questions/67463864/javascript-d3-plotting-radar-graph
    // Other references:
    // https://d3-graph-gallery.com/spider.html
    // https://observablehq.com/@observablehq/plot-radar-chart

    const values = this.dataManipulationService.getExtremum10Stats(2025, isTop10);

    const data = isTop10
      ? [{ color: TOP_10_COLOR, values: values }]
      : [{ color: BOTTOM_10_COLOR, values: values }];

    const svg = d3.select(element).attr('class', 'polar-chart');

    const maxValue = 1;
    const radius = 150;
    const center = { x: 250, y: 200 };

    const radialScale = d3.scaleLinear().domain([0, maxValue]).range([radius, 0]);

    for (let val = 0; val <= maxValue; val += maxValue / 5) {
      const r = radialScale(val);

      // REFERENCE: https://stackoverflow.com/questions/67664726/rendering-hexagons-in-d3-js-in-the-wordmap
      const hexagonPoints = (radius: number) => {
        const halfWidth = (radius * Math.sqrt(3)) / 2;
        return `
        0,${-r}
        ${halfWidth},${-r / 2}
        ${halfWidth},${radius / 2}
        0,${radius}
        ${-halfWidth},${radius / 2}
        ${-halfWidth},${-radius / 2}`;
      };

      svg
        .append('polygon')
        .attr('points', hexagonPoints(r))
        .attr('transform', 'translate(250, 200)') // 250 is center.x and 200 is center.y. Hard-coded values to simplify the syntax and because they are supposed to be static.
        .style('stroke', '#aaa')
        .style('fill', 'none');
    }

    // REFERENCE: https://stackoverflow.com/questions/24784302/wrapping-text-in-d3
    svg
      .append('foreignObject')
      .attr('width', '30rem')
      .attr('height', '5rem')
      .attr('x', '30')
      .attr('y', 2.6 * radius)
      .append('xhtml:div')
      .attr('text-align', 'center')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('overflow-y', 'visible')
      .attr('overflow-x', 'visible')
      .attr('overflow-wrap', 'break-word')
      .append('xhtml:h3')
      .attr('font-size', '1rem')
      .attr('font-weight', '600')
      .attr('class', 'chart-title')
      .attr('overflow-wrap', 'break-word')
      .html(
        `Average normalized explanation factors for the 10 countries with the ${isTop10 ? 'highest' : 'lowest'} happiness scores in 2025`,
      );

    const labels = [
      'GDP',
      'Social support',
      'Generosity',
      'Freedom',
      'Healthy life expectancy',
      'Perception of corruption',
    ];
    const anchors = ['middle', 'start', 'end'];
    const shifts = [
      { x: 0, y: -15 },
      { x: 5, y: -15 },
      { x: 60, y: 25 },
      { x: -30, y: 25 },
      { x: -120, y: 25 },
      { x: -120, y: -15 },
    ];

    for (let index = 0; index < labels.length; index++) {
      const angle = (index * Math.PI * 2) / labels.length;
      const x = center.x + radius * Math.sin(angle);
      const y = center.y + radius * -Math.cos(angle);

      svg
        .append('line')
        .attr('x1', center.x)
        .attr('y1', center.y)
        .attr('x2', x)
        .attr('y2', y)
        .style('stroke', '#aaa');

      svg
        .append('text')
        .text(labels[index])
        .attr('class', 'polar-labels')
        .attr('text-anchor', anchors[index])
        .attr('dx', shifts[index].x)
        .attr('dy', shifts[index].y)
        .attr('x', x)
        .attr('y', y);
    }

    data.forEach(({ color, values }, index) => {
      let path = '';
      for (let i = 0; i < values.length; i++) {
        const r = radius - radialScale(values[i]);
        const angle = (i * Math.PI * 2) / values.length;
        const x = center.x + r * Math.sin(angle);
        const y = center.y + r * -Math.cos(angle);
        path += `${i > 0 ? 'L' : 'M'} ${x},${y} `;
      }
      path += 'Z';
      svg
        .append('path')
        .attr('d', path)
        .style('stroke', color)
        .style('stroke-width', 3)
        .style('stroke-opacity', 0.6)
        .style('fill', color)
        .style('fill-opacity', 0.3);
    });

    const axis = d3.axisRight(radialScale).ticks(values.length).tickSizeInner(0);

    svg
      .append('g')
      .attr('transform', `translate(${center.x},${center.y - radius})`)
      .call(axis);

    svg.select('.domain').remove();
    svg.selectAll('.tick line').remove();
  }
}
