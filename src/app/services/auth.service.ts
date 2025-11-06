import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, LoginCredentials, SignupData } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  login(credentials: LoginCredentials): Observable<User> {
    return new Observable((observer) => {
      // Simular delay de rede
      setTimeout(() => {
        // Buscar usuário no localStorage
        const users = this.getStoredUsers();
        const user = users.find(
          (u) =>
            u.email === credentials.email &&
            this.verifyPassword(u.email, credentials.password)
        );

        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          observer.next(user);
          observer.complete();
        } else {
          observer.error({ message: 'Email ou senha inválidos' });
        }
      }, 500);
    });
  }

  signup(signupData: SignupData): Observable<User> {
    return new Observable((observer) => {
      // Simular delay de rede
      setTimeout(() => {
        // Verificar se o email já existe
        const users = this.getStoredUsers();
        const existingUser = users.find((u) => u.email === signupData.email);

        if (existingUser) {
          observer.error({ message: 'Email já cadastrado' });
          return;
        }

        // Criar novo usuário
        const newUser: User = {
          id: this.generateId(),
          fullName: signupData.fullName,
          email: signupData.email,
          incomes: signupData.incomes,
          expenses: signupData.expenses,
          startDay: signupData.startDay,
          createdAt: new Date(),
        };

        // Salvar usuário
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Salvar senha (em produção, isso seria hash no backend)
        this.savePassword(signupData.email, signupData.password);

        // Login automático
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        this.currentUserSubject.next(newUser);

        observer.next(newUser);
        observer.complete();
      }, 500);
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  private getStoredUsers(): User[] {
    const usersJson = localStorage.getItem('users');
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private savePassword(email: string, password: string): void {
    // Em produção, isso seria hash no backend
    const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
    passwords[email] = password;
    localStorage.setItem('passwords', JSON.stringify(passwords));
  }

  private verifyPassword(email: string, password: string): boolean {
    const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
    return passwords[email] === password;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
