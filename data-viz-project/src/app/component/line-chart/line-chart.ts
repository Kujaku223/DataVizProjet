import {afterNextRender, Component, ElementRef, inject, viewChild} from '@angular/core';
import {DataManipulation} from '../../service/data-manipulation';
import * as d3 from 'd3';
import { HappinessRecord } from '../../common/records';
import { LIFE_EVALUATION_DOMAIN } from '../../common/constants';

@Component({
  selector: 'app-line-chart',
  imports: [],
  templateUrl: './line-chart.html',
  styleUrl: './line-chart.scss',
})
export class LineChart {
  private dataManipulationService = inject(DataManipulation);
  private chartContainer = viewChild<ElementRef>('chartContainer');
  private width = 1200;
  private height = 800;
  private margin = { top: 20, right: 30, bottom: 30, left: 60 };
  private happinessRecords: HappinessRecord[] = [];


  constructor() {
    afterNextRender(() => {
      this.happinessRecords = this.dataManipulationService.filterYears(2011);
      this.createChart();
    });
  }


private createChart() {
    // https://kkirtigoel01.medium.com/mastering-data-visualization-best-practices-with-d3-js-and-angular-3687531cb88f
    const element = this.chartContainer()?.nativeElement;
    if (!element)
        return 

    // Clear any existing SVGs
    d3.select(element).selectAll('svg').remove();

    const svg = d3.select(element)
      .attr('width', this.width)
      .attr('height', this.height);

    const [xScale, yScale] = this.setAxis(svg);

    const groupedCountries: d3.InternMap<string, HappinessRecord[]> = d3.group(this.happinessRecords, d => d.country);
    const lineGenerator = d3.line<HappinessRecord>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.lifeEvaluation))
      .curve(d3.curveMonotoneX);

    svg.selectAll('.line')
      .data(groupedCountries)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke', '#808080')
      .attr('stroke-width', 1.5)
      .attr('d', ([countryName, happinessRecord]) => lineGenerator(happinessRecord))
  }

  private setAxis(svg: any) {
    const axisGroup = svg.append('g')
      .attr('id', 'axis');

    const xScale = this.setXScale();
    const yScale = this.setYScale();
    this.setXAxis(axisGroup, xScale);
    this.setYAxis(axisGroup, yScale);

    return [xScale, yScale];
  }

  private setXAxis(g: any, xScale: any) {
    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${this.height - this.margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(10, '.0f'));
  
    g.append('text')
      .text('Year')
      .attr('class', 'x axis-text')
      .attr('x', this.width / 2)
      .attr('y', this.height)
  }

  private setYAxis(g: any, yScale: any) {
    g.append('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(20, ".3f"))

    g.append('text')
      .text('Life Evaluation')
      .attr('class', 'y axis-text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.height / 2)
      .attr('y', 20)
  }

  private setXScale() {
    const years = this.happinessRecords.map(d => d.year)

    return d3.scaleLinear()
      .domain([Math.min(...years), Math.max(...years)])
      .range([this.margin.left, this.width - this.margin.right]);
  }

  private setYScale() {
    return d3.scaleLinear()
      .domain(LIFE_EVALUATION_DOMAIN)
      .range([this.height - this.margin.bottom, this.margin.top]);
  }
}
