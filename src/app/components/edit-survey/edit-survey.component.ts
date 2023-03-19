import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, UntypedFormArray, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Survey } from 'src/app/model/Survey';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { serverTimestamp } from 'firebase/firestore';

@Component({
  selector: 'app-edit-survey',
  templateUrl: './edit-survey.component.html',
  styleUrls: ['./edit-survey.component.less']
})
export class EditSurveyComponent {

  asFormArray(val: any): UntypedFormArray { return val }
  @Input() public survey?: Survey;
  public isLoading = false;
  public form?: FormGroup

  constructor(
    private afs: AngularFirestore,
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private notification: NzNotificationService,
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: this.fb.control(this.survey?.id || null, []),
      title: this.fb.control(this.survey?.title || "Untitled Survey", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      desc: this.fb.control(this.survey?.desc || "Please enter some description about this survey", [Validators.required, Validators.minLength(3), Validators.maxLength(500)]),
      questions: this.fb.array(this.survey?.questions?.map((question) => this.fb.group({
        label: this.fb.control(question.label || "Untitled Questions", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
        type: this.fb.control(question.type || "text", [Validators.required]),
        options: this.fb.control((question.options || []).join("\n"), []),
        required: this.fb.control(question.required || false, [])
      })) || [], [Validators.required]),
      isPublished: this.fb.control((this.survey) ? this.survey?.isPublished : true, []),
    })
    this.addQuestion()
  }

  public async submit() {
    for (const i in this.form?.controls) {
      this.form?.controls[i]?.markAsDirty();
      this.form?.controls[i]?.updateValueAndValidity();
    }
    if (this.form?.valid && !this.isLoading) {
      this.isLoading = true
      try {
        if (this.survey?.id) {
          this.afs.collection("surveys").doc(this.survey?.id).update({
            title: this.form?.value.title?.trim(),
            desc: this.form?.value.desc?.trim(),
            isPublished: this.form?.value.isPublished,
            questions: this.form?.value.questions.map((question: any) => ({
              label: question.label?.trim(),
              type: question.type?.trim(),
              options: question.options.split("\n").map((option: string) => option.trim()).filter((option: string) => option.length > 0),
              required: question.required
            })),
            updatedTime: serverTimestamp()
          })
        } else {
          this.afs.collection("surveys").add({
            title: this.form?.value.title?.trim(),
            desc: this.form?.value.desc?.trim(),
            isPublished: this.form?.value.isPublished,
            questions: this.form?.value.questions.map((question: any) => ({
              label: question.label?.trim(),
              type: question.type?.trim(),
              options: question.options.split("\n").map((option: string) => option.trim()).filter((option: string) => option.length > 0),
              required: question.required
            })),
            updatedTime: serverTimestamp(),
            createdTime: serverTimestamp()
          })
        }
        this.isLoading = false
        await this.modalRef.close(true)
      } catch (error) {
        console.log(error)
        this.isLoading = false
        this.notification.error('Error', `There was an error: ${error}`)
      }
    } else {
      this.isLoading = false
      this.notification.error('Error', 'Please fill out the form correctly')
    }
  }

  public async cancel() {
    await this.modalRef.close(false)
  }

  public addQuestion() {
    (this.form?.get('questions') as FormArray).push(this.fb.group({
      label: this.fb.control("Untitled Questions", [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      type: this.fb.control("text", [Validators.required]),
      options: this.fb.control("", []),
      required: this.fb.control(true, [])
    }));
  }

  public removeQuestion(index: number) {
    (this.form?.get('questions') as FormArray).removeAt(index);
  }

  public moveQuestion(index: number, position: number) {
    const newIndex = index + position;
    if (newIndex >= 0 && newIndex < (this.form?.get('questions') as FormArray).controls.length) {
      const question = (this.form?.get('questions') as FormArray).at(index);
      (this.form?.get('questions') as FormArray).removeAt(index);
      (this.form?.get('questions') as FormArray).insert(newIndex, question);
    }
  }

  public questionTypeChange(index: number, type: string) {
    if (type == "radio" || type == "select") {
      (this.form?.get('questions') as FormArray).at(index).get('options')?.setValidators([Validators.required])
    } else {
      (this.form?.get('questions') as FormArray).at(index).get('options')?.setValue("");
      (this.form?.get('questions') as FormArray).at(index).get('options')?.clearValidators()
    }
  }
}
