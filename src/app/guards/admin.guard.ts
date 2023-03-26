import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map, of, switchMap, tap } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../model/User';

export const canActivateByRoles: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
) => {
  const afAuth = inject(AngularFireAuth);
  const afs = inject(AngularFirestore);
  const router = inject(Router);
  return afAuth.authState.pipe(
    map(firebaseUser => {
      if (!firebaseUser) return false
      return firebaseUser?.uid
    }),
    switchMap(uid => {
      if (!uid) return of(null)
      return afs.collection("users").doc(uid as string).get().pipe(map(item => ({ ...item.data() as any, id: item.id }) as User))
    }),
    map(user => {
      if (!user) return false
      let index = route.data['roles'].indexOf(user?.role || "")
      return user && index > -1
    }),
    tap(res => {
      if (!res) afAuth.signOut().then(_ => router.navigate(["/"]))
    })
  )
};