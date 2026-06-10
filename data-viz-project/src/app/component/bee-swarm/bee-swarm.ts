import {afterNextRender, Component, ElementRef, inject, Input, viewChild} from '@angular/core';
import {DataManipulation} from '../../service/data-manipulation';
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

  // sources https://observablehq.com/@d3/beeswarm/2


  constructor() {
    // Ensure D3 only manipulates the DOM on the browser
    afterNextRender(() => {
      this.createChart();
    });
  }

  private createChart(): void {
    // https://kkirtigoel01.medium.com/mastering-data-visualization-best-practices-with-d3-js-and-angular-3687531cb88f
    const element = this.chartContainer()?.nativeElement;
    if (!element) return;

    d3.select(element).selectAll('svg').remove();

    const width = 300;
    const height = 170;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 40;
    const marginLeft = 20;
    const radius = 3;
    const padding = 1.5;

    const x = d3.scaleLinear()
      .range([marginLeft, width - marginRight])
      .domain(d3.extent(this.data, (d: any) => d["value"]) as any);

    // Create the SVG container
    const svg = d3.select(element)
    .append('svg')
    .attr('width', '100%')
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));


    svg.append("g")
      .selectAll()
      .data(this.dodge(this.data, {radius: radius * 2 + padding, x: d => x(d["value"])}))
      .join("circle")
      .attr("cx", (d:any) => d.x)
      .attr("cy", d => height - marginBottom - radius - padding - (d as any).y)
      .attr("r", radius)
      .attr("fill", (d:any)=> this.dataManipulationService.getColorFromCountryName(d.data.name))
      .attr("class", "point")
      .append("title")
      .text((d: any) => d.data.name);

    d3.selectAll(".point")
    .on("mouseover", (event) => {
      d3.select(event.target).transition().duration(200).attr("r", 4);
    })
    .on("mouseout", (event) => {
      d3.select(event.target).transition().duration(200).attr("r", radius);
    })
    .on("click", (event, d: any) => {
      const color = this.dataManipulationService.getColorFromCountryName(d.data.name);
      this.displayPanel(d.data, color, event);
    });

  }


  //////////////////////////////////////////////////////////
  // Dodging logic
  /////////////////////////////////////////////////////////

  dodge(data: any[], {radius = 1, x = (d: any, i: number, data: any[]) => d} = {}) {
    const radius2 = radius ** 2;
    const circles:any = data.map((d, i, data) => ({x: +x(d, i, data), data: d})).sort((a, b) => a.x - b.x);
    const epsilon = 1e-3;
    let head: { x: any; next?: any; data?: any; } | null = null, tail:any = null;

  // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
  function intersects(x: any, y: any) {
    let a:any = head;
    while (a) {
      if (radius2 - epsilon > (a.x - x) ** 2 + (a.y - y) ** 2) {
        return true;
      }
      a = a.next;
    }
    return false;
  }

  // Place each circle sequentially.
  for (const b of circles) {

    // Remove circles from the queue that can’t intersect the new circle b.
    while (head && head.x < b.x - radius2) head = head.next;

    // Choose the minimum non-intersecting tangent.
    if (intersects(b.x, b.y = 0)) {
      let a: any = head;
      b.y = Infinity;
      do {
        let y = a.y + Math.sqrt(radius2 - (a.x - b.x) ** 2);
        if (y < b.y && !intersects(b.x, y)) b.y = y;
        a = a.next;
      } while (a);
    }

    // Add b to the queue.
    b.next = null;
    if (head === null) head = tail = b;
    else tail = tail.next = b;
  }

    return circles;
  }
  //////////////////////////////////////////////////////////
  // Panel logic
  /////////////////////////////////////////////////////////
 private displayPanel(d: any, color: string, event?: any) {
  const panel = d3.select('#panel');

  panel
    .style('visibility', 'visible')
    .style('left', `${event.pageX + 10}px`)
    .style('top', `${event.pageY + 10}px`)
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
    .text('✕')
    .on('click', () => panel.style('visibility', 'hidden'));

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


