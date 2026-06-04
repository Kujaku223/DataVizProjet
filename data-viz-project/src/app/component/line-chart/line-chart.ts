import {Component, inject} from '@angular/core';
import {DataManipulation} from '../../service/data-manipulation';

@Component({
  selector: 'app-line-chart',
  imports: [],
  templateUrl: './line-chart.html',
  styleUrl: './line-chart.scss',
})
export class LineChart {
  private dataManipulationService = inject(DataManipulation)

}
