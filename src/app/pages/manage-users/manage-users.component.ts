import { Component } from '@angular/core';
import { User } from 'src/app/model/User';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { catchError, map, Observable, of } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import * as admin from 'firebase-admin';

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


  public async deleteUser(id: string, email: string) {
    try {
      // const app = admin.initializeApp({
      //   credential: admin.credential.applicationDefault(),
      // });
      // this.isDeleting = true
      //  // Delete the user account
      //  const user = await admin.auth().getUserByEmail(email);
      //  await admin.auth().deleteUser(user.uid);
 
      //  // Clean up the Firebase Admin SDK app
      //  await app.delete();
      await this.afs.collection("users").doc(id).delete()
      this.notification.success('Success', 'You have successfully deleted a user!')
      this.isDeleting = false
    } catch (error) {
      this.isDeleting = false
       console.log(error)
      this.notification.error("error", `Error: ${error}`)
    }
  }
}