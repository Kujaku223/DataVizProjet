import { afterNextRender, Component, ElementRef, inject, viewChild } from '@angular/core';
import { DataManipulation } from '../../service/data-manipulation';
import { HappinessRecord } from '../../common/records';
import * as d3 from 'd3';
import {
  CORRUPTION_COLOR,
  DYSTOPIA_COLOR,
  FREEDOM_COLOR,
  GDP_COLOR,
  GENEROSITY_COLOR,
  LIFE_EXPECTANCY_COLOR,
  SOCIAL_SUPPORT_COLOR,
} from '../../common/constants';

@Component({
  selector: 'app-bar-charts',
  imports: [],
  templateUrl: './bar-charts.html',
  styleUrl: './bar-charts.scss',
})
export class BarCharts {
  private dataManipulationService = inject(DataManipulation);
  private chartContainer = viewChild<ElementRef>('chartContainer');

  private records: HappinessRecord[] = [];

  private width = 900;
  private height = 900;

  private chartWidth = 300;
  private chartHeight = 280;

  private margin = { top: 50, right: 15, bottom: 55, left: 60 };

  private factors: {
    key: keyof HappinessRecord;
    label: string;
    color: string;
  }[] = [
    { key: 'GDP', label: 'Log GDP per capita', color: GDP_COLOR },
    { key: 'socialSupport', label: 'Social support', color: SOCIAL_SUPPORT_COLOR },
    { key: 'lifeExpectancy', label: 'Healthy life expectancy', color: LIFE_EXPECTANCY_COLOR },
    { key: 'freedom', label: 'Freedom to make life choices', color: FREEDOM_COLOR },
    { key: 'generosity', label: 'Generosity', color: GENEROSITY_COLOR },
    { key: 'corruptionPerception', label: 'Perceptions of corruption', color: CORRUPTION_COLOR },
    { key: 'dystopia', label: 'Dystopia + residual', color: DYSTOPIA_COLOR },
  ];

  constructor() {
    afterNextRender(() => {
      this.records = this.dataManipulationService
        .filterYears(2019)
        .filter((d) => d.country === 'Canada');

      this.createChart();
    });
  }

  private createChart(): void {
    const element = this.chartContainer()?.nativeElement;
    if (!element) return;

    d3.select(element).selectAll('*').remove();

    const svg = d3.select(element).attr('width', this.width).attr('height', this.height);

    const years = Array.from(new Set(this.records.map((d) => d.year))).sort();

    this.factors.forEach((factor, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);

      const xPosition = col * this.chartWidth;
      const yPosition = row * this.chartHeight;

      const g = svg.append('g').attr('transform', `translate(${xPosition}, ${yPosition})`);

      const data = years.map((year) => {
        const record = this.records.find((d) => d.year === year);
        const value = record ? Number(record[factor.key]) : 0;

        return {
          year,
          value: isNaN(value) ? 0 : value,
        };
      });

      const xScale = d3
        .scaleBand<number>()
        .domain(years)
        .range([this.margin.left, this.chartWidth - this.margin.right])
        .padding(0.12);

      const yScale = d3
        .scaleLinear()
        .domain([0, 3])
        .range([this.chartHeight - this.margin.bottom, this.margin.top]);

      g.append('text')
        .attr('class', 'chart-title')
        .attr('font-weight', 'bold')
        .attr('font-size', '14px')
        .text(factor.label)
        .attr('x', this.margin.left + (this.chartWidth - this.margin.left - this.margin.right) / 2)
        .attr('y', 25)
        .attr('text-anchor', 'middle');

      g.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${this.chartHeight - this.margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .attr('text-anchor', 'end');

      g.append('g')
        .attr('class', 'y axis')
        .attr('transform', `translate(${this.margin.left}, 0)`)
        .call(d3.axisLeft(yScale).ticks(6).tickFormat(d3.format('.3f')));

      const bars = g
        .selectAll('.bar')
        .data(data)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(d.year) ?? 0)
        .attr('y', (d) => yScale(d.value))
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => yScale(0) - yScale(d.value))
        .attr('fill', factor.color)
        .attr('data-color', factor.color);

      const valueLabels = g
        .selectAll('.bar-value')
        .data(data)
        .join('text')
        .attr('class', 'bar-value')
        .attr('x', (d) => (xScale(d.year) ?? 0) + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(d.value) - 6)
        .attr('text-anchor', 'middle')
        .attr('font-size', 11)
        .attr('font-weight', 500)
        .attr('fill', '#222')
        .attr('opacity', 0)
        .text((d) => d.value.toFixed(3));

      bars
        .on('mouseover', function (event, d) {
          const originalColor = d3.select(this).attr('data-color');

          d3.select(this).attr(
            'fill',
            d3.color(originalColor)?.darker(0.8)?.toString() ?? originalColor,
          );

          valueLabels.filter((labelData) => labelData.year === d.year).attr('opacity', 1);
        })
        .on('mouseout', function (event, d) {
          const originalColor = d3.select(this).attr('data-color');

          d3.select(this).attr('fill', originalColor);

          valueLabels.filter((labelData) => labelData.year === d.year).attr('opacity', 0);
        });

      g.append('text')
        .attr('class', 'axis-label')
        .text('Year')
        .attr('x', this.chartWidth / 2)
        .attr('y', this.chartHeight - 15)
        .attr('text-anchor', 'middle');

      g.append('text')
        .attr('class', 'axis-label')
        .text('Score')
        .attr('transform', 'rotate(-90)')
        .attr('x', -this.chartHeight / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle');
    });
  }
}
