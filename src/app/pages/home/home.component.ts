import { Component } from '@angular/core';
import { Survey } from 'src/app/model/Survey';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent {
  public surveys: Survey[] = []

}
