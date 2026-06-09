import {Component, inject} from '@angular/core';
import {DataManipulation} from '../../service/data-manipulation';
import {BeeSwarm} from '../bee-swarm/bee-swarm';
import {HappinessRecord} from '../../common/records';

@Component({
  selector: 'app-bee-swarms',
  imports: [BeeSwarm],
  templateUrl: './bee-swarms.html',
  styleUrl: './bee-swarms.scss',
})
export class BeeSwarms {
  private dataManipulationService = inject(DataManipulation)

  private readonly attributes: { key: keyof HappinessRecord; label: string }[] = [
    { key: 'GDP',                  label: 'GDP' },
    { key: 'socialSupport',        label: 'Social Support' },
    { key: 'lifeExpectancy',       label: 'Life Expectancy' },
    { key: 'freedom',              label: 'Freedom' },
    { key: 'generosity',           label: 'Generosity' },
    { key: 'corruptionPerception', label: 'Corruption Perception' },
  ];

  public beeSwarms: { label: string; data: { name: string; value: number }[] }[] =
    this.attributes.map(({ key, label }) => ({
      label,
      data: this.dataManipulationService.filterYear(2023).map((d: any) => ({
        name: d.country,
        value: d[key],
      }))
      .filter( d => d.value !== null && !isNaN(d.value)) 
    }));

}

