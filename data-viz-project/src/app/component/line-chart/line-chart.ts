import {afterNextRender, Component, ElementRef, inject, viewChild} from '@angular/core';
import {DataManipulation} from '../../service/data-manipulation';
import * as d3 from 'd3';
import { HappinessRecord } from '../../common/records';
import {
  BOTTOM_10_COUNTRIES_2025,
  LIFE_EVALUATION_DOMAIN,
  TOP_10_COUNTRIES_2025,
  CONTINENTS,
  CANADA_COLOR, TOP_10_COLOR, BOTTOM_10_COLOR, OTHER_COLOR
} from '../../common/constants';
import { ContinentFilter } from '../continent-filter/continent-filter';

@Component({
  selector: 'app-line-chart',
  imports: [ContinentFilter],
  templateUrl: './line-chart.html',
  styleUrl: './line-chart.scss',
})
export class LineChart {
  private dataManipulationService = inject(DataManipulation);
  private chartContainer = viewChild<ElementRef>('chartContainer');
  private width = 800;
  private height = 800;
  private margin = { top: 20, right: 30, bottom: 30, left: 60 };
  private happinessRecords: HappinessRecord[] = [];


  constructor() {
    afterNextRender(() => {
      this.happinessRecords = this.dataManipulationService.filterYears(2011);
      this.createChart(CONTINENTS);
    });
  }

  public continentsChanged(continents: string[]) {
    this.createChart(continents);
  }

  private createChart(selectedContinents: string[]) {
    // https://kkirtigoel01.medium.com/mastering-data-visualization-best-practices-with-d3-js-and-angular-3687531cb88f
    const element = this.chartContainer()?.nativeElement;
    if (!element)
        return

    d3.select(element).selectAll('*').remove();
    const svg = d3.select(element)
      .attr('width', this.width)
      .attr('height', this.height);
    const [xScale, yScale] = this.setAxis(svg);

    const filteredCountries = this.happinessRecords.filter(happinessRecord => selectedContinents.includes(happinessRecord.continent) || happinessRecord.country === 'Canada');
    const groupedCountries: d3.InternMap<string, HappinessRecord[]> = d3.group(filteredCountries, d => d.country);

    const lineGenerator = d3.line<HappinessRecord>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.lifeEvaluation))
      .curve(d3.curveMonotoneX);

    const countryLines = svg.append('g')
      .attr('id', 'countryLines')
      .selectAll('g')
      .data(groupedCountries)
      .join('g')
      .attr('id', ([countryName, happinessRecord]) => countryName)

    countryLines.append('path')
      .attr('fill', 'none')
      .attr('stroke', ([countryName, happinessRecord]) => this.countryStroke(countryName))
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

  private countryStroke(countryName: string): string {
    if (countryName == 'Canada')
      return CANADA_COLOR;
    else if (TOP_10_COUNTRIES_2025.includes(countryName))
      return TOP_10_COLOR;
    else if (BOTTOM_10_COUNTRIES_2025.includes(countryName))
      return BOTTOM_10_COLOR;

    return OTHER_COLOR
  }
}
