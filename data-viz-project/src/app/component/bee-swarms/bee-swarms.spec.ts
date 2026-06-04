import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeeSwarms } from './bee-swarms';

describe('BeeSwarms', () => {
  let component: BeeSwarms;
  let fixture: ComponentFixture<BeeSwarms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeeSwarms],
    }).compileComponents();

    fixture = TestBed.createComponent(BeeSwarms);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
