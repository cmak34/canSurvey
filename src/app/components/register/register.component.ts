import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less']
})
export class RegisterComponent implements OnInit{
  public isLoading = false;
  public form?: FormGroup 

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private notification: NzNotificationService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: this.fb.control(null, [Validators.required, Validators.pattern(AuthService.EMAIL_PATTERN)]),
      password: this.fb.control(null, [Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      role: this.fb.control("user", [Validators.required])
    })
  }

  public async submit() {
    for (const i in this.form?.controls) {
      this.form?.controls[i]?.markAsDirty();
      this.form?.controls[i]?.updateValueAndValidity();
    }
    if (this.form?.valid && !this.isLoading) { 
      this.isLoading = true
      try {
        await this.auth.register(this.form.value.email, this.form.value.password, this.form.value.role)
        this.isLoading = false
        await this.modalRef.close(true)
      } catch (error) {
        console.log(error)
        this.isLoading = false
        this.notification.error('Error', `There was an error signing up: ${error}`)
      }
    } else {
      this.isLoading = false
      this.notification.error('Error', 'Please fill out the form correctly')
    } 
  }

  public async cancel() {
    await this.modalRef.close(false)
  }
}
