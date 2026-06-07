import { Component, inject, OnDestroy, OnInit, output } from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-continent-filter',
  imports: [MatCheckboxModule, ReactiveFormsModule, FormsModule, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './continent-filter.html',
  styleUrl: './continent-filter.scss',
})
export class ContinentFilter implements OnDestroy, OnInit {
  private ngUnsubscribe = new Subject<void>();
  private readonly _formBuilder = inject(FormBuilder);
  readonly continents = this._formBuilder.group({ Americas: true, Europe: true, Oceania: true, Africa: true, Asia: true })

  selectedContinents = output<string[]>();

  ngOnInit() {
    this.continents.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(continents => {
      const selectedContinents = Object.entries(continents).filter(([continent, selected]) => selected).map(([continent, _]) => continent)
      this.selectedContinents.emit(selectedContinents);
    })
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
