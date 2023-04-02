import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { filter, map, tap } from 'rxjs';
import { Survey } from 'src/app/model/Survey';
import { serverTimestamp } from 'firebase/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.less'],
})
export class SurveyComponent implements OnInit {
  public isLoading: boolean = false;
  public survey?: Survey;
  public form?: FormGroup;

  constructor(
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private route: ActivatedRoute,
    private afs: AngularFirestore,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.loadSurvey(params['id'] || '');
    });
  }

  public async loadSurvey(surveyId: string) {
    if (surveyId !== '') {
      try {
        this.isLoading = true;
        this.survey = await this.afs
          .collection<Survey>('surveys')
          .doc(surveyId)
          .get()
          .pipe(
            filter((action) => action.exists),
            map(
              (action) =>
                ({ ...(action.data() as any), id: action.id } as Survey)
            ),
            tap((survey) => {
              this.form = this.fb.group({});
              survey.questions.forEach((question, index) => {
                this.form?.addControl(
                  `${index}`,
                  this.fb.control(
                    null,
                    question.required && question.type != 'checkbox'
                      ? [Validators.required]
                      : question.type == 'checkbox' && question.required
                      ? [Validators.requiredTrue]
                      : []
                  )
                );
              });
              const TWO_WEEKS_IN_MILLISECONDS = 2 * 7 * 24 * 60 * 60 * 1000;
              const expireTime =
                survey.createdTime.toDate().getTime() +
                TWO_WEEKS_IN_MILLISECONDS;
              const currentTime = new Date().getTime();
              if (expireTime <= currentTime) {
                console.error(`Error getting survey ${expireTime}:`, Error);
                this.notification.warning(
                  'Survey Expired',
                  'This survey has expired and is no longer accepting responses.'
                );
                this.form?.disable();
                this.router.navigate(['/home']);
              }
            })
          )
          .toPromise();
      } catch (error) {
        console.error(`Error getting survey ${surveyId}:`, error);
        this.notification.error('Error', `Sorry, error has expired: ${error}`);
      } finally {
        this.isLoading = false;
      }
    }
  }

  public submit() {
    for (const i in this.form?.controls) {
      this.form?.controls[i]?.markAsDirty();
      this.form?.controls[i]?.updateValueAndValidity();
    }
    if (this.form?.valid && !this.isLoading) {
      this.isLoading = true;
      try {
        this.afs.collection('results').add({
          surveyId: this.survey?.id,
          answers: this.survey?.questions.map(
            (_question, index) => this.form?.value[`${index}`] || null
          ),
          createdTime: serverTimestamp(),
        });
        this.isLoading = false;
        this.notification.success(
          'Success',
          'Survey updated successfully. You could view the result in the dashboard.'
        );
        this.form?.reset();
      } catch (error) {
        console.log(error);
        this.isLoading = false;
        this.notification.error('Error', `There was an error: ${error}`);
      }
    } else {
      this.isLoading = false;
      this.notification.error('Error', 'Please fill out the form correctly');
    }
  }
}
