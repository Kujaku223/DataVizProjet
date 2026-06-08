import { Component, EventEmitter, Output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  imports: [MatToolbarModule],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})


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
    {
      name: 'Line Chart',
      route: '/line-chart'
    },
    {
      name: 'Bar Chart',
      route: '/bar-chart'
    },
    {
      name: 'Radar Chart',
      route: '/radar-chart'
    },
    {
      name: 'Polar Chart',
      route: '/polar-chart'
    }
  ];
}
