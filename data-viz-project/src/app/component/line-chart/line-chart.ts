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

    this.setXAxis(svg);
    this.setYAxis(svg);
  }

  private setXAxis(svg: d3.Selection<any, unknown, null, undefined>) {
    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${this.height - this.margin.bottom})`)
      .call(d3.axisBottom(this.setXScale()).ticks(10, '.0f'));
  
    svg.append('text')
      .text('Year')
      .attr('class', 'x axis-text')
      .attr('x', this.width / 2)
      .attr('y', this.height)
  }

  private setYAxis(svg: d3.Selection<any, unknown, null, undefined>) {
    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .call(d3.axisLeft(this.setYScale()).ticks(20, ".3f"))

    svg.append('text')
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
