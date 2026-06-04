import {Component, inject} from '@angular/core';
import {DataManipulation} from '../../service/data-manipulation';

@Component({
  selector: 'app-polar-charts',
  imports: [],
  templateUrl: './polar-charts.html',
  styleUrl: './polar-charts.scss',
})
export class PolarCharts {
  private dataManipulationService = inject(DataManipulation)

}
