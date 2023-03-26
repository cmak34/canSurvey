import { Component } from '@angular/core';
import { User } from 'src/app/model/User';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { catchError, map, Observable, of } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { EditUserComponent } from 'src/app/components/edit-user/edit-user.component';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.less']
})
export class ManageUsersComponent {
  public isDeleting: boolean = false;
  public users$: Observable<User[]> = this.afs.collection<User>("users", ref => ref.orderBy("email", "asc"))
  .snapshotChanges()
  .pipe(
    map(actions => actions.map(action => ({ ...action.payload.doc.data() as any, id: action.payload.doc.id }))),
    catchError((error) => {
      console.error("Error getting users:", error);
      this.notification.error("Error", `Error getting users: ${error}`);
      return of([]);
    })
  )

  constructor(
    private modal: NzModalService,
    private notification: NzNotificationService,
    private afs: AngularFirestore,
  ) { }

  public async deleteUser(id: string) {
    try {
      this.isDeleting = true
      await this.afs.collection("users").doc(id).delete()
      this.notification.success('Success', 'You have successfully deleted a user!')
      this.isDeleting = false
    } catch (error) {
      this.isDeleting = false
       console.log(error)
      this.notification.error("error", `Error: ${error}`)
    }
  }

  public editUser(user: User) {
    let modal = this.modal.create({
      nzTitle: 'Edit User',
      nzContent: EditUserComponent,
      nzComponentParams: {
        user: user
      },
      nzFooter: null
    })
    modal.afterClose.subscribe((result) => {
      if (result) {
        this.notification.success('Success', 'You have successfully edited a user!')
      }
    })
  }
}