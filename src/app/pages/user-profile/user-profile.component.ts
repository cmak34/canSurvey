import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/model/User';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { catchError, map, Observable, of } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { EditProfileComponent } from 'src/app/components/edit-profile/edit-profile.component';
import { NzDateMode } from 'ng-zorro-antd/date-picker';
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


    constructor(
      private afs: AngularFirestore,
      private fb: FormBuilder,
      private auth: AuthService,
      // private modalRef: NzModalRef,
      private notification: NzNotificationService
    ) {
      
    }

    ngOnInit(): void {
      this.form = this.fb.group({
        userName: this.fb.control(this.auth.userProfile?.userName || null, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
        firstName: this.fb.control(this.auth.userProfile?.firstName || null, [Validators.required]),
        lastName: this.fb.control(this.auth.userProfile?.lastName || null, [Validators.required]),
        dob: this.fb.control(this.auth.userProfile?.dob?.toDate() || null, [Validators.required]),
        province: this.fb.control(this.auth.userProfile?.province || null, [Validators.required])
      })
    }

    public async submit() {
      if (this.form?.valid && !this.isLoading && this.auth.user?.uid) {
        this.isLoading = true;
        try {
          let result = await this.afs.collection("users").doc(this.auth.user?.uid).update({
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

