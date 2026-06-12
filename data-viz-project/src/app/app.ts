import { Component, signal } from '@angular/core';
import { TopBar } from './component/top-bar/top-bar';
import {MainPage} from './component/main-page/main-page';
import {MatSidenavModule} from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  imports: [ TopBar, MainPage, MatSidenavModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('data-viz-project');
}
