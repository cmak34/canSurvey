import { Component } from '@angular/core';
import { Survey } from 'src/app/model/Survey';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { catchError, map, Observable, of } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { EditSurveyComponent } from 'src/app/components/edit-survey/edit-survey.component';
import { ViewSurveyComponent } from 'src/app/components/view-survey/view-survey.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent {
  public isDeleting: boolean = false;
  public surveys$: Observable<Survey[]> = this.afs.collection<Survey>("surveys", ref => ref.orderBy("createdTime", "desc"))
  .snapshotChanges()
  .pipe(
    map(actions => actions.map(action => ({ ...action.payload.doc.data() as any, id: action.payload.doc.id }))),
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

  public addSurvey() {
    let modal = this.modal.create({
      nzTitle: 'Add Survey',
      nzContent: EditSurveyComponent,
      nzFooter: null
    })
    modal.afterClose.subscribe((result) => {
      if (result) {
        this.notification.success('Success', 'You have successfully added a survey!')
      }
    })
  }

  public editSurvey(survey: Survey) {
    let modal = this.modal.create({
      nzTitle: 'Edit Survey',
      nzContent: EditSurveyComponent,
      nzComponentParams: {
        survey: survey
      },
      nzFooter: null
    })
    modal.afterClose.subscribe((result) => {
      if (result) {
        this.notification.success('Success', 'You have successfully edited a survey!')
      }
    })
  }

  public viewSurvey(survey: Survey) {
    this.modal.create({
      nzTitle: `View ${survey.title || "Untitled Survey"}`,
      nzContent: ViewSurveyComponent,
      nzComponentParams: {
        survey: survey
      },
      nzFooter: null
    })
  }

  public async deleteSurvey(id: string) {
    try {
      this.isDeleting = true
      await this.afs.collection("surveys").doc(id).delete()
      this.notification.success('Success', 'You have successfully deleted a survey!')
      this.isDeleting = false
    } catch (error) {
      this.isDeleting = false
       console.log(error)
      this.notification.error("error", `Error: ${error}`)
    }
  }
}
