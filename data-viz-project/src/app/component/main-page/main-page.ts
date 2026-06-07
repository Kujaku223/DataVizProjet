import { Component, inject, OnInit } from '@angular/core';
import { DataManipulation } from '../../service/data-manipulation';
import {LineChart} from '../line-chart/line-chart';
import {StackedBarChart} from '../stacked-bar-chart/stacked-bar-chart';
import {BeeSwarms} from '../bee-swarms/bee-swarms';
import {PolarCharts} from '../polar-charts/polar-charts';

@Component({
  selector: 'app-main-page',
  imports: [LineChart, StackedBarChart, BeeSwarms, PolarCharts],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
})
export class MainPage {}
