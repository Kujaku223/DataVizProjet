import { Component, inject, OnInit } from '@angular/core';
import { DataManipulation } from '../../service/data-manipulation';

@Component({
  selector: 'app-main-page',
  imports: [],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage {
  private dataManipulationService = inject(DataManipulation)

  ngOnInit() {
    // for testing purposes
    console.log(this.dataManipulationService.happinessRecords)
  }
}
