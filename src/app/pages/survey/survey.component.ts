import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { filter, map } from 'rxjs';
import {Survey} from 'src/app/model/Survey';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.less']
})
export class SurveyComponent implements OnInit {
  public isLoading: boolean = false
  public survey?: Survey
  constructor(
    private notification: NzNotificationService,
    private route: ActivatedRoute,
    private afs: AngularFirestore
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loadSurvey(params['id'] || "");
    });
  }

  public async loadSurvey(surveyId: string) {
    if (surveyId !== "") {
      try {
        this.isLoading = true;
        this.survey = await this.afs.collection<Survey>("surveys").doc(surveyId).get().pipe(
          filter((action) => action.exists),
          map((action) => ({...action.data() as any, id: action.id}) as Survey),
        ).toPromise();
      } catch (error) {
        console.error(`Error getting survey ${surveyId}:`, error);
        this.notification.error("Error", `Error getting survey ${surveyId}: ${error}`)
      } finally {
        this.isLoading = false;
      }
    }
  }
}
