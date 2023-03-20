import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

import { User } from 'src/app/model/User';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public user: firebase.User | null = null;
  public userRole: string = 'user';

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {
    this.getAuth();
  }

  private async getAuth() {
    this.afAuth.onAuthStateChanged(async (user) => {
      this.user = user;
      if (user) {
        this.userRole = await this.getUserRole(user?.email || '');
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
      this.afs.collection('users').add({
        email: email.trim(),
        role: role.trim(),
      });
    }
  }
  public async getUserRole(email: string): Promise<string> {
    const userQuery = this.afs.collection('users').ref.where('email', '==', email);
    const userSnapshot = await userQuery.get();
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data() as User;
      return userData.role;
    } else {
      return 'user';
    }
  }
}
