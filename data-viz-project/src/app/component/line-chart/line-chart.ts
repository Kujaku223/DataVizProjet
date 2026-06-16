import { afterNextRender, Component, ElementRef, inject, viewChild } from '@angular/core';
import { DataManipulation } from '../../service/data-manipulation';
import * as d3 from 'd3';
import { HappinessRecord } from '../../common/records';
import { LIFE_EVALUATION_DOMAIN, CONTINENTS } from '../../common/constants';
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
      .attr('stroke', ([countryName, happinessRecord]) => this.dataManipulationService.getColorFromCountryName(countryName))
      .attr('stroke-width', 1.5)
      .attr('d', ([countryName, happinessRecord]) => lineGenerator(happinessRecord))
      .on('mousemove', (event, [countryName, happinessRecords]) => {
        const [mouseX, mouseY] = d3.pointer(event, svg.node());
        const hoveredYear = Math.round(xScale.invert(mouseX));
        const happinessRecord = happinessRecords.find(d => d.year === hoveredYear);

        if (happinessRecord) {
          const color = this.dataManipulationService.getColorFromCountryName(countryName);
          this.displayPanel(countryName, happinessRecord, color, event);
          d3.select(event.currentTarget).style('stroke-width', 4.5);
          d3.select(event.currentTarget.parentNode).raise(); // the linePath is the child of a <g id=countryName> node, so we want to raise the parent
        }

      })
      .on('mouseout', (event, d) => {
        d3.select(event.currentTarget).style('stroke-width', 1.5);
        const panel = d3.select('#lineChartPanel');
        panel.style('visibility', 'hidden');
      })
  }

  private displayPanel(countryName: string, happinessRecord: HappinessRecord, color: string, event?: any) {
    const panel = d3.select('#lineChartPanel');

    panel.style('visibility', 'visible')
      .style('border', `2px solid ${color}`)
      .style('left', `${event.pageX}px`)
      .style('top', `${event.pageY}px`)
      .html('');

    panel
      .append('div')
      .style('text-align', 'left')
      .style('font-weight', 'bold')
      .style('font-size', '22px')
      .style('color', color)
      .style('margin-top', '4px')
      .text(`${countryName} - ${happinessRecord.year}`);

    panel
      .append('div')
      .style('text-align', 'left')
      .style('margin-top', '8px')
      .style('font-size', '14px')
      .text(`Life Evaluation: ${happinessRecord.lifeEvaluation}`);
    
    panel
      .append('div')
      .style('text-align', 'left')
      .style('margin-top', '8px')
      .style('font-size', '14px')
      .text(`Rank: ${happinessRecord.rank}`);
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
