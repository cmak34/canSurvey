import { Component } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent {
  constructor(
    private router: Router,
    private modal: NzModalService,
    private notification: NzNotificationService,
    public auth: AuthService
  ) {}

  public login() {
    let modal = this.modal.create({
      nzTitle: 'Login',
      nzContent: LoginComponent,
      nzFooter: null,
    });
    modal.afterClose.subscribe((result) => {
      if (result) {
        this.notification.success(
          'Success',
          'You have successfully logged in!'
        );
      }
    });
  }

  public register() {
    let modal = this.modal.create({
      nzTitle: 'Register',
      nzContent: RegisterComponent,
      nzFooter: null,
    });
    modal.afterClose.subscribe((result) => {
      if (result) {
        this.notification.success('Success','You have successfully registered!');
      }
    });
  }

  public async logout() {
    try {
      await this.auth.logout();
      this.notification.success('Success', 'You have successfully logged out!');
      this.router.navigate(['/']);
    } catch (error) {
      console.log(error);
      this.notification.error('Error',`There was an error logging out: ${error}`);
    }
  }
}
