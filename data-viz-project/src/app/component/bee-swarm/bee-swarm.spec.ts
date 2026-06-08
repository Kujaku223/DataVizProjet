import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeeSwarm } from './bee-swarm';

describe('BeeSwarm', () => {
  let component: BeeSwarm;
  let fixture: ComponentFixture<BeeSwarm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeeSwarm],
    }).compileComponents();

    fixture = TestBed.createComponent(BeeSwarm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
