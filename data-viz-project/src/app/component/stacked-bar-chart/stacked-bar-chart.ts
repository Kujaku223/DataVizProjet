import {Component, inject} from '@angular/core';
import {DataManipulation} from '../../service/data-manipulation';

@Component({
  selector: 'app-stacked-bar-chart',
  imports: [],
  templateUrl: './stacked-bar-chart.html',
  styleUrl: './stacked-bar-chart.scss',
})
export class StackedBarChart {
  private dataManipulationService = inject(DataManipulation)

}
