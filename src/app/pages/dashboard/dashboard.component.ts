import { Component } from '@angular/core';
import {Survey} from 'src/app/model/Survey';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent {
  public surveys: Survey[] = []

}
