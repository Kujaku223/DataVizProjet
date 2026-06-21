import {Component, inject} from '@angular/core';
import {DataManipulation} from '../../service/data-manipulation';
import {BeeSwarm} from '../bee-swarm/bee-swarm';
import {HappinessRecord, HumanDevelopmentIndexRecord} from '../../common/records';

@Component({
  selector: 'app-bee-swarms',
  imports: [BeeSwarm],
  templateUrl: './bee-swarms.html',
  styleUrl: './bee-swarms.scss',
})
export class BeeSwarms {
  private dataManipulationService = inject(DataManipulation)

  private readonly whrAttributes: { key: keyof HappinessRecord; label: string }[] = [
    { key: 'GDP',                  label: 'GDP (2025)' },
    { key: 'socialSupport',        label: 'Social Support (2025)' },
    { key: 'lifeExpectancy',       label: 'Life Expectancy (2025)' },
    { key: 'freedom',              label: 'Freedom (2025)' },
    { key: 'generosity',           label: 'Generosity (2025)' },
    { key: 'corruptionPerception', label: 'Corruption Perception (2025)' },
  ];

  private readonly hdiAttributes: { key: keyof HumanDevelopmentIndexRecord; label: string }[] = [
    { key: 'humanDevelopmentIndex', label: 'HDI (2023)' },
    { key: 'lifeExpectancy',        label: 'Life Expectancy in years (2023)' },
  ];

  private buildBeeSwarm<T>(
    data: T[],
    attributes: { key: keyof T; label: string }[]
  ) {
    return attributes.map(({ key, label }) => ({
      label,
      data: data
        .map((d: any) => ({
          name: d.country,
          value: d[key],
        }))
        .filter((d) => d.value !== null && !isNaN(d.value)),
    }));
  }

    public beeSwarms: { label: string; data: { name: string; value: number }[] }[] =
      this.whrAttributes.map(({ key, label }) => ({
        label,
        data: this.dataManipulationService.filterYear(2023).map((d: any) => ({
          name: d.country,
          value: d[key],
        }))
        .filter( d => d.value !== null && !isNaN(d.value))
      }));

    ngOnInit() {
    const whrData = this.dataManipulationService.filterYear(2023);
    const hdiData = this.dataManipulationService.humanDevelopmentIndex;

    const whrBeeSwarms = this.buildBeeSwarm(whrData, this.whrAttributes);

    const hdiBeeSwarms = this.buildBeeSwarm(hdiData, this.hdiAttributes);

    this.beeSwarms = [
      ...whrBeeSwarms,
      ...hdiBeeSwarms
    ];
  }
}

