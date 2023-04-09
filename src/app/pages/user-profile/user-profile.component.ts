import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/service/auth.service';
import { serverTimestamp } from 'firebase/firestore';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.less']
})
export class UserProfileComponent implements OnInit {
  public isLoading = false;
  public form?: FormGroup;
  public subscription: any;

  constructor(
    private afs: AngularFirestore,
    private fb: FormBuilder,
    private auth: AuthService,
    private notification: NzNotificationService
  ) {

  }

  ngOnInit(): void {
    this.subscription = this.auth.profile$.subscribe(user => {
      this.form = this.fb.group({
        userName: this.fb.control(user?.userName || null, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
        firstName: this.fb.control(user?.firstName || null, [Validators.required]),
        lastName: this.fb.control(user?.lastName || null, [Validators.required]),
        dob: this.fb.control(user?.dob?.toDate() || null, [Validators.required]),
        province: this.fb.control(user?.province || null, [Validators.required])
      })
    })
  }

  public async submit() {
    if (this.form?.valid && !this.isLoading && this.auth.user?.uid) {
      this.isLoading = true;
      try {
        await this.afs.collection("users").doc(this.auth.user?.uid).update({
          userName: this.form?.value.userName?.trim(),
          firstName: this.form?.value.firstName?.trim(),
          lastName: this.form?.value.lastName?.trim(),
          dob: this.form?.value.dob,
          province: this.form?.value.province?.trim(),
          updateTime: serverTimestamp()
        })
        this.notification.success("Success", "The user profile has been updated")
        this.isLoading = false
      } catch (error) {
        console.log(error);
        this.isLoading = false;
        this.notification.error('Error', `There was an error: ${error}`);
      }
    }
  }
}

