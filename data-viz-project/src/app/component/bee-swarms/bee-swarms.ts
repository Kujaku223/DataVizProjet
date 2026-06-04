import {Component, inject} from '@angular/core';
import {DataManipulation} from '../../service/data-manipulation';

@Component({
  selector: 'app-bee-swarms',
  imports: [],
  templateUrl: './bee-swarms.html',
  styleUrl: './bee-swarms.scss',
})
export class BeeSwarms {
  private dataManipulationService = inject(DataManipulation)

}
