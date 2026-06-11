import { Component, EventEmitter, Output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss'
})
export class TopBar {

  @Output() menuToggle = new EventEmitter<void>();

  title = 'World Happiness Report';

  toggleMenu(): void {
    this.menuToggle.emit();
  }

  pages = [
    { name: 'Line Chart', anchor: 'line-chart' },
    { name: 'Stacked Bar Chart', anchor: 'stacked-bar-chart' },
    { name: 'Bar Charts', anchor: 'bar-charts' },
    { name: 'Bee Swarms', anchor: 'bee-swarms' },
    { name: 'Polar Chart', anchor: 'polar-chart' }
  ];

  scrollTo(anchor: string) {
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
  }
}
