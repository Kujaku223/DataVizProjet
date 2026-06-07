import { afterNextRender, Component, ElementRef, inject, viewChild } from '@angular/core';
import { DataManipulation } from '../../service/data-manipulation';
import * as d3 from 'd3';

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

    // Based on: https://stackoverflow.com/questions/67463864/javascript-d3-plotting-radar-graph

    // TODO: Read from CSV
    const data = isTop10
      ? [{ color: 'red', values: [0.5, 0.7, 0.1, 0.4, 0.6] }]
      : [{ color: 'blue', values: [0.8, 0.9, 0.6, 0.8, 0.9] }];

    const svg = d3.select(element).attr('class', 'polar-chart');

    const maxValue = 1;
    const radius = 150;
    const center = { x: 250, y: 200 };

    const radialScale = d3.scaleLinear().domain([0, maxValue]).range([radius, 0]);

    const axis = d3.axisRight(radialScale).ticks(5);

    svg
      .append('g')
      .attr('transform', `translate(${center.x},${center.y - radius})`)
      .call(axis);

    for (let val = 0; val <= maxValue; val += maxValue / 5) {
      const r = radialScale(val);
      svg
        .append('circle')
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('r', r)
        .style('stroke', '#aaa')
        .style('fill', 'none');
    }

    const labels = [
      'PIB',
      'Social support',
      'Freedom',
      'Healthy life expectancy',
      'Perception of corruption',
    ];
    const anchors = ['middle', 'start', 'end'];
    const shifts = [
      { x: 0, y: -15 },
      { x: 10, y: -15 },
      { x: 60, y: 25 },
      { x: -120, y: 25 },
      { x: -80, y: -15 },
    ];

    for (let index = 0; index < labels.length; index++) {
      const angle = (index * Math.PI * 2) / labels.length;
      const x = center.x + radius * Math.sin(angle);
      const y = center.y + radius * -Math.cos(angle);
      if (angle > 0) {
        svg
          .append('line')
          .attr('x1', center.x)
          .attr('y1', center.y)
          .attr('x2', x)
          .attr('y2', y)
          .style('stroke', '#000');
      }
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
        console.log('V: ', values[i]);
        console.log('R: ', r);
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
  }
}
