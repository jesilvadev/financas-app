import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
  ],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnInit {
  userName: string = '';
  userInitial: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user: User | null) => {
      if (user) {
        this.userName = user.fullName;
        this.userInitial = user.fullName.charAt(0).toUpperCase();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/signin']);
  }
}
