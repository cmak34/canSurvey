import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

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

  public async login(email: string, password: string) {
    await this.afAuth.signInWithEmailAndPassword(email, password)
  }

  public async logout() {
    await this.afAuth.signOut()
  }
}