import { Component, Input } from '@angular/core';
import { FormBuilder,FormGroup,UntypedFormArray } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { User } from 'src/app/model/User';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.less'],
})
export class EditUserComponent {
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
