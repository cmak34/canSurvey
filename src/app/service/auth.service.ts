import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { Observable, filter, map, of } from 'rxjs';

import { User } from 'src/app/model/User';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user: firebase.User | null = null
  public profile$: Observable<User | null> = of(null);
  public static EMAIL_PATTERN = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}(\.[a-zA-Z]{2,6})?)$/
  userProfile: any;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {
    this.getAuth();
  }

  private async getAuth() {
    this.afAuth.onAuthStateChanged(async (user) => {
      this.user = user;
      if (user && user?.uid) {
        this.profile$ = this.afs.collection('users').doc(user?.uid).snapshotChanges().pipe(
          filter((user) => user.payload.exists),
          map((user) => ({ ...user.payload.data() as any, id: user.payload.id }) as User)
        )
      } else {
        this.profile$ = of(null);
      }
    });
  }

  public async login(email: string, password: string) {
    await this.afAuth.signInWithEmailAndPassword(email, password);
  }

  public async logout() {
    await this.afAuth.signOut();
  }

  public async register(email: string, password: string, role: string) {
    const userCredential = await this.afAuth.createUserWithEmailAndPassword(
      email,
      password
    );
    if (userCredential) {
      await this.afs.collection('users').doc(userCredential.user?.uid).set({
        email: email.trim(),
        role: role.trim()
      })
    }
  }
}
