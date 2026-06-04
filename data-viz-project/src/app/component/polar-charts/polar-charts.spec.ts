import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolarCharts } from './polar-charts';

describe('PolarCharts', () => {
  let component: PolarCharts;
  let fixture: ComponentFixture<PolarCharts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarCharts],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarCharts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
