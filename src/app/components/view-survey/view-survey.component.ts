import { Component, Input, OnInit } from '@angular/core';
import { Survey } from 'src/app/model/Survey';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Result } from 'src/app/model/Result';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-view-survey',
  templateUrl: './view-survey.component.html',
  styleUrls: ['./view-survey.component.less']
})
export class ViewSurveyComponent implements OnInit {
  @Input() public survey?: Survey;
  public results: Result[] = [];
  public results$: Observable<Result[]> = of([])
  public isExporting = false;

  constructor(
    private modalRef: NzModalRef,
    private notification: NzNotificationService,
    private afs: AngularFirestore,
    private auth : AuthService
  ) {

  }

  ngOnInit(): void {
    const currentUserId = this.auth.user?.uid;
    if (currentUserId && this.survey?.id) {
      this.results$ = this.afs.collection<Result>("results", ref => ref.where("surveyId", "==", this.survey?.id).orderBy("createdTime", "desc"))
        .snapshotChanges()
        .pipe(
          map(actions => actions.map(action => ({ ...action.payload.doc.data() as any, id: action.payload.doc.id }))),
          tap(actions => this.results = actions || []),
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

  public exportToCsv() {
    try {      
      if (this.results.length) {
        this.isExporting = true
        const header = this.survey?.questions.map(question => question.label).join(',') + '\n';
        const csvData = this.results.map(result => {
          return result.answers.map(answer => {
            if (typeof answer != 'object' && answer !== null) {
              return JSON.stringify(answer);
            } else if (answer?.toDate) {
              return new DatePipe('en-US').transform(answer?.toDate(), 'yyyy-MM-dd HH:mm:ss');
            } else {
              return answer;
            }
          }).join(',');
        }).join('\n');
        const csvContent = header + csvData;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `survey_results_${this.survey?.title}_${this.survey?.id}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        this.isExporting = false
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      this.isExporting = false
      console.error("Error exporting to CSV:", error);
      this.notification.error("Error", `Error exporting to CSV: ${error}`);
    }
  }
}
