import {Component, inject} from '@angular/core';
import {DataManipulation} from '../../service/data-manipulation';
import {BeeSwarm} from '../bee-swarm/bee-swarm';

@Component({
  selector: 'app-bee-swarms',
  imports: [BeeSwarm],
  templateUrl: './bee-swarms.html',
  styleUrl: './bee-swarms.scss',
})
export class BeeSwarms {
  private dataManipulationService = inject(DataManipulation)

}
