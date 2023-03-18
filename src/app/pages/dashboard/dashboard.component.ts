import { Component, OnInit } from '@angular/core';
import { Survey } from 'src/app/model/Survey';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { catchError, map, Observable, of } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import {RegisterComponent} from '../../components/register/register.component';
import { EditSurveyComponent } from 'src/app/components/edit-survey/edit-survey.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  public surveys$: Observable<Survey[]> = this.afs.collection<Survey>("surveys", ref => ref.orderBy("createdTime", "desc"))
  .get()
  .pipe(
    map((actions) => actions.docs.map(action => ({ ...action.data() as any, id: action.id } as Survey))),
    catchError((error) => {
      console.error("Error getting surveys:", error);
      this.notification.error("Error", `Error getting surveys: ${error}`);
      return of([]);
    })
  )

  constructor(
    private modal: NzModalService,
    private notification: NzNotificationService,
    private afs: AngularFirestore,
  ) { }

  ngOnInit(): void {
  }

  public add() {
    let modal = this.modal.create({
      nzTitle: 'Survey',
      nzContent: EditSurveyComponent,
      nzFooter: null
    })
    modal.afterClose.subscribe((result) => {
      if (result) {
        this.notification.success('Success', 'You have successfully added a survey!')
      }
    })
  }
}
