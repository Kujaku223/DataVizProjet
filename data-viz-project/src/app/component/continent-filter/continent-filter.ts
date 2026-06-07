import { Component, inject } from '@angular/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-continent-filter',
  imports: [MatCheckboxModule, ReactiveFormsModule, FormsModule],
  templateUrl: './continent-filter.html',
  styleUrl: './continent-filter.scss',
})
export class ContinentFilter {
  private readonly _formBuilder = inject(FormBuilder);
  readonly continents = this._formBuilder.group({ Americas: true, Europe: true, Oceania: true, Africa: true, Asia: true })

}
