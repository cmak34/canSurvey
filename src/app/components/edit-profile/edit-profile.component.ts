import { Component, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, UntypedFormArray, Validators } from '@angular/forms';
import { NzDateMode } from 'ng-zorro-antd/date-picker';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { User } from 'src/app/model/User';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.less']
})
export class EditProfileComponent {
  mode: string|NzDateMode[]|string[]|null|undefined;
  log(arg0: string) {
  throw new Error('Method not implemented.');
  }
    asFormArray(val: any): UntypedFormArray {
      return val;
    }
    @Input() public user?: User;
    public isLoading = false;
    public form?: FormGroup;
  
    constructor(
      private afs: AngularFirestore,
      private fb: FormBuilder,
      private modalRef: NzModalRef,
      private notification: NzNotificationService
    ) {}
  
    ngOnInit(): void {
      this.form = this.fb.group({
        id: this.fb.control(this.user?.id || null, []),
        role: this.fb.control(this.user?.role || 'user'),
        userName: this.fb.control(this.user?.userName || null, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]),
        firstName: this.fb.control(this.user?.firstName || null),
        lastName: this.fb.control(this.user?.lastName || null),
        birthDate: this.fb.control(this.user?.dob || null),
        province: this.fb.control(this.user?.province || null)
      });
    }
  
    public async submit() {
      if (this.form?.valid && !this.isLoading) {
        this.isLoading = true;
        try {
          if (this.user?.id) {
            this.afs.collection('users').doc(this.user?.id).update({
              role: this.form?.value.role?.trim(),
            });
          }
          this.isLoading = false
          await this.modalRef.close(true)
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
    public async cancel() {
      await this.modalRef.close(false);
    }
}
