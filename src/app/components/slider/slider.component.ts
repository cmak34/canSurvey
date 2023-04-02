import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.less'],
  animations: [
    trigger(
      'headingAnimation', [
      state('true', style({ height: '*', opacity: 1 })),
      state('false', style({ height: '0px', opacity: 0 })),
      transition('false <=> true', animate(500))
    ]
    ),
    trigger(
      'subheadingAnimation', [
      state('true', style({ height: '*', opacity: 1 })),
      state('false', style({ height: '0px', opacity: 0 })),
      transition('false <=> true', animate(1000))
    ]
    )
  ]
})
export class SliderComponent {

  @Input() blockIndex = -1
  @Input() adjustedWidth = 1
  currentBanner: number = 0

  constructor(
    public auth: AuthService,
    public route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
  }

  updateAnimation(event: any) {
    this.currentBanner = event['to']
  }
}
