import { afterNextRender, Component, ElementRef, inject, viewChild } from '@angular/core';
import * as d3 from 'd3';

import { DataManipulation } from '../../service/data-manipulation';
import { HappinessRecord } from '../../common/records';
import {
  CORRUPTION_COLOR,
  DYSTOPIA_COLOR,
  FREEDOM_COLOR,
  GDP_COLOR,
  GENEROSITY_COLOR,
  LIFE_EXPECTANCY_COLOR,
  SOCIAL_SUPPORT_COLOR,
} from '../../common/constants';

type StackKey =
  | 'GDP'
  | 'socialSupport'
  | 'lifeExpectancy'
  | 'freedom'
  | 'generosity'
  | 'corruptionPerception'
  | 'dystopia';

@Component({
  selector: 'app-stacked-bar-chart',
  templateUrl: './stacked-bar-chart.html',
  styleUrl: './stacked-bar-chart.scss',
})
export class StackedBarChart {
  private dataManipulationService = inject(DataManipulation);
  private chartContainer = viewChild<ElementRef<SVGSVGElement>>('chartContainer');

  private width = 900;
  private height = 700;
  private margin = { top: 30, right: 190, bottom: 60, left: 80 };

  private happinessRecords: HappinessRecord[] = [];

  private keys: StackKey[] = [
    'GDP',
    'socialSupport',
    'lifeExpectancy',
    'freedom',
    'generosity',
    'corruptionPerception',
    'dystopia',
  ];

  private labels: Record<StackKey, string> = {
    GDP: 'Log GDP per capita',
    socialSupport: 'Social support',
    lifeExpectancy: 'Healthy life expectancy',
    freedom: 'Freedom to make life choices',
    generosity: 'Generosity',
    corruptionPerception: 'Perceptions of corruption',
    dystopia: 'Dystopia + residual',
  };

  constructor() {
    afterNextRender(() => {
      this.happinessRecords = this.dataManipulationService.filterYears(2019);
      this.createChart('Canada');
    });
  }

  private createChart(country: string) {
    const element = this.chartContainer()?.nativeElement;
    if (!element) return;

    d3.select(element).selectAll('*').remove();

    const svg = d3.select(element).attr('width', this.width).attr('height', this.height);

    const data = this.prepareData(country);

    const xScale = this.setXScale(data);
    const yScale = this.setYScale(data);
    const colorScale = this.setColorScale();

    const stack = d3.stack<HappinessRecord, StackKey>().keys(this.keys);

    const stackedData = stack(data);

    this.drawAxes(svg, xScale, yScale);
    this.drawBars(svg, stackedData, xScale, yScale, colorScale);
    this.drawLegend(svg, colorScale);
  }

  private prepareData(country: string): HappinessRecord[] {
    return this.happinessRecords
      .filter((d) => d.country === country)
      .sort((a, b) => a.year - b.year);
  }

  private setXScale(data: HappinessRecord[]) {
    return d3
      .scaleBand<number>()
      .domain(data.map((d) => d.year))
      .range([this.margin.left, this.width - this.margin.right])
      .padding(0.2);
  }

  private setYScale(data: HappinessRecord[]) {
    const maxScore = d3.max(data, (d) => this.keys.reduce((sum, key) => sum + d[key], 0)) ?? 0;

    return d3
      .scaleLinear()
      .domain([0, maxScore])
      .nice()
      .range([this.height - this.margin.bottom, this.margin.top]);
  }

  private setColorScale() {
    return d3
      .scaleOrdinal<StackKey, string>()
      .domain(this.keys)
      .range([
        GDP_COLOR,
        SOCIAL_SUPPORT_COLOR,
        LIFE_EXPECTANCY_COLOR,
        FREEDOM_COLOR,
        GENEROSITY_COLOR,
        CORRUPTION_COLOR,
        DYSTOPIA_COLOR,
      ]);
  }

  private drawAxes(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    xScale: d3.ScaleBand<number>,
    yScale: d3.ScaleLinear<number, number>,
  ) {
    const axisGroup = svg.append('g').attr('id', 'axis');

    axisGroup
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${this.height - this.margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')));

    axisGroup
      .append('text')
      .text('Year')
      .attr('class', 'x axis-text')
      .attr('x', this.width / 2)
      .attr('y', this.height - 15)
      .attr('text-anchor', 'middle');

    axisGroup
      .append('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(10));

    axisGroup
      .append('text')
      .text('Life evaluation score')
      .attr('class', 'y axis-text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle');
  }

  private drawBars(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    stackedData: d3.Series<HappinessRecord, StackKey>[],
    xScale: d3.ScaleBand<number>,
    yScale: d3.ScaleLinear<number, number>,
    colorScale: d3.ScaleOrdinal<StackKey, string>,
  ) {
    const barsGroup = svg
      .append('g')
      .attr('id', 'stacked-bars')
      .selectAll('g')
      .data(stackedData)
      .join('g')
      .attr('fill', (d) => colorScale(d.key))
      .on('mouseenter', (_, hoveredElement) => {
        barsGroup.style('opacity', (element) => (hoveredElement.key === element.key ? 1 : 0.2));
      })
      .on('mouseleave', () => {
        barsGroup.style('opacity', 1);
      });

    barsGroup
      .selectAll('rect')
      .data((d) => d)
      .join('rect')
      .attr('x', (d) => xScale(d.data.year) ?? 0)
      .attr('y', (d) => yScale(d[1]))
      .attr('height', (d) => yScale(d[0]) - yScale(d[1]))
      .attr('width', xScale.bandwidth());
  }

  private drawLegend(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    colorScale: d3.ScaleOrdinal<StackKey, string>,
  ) {
    const legend = svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${this.width - this.margin.right + 25}, ${this.margin.top})`);

    this.keys.forEach((key, index) => {
      const legendRow = legend.append('g').attr('transform', `translate(0, ${index * 25})`);

      legendRow.append('rect').attr('width', 14).attr('height', 14).attr('fill', colorScale(key));

      legendRow
        .append('text')
        .text(this.labels[key])
        .attr('x', 22)
        .attr('y', 12)
        .attr('font-size', '12px');
    });
  }
}
