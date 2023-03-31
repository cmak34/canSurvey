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

  public exportToCsv() {
    if (this.survey?.id) {
    this.results$.subscribe(results => {
      // Generate header from survey questions
      const header = this.survey?.questions.map(question => question.label).join(',') + '\n';
  
      // Format answers as CSV rows
      const csvData = results.map(result => {
        return result.answers.map(answer => {
          if (typeof answer === 'object' && answer !== null) {
            return JSON.stringify(answer);
          }
          return answer;
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
      link.click();
      document.body.removeChild(link);
    });
  }
  }
}
