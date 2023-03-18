import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user: (firebase.User | null) = null

  constructor(
    
    private afAuth: AngularFireAuth
  ) { 
    this.getAuth()
  }

  private async getAuth() {
    this.afAuth.onAuthStateChanged(async (user) => {
      this.user = user;
    })
  }

  public async logout() {
    await this.afAuth.signOut()
  }
}