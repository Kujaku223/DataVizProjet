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

  public data: { name: string; value: number }[] = this.dataManipulationService.filterYear(2023)
    .map((d: any) => ({
      name: d.country,
      value: d.corruptionPerception,
    }));
}
