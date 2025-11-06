export interface User {
  id: string;
  fullName: string;
  email: string;
  incomes: Income[];
  expenses: Expense[];
  startDay: string;
  createdAt: Date;
}

export interface Income {
  value: number;
  category: string;
  day: string;
}

export interface Expense {
  value: number;
  category: string;
  day: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  incomes: Income[];
  expenses: Expense[];
  startDay: string;
}
