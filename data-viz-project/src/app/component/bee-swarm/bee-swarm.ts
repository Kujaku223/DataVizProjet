import { afterNextRender, Component, ElementRef, inject, Input, viewChild } from '@angular/core';
import { DataManipulation } from '../../service/data-manipulation';
import * as d3 from 'd3';

@Component({
  selector: 'app-bee-swarm',
  imports: [],
  templateUrl: './bee-swarm.html',
  styleUrl: './bee-swarm.scss',
})
export class BeeSwarm {
  @Input({ required: true }) data!: any[];
  private dataManipulationService = inject(DataManipulation);
  private chartContainer = viewChild<ElementRef>('chartContainer');

  private readonly width = 600;
  private readonly height = 120;

  private readonly margin = {
    left: 20,
    right: 20,
    bottom: 40,
  };

  private readonly radius = 3;
  private baselineY = this.height - this.margin.bottom;

  // sources https://observablehq.com/@d3/beeswarm/2
  constructor() {
    const element = this.chartContainer()?.nativeElement;
    afterNextRender(() => {
      this.createChart();
    });
  }

  private createChart(): void {
    // https://kkirtigoel01.medium.com/mastering-data-visualization-best-practices-with-d3-js-and-angular-3687531cb88f
    const element = this.chartContainer()?.nativeElement;
    if (!element) return;

    d3.select(element).selectAll('*').remove();
    const svg = this.createSvg(element);
    const x = this.createXScale();
    this.drawMiddleLine(svg);
    this.drawAxis(svg, x);
    const nodes = this.createNodes(x);
    this.runSimulation(nodes);
    this.drawCircles(svg, nodes);
  }

  private createSvg(element: SVGSVGElement) {
    return d3
      .select(element)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height * 0.5}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
  }

  private createXScale() {
    return d3
      .scaleLinear()
      .range([this.margin.left, this.width - this.margin.right])
      .domain(d3.extent(this.data, (d) => d.value) as [number, number]);
  }

  private drawMiddleLine(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    svg
      .append('line')
      .attr('x1', 0)
      .attr('x2', this.width)
      .attr('y1', this.baselineY / 7.5)
      .attr('y2', this.baselineY / 7.5)
      .attr('stroke', 'gray')
      .attr('opacity', 0.35);
  }

  private drawAxis(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    x: d3.ScaleLinear<number, number>,
  ): void {
    svg
      .append('g')
      .attr('transform', `translate(0,${this.baselineY / 2})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));
  }

  private createNodes(x: d3.ScaleLinear<number, number>) {
    return this.data.map((d) => ({
      data: d,
      x: x(d.value),
      y: this.baselineY,
      targetX: x(d.value),
    }));
  }

  private runSimulation(nodes: any[]): void {
    // https://stackoverflow.com/questions/69225073/d3js-beeswarm-with-force-simulation
    // https://d3js.org/d3-force/simulation
    d3.forceSimulation(nodes)
      .force('x', d3.forceX((d: any) => d.targetX).strength(1))
      .force('y', d3.forceY(0).strength(0.03))
      .force('collide', d3.forceCollide(this.radius + 0.3).strength(1))
      .stop();

    const simulation = d3
      .forceSimulation(nodes)
      .force('x', d3.forceX((d: any) => d.targetX).strength(1))
      .force('y', d3.forceY(0).strength(0.03))
      .force('collide', d3.forceCollide(this.radius + 0.3))
      .stop();

    for (let i = 0; i < 300; i++) {
      simulation.tick();

      nodes.forEach((d: any) => {
        if (d.y > this.baselineY - this.radius) {
          d.y = this.baselineY - this.radius;
        }
      });
    }
  }

  private drawCircles(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodes: any[],
  ): void {
    const circles = svg
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', this.radius)
      .attr('fill', (d) => this.dataManipulationService.getColorFromCountryName(d.data.name))
      .attr('class', 'point');

    circles.append('title').text((d) => d.data.name);

    this.attachEvents(circles);
  }

  private attachEvents(circles: any): void {
    circles
      .on('mouseover', (event: { target: any }, d: { data: { name: string } }) => {
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('r', this.radius * 1.5);

        const color = this.dataManipulationService.getColorFromCountryName(d.data.name);
        this.displayPanel(d.data, color, event);
      })
      .on('mouseout', (event: { target: any }) => {
        d3.select(event.target).transition().duration(200).attr('r', this.radius);

        d3.select('#panel').style('visibility', 'hidden');
      });
  }

  private displayPanel(d: any, color: string, event?: any) {
    const panel = d3.select('#panel');
    panel
      .style('visibility', 'visible')
      .style('left', `${event.pageX}px`)
      .style('top', `${event.pageY - 30}px`)
      .style('border', `2px solid ${color}`)
      .html('');

    const header = panel
      .append('div')
      .style('display', 'flex')
      .style('justify-content', 'flex-end');

    header
      .append('div')
      .style('cursor', 'pointer')
      .style('font-size', '12px')
      .style('color', '#666')
      .style('line-height', '1')
      .style('user-select', 'none')
      .on('mouseout', () => panel.style('visibility', 'hidden'));

    panel
      .append('div')
      .style('text-align', 'left')
      .style('font-weight', 'bold')
      .style('font-size', '22px')
      .style('color', color)
      .style('margin-top', '4px')
      .text(d.name);

    panel
      .append('div')
      .style('text-align', 'left')
      .style('margin-top', '8px')
      .style('font-size', '14px')
      .text(`Value: ${d.value}`);
  }
}
