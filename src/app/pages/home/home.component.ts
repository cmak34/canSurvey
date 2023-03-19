import { Component } from '@angular/core';
import { Survey } from 'src/app/model/Survey';
import {catchError, map, Observable, of} from 'rxjs';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {NzNotificationService} from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent {
  public surveys$: Observable<Survey[]> = this.afs.collection<Survey>("surveys", ref => ref.orderBy("createdTime", "desc").where("isPublished", "==", true))
  .snapshotChanges()
  .pipe(
    map(actions => actions.map(action => ({ ...action.payload.doc.data() as any, id: action.payload.doc.id }))),
    catchError((error) => {
      console.error("Error getting surveys:", error);
      this.notification.error("Error", `Error getting surveys: ${error}`);
      return of([]);
    })
  )

  constructor(
    private notification: NzNotificationService,
    private afs: AngularFirestore,
  ) { }

}
