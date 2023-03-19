import { Component, Input, OnInit } from '@angular/core';
import { Survey } from 'src/app/model/Survey';
import { catchError, map, Observable, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Result } from 'src/app/model/Result';

@Component({
  selector: 'app-view-survey',
  templateUrl: './view-survey.component.html',
  styleUrls: ['./view-survey.component.less']
})
export class ViewSurveyComponent implements OnInit {
  @Input() public survey?: Survey;
  public results$: Observable<Result[]> = of([])

  constructor(
    private modalRef: NzModalRef,
    private notification: NzNotificationService,
    private afs: AngularFirestore,
  ) {

  }

  ngOnInit(): void {
    if (this.survey?.id) {
      this.results$ = this.afs.collection<Result>("results", ref => ref.where("surveyId", "==", this.survey?.id).orderBy("createdTime", "desc"))
        .snapshotChanges()
        .pipe(
          map(actions => actions.map(action => ({ ...action.payload.doc.data() as any, id: action.payload.doc.id }))),
          catchError((error) => {
            console.error("Error getting survey results:", error);
            this.notification.error("Error", `Error getting survey results: ${error}`);
            return of([]);
          })
        )
    }
  }

  public close() {
    this.modalRef.close();
  }
}
